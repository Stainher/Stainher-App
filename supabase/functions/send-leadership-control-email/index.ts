import { withSupabase } from "npm:@supabase/server@^1";

type Json = Record<string, unknown>;
type Recipient = { email: string; name?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_ATTACHMENT_B64 = 12_000_000;
const MAX_HTML = 200_000;
const FALLBACK_FROM_EMAIL = "ismael.galvez@stainher.cl";
const FALLBACK_FROM_NAME = "Stainher App";
const ALLOWED_ROLES = new Set(["administrador","prevencion","confiabilidad","planificador","supervisor","tecnico"]);

function clean(value: unknown, max = 500): string {
  return String(value ?? "").trim().slice(0, max);
}

function recipient(value: unknown): Recipient | null {
  const source = typeof value === "object" && value !== null ? value as Json : null;
  const email = clean(source?.email ?? value, 320).toLowerCase();
  if (!EMAIL_RE.test(email)) return null;
  const name = clean(source?.name, 160);
  return name ? { email, name } : { email };
}

function uniqueRecipients(values: unknown[]): Recipient[] {
  const map = new Map<string, Recipient>();
  for (const value of values) {
    const item = recipient(value);
    if (item && !map.has(item.email)) map.set(item.email, item);
  }
  return [...map.values()];
}

function sender(value: unknown): Recipient | null {
  const raw = clean(value, 500);
  if (!raw) return null;
  const direct = recipient(raw);
  if (direct) return direct;
  const match = raw.match(/^\s*(.*?)\s*<([^<>]+)>\s*$/);
  if (!match) return null;
  const email = clean(match[2], 320).toLowerCase();
  if (!EMAIL_RE.test(email)) return null;
  const name = clean(match[1].replace(/^['"]|['"]$/g, ""), 160);
  return name ? { email, name } : { email };
}

function originHeaders(req: Request): HeadersInit {
  const origin = req.headers.get("origin") || "";
  const allowed = origin === "https://stainher.github.io" || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  return {
    "Access-Control-Allow-Origin": allowed ? origin : "https://stainher.github.io",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json; charset=utf-8",
    "Vary": "Origin",
  };
}

function reply(req: Request, body: Json, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: originHeaders(req) });
}

function leadershipAllowed(profile: Json): boolean {
  const role = clean(profile.rol, 80).toLowerCase();
  if (!ALLOWED_ROLES.has(role)) return false;
  if (role === "administrador") return true;
  const permissions = profile.permisos && typeof profile.permisos === "object" ? profile.permisos as Json : {};
  const level = clean(permissions.liderazgo, 40).toLowerCase();
  return level === "ver" || level === "editar";
}

async function requiredRecipients(ctx: any, executor: Recipient) {
  const { data, error } = await ctx.supabaseAdmin
    .from("perfiles")
    .select("email,nombre,rol")
    .eq("activo", true)
    .in("rol", ["prevencion", "administrador"]);
  if (error) throw new Error(`No se pudieron resolver los destinatarios obligatorios: ${error.message}`);

  const prevention = uniqueRecipients((data || [])
    .filter((p: Json) => clean(p.rol, 80).toLowerCase() === "prevencion")
    .map((p: Json) => ({ email: p.email, name: p.nombre })));
  const administrators = uniqueRecipients((data || [])
    .filter((p: Json) => clean(p.rol, 80).toLowerCase() === "administrador")
    .map((p: Json) => ({ email: p.email, name: p.nombre })));

  const to = uniqueRecipients([executor, ...prevention]);
  const toEmails = new Set(to.map((x) => x.email));
  const cc = administrators.filter((x) => !toEmails.has(x.email));
  return { to: to.slice(0, 25), cc: cc.slice(0, 25) };
}

export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: originHeaders(req) });
    if (req.method !== "POST") return reply(req, { ok: false, error: "Método no permitido." }, 405);

    const origin = req.headers.get("origin") || "";
    if (origin && origin !== "https://stainher.github.io" && !/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return reply(req, { ok: false, error: "Origen no autorizado." }, 403);
    }

    const userId = clean(ctx.userClaims?.id ?? ctx.userClaims?.sub, 80);
    if (!userId) return reply(req, { ok: false, error: "Usuario no autenticado." }, 401);

    const profileResult = await ctx.supabaseAdmin
      .from("perfiles")
      .select("id,nombre,email,rol,activo,permisos")
      .eq("id", userId)
      .maybeSingle();
    if (profileResult.error) return reply(req, { ok: false, error: "No se pudo validar el perfil del ejecutor." }, 500);
    const profile = profileResult.data as Json | null;
    if (!profile || profile.activo !== true) return reply(req, { ok: false, error: "Perfil inactivo o inexistente." }, 403);
    if (!leadershipAllowed(profile)) return reply(req, { ok: false, error: "Tu perfil no puede enviar controles de Liderazgo." }, 403);

    const executor = recipient({ email: profile.email, name: profile.nombre });
    if (!executor) return reply(req, { ok: false, error: "El usuario que realizó el control no tiene un correo válido registrado." }, 400);

    let body: Json;
    try { body = await req.json() as Json; }
    catch { return reply(req, { ok: false, error: "Solicitud JSON inválida." }, 400); }

    const subject = clean(body.subject, 200) || "Control Stainher realizado";
    const htmlContent = String(body.htmlContent ?? "");
    const pdfBase64 = body.pdfBase64 ? String(body.pdfBase64) : "";
    const pdfName = clean(body.pdfName, 220);
    if (!pdfBase64 || !pdfName || !/\.pdf$/i.test(pdfName)) return reply(req, { ok: false, error: "El control debe incluir un PDF válido." }, 400);
    if (pdfBase64.length > MAX_ATTACHMENT_B64) return reply(req, { ok: false, error: "El PDF excede el tamaño permitido." }, 413);
    if (htmlContent.length > MAX_HTML) return reply(req, { ok: false, error: "El mensaje excede el tamaño permitido." }, 413);

    let recipients;
    try { recipients = await requiredRecipients(ctx, executor); }
    catch (error) { return reply(req, { ok: false, error: error instanceof Error ? error.message : "No se pudieron resolver destinatarios." }, 500); }
    if (!recipients.to.length) return reply(req, { ok: false, error: "No hay destinatarios válidos para el control." }, 400);

    const referenceId = clean(body.referencia_id ?? body.referenceId, 200) || null;
    const idempotencyKey = clean(body.idempotencyKey, 200) || `liderazgo-control:${referenceId || crypto.randomUUID()}:${userId}`;
    const now = new Date().toISOString();
    const copiesForLog = [...recipients.to.slice(1), ...recipients.cc];
    const logRow = {
      modulo: "liderazgo",
      referencia_id: referenceId,
      destinatario: executor.email,
      destinatario_previsto: executor.email,
      copias: copiesForLog,
      asunto: subject,
      estado: "procesando",
      intentos: 1,
      enviado_por: userId,
      proveedor: "brevo",
      idempotency_key: idempotencyKey,
      tipo_documento: "liderazgo",
      ultimo_error: null,
      procesado_at: null,
    };

    let log: any = null;
    const inserted = await ctx.supabaseAdmin.from("email_envios_v1518").insert(logRow).select("*").single();
    if (inserted.error) {
      if (inserted.error.code !== "23505") return reply(req, { ok: false, error: "No se pudo iniciar la trazabilidad del correo." }, 500);
      const existing = await ctx.supabaseAdmin.from("email_envios_v1518").select("*").eq("idempotency_key", idempotencyKey).maybeSingle();
      if (existing.error || !existing.data) return reply(req, { ok: false, error: "No se pudo resolver el reintento del correo." }, 500);
      if (existing.data.estado === "enviado") return reply(req, { ok: true, duplicate: true, messageId: existing.data.message_id, deliveredTo: executor.email, logId: existing.data.id });
      const age = Date.now() - new Date(existing.data.created_at).getTime();
      if (existing.data.estado === "procesando" && age < 120_000) return reply(req, { ok: false, duplicate: true, error: "Este correo ya se está procesando." }, 409);
      const retry = await ctx.supabaseAdmin.from("email_envios_v1518").update({ estado: "procesando", intentos: Number(existing.data.intentos || 1) + 1, ultimo_error: null, procesado_at: null }).eq("id", existing.data.id).select("*").single();
      if (retry.error) return reply(req, { ok: false, error: "No se pudo preparar el reintento." }, 500);
      log = retry.data;
    } else log = inserted.data;

    const apiKey = clean(Deno.env.get("BREVO_API_KEY"), 48_000);
    const envSender = sender(Deno.env.get("EMAIL_FROM"));
    const fromEmail = envSender?.email || FALLBACK_FROM_EMAIL;
    const fromName = clean(Deno.env.get("EMAIL_FROM_NAME"), 160) || envSender?.name || FALLBACK_FROM_NAME;
    if (!apiKey || !EMAIL_RE.test(fromEmail)) {
      const message = !apiKey ? "BREVO_API_KEY no está configurada." : "El remitente de correo no es válido.";
      await ctx.supabaseAdmin.from("email_envios_v1518").update({ estado: "error", ultimo_error: message, procesado_at: now }).eq("id", log.id);
      return reply(req, { ok: false, error: message, logId: log.id }, 500);
    }

    const brevoPayload: Json = {
      sender: { email: fromEmail, name: fromName },
      to: recipients.to,
      subject,
      htmlContent: htmlContent || "<h2>Control Stainher realizado</h2><p>Se adjunta el formulario PDF.</p>",
      attachment: [{ content: pdfBase64, name: pdfName }],
    };
    if (recipients.cc.length) brevoPayload.cc = recipients.cc;

    let provider: Response;
    let providerData: any = null;
    try {
      provider = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: { "api-key": apiKey, "content-type": "application/json", "idempotencyKey": idempotencyKey },
        body: JSON.stringify(brevoPayload),
      });
      try { providerData = await provider.json(); } catch { providerData = null; }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await ctx.supabaseAdmin.from("email_envios_v1518").update({ estado: "error", ultimo_error: message, procesado_at: new Date().toISOString() }).eq("id", log.id);
      return reply(req, { ok: false, error: "No fue posible conectar con el proveedor de correo.", logId: log.id }, 502);
    }

    if (!provider.ok) {
      const message = clean(providerData?.message ?? providerData?.error ?? `HTTP ${provider.status}`, 1000);
      await ctx.supabaseAdmin.from("email_envios_v1518").update({ estado: "error", ultimo_error: message, http_status: provider.status, detalle_respuesta: providerData, procesado_at: new Date().toISOString() }).eq("id", log.id);
      return reply(req, { ok: false, error: `Brevo rechazó el envío: ${message}`, logId: log.id }, 502);
    }

    const messageId = clean(providerData?.messageId, 300) || null;
    await ctx.supabaseAdmin.from("email_envios_v1518").update({ estado: "enviado", message_id: messageId, http_status: provider.status, detalle_respuesta: providerData, procesado_at: new Date().toISOString() }).eq("id", log.id);
    return reply(req, {
      ok: true,
      messageId,
      deliveredTo: executor.email,
      preventionRecipients: recipients.to.length - 1,
      adminCopies: recipients.cc.length,
      logId: log.id,
    });
  }),
};
