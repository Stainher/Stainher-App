import { withSupabase } from "npm:@supabase/server@^1";

type Json = Record<string, unknown>;
type Profile = { id: string; nombre?: string | null; email?: string | null; rol?: string | null; activo?: boolean | null };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FROM_FALLBACK = "ismael.galvez@stainher.cl";
const FROM_NAME_FALLBACK = "Stainher App";
const APP_URL = "https://stainher.github.io/Stainher-App/";

function clean(v: unknown, max = 1000): string {
  return String(v ?? "").trim().slice(0, max);
}
function html(v: unknown): string {
  return clean(v, 5000).replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[c] || c));
}
function response(req: Request, body: Json, status=200){
  const origin=req.headers.get("origin")||"";
  const allowed=origin==="https://stainher.github.io"||/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  return new Response(JSON.stringify(body),{status,headers:{
    "Access-Control-Allow-Origin":allowed?origin:"https://stainher.github.io",
    "Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods":"POST, OPTIONS",
    "Content-Type":"application/json; charset=utf-8",
    "Vary":"Origin"
  }});
}
function typeLabel(v: unknown): string {
  const k=clean(v,80).toLowerCase();
  return ({
    vacaciones:"Vacaciones",
    permiso:"Permiso / ausencia",
    cambio_turno:"Cambio puntual de turno",
    otro:"Otra solicitud",
    justificativo:"Justificativo laboral"
  } as Record<string,string>)[k]||clean(v,120)||"Solicitud";
}
function roleLabel(v: unknown): string {
  const k=clean(v,80).toLowerCase();
  return ({
    administrador:"Administrador",
    gerente:"Gerente",
    recursos_humanos:"Recursos Humanos",
    supervisor:"Supervisor",
    tecnico:"Técnico"
  } as Record<string,string>)[k]||clean(v,120)||"Aprobador";
}
function formatDate(v: unknown): string {
  const raw=clean(v,20);
  const m=raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m?`${m[3]}-${m[2]}-${m[1]}`:raw;
}
function periodText(r: Json): string {
  const from=formatDate(r.fecha_inicio);
  const to=formatDate(r.fecha_fin);
  if(!from)return "Sin período";
  return to&&to!==from?`${from} al ${to}`:from;
}
function senderFromEnv(){
  const raw=clean(Deno.env.get("EMAIL_FROM"),500);
  const match=raw.match(/^\s*(.*?)\s*<([^<>]+)>\s*$/);
  if(match&&EMAIL_RE.test(match[2].trim()))return {email:match[2].trim().toLowerCase(),name:clean(match[1].replace(/^['"]|['"]$/g,""),160)||FROM_NAME_FALLBACK};
  if(EMAIL_RE.test(raw))return {email:raw.toLowerCase(),name:clean(Deno.env.get("EMAIL_FROM_NAME"),160)||FROM_NAME_FALLBACK};
  return {email:FROM_FALLBACK,name:clean(Deno.env.get("EMAIL_FROM_NAME"),160)||FROM_NAME_FALLBACK};
}

export default {
  fetch: withSupabase({auth:"user"}, async (req,ctx)=>{
    if(req.method==="OPTIONS")return new Response("ok",{headers:{
      "Access-Control-Allow-Origin":req.headers.get("origin")||"https://stainher.github.io",
      "Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type",
      "Access-Control-Allow-Methods":"POST, OPTIONS"
    }});
    if(req.method!=="POST")return response(req,{ok:false,error:"Método no permitido."},405);

    const caller=clean(ctx.userClaims?.id??ctx.userClaims?.sub,80);
    if(!caller)return response(req,{ok:false,error:"Usuario no autenticado."},401);

    let body: Json={};
    try{body=await req.json() as Json}catch{return response(req,{ok:false,error:"Solicitud JSON inválida."},400)}
    const requestId=clean(body.request_id??body.requestId,80);
    if(!/^[0-9a-f-]{36}$/i.test(requestId))return response(req,{ok:false,error:"Solicitud no válida."},400);

    const rq=await ctx.supabaseAdmin.from("solicitudes_v15")
      .select("id,tipo,fecha_inicio,fecha_fin,comentario,estado,etapa,solicitante_user_id,solicitante_nombre,solicitante_rol,aprobador_user_id,aprobador_rol,rrhh_user_id,justificativo_institucion")
      .eq("id",requestId).maybeSingle();
    if(rq.error)return response(req,{ok:false,error:"No se pudo cargar la solicitud."},500);
    const r=(rq.data||null) as Json|null;
    if(!r)return response(req,{ok:false,error:"Solicitud no encontrada."},404);

    const callerProfileQ=await ctx.supabaseAdmin.from("perfiles").select("id,nombre,email,rol,activo").eq("id",caller).maybeSingle();
    if(callerProfileQ.error||!callerProfileQ.data||callerProfileQ.data.activo!==true)return response(req,{ok:false,error:"Perfil remitente no autorizado."},403);
    const callerRole=clean(callerProfileQ.data.rol,80).toLowerCase();
    const isRequester=String(r.solicitante_user_id||"")===caller;
    const isCurrentApprover=String(r.aprobador_user_id||"")===caller||String(r.rrhh_user_id||"")===caller;
    if(!isRequester&&!isCurrentApprover&&!["administrador","recursos_humanos"].includes(callerRole)){
      return response(req,{ok:false,error:"No tienes autorización para notificar esta solicitud."},403);
    }

    const stage=clean(r.etapa,40).toLowerCase();
    if(!["aprobador","rrhh"].includes(stage)){
      return response(req,{ok:false,error:"La solicitud ya no tiene una etapa pendiente de autorización."},409);
    }
    const recipientId=stage==="rrhh"
      ?clean(r.rrhh_user_id??r.aprobador_user_id,80)
      :clean(r.aprobador_user_id,80);
    if(!recipientId)return response(req,{ok:false,error:"La solicitud no tiene un autorizador asignado."},409);

    const profilesQ=await ctx.supabaseAdmin.from("perfiles")
      .select("id,nombre,email,rol,activo")
      .in("id",[clean(r.solicitante_user_id,80),recipientId]);
    if(profilesQ.error)return response(req,{ok:false,error:"No se pudieron resolver los perfiles de la solicitud."},500);
    const profiles=(profilesQ.data||[]) as Profile[];
    const requester=profiles.find(p=>String(p.id)===String(r.solicitante_user_id))||{} as Profile;
    const recipient=profiles.find(p=>String(p.id)===recipientId)||{} as Profile;
    const recipientEmail=clean(recipient.email,320).toLowerCase();
    if(recipient.activo!==true||!EMAIL_RE.test(recipientEmail)){
      return response(req,{ok:false,error:"El autorizador asignado no tiene un correo activo válido."},409);
    }

    const stageKey=stage==="rrhh"?"rrhh":"aprobador";
    const idempotencyKey=`solicitud:${requestId}:${stageKey}:${recipientId}`;
    const existingQ=await ctx.supabaseAdmin.from("email_envios_v1518")
      .select("id,estado,message_id,destinatario,created_at")
      .eq("idempotency_key",idempotencyKey).maybeSingle();
    if(existingQ.data?.estado==="enviado"){
      return response(req,{ok:true,duplicate:true,deliveredTo:existingQ.data.destinatario,messageId:existingQ.data.message_id,stage:stageKey});
    }

    const requesterName=clean(r.solicitante_nombre??requester.nombre,160)||"Trabajador";
    const requestType=typeLabel(r.tipo);
    const recipientName=clean(recipient.nombre,160)||roleLabel(recipient.rol);
    const period=periodText(r);
    const comment=clean(r.comentario,2500);
    const institution=clean(r.justificativo_institucion,180);
    const subject=`Nueva solicitud pendiente · ${requestType} · ${requesterName}`;
    const stageText=stageKey==="rrhh"?"requiere tu revisión / validación":"requiere tu aprobación";

    const htmlContent=`
      <div style="font-family:Arial,sans-serif;color:#172033;line-height:1.5;max-width:680px;margin:auto">
        <h2 style="margin:0 0 16px">Stainher App · Solicitud pendiente</h2>
        <p>Hola <b>${html(recipientName)}</b>,</p>
        <p>Se registró una solicitud que <b>${html(stageText)}</b>.</p>
        <table style="border-collapse:collapse;width:100%;margin:18px 0">
          <tr><td style="padding:8px;border-bottom:1px solid #d9e0e8"><b>Solicitante</b></td><td style="padding:8px;border-bottom:1px solid #d9e0e8">${html(requesterName)}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #d9e0e8"><b>Tipo</b></td><td style="padding:8px;border-bottom:1px solid #d9e0e8">${html(requestType)}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #d9e0e8"><b>Período</b></td><td style="padding:8px;border-bottom:1px solid #d9e0e8">${html(period)}</td></tr>
          ${institution?`<tr><td style="padding:8px;border-bottom:1px solid #d9e0e8"><b>Destinatario</b></td><td style="padding:8px;border-bottom:1px solid #d9e0e8">${html(institution)}</td></tr>`:""}
          ${comment?`<tr><td style="padding:8px;border-bottom:1px solid #d9e0e8"><b>Motivo</b></td><td style="padding:8px;border-bottom:1px solid #d9e0e8">${html(comment)}</td></tr>`:""}
        </table>
        <p style="margin:20px 0"><a href="${APP_URL}" style="display:inline-block;padding:10px 16px;background:#1769c2;color:#fff;text-decoration:none;border-radius:8px">Abrir Stainher App</a></p>
        <p style="font-size:12px;color:#64748b">Solicitud: ${html(requestId)} · Etapa: ${html(stageKey)}</p>
      </div>`;

    const now=new Date().toISOString();
    let logId=existingQ.data?.id||null;
    if(logId){
      await ctx.supabaseAdmin.from("email_envios_v1518").update({
        estado:"procesando",intentos:2,ultimo_error:null,procesado_at:null
      }).eq("id",logId);
    }else{
      const ins=await ctx.supabaseAdmin.from("email_envios_v1518").insert({
        modulo:"solicitudes",
        referencia_id:requestId,
        destinatario:recipientEmail,
        destinatario_previsto:recipientEmail,
        copias:[],
        asunto:subject,
        estado:"procesando",
        intentos:1,
        enviado_por:caller,
        proveedor:"brevo",
        idempotency_key:idempotencyKey,
        tipo_documento:"solicitud_aprobacion",
        ultimo_error:null,
        procesado_at:null
      }).select("id").single();
      if(ins.error)return response(req,{ok:false,error:"No se pudo iniciar la trazabilidad del correo."},500);
      logId=ins.data.id;
    }

    const apiKey=clean(Deno.env.get("BREVO_API_KEY"),48000);
    if(!apiKey){
      await ctx.supabaseAdmin.from("email_envios_v1518").update({estado:"error",ultimo_error:"BREVO_API_KEY no configurada",procesado_at:now}).eq("id",logId);
      return response(req,{ok:false,error:"El servicio de correo no está configurado.",logId},500);
    }

    const sender=senderFromEnv();
    let provider: Response;
    let providerBody: Json={};
    try{
      provider=await fetch("https://api.brevo.com/v3/smtp/email",{
        method:"POST",
        headers:{"api-key":apiKey,"idempotencyKey":idempotencyKey,"Content-Type":"application/json","Accept":"application/json"},
        body:JSON.stringify({
          sender,
          to:[{email:recipientEmail,name:recipientName}],
          subject,
          htmlContent
        })
      });
      try{providerBody=await provider.json() as Json}catch{providerBody={}}
    }catch(error){
      const message=error instanceof Error?error.message:"Brevo no respondió.";
      await ctx.supabaseAdmin.from("email_envios_v1518").update({estado:"error",ultimo_error:clean(message,1000),procesado_at:new Date().toISOString()}).eq("id",logId);
      return response(req,{ok:false,error:"No fue posible conectar con el servicio de correo.",logId},502);
    }

    if(!provider.ok){
      const message=clean(providerBody.message??providerBody.error,1000)||`Brevo respondió ${provider.status}.`;
      await ctx.supabaseAdmin.from("email_envios_v1518").update({
        estado:"error",ultimo_error:message,http_status:provider.status,detalle_respuesta:{message},procesado_at:new Date().toISOString()
      }).eq("id",logId);
      return response(req,{ok:false,error:message,providerStatus:provider.status,logId},provider.status);
    }

    const messageId=clean(providerBody.messageId,500)||null;
    const completedAt=new Date().toISOString();
    await ctx.supabaseAdmin.from("email_envios_v1518").update({
      estado:"enviado",message_id:messageId,http_status:provider.status,
      detalle_respuesta:{messageId},enviado_at:completedAt,procesado_at:completedAt,ultimo_error:null
    }).eq("id",logId);

    return response(req,{ok:true,duplicate:false,deliveredTo:recipientEmail,messageId,stage:stageKey,logId});
  })
};