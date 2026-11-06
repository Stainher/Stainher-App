import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
const feature=readFileSync('assets/stainher-v1524-vehicle-fatigue-sensor-r379.js','utf8');
const loader=readFileSync('assets/stainher-v1524-hp-loader-r72.js','utf8');
const mail=readFileSync('assets/stainher-v1524-leadership-mail-after-save-r88.js','utf8');
new Function(feature);new Function(mail);
test('R379: el cargador actual instala el control de sensor',()=>{
 assert.match(loader,/refreshVehicleFatigueR379/);
 assert.match(loader,/stainher-v1524-vehicle-fatigue-sensor-r379\.js/);
 assert.ok(Number(loader.match(/__STAINHER_HP_LOADER_VERSION__='R(\\d+)'/)?.[1])>=379);
});
test('R379: los cuatro ítems forman parte de los datos que usa PDF y evaluación',()=>{
 let form=null;
 const fieldValues={sensor_instalado:'Bueno',sensor_encendido:'Bueno',sensor_camara:'Malo',sensor_alertas:'Bueno'};
 const win={
  addEventListener(){},openVehiculoControlV13(){},
  vehiculoDataV13(){return {groups:[['Frenos',[['Frenos','Bueno']]]],fecha:'2026-11-06'}}
 };
 const doc={getElementById(id){return id==='vehCtlFormV13'?form:null}};
 vm.runInNewContext(feature,{window:win,document:doc,setTimeout(){},console});
 form={querySelector(sel){return sel==='[data-r379-sensor]'?{}:null},elements:{namedItem(name){return {value:fieldValues[name]||''}}}};
 const d=win.vehiculoDataV13();
 assert.equal(d.groups.length,2);
 const [title,rows]=d.groups[1];
 assert.match(title,/Dispositivo de fatiga/);
 assert.equal(rows.length,4);
 assert.ok(rows.some(x=>x[0].includes('Cámara')&&x[1]==='Malo'));
 assert.equal(win.StainherVehicleFatigueSensorR379.collect().length,4);
});
test('R379: solo finaliza correo con PDF generado; no informa éxito falso de registro',()=>{
 assert.match(mail,/if\(!captured\?\.doc\)return false/);
 assert.match(mail,/await mail\.send\(captured\.doc/);
 assert.doesNotMatch(mail,/No fue posible identificar el registro para enviar correo/);
});
