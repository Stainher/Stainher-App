import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import {chromium} from 'playwright';

const roles = ['supervisor','tecnico','administrador','prevencion','planificador','confiabilidad','gerente','recursos_humanos'];
const profiles = roles.map((rol,index) => ({
  id: `00000000-0000-4000-8000-00000000000${index}`,
  email: `${rol}@example.test`, nombre: `Perfil ${rol}`, rol, activo: true
}));
const fields = [
  [4,'vehCtlSupV13'], [5,'extSupV12'], [6,'terrainSupervisorV11'],
  [7,'eppSupV12'], [8,'envSupV12'], [9,'protSupV12']
];
const template = {id:'prueba',codigo:'CTRL-QA',nombre:'Control personalizado de prueba',activo:true,campos:[]};
const testOrigin = process.env.STAINHER_CONTROL_QA_URL || 'https://stainher-controls.test/';
const usePublishedAssets = Boolean(process.env.STAINHER_CONTROL_QA_URL);
const mimeTypes = {html:'text/html',js:'application/javascript',css:'text/css',json:'application/json'};

test('Los perfiles activos pueden seleccionar y registrar al responsable desde los formularios móviles', {timeout:90000}, async () => {
  const browser = await chromium.launch({headless:true});
  try {
    const page = await browser.newPage({viewport:{width:393,height:820},isMobile:true,hasTouch:true});
    await page.route('**/*', async route => {
      const url = new URL(route.request().url());
      if (url.origin === new URL(testOrigin).origin) {
        if (usePublishedAssets) return route.continue();
        const path = url.pathname === '/' ? 'index.html' : '.' + url.pathname;
        try {
          return await route.fulfill({body:readFileSync(path),contentType:mimeTypes[path.split('.').at(-1)] || 'application/octet-stream'});
        } catch {return route.fulfill({status:404});}
      }
      if (url.hostname === 'cdn.jsdelivr.net' && url.pathname.includes('supabase-js')) {
        return route.fulfill({contentType:'application/javascript',body:`
          const qaProfiles=${JSON.stringify(profiles)};
          const qaTemplate=${JSON.stringify(template)};
          window.qaWrites=[];
          window.supabase={createClient:()=>({
            auth:{
              getSession:async()=>({data:{session:{user:qaProfiles[0],access_token:'test'}}}),
              onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}})
            },
            from(table){
              let single=false;
              const chain=new Proxy({}, {get(_target,key){
                if(key==='then') return resolve=>resolve({data:table==='perfiles'&&single?qaProfiles[0]:table==='liderazgo_plantillas_v1512'?[qaTemplate]:[],error:null,count:0});
                return (...args)=>{
                  if(key==='single'||key==='maybeSingle')single=true;
                  if(key==='insert')window.qaWrites.push({table,payload:args[0]});
                  return chain;
                };
              }});
              return chain;
            },
            rpc:async(name)=>({error:null,data:
              name==='controles_responsables_r416'?qaProfiles.map(p=>({user_id:p.id,nombre:p.nombre})):
              name==='controles_vehiculos_r416'?[{patente:'QA001',marca_modelo:'Prueba',kilometraje:100,estado:'Operativo'}]:[]}),
            channel:()=>({on(){return this},subscribe(){return this}}),removeChannel(){},functions:{invoke:async()=>({data:[]})}
          })};
        `});
      }
      return route.abort();
    });

    await page.goto(testOrigin,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(() => window.state?.profile && window.StainherControlSupervisor && window.StainherRITModalR390);
    page.setDefaultTimeout(8000);
    await page.evaluate(() => {document.documentElement.dataset.theme='dark';});
    const selectPerson = async (id, profile, byName=false) => {
      const select = page.locator('#'+id);
      await select.waitFor({state:'visible'});
      const value = byName ? profile.nombre : profile.id;
      await select.locator('option').filter({hasText:profile.nombre}).waitFor({state:'attached'});
      assert.ok(await select.isEnabled(), id);
      await select.selectOption(value);
      assert.equal(await select.inputValue(),value);
    };

    for (const [index,profile] of profiles.entries()) {
      const other = profiles[(index+1)%profiles.length];
      await page.evaluate(current => {
        state.profile=current;
        state.session.user=current;
        document.getElementById('page-liderazgo').classList.remove('hidden');
      },profile);
      assert.equal(await page.evaluate(() => canViewV11('liderazgo') && canExecuteLeadershipV11()),true,profile.rol);
      await page.evaluate(async () => {applyPermissionsV11();await v1519Navigate('liderazgo');v1512LeadSwitch('controles');});
      await page.locator('#v1512Lead_controles').waitFor({state:'visible'});
      if (profile.rol === 'recursos_humanos') {
        assert.equal(await page.locator('#v1512Lead_indicadores').count(),0);
      }

      for (const [number,id] of fields) {
        await page.evaluate(n => openControlV12(n),number);
        await selectPerson(id,other);
        const selection=await page.evaluate(id => v12SupervisorData(id),id);
        assert.deepEqual(selection,{supervisor_user_id:other.id,supervisor_nombre:other.nombre},`${profile.rol} / ${id}`);
        if (number===6) {
          const terrain=await page.evaluate(() => terrainDataV11());
          assert.equal(terrain.supervisor_user_id,other.id);
          assert.equal(terrain.supervisor,other.nombre);
        }
        if (number===7) {
          const result=await page.evaluate(async id => {
            await v12Register(v12Control(7),'2026-11-10',id);
            return window.qaWrites.findLast(row => row.table==='liderazgo_cumplimiento');
          },id);
          assert.equal(result.table,'liderazgo_cumplimiento');
          assert.equal(result.payload.supervisor_user_id,other.id);
          assert.equal(result.payload.supervisor_nombre,other.nombre);
          assert.equal(result.payload.ejecutado_por_user_id,profile.id);
        }
        await page.evaluate(() => closeModal());
      }
    }
    await page.evaluate(() => v1512OpenExtraInspection());
    await selectPerson('v416ExtraSupervisor',profiles[0]);
    await page.evaluate(() => {closeModal();v1512OpenGenericControl('prueba');});
    await selectPerson('v416GenericSupervisor',profiles[1]);
    await page.evaluate(() => {closeModal();v1512LeadSwitch('controles');StainherRITModalR390.mount();});
    await page.locator('#stainher-rit-card-r389 [data-r390-action="open"]').click();
    await selectPerson('v416RitSupervisor',profiles[2],true);
  } finally {
    await browser.close();
  }
});
