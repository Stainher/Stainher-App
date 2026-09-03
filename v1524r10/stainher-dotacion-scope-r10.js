/* Stainher App V15.24 · Dotación r10
 * Corrige la visibilidad de grupo para Supervisor/Técnico.
 * Usa primero el UUID del perfil autenticado y no depende de que la fila propia
 * venga incluida en un subconjunto previamente filtrado.
 */
(function installDotacionScopeR10(){
  if(window.__STAINHER_DOTACION_SCOPE_R10__)return;
  window.__STAINHER_DOTACION_SCOPE_R10__=true;

  const norm=value=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
  const same=(a,b)=>String(a??'')!==''&&String(a)===String(b);
  const tokens=value=>norm(value).split(' ').filter(x=>x.length>=3);
  function samePersonName(a,b){
    const A=tokens(a),B=tokens(b);if(!A.length||!B.length)return false;
    const small=A.length<=B.length?A:B,big=A.length<=B.length?B:A;
    return small.every(t=>big.includes(t));
  }
  function role(){
    try{return norm(window.v11Role?.()||window.state?.profile?.rol||'')}catch(_){return ''}
  }
  function userId(){
    try{return String(window.state?.profile?.id||window.state?.profile?.user_id||window.state?.session?.user?.id||'')}catch(_){return ''}
  }
  function userName(){
    try{return String(window.state?.profile?.nombre||window.state?.session?.user?.user_metadata?.nombre||'')}catch(_){return ''}
  }
  function identity(rows){
    const uid=userId();
    if(uid){const byId=rows.find(p=>same(p.user_id,uid)||same(p.id,uid));if(byId)return byId}
    const name=userName();
    if(!name)return null;
    return rows.find(p=>norm(p.nombre)===norm(name))||rows.find(p=>samePersonName(p.nombre,name))||null;
  }
  function supervisorMatches(row,sid,names){
    if(sid&&same(row.supervisor_user_id,sid))return true;
    const legacy=String(row.supervisor_nombre||'');
    return !!legacy&&names.some(n=>n&&(norm(legacy)===norm(n)||samePersonName(legacy,n)));
  }
  function visible(rows){
    rows=Array.isArray(rows)?rows:[];
    const r=role();
    if(!['supervisor','tecnico'].includes(r))return rows;

    const uid=userId(),pname=userName(),me=identity(rows);
    if(r==='supervisor'){
      const sid=uid||String(me?.user_id||'');
      const names=[pname,String(me?.nombre||'')].filter(Boolean);
      return rows.filter(p=>
        (sid&&(same(p.user_id,sid)||same(p.id,sid)))||
        supervisorMatches(p,sid,names)||
        (/supervisor/i.test(String(p.cargo||''))&&names.some(n=>samePersonName(p.nombre,n)))
      );
    }

    const myId=uid||String(me?.user_id||'');
    if(!me){
      return rows.filter(p=>myId&&(same(p.user_id,myId)||same(p.id,myId)));
    }
    const sid=String(me.supervisor_user_id||'');
    const sname=String(me.supervisor_nombre||'');
    return rows.filter(p=>
      (myId&&(same(p.user_id,myId)||same(p.id,myId)))||
      (sid&&(same(p.user_id,sid)||same(p.supervisor_user_id,sid)))||
      (!sid&&sname&&(samePersonName(p.nombre,sname)||samePersonName(p.supervisor_nombre,sname)))
    );
  }

  function installGlobals(){
    window.v156VisibleDotation=visible;
    window.v1524VisibleCrewScope=visible;
    window.v1524VisibleCrewScopeR10=visible;
    try{v156VisibleDotation=visible}catch(_){ }
  }

  const renderNames=['renderStandaloneDotacion','renderDotacion','renderDotacionV15'];
  function wrapRenderers(){
    let found=false;
    renderNames.forEach(name=>{
      const current=window[name];
      if(typeof current!=='function')return;
      found=true;
      if(current.__stainherDotacionScopeR10)return;
      const wrapped=async function(){
        installGlobals();
        const out=await current.apply(this,arguments);
        installGlobals();
        return out;
      };
      wrapped.__stainherDotacionScopeR10=true;
      wrapped.__base=current;
      window[name]=wrapped;
    });
    return found;
  }

  let refreshed=false;
  function pageVisible(){
    const page=document.getElementById('page-dotacion');
    if(!page)return false;
    const style=getComputedStyle(page);
    return style.display!=='none'&&!page.hidden;
  }
  function refreshCurrentPage(){
    if(refreshed||!pageVisible())return;
    const fn=window.renderStandaloneDotacion||window.renderDotacion||window.renderDotacionV15;
    if(typeof fn!=='function')return;
    refreshed=true;
    Promise.resolve(fn()).catch(err=>console.warn('[Dotación r10]',err));
  }

  function boot(){
    installGlobals();
    wrapRenderers();
    setTimeout(refreshCurrentPage,180);
    let tries=0;
    const timer=setInterval(()=>{
      installGlobals();wrapRenderers();
      if(pageVisible())refreshCurrentPage();
      if(++tries>60)clearInterval(timer);
    },150);
    document.addEventListener('click',event=>{
      const target=event.target?.closest?.('[data-page]');
      if(String(target?.dataset?.page||'')==='dotacion'){
        refreshed=false;
        installGlobals();
        setTimeout(()=>{wrapRenderers();refreshCurrentPage()},80);
      }
    },true);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
