import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import {chromium} from 'playwright';

const release=JSON.parse(readFileSync('release.json','utf8'));
const site='https://stainher-qa.invalid';
const profile={id:'27d3c835-5957-49e8-b781-390d4b3c6a92',email:'admin@example.test',nombre:'Administrador de prueba',rol:'administrador',activo:true};
const mime={html:'text/html; charset=utf-8',js:'application/javascript',css:'text/css',json:'application/json'};

test('Inicio conserva el título, el panel y la dotación al cargar módulos y refrescar datos', {timeout:45000}, async()=>{
  const browser=await chromium.launch({headless:true});
  try{
    for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
      const page=await browser.newPage({viewport,isMobile:viewport.width===390,hasTouch:viewport.width===390});
      page.setDefaultTimeout(8000);
      const assetBuilds=new Map();
      await page.route('**/*',async route=>{
        const url=new URL(route.request().url());
        if(url.origin===site){
          const path=url.pathname==='/'?'index.html':'.'+url.pathname;
          if(url.pathname.endsWith('/stainher-v1524-final.js')){
            await new Promise(resolve=>setTimeout(resolve,450));
          }
          if(path.endsWith('.js'))assetBuilds.set(url.pathname.split('/').at(-1),url.searchParams);
          try{return route.fulfill({body:readFileSync(path),contentType:mime[path.split('.').at(-1)]||'application/octet-stream'});}
          catch{return route.fulfill({status:404});}
        }
        if(url.hostname==='cdn.jsdelivr.net'&&url.pathname.includes('supabase-js')){
          return route.fulfill({contentType:'application/javascript',body:`
            const profile=${JSON.stringify(profile)};
            window.qaHoldStaffing=null;
            window.qaStaffingReads=0;
            const person={user_id:'colaborador-prueba',nombre:'Nombre de prueba',cargo:'Técnico',estado:'activo',aplica_turnos:true};
            window.supabase={createClient:()=>({
              auth:{getSession:async()=>({data:{session:{user:profile,access_token:'qa'}}}),
                onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}})},
              from(table){
                let single=false;
                const chain=new Proxy({}, {get(_target,key){
                  if(key==='then')return async resolve=>{
                    if(table==='dotacion_contrato'&&window.qaHoldStaffing){window.qaStaffingReads++;await window.qaHoldStaffing;}
                    const data=table==='perfiles'&&single?profile:table==='dotacion_contrato'?[person]:
                      table==='turnos_malla_v1512'?[{user_id:person.user_id,turno_base:'A',estado_publicacion:'publicado'}]:[];
                    resolve({data,error:null,count:0});
                  };
                  return ()=>{if(key==='single'||key==='maybeSingle')single=true;return chain;};
                }});
                return chain;
              },
              rpc:async()=>({data:[],error:null}),
              channel:()=>({on(){return this},subscribe(){return this}}),removeChannel(){},functions:{invoke:async()=>({data:[]})}
            })};
          `});
        }
        return route.abort();
      });
      await page.addInitScript(()=>{
        window.qaLegacyPanels=0;
        new MutationObserver(()=>{
          if(document.querySelector('#page-inicio .v1522-home-person,#page-inicio .v1523-home-person')){
            window.qaLegacyPanels++;
          }
        }).observe(document,{childList:true,subtree:true});
      });
      await page.goto(site+'/',{waitUntil:'domcontentloaded'});
      const title=`Stainher App ${release.version} ${release.revision}`;
      assert.equal(await page.title(),title);
      const panel=page.locator('#page-inicio details[data-stainher-home-panel="staffing"]');
      await panel.locator('summary').waitFor();
      assert.equal(await panel.locator('summary').textContent(),'Dotación en turno hoy');
      if(!await panel.evaluate(node=>node.open))await panel.locator('summary').click();
      await panel.getByText('Nombre de prueba',{exact:true}).waitFor();
      await page.waitForFunction(()=>window.STAINHER_LOADER_STATUS?.state==='ready'&&window.StainherHomeStaffing);
      assert.match(await page.locator('#page-inicio [data-stainher-version]').textContent(),new RegExp(release.revision+'$'));
      assert.equal(await panel.locator('[data-home-staffing-content]').count(),1);

      await page.evaluate(()=>{
        document.title='Stainher App V15.24 R401';
        window.qaHoldStaffing=new Promise(resolve=>{window.qaReleaseStaffing=resolve;});
        window.qaRefresh=Promise.all([renderInicio(),renderInicio()]);
      });
      assert.equal(await page.title(),title);
      assert.equal(await page.locator('head > title').textContent(),title);
      assert.equal(await panel.evaluate(node=>node.open),true);
      assert.equal(await panel.getByText('Nombre de prueba',{exact:true}).isVisible(),true);
      await page.waitForFunction(()=>window.qaStaffingReads>0);
      await page.evaluate(async()=>{window.qaReleaseStaffing();await window.qaRefresh;});
      assert.equal(await panel.locator('summary').textContent(),'Dotación en turno hoy');
      assert.equal(await panel.evaluate(node=>node.open),true);
      assert.equal(await page.evaluate(()=>window.qaLegacyPanels),0);
      assert.equal(assetBuilds.get('stainher-v1524-final.js')?.get('app_build'),release.build);
      assert.equal(assetBuilds.get('stainher-v1524-navigation-stability.js')?.get('build'),release.build);
      await page.close();
    }
  }finally{
    await browser.close();
  }
});
