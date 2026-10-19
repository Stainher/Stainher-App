import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const core=fs.readFileSync('assets/stainher-presupuestos-r80.js','utf8');

assert.match(core,/function nextCodeFromRows\(equipment,date,rows,excludeId=''\)/,'Debe generar correlativo usando códigos existentes');
assert.match(core,/return found\?\`\$\{base\}-\$\{maxSuffix\+1\}\`:base/,'El segundo presupuesto debe usar sufijo -1 y continuar correlativamente');
assert.match(core,/existing\?\.codigo\|\|documentCode\(d\)/,'Editar debe conservar el código ya asignado');
assert.match(core,/for\(let attempt=0;attempt<6;attempt\+\+\)/,'Alta debe reintentar ante una colisión concurrente');
assert.match(core,/select\('id,codigo'\)/,'Tras colisión debe refrescar los códigos existentes');
assert.match(core,/code=documentCode\(d\)/,'El PDF debe usar el código definitivo del documento');
assert.doesNotMatch(core,/\bcodeFor\(/,'No debe quedar la lógica antigua de código único por fecha');

const marker="  install();window.addEventListener('stainher:modules-ready',install);\n})();";
assert.ok(core.includes(marker),'Debe encontrarse el punto de instalación del módulo');
const exposed=core.replace(
  marker,
  "  window.__r159Test={baseCodeFor,nextCodeFromRows,documentCode,state};\n})();"
);
const context={window:{}};
vm.runInNewContext(exposed,context);

const api=context.window.__r159Test;
assert.ok(api,'Debe exponer helpers para la prueba');

const base='JAULA-ALIMAK-PE-19-10-26';
assert.equal(api.baseCodeFor('JAULA ALIMAK','2026-10-19'),base);
assert.equal(api.nextCodeFromRows('JAULA ALIMAK','2026-10-19',[]),base);
assert.equal(api.nextCodeFromRows('JAULA ALIMAK','2026-10-19',[{id:'a',codigo:base}]),base+'-1');
assert.equal(api.nextCodeFromRows('JAULA ALIMAK','2026-10-19',[
  {id:'a',codigo:base},
  {id:'b',codigo:base+'-1'}
]),base+'-2');
assert.equal(api.nextCodeFromRows('JAULA ALIMAK','2026-10-19',[
  {id:'a',codigo:base},
  {id:'b',codigo:base+'-3'}
]),base+'-4');
assert.equal(api.nextCodeFromRows('JAULA ALIMAK','2026-10-19',[
  {id:'a',codigo:base}
],'a'),base);

context.window.state={r80Budgets:{rows:[{id:'p1',codigo:base+'-2'}],equipment:[],editing:null}};
assert.equal(api.documentCode({id:'p1',equipo_nombre:'JAULA ALIMAK',fecha:'2026-10-19'}),base+'-2');

new Function(core);
console.log('presupuestos-code-sequence-r159: ok');
