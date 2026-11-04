import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import {test} from 'node:test';

test('R374: Subsistema declarado prevalece sobre palabras ambiguas en observaciones',()=>{
 const source=fs.readFileSync('assets/stainher-v1524-pareto-subsystems-r322.js','utf8');
 const ctx={window:{},document:{readyState:'loading',addEventListener(){}},setInterval(){}};
 vm.runInNewContext(source,ctx);
 const {classify,aggregate}=ctx.window.StainherSubsystemParetoR322;
 const cases=[
 ['Puertas y enclavamientos','Puertas y accesos','Sensor y contacto de seguridad en puerta'],
 ['Eléctrico','Alimentación eléctrica','Contacto de puerta, sensor y cables'],
 ['Seguridad / protecciones','Seguridad','Puerta con falla en seguridad'],
 ['Mecánico','Tracción y transmisión','Freno y corte de aire comprimido'],
 ['Cables y tracción','Tracción y transmisión','Pozo con agua, polines y trole tensor']
 ];
 const rows=cases.map(([name,expected,desc])=>({observaciones:'Subsistema: '+name+'\r\nDescripción: '+desc,duracion_minutos:60}));
 for(let i=0;i<cases.length;i++)assert.equal(classify(rows[i]),cases[i][1],cases[i][0]);
 assert.equal(classify({observaciones:'Descripción: Falla en puerta'}),'Puertas y accesos','fallback for no declaration');
 assert.equal(classify({observaciones:'Subsistema: Puertas y enclavamientos\nCausa probable: Seguridad de contacto'}),'Puertas y accesos');
 assert.equal(aggregate(rows).reduce((sum,r)=>sum+r.fallas,0),5);
 assert.equal(aggregate(rows).some(x=>x.subsistema==='Sin clasificar'),false);
 const excluded={observaciones:'Subsistema: Eléctrico\nDescripción: Corte energía',excluir_kpi:true};
 assert.equal(aggregate([...rows,excluded]).reduce((n,r)=>n+r.fallas,0),5);
});
