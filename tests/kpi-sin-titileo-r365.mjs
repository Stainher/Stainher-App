import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from 'playwright';

const script=fs.readFileSync('assets/stainher-v1524-stable-kpi-r365.js','utf8');
const loader=fs.readFileSync('assets/stainher-v1524-hp-loader-r72.js','utf8');
new Function(script);new Function(loader);
const boot=loader.slice(loader.indexOf('async function bootstrapR135()'));
assert.match(boot,/await refreshStableKpiR365\(\)/);
assert.doesNotMatch(boot,/await refreshUnifiedSummaryR360\(\)/);
assert.doesNotMatch(boot,/await refreshKpiContrastR362\(\)/);
assert.doesNotMatch(script,/MutationObserver|requestAnimationFrame|setInterval|setTimeout/);

const browser=await chromium.launch({headless:true});
try{
 for(const theme of ['light','modern','dark']){
  const page=await browser.newPage({viewport:{width:390,height:844}});
  await page.setContent('<!doctype html><html data-theme="'+theme+'"><head><style>'+
   'html:is([data-theme="light"],[data-theme="modern"]) body #page-liderazgo .v1512-mini-kpi{background:#f3f8fd!important;color:#173651!important;}'+
   'html:is([data-theme="light"],[data-theme="modern"]) body #page-liderazgo .v1512-mini-kpi :is(span,b,strong,small){color:#173651!important;-webkit-text-fill-color:#173651!important;}'+
   '</style></head><body><section id="page-liderazgo"><div id="stats"><article class="v1512-mini-kpi"><span>PROGRAMADOS</span><b>0</b></article><article class="v1512-mini-kpi"><span>REALIZADOS</span><b>0</b></article></div>'+
   '<div id="table"><table><tr><td>Sin actividades programadas.</td></tr></table></div><button>Nuevo RIT</button></section>'+
   '<section id="page-estandarizacion"><article class="std-kpi"><span>AVANCE GLOBAL</span><strong>58.2%</strong></article></section>'+
   '<section id="page-contrato"><article class="v1520-kpi"><span>VALOR VIGENTE</span><b>$100</b></article></section></body></html>');
  await page.addScriptTag({content:script});
  const checks=await page.evaluate(()=>{
   const sample=()=>{
    const e=document.querySelector('#stats article');const title=e.querySelector('span');const value=e.querySelector('b');
    return {bg:getComputedStyle(e).backgroundImage,title:getComputedStyle(title).color,
      textFill:getComputedStyle(title).webkitTextFillColor,
      value:getComputedStyle(value).color};
   };
   const observed=[sample()];
   const stats=document.getElementById('stats');
   for(let i=0;i<30;i++){
    stats.innerHTML='<article class="v1512-mini-kpi"><span>PROGRAMADOS</span><b>'+i+'</b></article>'+
     '<article class="v1512-mini-kpi"><span>REALIZADOS</span><b>'+i+'</b></article>';
    observed.push(sample());
   }
   const others=['#page-estandarizacion .std-kpi','#page-contrato .v1520-kpi'].map(s=>{
    const e=document.querySelector(s);return {bg:getComputedStyle(e).backgroundImage,text:getComputedStyle(e.querySelector('strong,b')).color};
   });
   return {observed,others,styles:document.querySelectorAll('#stainher-stable-kpi-r365').length,
     untouchedTable:document.querySelector('#table').className,
     untouchedButton:document.querySelector('button').className};
  });
  assert.equal(checks.styles,1,'Only one stable stylesheet');
  for(const [index,frame] of checks.observed.entries()){
   assert.match(frame.bg,/linear-gradient/,theme+' KPI missing at '+index);
   assert.equal(frame.title,'rgb(255, 255, 255)',theme+' title at '+index);
   assert.equal(frame.textFill,'rgb(255, 255, 255)',theme+' fill at '+index);
   assert.equal(frame.value,'rgb(255, 255, 255)',theme+' value at '+index);
  }
  for(const card of checks.others){
   assert.match(card.bg,/linear-gradient/);assert.equal(card.text,'rgb(255, 255, 255)');
  }
  assert.equal(checks.untouchedTable,'');
  assert.equal(checks.untouchedButton,'');
  await page.close();
 }
}finally{await browser.close()}
console.log('R365: sin observadores rivales, KPI blancos/azules estables en 3 temas durante 30 re-renderizados');
