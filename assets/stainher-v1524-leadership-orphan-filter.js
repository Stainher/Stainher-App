/* Stainher V15.24 · filtro de programaciones huérfanas de Liderazgo. */
(()=>{
  'use strict';
  if(window.__STAINHER_LEADERSHIP_ORPHAN_FILTER__)return;
  window.__STAINHER_LEADERSHIP_ORPHAN_FILTER__=true;

  const controls=()=>{try{return Array.isArray(V12_CONTROLS)?V12_CONTROLS:[]}catch(_){return []}};
  const rowCode=row=>String(row?.control_codigo||row?.control_code||row?.codigo_control||row?.codigo||row?.control||'').trim();

  async function activeCodes(){
    const set=new Set();
    controls().forEach(c=>{if(c&&c.active!==false&&c.code)set.add(String(c.code).trim())});
    try{
      const base=await window.sb.from('liderazgo_controles_base_v1513').select('codigo,activo');
      if(!base.error)(base.data||[]).forEach(r=>{if(r?.activo!==false&&r?.codigo)set.add(String(r.codigo).trim())});
    }catch(_){ }
    try{
      const custom=await window.sb.from('liderazgo_plantillas_v1512').select('codigo,activo');
      if(!custom.error)(custom.data||[]).forEach(r=>{if(r?.activo!==false&&r?.codigo)set.add(String(r.codigo).trim())});
    }catch(_){ }
    return set;
  }

  async function install(){
    const sb=window.sb;
    if(!sb||typeof sb.from!=='function'||sb.from.__stainherOrphanFilter)return false;
    const active=await activeCodes();
    const original=sb.from.bind(sb);
    const wrapBuilder=builder=>{
      if(!builder||typeof builder!=='object')return builder;
      return new Proxy(builder,{
        get(target,prop){
          if(prop==='then')return (ok,fail)=>target.then(result=>{
            if(result&&!result.error&&Array.isArray(result.data)){
              result={...result,data:result.data.filter(row=>{
                const code=rowCode(row);
                return !code||active.has(code);
              })};
            }
            return typeof ok==='function'?ok(result):result;
          },fail);
          const value=Reflect.get(target,prop,target);
          if(typeof value!=='function')return value;
          return (...args)=>{
            const out=value.apply(target,args);
            return out&&typeof out==='object'&&typeof out.then==='function'?wrapBuilder(out):out;
          };
        }
      });
    };
    const wrapped=function(table){
      const builder=original(table);
      return String(table)==='liderazgo_programacion'?wrapBuilder(builder):builder;
    };
    wrapped.__stainherOrphanFilter=true;
    wrapped.__base=original;
    sb.from=wrapped;
    return true;
  }

  const tryInstall=()=>install().catch(err=>console.warn('[Stainher] filtro liderazgo',err));
  tryInstall();
  window.addEventListener('stainher:modules-ready',tryInstall);
  setTimeout(tryInstall,500);
  setTimeout(tryInstall,1500);
})();
