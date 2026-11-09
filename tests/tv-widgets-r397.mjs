import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {chromium} from 'playwright';
const js=readFileSync('assets/stainher-tv-r397.js','utf8');
const css=readFileSync('assets/stainher-tv-r397.css','utf8');
const fixture=readFileSync('tests/fixtures/tv-r397-fixture.js','utf8');
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:1920,height:1080}});
 await page.clock.setFixedTime(new Date('2026-12-01T02:59:59Z'));
 await page.setContent('<!doctype html><html><head></head><body><div id="appView"><aside class="sidebar"><nav class="nav"></nav></aside><p id="qa-status"></p></div></body></html>');
 const weatherRequests={andina:0,santiago:0};
 await page.route(/https:\/\/pronostico-fixture\.invalid\/functions\/v1\/tv-pronostico(?:\?.*)?$/,route=>{
  const location=new URL(route.request().url()).searchParams.get('location')||'andina';
  weatherRequests[location]++;
  const delta=location==='santiago'?10:0;
  return route.fulfill({headers:{'Access-Control-Allow-Origin':'*'},json:{
   location,updatedAt:'2026-11-30T22:00:00Z',expiresAt:Date.parse('2026-12-01T06:00:00Z'),
   days:Array.from({length:8},(_,i)=>({
    date:new Date(Date.UTC(2026,10,30+i)).toISOString().slice(0,10),
    min:i-2+delta,max:i+5+delta,condition:['sun','snow','rain','cloud','partly','sleet','thunder','fog'][i],
   })),
  }});
 });
 await page.route('https://pronostico-fixture.invalid/functions/v1/tv-portal-deve',route=>route.fulfill({
  headers:{'Access-Control-Allow-Origin':'*'},json:{
   consultedAt:'2026-12-01T02:59:50Z',alert:'Aviso de prueba <img src=x>',
   documents:[
    {label:'Pronóstico semanal',url:'https://deve.codelco.cl/deve/site/docs/semana.pdf'},
    {label:'Destino inválido',url:'https://example.invalid/archivo.pdf'},
   ],
  },
 }));
 await page.addStyleTag({content:css});await page.addScriptTag({content:fixture});
 await page.evaluate(()=>{window.STAINHER_CONFIG={SUPABASE_URL:'https://pronostico-fixture.invalid'}});
 await page.addScriptTag({content:js});
 await page.evaluate(()=>{state.profile.rol='tecnico';StainherTV.install()});
 assert.equal(await page.locator('#stainher-tv-open').count(),0);
 await page.evaluate(()=>StainherTV.open());assert.equal(await page.locator('#stainher-tv').count(),0);
 await page.evaluate(()=>{state.profile.rol='administrador';tvQA.serverRole='tecnico';StainherTV.install()});
 await page.evaluate(()=>StainherTV.open());assert.equal(await page.locator('#stainher-tv').count(),0,'Server role must reject a forged local admin');
 await page.evaluate(()=>{tvQA.serverRole='administrador'});await page.locator('#stainher-tv-open').click();
 await page.locator('#stainher-tv').waitFor();assert.equal(await page.locator('.tv-widget').count(),5);
 assert.ok(await page.locator('.tv-kpis').innerText().then(t=>t.includes('5 / 28')));
 await page.locator('[data-tv-screen="1"]').click();assert.equal(await page.locator('.tv-rosters section').count(),3);
 await page.locator('[data-tv-screen="2"]').click();assert.equal(await page.locator('.tv-directory section').count(),8);
 assert.equal(await page.locator('#stainher-tv').evaluate(n=>n.scrollWidth<=n.clientWidth),true);
 await page.locator('[data-tv-action="edit"]').click();await page.locator('[name="title"]').fill('Personal TV');
 await page.locator('[data-tv-action="add-screen"]').click();await page.locator('[name="title"]').fill('Avisos');
 await page.locator('[data-tv-field="text"]').fill('<img src=x onerror=alert(1)> Mensaje de prueba');
 await page.locator('[name="type"]').selectOption('reloj');await page.locator('[data-tv-action="add-widget"]').click();
 await page.locator('[data-tv-action="up"][data-index="1"]').click();
 await page.locator('[data-tv-field="width"]').first().selectOption('4');
 await page.locator('[data-tv-action="down"][data-index="0"]').click();
 await page.locator('[name="type"]').selectOption('calendario');await page.locator('[data-tv-action="add-widget"]').click();
 await page.locator('[data-tv-field="width"]').nth(0).selectOption('4');
 await page.locator('[data-tv-field="width"]').nth(2).selectOption('4');
 await page.locator('[name="type"]').selectOption('clima');await page.locator('[data-tv-action="add-widget"]').click();
 await page.locator('[name="type"]').selectOption('clima');await page.locator('[data-tv-action="add-widget"]').click();
 await page.getByLabel('Ubicación',{exact:false}).last().selectOption('santiago');
 await page.locator('[name="type"]').selectOption('portal');await page.locator('[data-tv-action="add-widget"]').click();
 await page.locator('[type="submit"]').click();await page.locator('[data-tv-editor]').waitFor({state:'hidden'});
 assert.equal(await page.evaluate(()=>tvQA.writes),1);assert.equal(await page.locator('.tv-message img').count(),0,'Custom messages must be escaped');
 assert.equal(await page.locator('[data-tv-tabs] button').count(),4);
 await page.getByRole('heading',{name:'Reloj analógico',exact:true}).waitFor();
 const clock=page.locator('.tv-clock-time');
 const today=page.locator('.tv-calendar [aria-current="date"]');
 const weekday=page.locator('.tv-calendar th.tv-calendar-weekday');
 const hand=name=>clock.locator(`[data-clock-hand="${name}"]`);
 const andina=page.locator('[data-tv-weather="andina"]');
 const santiago=page.locator('[data-tv-weather="santiago"]');
 const forecast=andina.locator('.tv-weather-day');
 const cityDays=santiago.locator('.tv-weather-day');
 await cityDays.first().waitFor();
 assert.equal(await cityDays.count(),7);
 assert.match(await cityDays.first().innerText(),/Mín.*8°.*Máx.*15°/s);
 assert.equal(await santiago.locator('.tv-weather-place').textContent(),'Santiago · sector centro');
 await forecast.first().waitFor();
 assert.equal(await forecast.count(),7);
 assert.equal(await forecast.locator('svg').count(),7);
 assert.match(await forecast.first().innerText(),/Hoy.*Despejado.*Mín.*-2°.*Máx.*5°/s);
 assert.equal(await andina.locator('.tv-weather-source').getByRole('link',{name:'MET Norway'}).textContent(),'MET Norway');
 assert.equal(await clock.getAttribute('datetime'),'23:59:59');
 assert.equal(await clock.locator('svg text').count(),12);
 assert.equal(await hand('second').getAttribute('transform'),'rotate(354 100 100)');
 assert.equal(await weekday.getAttribute('aria-label'),'Lunes, día de la semana actual');
 assert.equal(await page.locator('.tv-calendar td.tv-calendar-weekday').count(),5);
 assert.equal(await weekday.evaluate(th=>getComputedStyle(th).backgroundColor),'rgb(23, 100, 125)');
 const calendarSize=()=>page.evaluate(()=>{
  const clock=document.querySelector('.tv-clock').getBoundingClientRect();
  const calendar=document.querySelector('.tv-calendar caption').getBoundingClientRect();
  const lastWeek=document.querySelector('.tv-calendar tbody tr:last-child').getBoundingClientRect();
  const date=document.querySelector('.tv-calendar-current-cell');
  return {heightRatio:(lastWeek.bottom-calendar.top)/clock.height,topDifference:Math.abs(calendar.top-clock.top),
   dateFont:parseFloat(getComputedStyle(date).fontSize),currentColor:getComputedStyle(date).backgroundColor};
 });
 const normal=await calendarSize();
 assert.ok(normal.heightRatio>=.94&&normal.heightRatio<=1.04,JSON.stringify(normal));
 assert.ok(normal.topDifference<=2,JSON.stringify(normal));
 assert.ok(normal.dateFont>=20,JSON.stringify(normal));
 assert.equal(normal.currentColor,'rgb(18, 97, 128)');
 await page.locator('[data-tv-action="fullscreen"]').click();
 await page.waitForFunction(()=>Number(document.querySelector('[data-tv-grid]').style.zoom)>0);
 const fullscreen=await calendarSize();
 assert.ok(fullscreen.heightRatio>=.94&&fullscreen.heightRatio<=1.04,JSON.stringify(fullscreen));
 await page.locator('[data-tv-action="controls"]').click();
 assert.equal(await page.locator('.tv-calendar caption').textContent(),'noviembre de 2026');
 assert.equal(await today.getAttribute('datetime'),'2026-11-30');
 assert.equal(await today.evaluate(node=>node.parentElement.cellIndex),0);
 await page.clock.setFixedTime(new Date('2026-12-01T03:00:05Z'));
 await page.locator('.tv-clock-time[datetime="00:00:05"]').waitFor();
 await page.locator('.tv-calendar [datetime="2026-12-01"]').waitFor();
 assert.equal(await today.evaluate(node=>node.parentElement.cellIndex),1);
 assert.equal(await weekday.getAttribute('aria-label'),'Martes, día de la semana actual');
 assert.equal(await forecast.first().locator('time').getAttribute('datetime'),'2026-12-01');
 assert.match(await forecast.first().innerText(),/Nieve/);
 assert.equal(await hand('second').getAttribute('transform'),'rotate(30 100 100)');
 assert.equal(await hand('minute').getAttribute('transform'),'rotate(0.5 100 100)');
 assert.equal(await page.locator('.tv-calendar caption').textContent(),'diciembre de 2026');
 await page.locator('[data-tv-action="close"]').click();assert.equal(await page.locator('#stainher-tv').count(),0);assert.equal(await page.locator('#appView').evaluate(n=>n.inert),false);
 await page.evaluate(()=>{tvQA.saved.valor.screens[1].widgets.find(widget=>widget.type==='reloj').title='Reloj digital'});
 await page.locator('#stainher-tv-open').click();await page.locator('#stainher-tv').waitFor();assert.equal(await page.locator('[data-tv-tabs] button').count(),4,'Saved screens survive reopening');
 await page.locator('[data-tv-screen="1"]').click();
 await page.getByRole('heading',{name:'Reloj analógico',exact:true}).waitFor();
 await page.locator('[data-tv-screen="0"]').click();
 await page.locator('[data-tv-action="edit"]').click();await page.locator('[name="title"]').fill('No debe guardarse');
 await page.evaluate(()=>{tvQA.saved.updated_at='changed-by-other-admin'});await page.locator('[type="submit"]').click();
 await page.getByText('La configuración cambió en otra sesión.',{exact:false}).waitFor();assert.equal(await page.evaluate(()=>tvQA.writes),1);
 await page.locator('[data-tv-action="cancel"]').first().click();
 await page.locator('[data-tv-action="play"]').click();assert.equal(await page.locator('[data-tv-action="play"]').getAttribute('aria-pressed'),'true');
 await page.locator('[data-tv-action="play"]').click();
 await page.getByRole('button',{name:'Avisos',exact:true}).click();
 assert.equal(await today.getAttribute('datetime'),'2026-12-01','Saved calendar survives reopening');
 assert.equal(await forecast.count(),7,'El pronóstico guardado sigue visible');
 assert.equal(await cityDays.count(),7,'Santiago se conserva al reabrir');
 assert.deepEqual(weatherRequests,{andina:1,santiago:1},'La caché es independiente para cada ubicación');
 const panel=page.locator('[data-tv-portal]');
 await panel.getByText('Aviso de prueba <img src=x>',{exact:true}).waitFor();
 assert.equal(await panel.locator('img').count(),0);
 assert.equal(await panel.getByRole('link',{name:/Pronóstico semanal/}).getAttribute('href'),'https://deve.codelco.cl/deve/site/docs/semana.pdf');
 assert.equal(await panel.getByText('Destino inválido').count(),0);
 assert.match(await panel.innerText(),/Fuente: Codelco DEVE/);
 const portal=page.getByRole('link',{name:'Abrir portal oficial'});
 assert.equal(await portal.getAttribute('href'),'https://deve.codelco.cl/');
 assert.equal(await portal.getAttribute('rel'),'noopener noreferrer');
 await portal.focus();
 await portal.press('Tab');
 assert.equal(await page.evaluate(()=>document.activeElement.dataset.tvAction),'close');
 await page.context().route('https://deve.codelco.cl/',route=>route.fulfill({
  headers:{'Content-Security-Policy':"frame-ancestors 'self'",'X-Frame-Options':'SAMEORIGIN'},
  body:'Portal DEVE de prueba',
 }));
 const [opened]=await Promise.all([
  page.context().waitForEvent('page'),
  portal.click(),
 ]);
 await opened.waitForURL('https://deve.codelco.cl/');
 assert.equal(opened.url(),'https://deve.codelco.cl/');
 assert.equal(await page.locator('#stainher-tv').count(),1);
 await opened.close();
 await page.setViewportSize({width:390,height:844});assert.equal(await page.locator('#stainher-tv').evaluate(n=>n.scrollWidth<=n.clientWidth),true);
 await page.evaluate(()=>{state.profile.rol='tecnico';StainherTV.install()});assert.equal(await page.locator('#stainher-tv').count(),0,'Revoking admin closes TV');
 console.log('R397: admin-only entry, server authorization, live widgets, escaping, editing, shared persistence, conflict handling, rotation controls, mobile overflow and cleanup passed.');
}finally{await browser.close()}
