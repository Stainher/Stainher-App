/* R331 contract smoke tests; run with node tests/rit-r331.mjs */
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const file=fs.readFileSync("assets/stainher-v1524-rit-r331.js","utf8");
new vm.Script(file,{filename:"stainher-v1524-rit-r331.js"});
for(const text of ["rit_reuniones","Riesgos de fatalidad","Actividades y preparación","Análisis y controles","Aportes y reconocimientos","Revisión y cierre","RF01","RF09","RF30","Instructivos","Materiales","Herramientas","EPP"]){
 assert.ok(file.includes(text),"Missing RIT contract: "+text);
}
assert.match(file,/record\.actividades\.length>=6/);
assert.match(file,/a\.preparacion\[item\]==="no"/);
assert.match(file,/estado:"borrador"/);
assert.match(file,/fecha_cierre/);
const bootstrap=fs.readFileSync("assets/stainher-v1524-leadership-execution-access.js","utf8");
assert.match(bootstrap,/stainher-v1524-rit-r331\.js/);
const pdf=fs.readFileSync("assets/stainher-v1524-rit-pdf-r331.js","utf8");
new vm.Script(pdf,{filename:"stainher-v1524-rit-pdf-r331.js"});
assert.match(pdf,/RIT_Codelco_original\.pdf/);
assert.match(pdf,/getPageCount\(\)!==2/);
assert.match(pdf,/RF_COORD/);
assert.match(pdf,/La plantilla RIT descargada no es un PDF válido/);
assert.match(bootstrap,/stainher-v1524-rit-pdf-r331\.js/);
assert.match(file,/dotacion_contrato/);
assert.match(file,/data-person/);
assert.match(file,/data-pdf/);
console.log("R331 RIT wizard, Dotación and guarded original-PDF overlay checks passed.");