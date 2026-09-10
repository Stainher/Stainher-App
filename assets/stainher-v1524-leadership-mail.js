/* Stainher App V15.24 · correo automático de Controles Stainher realizados.
 * Todo control ejecutado envía el PDF al ejecutor y Prevención, con copia a Administrador.
 * No modifica la lógica de registro del control ni otros módulos de correo.
 */
(()=>{
  'use strict';
  if(window.__STAINHER_LEADERSHIP_MAIL_V1__)return;
  window.__STAINHER_LEADERSHIP_MAIL_V1__=true;

  const deliveries=new WeakMap();
  const WRAP=Symbol('stainherLeadershipMailWrap');
  const cleanFile=value=>String(value||'Control_Stainher.pdf').trim()||'Control_Stainher.pdf';
  const controlLabel=file=>cleanFile(file).replace(/\.pdf$/i,'').replace(/[_-]+/g,' ').replace(/\s+/g,' ').trim();

  async function sendControl(doc,fileName,recordId=null,meta={}){
    if(!doc||typeof doc.output!=='function')throw new Error('PDF del control no disponible.');
    const sb=window.sb;if(!sb?.functions?.invoke)throw new Error('Servicio de correo no disponible.');
    const pdfBase64=doc.output('datauristring').split(',')[1];
    if(!pdfBase64)throw new Error('No se pudo preparar el PDF para correo.');
    const name=cleanFile(fileName),label=String(meta?.control||controlLabel(name)),reference=recordId?String(recordId):null;
    const key=`liderazgo-control:${reference||crypto.randomUUID()}:${window.state?.session?.user?.id||'anon'}`;
    const result=await sb.functions.invoke('send-leadership-control-email',{body:{
      subject:`Control Stainher realizado · ${label}`,
      htmlContent:`<h2>Control Stainher realizado</h2><p>Se adjunta el formulario PDF del control <b>${String(label).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}</b>.</p><p>El envío se distribuye automáticamente al usuario que realizó el control y al personal de Prevención, con copia al Administrador.</p>`,
      pdfBase64,pdfName:name,referencia_id:reference,idempotencyKey:key,
      controlNombre:label,fecha:meta?.fecha||null
    }});
    if(result.error)throw result.error;
    if(result.data?.ok===false)throw new Error(result.data?.error||'El servicio rechazó el correo.');
    return result.data;
  }

  function delivery(doc,fileName,recordId=null,meta={}){
    if(deliveries.has(doc))return deliveries.get(doc);
    const promise=sendControl(doc,fileName,recordId,meta);
    deliveries.set(doc,promise);
    return promise;
  }

  async function deliverCaptured(captured,meta={},notifySuccess=false){
    if(!captured?.doc||deliveries.has(captured.doc))return;
    try{
      await delivery(captured.doc,captured.fileName,null,meta);
      if(notifySuccess)window.toast?.('Control registrado y copia enviada por correo','success');
    }catch(error){
      console.warn('[Stainher Liderazgo] correo del control',error);
      window.toast?.(`Control registrado. Correo no enviado: ${error?.message||String(error)}`,'warn');
    }
  }

  async function capturePdf(run){
    const ctor=window.jspdf?.jsPDF,proto=ctor?.prototype,original=proto?.save;
    let captured=null;
    if(!proto||typeof original!=='function'){
      const result=await run();return {result,captured};
    }
    proto.save=function(fileName,...args){captured={doc:this,fileName:cleanFile(fileName)};return original.call(this,fileName,...args)};
    try{return {result:await run(),captured}}
    finally{proto.save=original}
  }

  function wrapSafeAutoSend(){
    const current=window.v156SafeAutoSend;
    if(typeof current!=='function'||current[WRAP])return;
    const wrapped=async function(doc,fileName,type,module,recordId,to=[]){
      if(String(module||'').toLowerCase()!=='liderazgo')return current.apply(this,arguments);
      try{
        await delivery(doc,fileName,recordId,{control:controlLabel(fileName)});
        window.toast?.('PDF generado y correo enviado','success');
        return true;
      }catch(error){
        console.warn('[Stainher Liderazgo] correo automático',error);
        window.toast?.(`PDF generado. Correo no enviado: ${error?.message||String(error)}`,'warn');
        return false;
      }
    };
    wrapped[WRAP]=true;window.v156SafeAutoSend=wrapped;
  }

  function wrapGenerator(name){
    const current=window[name];
    if(typeof current!=='function'||current[WRAP])return;
    const wrapped=async function(...args){
      const {result,captured}=await capturePdf(()=>current.apply(this,args));
      await deliverCaptured(captured,{control:controlLabel(captured?.fileName||name)},false);
      return result;
    };
    wrapped[WRAP]=true;window[name]=wrapped;
  }

  function wrapFormAfterOpen(openerName,formId){
    const current=window[openerName];
    if(typeof current!=='function'||current[WRAP])return;
    const wrapped=async function(...args){
      const out=await current.apply(this,args);
      queueMicrotask(()=>{
        const form=document.getElementById(formId),submit=form?.onsubmit;
        if(!form||typeof submit!=='function'||submit[WRAP])return;
        const submitWrapped=async function(...submitArgs){
          const {result,captured}=await capturePdf(()=>submit.apply(this,submitArgs));
          await deliverCaptured(captured,{control:controlLabel(captured?.fileName||formId)},false);
          return result;
        };
        submitWrapped[WRAP]=true;form.onsubmit=submitWrapped;
      });
      return out;
    };
    wrapped[WRAP]=true;window[openerName]=wrapped;
  }

  function install(){
    wrapSafeAutoSend();
    ['generateVehiculoV13','generateExtV12','generateTerrainPdfV11','generateEppV12','generateEnvV12','generateProtV12'].forEach(wrapGenerator);
    wrapFormAfterOpen('v1512OpenGenericControl','v1524GenericForm');
    wrapFormAfterOpen('v1512OpenExtraInspection','v1512ExtraForm');
  }

  window.StainherLeadershipMail=Object.freeze({send:delivery,install});
  install();
  window.addEventListener('stainher:modules-ready',()=>{install();setTimeout(install,100);setTimeout(install,900)},{once:true});
  [250,700,1400,2600,4500].forEach(ms=>setTimeout(install,ms));
})();
