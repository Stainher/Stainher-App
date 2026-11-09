import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {chromium} from 'playwright';

const watcher=readFileSync('assets/stainher-v1524-release-refresh-r231.js','utf8');
const site='https://stainher-qa.invalid/Stainher-App';
const documentFor=revision=>`<!doctype html><html data-stainher-revision="${revision}"><head>
 <base href="${site}/assets/"><title>Stainher App V15.24 ${revision}</title>
 <script defer src="stainher-v1524-release-refresh-r231.js"></script></head>
 <body><h1>${revision}</h1></body></html>`;
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage();
 const requests=[];
 page.on('request',request=>requests.push([request.isNavigationRequest(),request.url()]));
 page.on('requestfailed',request=>requests.push([request.failure()?.errorText,request.url()]));
 let manifest='R405',available='R405';
 await page.route(site+'/**',route=>{
  const url=new URL(route.request().url());
  if(url.pathname.endsWith('/release.json'))return route.fulfill({json:{revision:manifest}});
  if(url.pathname.endsWith('.js'))return route.fulfill({contentType:'text/javascript',body:watcher});
  return route.fulfill({contentType:'text/html',body:documentFor(available)});
 });
 await page.goto(site+'/index.html');
 await page.evaluate(()=>{
  document.title='Stainher App V15.24 R403';
  window.previousDocument=true;
  sessionStorage.setItem('test-session','persistente');
 });
 const recheck=async()=>{
  const checked=page.waitForResponse(response=>response.url().includes('/release.json?'));
  await page.evaluate(()=>window.dispatchEvent(new Event('pageshow')));
  await checked;
 };
 await recheck();
 const notice=page.locator('#stainher-release-notice');
 assert.equal(await notice.count(),0);
 manifest='R406';
 await recheck();
 await notice.getByRole('button',{name:'Actualizar ahora'}).click();
 await notice.getByText(/El servidor entrega R405 en lugar de R406/).waitFor();
 assert.equal(await page.evaluate(()=>window.previousDocument),true);
 available='R406';
 try{
  await notice.getByRole('button',{name:'Reintentar actualización'}).click({noWaitAfter:true});
  await page.getByRole('heading',{name:'R406'}).waitFor({timeout:10000});
  assert.ok(new URL(page.url()).searchParams.has('verify'));
 }catch(error){
  const status=await page.locator('body').innerText().catch(()=>'-');
  throw new Error(`Navegación a revisión verificada: ${page.url()} | ${status} | ${JSON.stringify(requests)}`,{cause:error});
 }
 assert.equal(await page.evaluate(()=>window.previousDocument),undefined,'La nueva revisión inicia en un documento nuevo');
 assert.equal(await page.evaluate(()=>sessionStorage.getItem('test-session')),'persistente');
 await recheck();
 assert.equal(await notice.count(),0);
}finally{await browser.close()}
console.log('Actualización: título histórico ignorado, HTML atrasado rechazado, navegación verificada y sesión conservada.');
