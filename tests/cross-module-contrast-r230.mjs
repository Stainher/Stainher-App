import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {readFileSync,mkdirSync} from 'node:fs';

// Probar el CSS de producción y las reglas heredadas que realmente genera index.html.
const source=readFileSync('assets/stainher-v1524-theme.js','utf8');
const themeCss=source.match(/const css=`([\s\S]*?)`;/)?.[1];
const index=readFileSync('index.html','utf8');
assert.ok(themeCss,'CSS activo de los temas');
const keys=['.v1520-status{','.v1520-status.ok{','.v1520-status.warn{',
 '.v1520-status.bad{','.v1520-status.info{','.v1520-error{',
 '.v1520-readonly{','.v1520-dl dt{','.v1523-prev-unplanned-group{',
 '.v1523-prev-unplanned-group>header{'];
const legacy=keys.map(key=>{
 const at=index.indexOf(key);
 assert.ok(at>=0,'Debe existir la regla heredada '+key);
 return index.slice(at,index.indexOf('}',at)+1);
}).join('\n');
assert.match(themeCss,/R230: criterios WCAG AA/);
assert.match(themeCss,/R230: las pestañas modernas no deben heredar/);

function ratio(text,bg){
 const channels=v=>[...v.matchAll(/[\d.]+/g)].slice(0,3).map(x=>Number(x[0]));
 const luminance=v=>{
   const a=channels(v).map(x=>{let y=x/255;return y<=.04045?y/12.92:((y+.055)/1.055)**2.4});
   assert.equal(a.length,3,'RGB inválido '+v);
   return a[0]*.2126+a[1]*.7152+a[2]*.0722;
 };
 const a=luminance(text),b=luminance(bg);
 return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
}
const browser=await chromium.launch({headless:true});
mkdirSync('artifacts',{recursive:true});
try{
 for(const skin of ['light','modern']){
  for(const width of [390,1280]){
   const page=await browser.newPage({viewport:{width,height:850},deviceScaleFactor:1});
   await page.setContent(`<!DOCTYPE html><html data-theme="${skin}"><body>
   <section id="page-contrato">
    <article class="v1520-contract-card"><dl class="v1520-dl"><dt>Periodo contractual</dt><dd>Octubre 2026</dd></dl></article>
    <div class="states">
     <span class="v1520-status ok">Ejecutada</span>
     <span class="v1520-status warn">Por calendarizar</span>
     <span class="v1520-status bad">Vencida</span>
     <span class="v1520-status info">Programada</span>
    </div>
    <aside class="v1520-readonly">Modo lectura: información contractual</aside>
    <aside class="v1520-error">No fue posible cargar el registro</aside>
   </section>
   <section id="page-preventivo">
    <div class="v1523-prev-unplanned">Por calendarizar
      <div class="v1523-prev-unplanned-group">
       <header><h5>Equipo de prueba</h5></header>
       <div class="v1523-prev-unplanned-row">Actividad de mantenimiento</div>
      </div>
    </div>
    <button class="btn active" aria-selected="true">Vista mensual</button>
    <button class="btn">Vista diaria</button>
   </section>
   <section id="page-solicitudes"><button class="btn active" aria-selected="true"><span>Solicitudes activas</span></button><button class="btn">Finalizadas</button></section>
   <section id="page-sistema"><button class="btn" disabled>No disponible</button></section>
   </body></html>`);
   await page.addStyleTag({content:legacy});
   await page.addStyleTag({content:themeCss});
   const probes=await page.evaluate(()=>{
    const picks={
      estado_ok:'#page-contrato .v1520-status.ok', estado_warn:'#page-contrato .v1520-status.warn',
      estado_bad:'#page-contrato .v1520-status.bad', estado_info:'#page-contrato .v1520-status.info',
      aviso:'#page-contrato .v1520-error',solo_lectura:'#page-contrato .v1520-readonly',
      periodo:'#page-contrato .v1520-dl dt',pendiente:'#page-preventivo .v1523-prev-unplanned-group',
      cabecera:'#page-preventivo .v1523-prev-unplanned-group>header',
      tab_preventivo:'#page-preventivo .btn.active',tab_solicitudes:'#page-solicitudes .btn.active',
      tab_normal:'#page-preventivo .btn:not(.active)',deshabilitado:'#page-sistema button:disabled'
    };
    return Object.fromEntries(Object.entries(picks).map(([key,selector])=>{
      const el=document.querySelector(selector),css=getComputedStyle(el);
      return [key,{color:css.color,fill:css.webkitTextFillColor,background:css.backgroundColor,opacity:css.opacity}];
    }));
   });
   for(const name of ['estado_ok','estado_warn','estado_bad','estado_info','aviso','solo_lectura','pendiente','cabecera','tab_preventivo','tab_solicitudes','tab_normal','deshabilitado']){
    const x=probes[name],r=ratio(x.color,x.background);
    assert.ok(r>=4.5,`${skin} ${width}px ${name}: ${r.toFixed(2)}:1, ${JSON.stringify(x)}`);
   }
   const labelRatio=ratio(probes.periodo.color,probes.solo_lectura.background);
   assert.ok(labelRatio>=4.5,`${skin}: label contractual poco legible: ${labelRatio.toFixed(2)}:1`);
   assert.ok(Number(probes.pendiente.background.match(/\d+/)[0])>=220,skin+' no debe conservar fondo negro en Preventivo');
   await page.screenshot({path:`artifacts/r230-cross-module-${skin}-${width}.png`,fullPage:true});
   console.log('PASS R230 contraste transversal',skin,width,Object.fromEntries(Object.entries(probes).map(([k,v])=>[k,Number(ratio(v.color,v.background).toFixed(2))])));
   await page.close();
  }
 }
}finally{await browser.close()}
