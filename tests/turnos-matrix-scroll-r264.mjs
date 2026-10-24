import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {readFileSync,mkdirSync} from 'node:fs';
const source=readFileSync('assets/stainher-turnos-direct-r18.js','utf8');
const css=source.match(/s\.textContent=`([\s\S]*?)`;document\.head\.appendChild\(s\);/)?.[1];
assert.ok(css,'CSS real de Turnos');
mkdirSync('artifacts',{recursive:true});
const browser=await chromium.launch({headless:true});
try{
 for(const theme of ['light','modern']){
  const page=await browser.newPage({viewport:{width:390,height:844}});
  const days=Array.from({length:31},(_,i)=>'<th>'+String(i+1)+'</th>').join('');
  const cells=Array.from({length:31},()=>'<td>A</td>').join('');
  await page.setContent('<html data-theme="'+theme+'"><head><style>*{box-sizing:border-box}body{margin:0}main{width:100%;padding:10px;min-width:0}</style></head><body><main id="page-turnos"><div class="r18-matrix"><table><thead><tr><th>Colaborador</th>'+days+'</tr></thead><tbody><tr><td>Trabajador de prueba</td>'+cells+'</tr></tbody></table></div></main></body></html>');
  await page.addStyleTag({content:css});
  const before=await page.evaluate(()=>{const m=document.querySelector('.r18-matrix'),n=m.querySelector('tbody td');return {documentWidth:document.documentElement.scrollWidth,viewport:innerWidth,available:m.scrollWidth-m.clientWidth,left:n.getBoundingClientRect().left,sticky:getComputedStyle(n).position}});
  assert.ok(before.documentWidth<=before.viewport+1,'Sin desborde global');
  assert.ok(before.available>400,'Malla desplazable');
  assert.equal(before.sticky,'sticky','Colaborador fijo');
  const after=await page.evaluate(()=>{const m=document.querySelector('.r18-matrix');m.scrollLeft=440;return {scrollLeft:m.scrollLeft,left:m.querySelector('tbody td').getBoundingClientRect().left}});
  assert.ok(after.scrollLeft>300,'Scroll funciona');
  assert.ok(Math.abs(after.left-before.left)<2,'Colaborador permanece visible');
  await page.screenshot({path:'artifacts/turnos-matrix-scroll-'+theme+'-r264.png'});
  await page.close();
 }
}finally{await browser.close()}
