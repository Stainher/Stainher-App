import { withSupabase } from "npm:@supabase/server@^1";

type Json = Record<string, unknown>;
type Recipient = { email: string; name?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_HTML = 200_000;
const MAX_ATTACHMENT_B64 = 12_000_000;
const FALLBACK_FROM_EMAIL = "ismael.galvez@stainher.cl";
const FALLBACK_FROM_NAME = "Stainher App";
const ALLOWED_MODULES = new Set([
  "sistema", "vacaciones", "confiabilidad", "correctivo",
  "preventivo", "vehiculos", "liderazgo", "documentos", "general",
]);

function clean(value: unknown, max = 500): string {
  return String(value ?? "").trim().slice(0, max);
}

function normalizeRecipient(value: unknown): Recipient | null {
  const source = typeof value === "object" && value !== null ? value as Json : null;
  const email = clean(source?.email ?? value, 320).toLowerCase();
  if (!EMAIL_RE.test(email)) return null;
  const name = clean(source?.name, 160);
  return name ? { email, name } : { email };
}

function normalizeRecipients(value: unknown): Recipient[] {
  const values = Array.isArray(value) ? value : value ? [value] : [];
  const unique = new Map<string, Recipient>();
  for (const raw of values) {
    const recipient = normalizeRecipient(raw);
    if (recipient && !unique.has(recipient.email)) unique.set(recipient.email, recipient);
  }
  return [...unique.values()];
}

function normalizeSender(value: unknown): Recipient | null {
  const raw = clean(value, 500);
  if (!raw) return null;
  const direct = normalizeRecipient(raw);
  if (direct) return direct;
  const match = raw.match(/^\s*(.*?)\s*<([^<>]+)>\s*$/);
  if (!match) return null;
  const email = clean(match[2], 320).toLowerCase();
  if (!EMAIL_RE.test(email)) return null;
  const name = clean(match[1].replace(/^['"]|['"]$/g, ""), 160);
  return name ? { email, name } : { email };
}

function safeDetail(value: unknown): Json {
  if (!value || typeof value !== "object") return { message: clean(value, 1000) };
  const source = value as Json;
  return {
    code: clean(source.code, 120) || null,
    message: clean(source.message ?? source.error, 1000) || null,
  };
}

function originHeaders(req: Request): HeadersInit {
  const origin = req.headers.get("origin") || "";
  const allowed = origin === "https://stainher.github.io" ||
    /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  return {
    "Access-Control-Allow-Origin": allowed ? origin : "https://stainher.github.io",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json; charset=utf-8",
    "Vary": "Origin",
  };
}

function response(req: Request, body: Json, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: originHeaders(req) });
}

function modulePermission(profile: Json, moduleName: string): boolean {
  const role = clean(profile.rol, 80).toLowerCase();
  if (role === "administrador") return true;
  if (moduleName === "sistema" || moduleName === "general" || moduleName === "documentos") return false;
  if (moduleName === "vacaciones") return role === "recursos_humanos";
  const permissionModule: Record<string, string> = {
    confiabilidad: "correctivo",
    correctivo: "correctivo",
    preventivo: "preventivo",
    vehiculos: "vehiculos",
    liderazgo: "liderazgo",
  };
  const key = permissionModule[moduleName];
  const permissions = profile.permisos && typeof profile.permisos === "object"
    ? profile.permisos as Json
    : {};
  return !!key && clean(permissions[key], 40).toLowerCase() === "editar";
}

async function configuredRecipients(ctx: any, documentType: string): Promise<Recipient[]> {
  if (!documentType) return [];
  const { data: config, error } = await ctx.supabaseAdmin
    .from("correo_config_v155")
    .select("tipo_documento,activo,destinatarios,copia_administrador,copia_prevencion,copia_confiabilidad,copia_planificacion")
    .eq("tipo_documento", documentType)
    .maybeSingle();
  if (error) throw new Error(`No se pudo leer la configuración de correo: ${error.message}`);
  if (!config || !config.activo) return [];

  const recipients = normalizeRecipients(config.destinatarios || []);
  const roles: string[] = [];
  if (config.copia_administrador) roles.push("administrador");
  if (config.copia_prevencion) roles.push("prevencion");
  if (config.copia_confiabilidad) roles.push("confiabilidad");
  if (config.copia_planificacion) roles.push("planificador");

  if (roles.length) {
    const { data: profiles, error: profilesError } = await ctx.supabaseAdmin
      .from("perfiles")
      .select("email,nombre,rol")
      .eq("activo", true)
      .in("rol", roles);
    if (profilesError) throw new Error(`No se pudieron resolver las copias configuradas: ${profilesError.message}`);
    recipients.push(...normalizeRecipients((profiles || []).map((p: Json) => ({ email: p.email, name: p.nombre }))));
  }
  return normalizeRecipients(recipients).slice(0, 25);
}

function defaultDocumentType(moduleName: string): string {
  return ({
    sistema: "prueba",
    vacaciones: "vacaciones",
    confiabilidad: "correctivo_confiabilidad",
    correctivo: "correctivo_confiabilidad",
    preventivo: "preventivo",
    vehiculos: "checklist_vehiculo",
    liderazgo: "liderazgo",
  } as Record<string, string>)[moduleName] || "";
}

export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: originHeaders(req) });
    if (req.method !== "POST") return response(req, { ok: false, error: "Método no permitido." }, 405);

    const origin = req.headers.get("origin") || "";
    if (origin && origin !== "https://stainher.github.io" &&
        !/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return response(req, { ok: false, error: "Origen no autorizado." }, 403);
    }

    const userId = clean(ctx.userClaims?.id ?? ctx.userClaims?.sub, 80);
    if (!userId) return response(req, { ok: false, error: "Usuario no autenticado." }, 401);

    const { data: profile, error: profileError } = await ctx.supabaseAdmin
      .from("perfiles")
      .select("id,nombre,email,rol,activo,permisos")
      .eq("id", userId)
      .maybeSingle();
    if (profileError) {
      console.error("profile_lookup", profileError.code, profileError.message);
      return response(req, { ok: false, error: "No se pudo validar el perfil del remitente." }, 500);
    }
    if (!profile || !profile.activo) {
      return response(req, { ok: false, error: "El perfil no existe o está inactivo." }, 403);
    }

    let body: Json;
    try { body = await req.json() as Json; }
    catch { return response(req, { ok: false, error: "Solicitud JSON inválida." }, 400); }

    const moduleName = clean(body.modulo ?? body.module, 80).toLowerCase() || "general";
    if (!ALLOWED_MODULES.has(moduleName)) {
      return response(req, { ok: false, error: "Módulo de correo no permitido." }, 400);
    }
    if (!modulePermission(profile as Json, moduleName)) {
      return response(req, { ok: false, error: "Tu perfil no puede enviar correos desde este módulo." }, 403);
    }

    const subject = clean(body.subject, 200) || "Stainher App";
    const htmlContent = String(body.htmlContent ?? "");
    const pdfBase64 = body.pdfBase64 ? String(body.pdfBase64) : "";
    const pdfName = clean(body.pdfName, 220);
    if (htmlContent.length > MAX_HTML) return response(req, { ok: false, error: "El mensaje excede el tamaño permitido." }, 413);
    if (pdfBase64.length > MAX_ATTACHMENT_B64) return response(req, { ok: false, error: "El PDF excede el tamaño permitido." }, 413);
    if (pdfBase64 && (!pdfName || !/\.pdf$/i.test(pdfName))) {
      return response(req, { ok: false, error: "El adjunto debe tener un nombre PDF válido." }, 400);
    }

    const testMode = body.testMode === true;
    if (testMode && clean(profile.rol, 80).toLowerCase() !== "administrador") {
      return response(req, { ok: false, error: "Solo el administrador puede usar el modo de prueba." }, 403);
    }

    const documentType = clean(body.tipoDocumento ?? body.documentType, 120) || defaultDocumentType(moduleName);
    const explicit = normalizeRecipients(body.to);
    const suppliedCc = normalizeRecipients(body.cc);
    let configured: Recipient[] = [];
    try { configured = documentType ? await configuredRecipients(ctx, documentType) : []; }
    catch (error) {
      return response(req, { ok: false, error: error instanceof Error ? error.message : "Configuración de correo inválida." }, 500);
    }

    let to: Recipient | null = explicit[0] || null;
    let cc = normalizeRecipients([...explicit.slice(1), ...suppliedCc, ...configured]);
    const intendedTo = clean(body.intendedTo, 320) || to?.email || "";
    if (testMode) {
      to = normalizeRecipient({ email: profile.email, name: profile.nombre });
      cc = [];
    } else if (!to && configured.length) {
      to = configured[0];
      cc = normalizeRecipients(configured.slice(1));
    }
    if (!to) return response(req, { ok: false, error: "No hay un destinatario válido ni una configuración activa para este documento." }, 400);
    cc = cc.filter((item) => item.email !== to!.email).slice(0, 24);

    const referenceId = clean(body.referencia_id ?? body.referenceId, 200) || null;
    const rawKey = clean(body.idempotencyKey, 200);
    const idempotencyKey = rawKey || crypto.randomUUID();
    const deliveredSubject = testMode ? `[MODO PRUEBA] ${subject}` : subject;
    const now = new Date().toISOString();
    const logRow = {
      modulo: moduleName,
      referencia_id: referenceId,
      destinatario: to.email,
      destinatario_previsto: intendedTo || to.email,
      copias: cc,
      asunto: deliveredSubject,
      estado: "procesando",
      intentos: 1,
      enviado_por: userId,
      proveedor: "brevo",
      idempotency_key: idempotencyKey,
      tipo_documento: documentType || null,
      ultimo_error: null,
      procesado_at: null,
    };

    let log: any = null;
    const insertResult = await ctx.supabaseAdmin.from("email_envios_v1518").insert(logRow).select("*").single();
    if (insertResult.error) {
      if (insertResult.error.code !== "23505") {
        console.error("email_log_insert", insertResult.error.code, insertResult.error.message);
        return response(req, { ok: false, error: `No se pudo iniciar la trazabilidad del correo (${insertResult.error.code || "db"}).` }, 500);
      }
      const existingResult = await ctx.supabaseAdmin.from("email_envios_v1518")
        .select("*").eq("idempotency_key", idempotencyKey).maybeSingle();
      const existing = existingResult.data;
      if (!existing || existingResult.error) return response(req, { ok: false, error: "No se pudo resolver el reintento del correo." }, 500);
      if (existing.estado === "enviado") {
        return response(req, {
          ok: true, duplicate: true, messageId: existing.message_id,
          deliveredTo: existing.destinatario, logId: existing.id,
        });
      }
      const age = Date.now() - new Date(existing.created_at).getTime();
      if (existing.estado === "procesando" && age < 120_000) {
        return response(req, { ok: false, duplicate: true, error: "Este correo ya se está procesando." }, 409);
      }
      const retry = await ctx.supabaseAdmin.from("email_envios_v1518").update({
        estado: "procesando",
        intentos: Number(existing.intentos || 1) + 1,
        ultimo_error: null,
        http_status: null,
        detalle_respuesta: null,
        procesado_at: null,
      }).eq("id", existing.id).select("*").single();
      if (retry.error) return response(req, { ok: false, error: "No se pudo preparar el reintento." }, 500);
      log = retry.data;
    } else {
      log = insertResult.data;
    }

    const apiKey = clean(Deno.env.get("BREVO_API_KEY"), 48_000);
    const envSender = normalizeSender(Deno.env.get("EMAIL_FROM"));
    const fromEmail = envSender?.email || FALLBACK_FROM_EMAIL;
    const fromName = clean(Deno.env.get("EMAIL_FROM_NAME"), 160) || envSender?.name || FALLBACK_FROM_NAME;

    if (!apiKey) {
      const message = "BREVO_API_KEY no está configurada en los secretos de Supabase.";
      await ctx.supabaseAdmin.from("email_envios_v1518").update({
        estado: "error", ultimo_error: message, procesado_at: now,
      }).eq("id", log.id);
      return response(req, { ok: false, error: "La API key de Brevo no está configurada en el servidor.", logId: log.id }, 500);
    }

    if (!EMAIL_RE.test(fromEmail)) {
      const message = "El remitente configurado para Brevo no es válido.";
      await ctx.supabaseAdmin.from("email_envios_v1518").update({
        estado: "error", ultimo_error: message, procesado_at: now,
      }).eq("id", log.id);
      return response(req, { ok: false, error: message, logId: log.id }, 500);
    }

    const brevoPayload: Json = {
      sender: { email: fromEmail, name: fromName },
      to: [to],
      subject: deliveredSubject,
      htmlContent: htmlContent || "<p>Mensaje enviado desde Stainher App.</p>",
    };
    if (cc.length) brevoPayload.cc = cc;
    if (pdfBase64) brevoPayload.attachment = [{ content: pdfBase64, name: pdfName }];

    let providerResponse: Response;
    let providerBody: any = null;
    try {
      providerResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": apiKey,
          "idempotencyKey": idempotencyKey,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(brevoPayload),
      });
      try { providerBody = await providerResponse.json(); }
      catch { providerBody = {}; }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Brevo no respondió.";
      console.error("brevo_network", message);
      await ctx.supabaseAdmin.from("email_envios_v1518").update({
        estado: "error",
        ultimo_error: message.slice(0, 1000),
        detalle_respuesta: { message: "network_error" },
        procesado_at: new Date().toISOString(),
      }).eq("id", log.id);
      return response(req, { ok: false, error: "No fue posible conectar con el proveedor de correo.", logId: log.id }, 502);
    }

    if (!providerResponse.ok) {
      const detail = safeDetail(providerBody);
      const message = clean(detail.message, 1000) || `Brevo respondió ${providerResponse.status}.`;
      console.error("brevo_rejected", providerResponse.status, message);
      await ctx.supabaseAdmin.from("email_envios_v1518").update({
        estado: "error",
        ultimo_error: message,
        http_status: providerResponse.status,
        detalle_respuesta: detail,
        procesado_at: new Date().toISOString(),
      }).eq("id", log.id);
      return response(req, { ok: false, error: message, providerStatus: providerResponse.status, logId: log.id }, providerResponse.status);
    }

    const messageId = clean(providerBody?.messageId, 500) || null;
    const completedAt = new Date().toISOString();
    const update = await ctx.supabaseAdmin.from("email_envios_v1518").update({
      estado: "enviado",
      message_id: messageId,
      http_status: providerResponse.status,
      detalle_respuesta: { messageId },
      enviado_at: completedAt,
      procesado_at: completedAt,
      ultimo_error: null,
    }).eq("id", log.id);
    if (update.error) console.error("email_log_success_update", update.error.code, update.error.message);

    return response(req, {
      ok: true,
      messageId,
      deliveredTo: to.email,
      intendedTo: intendedTo || to.email,
      copiedTo: cc.map((item) => item.email),
      logId: log.id,
      duplicate: false,
    });
  }),
};
