import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const src=fs.readFileSync('assets/stainher-v1524-correctivo-replace-r364.js','utf8');
const headers=[
 'Equipo','Número de guía de trabajo','Nombre Supervisor/Técnico',
 'Fecha inicio trabajo','Hora inicio trabajo','Fecha término de trabajo',
 'Hora término de trabajo','Estado final del equipo','Observaciones'
];
const raw=[
 ['JAULA ASEA','','Cristian Flores',46035,0.4583333333333333,46035,0.4895833333333333,'Operativo','Subsistema: Puertas\nDescripción: Modificación verificada'],
 ['JAULA ASEA','','Luis Contreras',46067,0.8194444444444444,46067,0.9097222222222222,'Operativo','Observación corregida']
];
while(raw.length<72){
 const i=raw.length;
 raw.push(['NODO 3700','MOV-'+i,'Luis Rojas',46068+i,0.3958333333333333,46068+i,0.5416666666666666,'Operativo','Observación '+i]);
}
const matrix=[headers,...raw];
const context={
 window:{
  state:{profile:{rol:'confiabilidad'}},
  XLSX:{
   read:()=>({SheetNames:['Instrucciones','Carga averías','Catálogos'],Sheets:{Instrucciones:{},'Carga averías':{},Catálogos:{}}}),
   utils:{sheet_to_json:(sheet)=>sheet===context.window.XLSX.read().Sheets['Carga averías']?matrix:[]},
   SSF:{parse_date_code:serial=>{const date=new Date(Date.UTC(1899,11,30)+Math.floor(serial)*86400000);return {y:date.getUTCFullYear(),m:date.getUTCMonth()+1,d:date.getUTCDate()}}}
  }
 },
 document:{readyState:'loading',addEventListener:()=>{}}
};
const sheets={Instrucciones:{marker:'instructions'},'Carga averías':{marker:'data'},Catálogos:{marker:'catalogue'}};
context.window.XLSX.read=()=>({SheetNames:Object.keys(sheets),Sheets:sheets});
context.window.XLSX.utils.sheet_to_json=sh=>sh===sheets['Carga averías']?matrix:[['Uso','Descripción']];
context.window.addEventListener=()=>{};
vm.runInNewContext(src,context);
const result=context.window.StainherCorrectivoReplaceR364.parse(new ArrayBuffer(0));
assert.equal(result.length,72,'Debe reconocer las 72 filas de la plantilla adjunta');
assert.equal(result[0].equipo_original,'JAULA ASEA');
assert.equal(result[0].supervisor_tecnico,'Cristian Flores');
assert.equal(result[0].fecha_inicio,'2026-01-13');
assert.equal(result[0].hora_inicio,'11:00');
assert.equal(result[0].fecha_termino,'2026-01-13');
assert.equal(result[0].hora_termino,'11:45');
assert.equal(result[0].estado_final,'Operativo');
assert.match(result[0].observaciones,/Modificación verificada/);
assert.equal(result[71].numero_guia,'MOV-71');
context.window.XLSX.SSF={};
const fallback=context.window.StainherCorrectivoReplaceR364.parse(new ArrayBuffer(0));
assert.equal(fallback[0].fecha_inicio,'2026-01-13','Debe convertir serial Excel incluso sin SSF');
console.log('R371: 72 averías reconocidas, 9 encabezados exactos, fechas y horas seriales convertidas');
