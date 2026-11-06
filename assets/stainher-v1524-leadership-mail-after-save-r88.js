/* Stainher V15.24 · R88 · correo de Liderazgo desacoplado de doc.save().
 * Después de guardar un control personalizado/extra, recupera el registro real,
 * reconstruye el PDF desde liderazgo_cumplimiento y llama la Edge Function con
 * referencia_id real. Sin observers globales ni cambios de login.
 */
(()=>{
  'use strict';
  const BUILD='20261106-r379-leadership-mail-record-fallback';
  if(window.__STAINHER_LEADERSHIP_MAIL_AFTER_SAVE_R88__===BUILD)return;
  window.__STAINHER_LEADERSHIP_MAIL_AFTER_SAVE_R88__=BUILD;

  const WRAP=Symbol('stainherLeadershipMailAfterSaveR88');
  const sent=new Set();
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  const clean=v=>String(v==null?'':v).trim();
  const safeFile=v=>clean(v||'Control_Stainher').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9_-]+/g,'_').replace(/^_+|_+$/g,'')||'Control_Stainher';

  function currentUserId(){
    return clean(window.state?.session?.user?.id||window.state?.user?.id||'');
  }

  async function latestSavedRecord(startedAt){
    const sb=window.sb,uid=currentUserId();
    if(!sb||!uid)return null;
    const from=new Date(startedAt-3000).toISOString();
    for(let attempt=0;attempt<8;attempt++){
      for(const field of ['ejecutado_por_user_id','created_by']){
        try{
          const q=await sb.from('liderazgo_cumplimiento')
            .select('*').eq(field,uid).gte('created_at',from)
            .order('created_at',{ascending:false}).limit(1);
          if(!q.error&&Array.isArray(q.data)&&q.data[0])return q.data[0];
        }catch(_){ }
      }
      await sleep(350+attempt*120);
    }
    return null;
  }

  async function alreadySent(recordId){
    try{
      const q=await window.sb.from('email_envios_v1518')
        .select('id,estado').eq('modulo','liderazgo').eq('referencia_id',String(recordId))
        .eq('estado','enviado').limit(1);
      return !q.error&&Array.isArray(q.data)&&q.data.length>0;
    }catch(_){return false}
  }

  function buildPdf(row){
    const builder=window.StainherLeadershipR86?.buildRecordPdf;
    if(typeof builder!=='function')throw new Error('Generador PDF de Liderazgo no disponible.');
    return builder(row);
  }

  async function sendRecord(row){
    if(!row?.id||sent.has(String(row.id)))return false;
    const id=String(row.id);
    if(await alreadySent(id)){sent.add(id);return true;}
    const mail=window.StainherLeadershipMail;
    if(!mail?.send)throw new Error('Módulo de correo de Liderazgo no disponible.');
    const doc=buildPdf(row);
    const label=clean(row.control_nombre||row.control_codigo||'Control Stainher');
    const filename=`${safeFile(row.control_codigo||row.control_nombre)}_${clean(row.fecha).replace(/-/g,'')}.pdf`;
    await mail.send(doc,filename,id,{control:label,fecha:row.fecha||null});
    sent.add(id);
    window.toast?.('Control registrado y correo enviado a Prevención + Administrador','success');
    return true;
  }

  async function afterSaved(startedAt,captured=null){
    // El guardado puede ser válido aunque un filtro por fecha/usuario no recupere el registro.
    // Reutilizar el mismo documento mantiene la deduplicación del módulo de correo.
    if(!captured?.doc)return false; // Sin PDF no asumir que el guardado concluyó.
    try{
      const row=await latestSavedRecord(startedAt);
      const mail=window.StainherLeadershipMail;
      if(!mail?.send)throw new Error('Servicio de correo no disponible.');
      if(row?.id){
        if(await alreadySent(row.id)){sent.add(String(row.id));return true;}
        await mail.send(captured.doc,captured.fileName,String(row.id),{control:row.control_nombre||row.control_codigo,fecha:row.fecha});
        sent.add(String(row.id));
      }else{
        await mail.send(captured.doc,captured.fileName,null,{control:captured.control||'Control Stainher'});
      }
      return true;
    }catch(error){
      console.warn('[Stainher Liderazgo R379] correo posterior al guardado',error);
      window.toast?.(`Control registrado. Correo no enviado: ${error?.message||String(error)}`,'warn');
      return false;
    }
  }

  function wrapForm(form){
    const submit=form?.onsubmit;
    if(!form||typeof submit!=='function'||submit[WRAP])return;
    const wrapped=async function(...args){
      const startedAt=Date.now();
      const proto=window.jspdf?.jsPDF?.prototype;
      const save=proto?.save;
      let captured=null;
      if(typeof save==='function'){
        proto.save=function(fileName,...saveArgs){
          captured={doc:this,fileName:String(fileName||'Control_Stainher.pdf')};
          return save.call(this,fileName,...saveArgs);
        };
      }
      let out;
      try{out=await submit.apply(this,args)}
      finally{if(typeof save==='function')proto.save=save}
      await afterSaved(startedAt,captured);
      return out;
    };
    wrapped[WRAP]=true;wrapped.__base=submit;form.onsubmit=wrapped;
  }

  function wrapOpener(name,formIds){
    const current=window[name];
    if(typeof current!=='function'||current[WRAP])return;
    const ids=Array.isArray(formIds)?formIds:[formIds];
    const wrapped=async function(...args){
      const out=await current.apply(this,args);
      queueMicrotask(()=>wrapForm(ids.map(id=>document.getElementById(id)).find(Boolean)));
      setTimeout(()=>wrapForm(ids.map(id=>document.getElementById(id)).find(Boolean)),80);
      return out;
    };
    wrapped[WRAP]=true;wrapped.__base=current;window[name]=wrapped;
  }

  function install(){
    window.StainherLeadershipMail?.install?.();
    wrapOpener('v1512OpenGenericControl',['v1524GenericForm','v1512GenericForm']);
    wrapOpener('v1512OpenExtraInspection','v1512Extra');
  }

  window.StainherLeadershipMailAfterSaveR88=Object.freeze({install,sendRecord,afterSaved});
  install();
  window.addEventListener('stainher:modules-ready',()=>{install();setTimeout(install,120);setTimeout(install,900)},{once:true});
  [300,900,1800,3200].forEach(ms=>setTimeout(install,ms));
})();
