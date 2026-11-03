/* R331 contract smoke tests; run with node tests/rit-r331.mjs */
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import {createHash} from "node:crypto";
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
assert.match(pdf,/cross\(239,y\+j\*17\.4\+3\)/);
assert.match(pdf,/cross\(259,y\+j\*17\.4\+3\)/);
assert.match(pdf,/draw\(clip\(record\.supervisor,70\),681,96,8,196\)/);
assert.match(pdf,/replace\(\/\^RF\/i,""\),289/);
assert.match(pdf,/El archivo seleccionado no es PDF/);
assert.match(pdf,/importTemplate/);
assert.match(pdf,/buildPdf/);
assert.doesNotMatch(file,/data-rit-template/);
assert.match(file,/review-prep/);
assert.match(file,/No es necesario subir archivos/);
assert.match(file,/Resuelva y verifique la condición antes de finalizar/);
assert.match(file,/pdfPrepared/);
assert.match(bootstrap,/stainher-v1524-rit-pdf-r331\.js/);
assert.match(file,/dotacion_contrato/);
assert.match(file,/data-person/);
assert.match(file,/data-pdf/);
const bundled=Array.from({length:15},(_,i)=>fs.readFileSync("assets/rit-template/r331-part-"+String(i).padStart(2,"0")+".txt","utf8").trim())
 .map((piece,i)=>i>=4?piece.split("").reverse().join(""):piece).join("");
const template=Buffer.from(bundled,"base64");
assert.equal(template.slice(0,5).toString(),"%PDF-");
assert.equal(template.length,129097);
assert.equal(createHash("sha256").update(template).digest("hex"),"afa4a550b8e4fb2c0c63bcad4f18d75fb7e65ca328551f8f3f990ec3a3680717");
assert.match(pdf,/async function bundledTemplate/);
assert.match(file,/RF\.filter\(\(\[code\]\)=>record\.riesgos\.includes\(code\)\)/);
assert.match(file,/record\.riesgos\.includes\(r\.rf\)\?r\.rf:""/);
assert.match(file,/record\.actividades\[i\]\.riesgos\.push/);
console.log("R331 RIT wizard, Dotación and guarded original-PDF overlay checks passed.");