import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('../assets/stainher-turn-pdf-final-r18.js',import.meta.url),'utf8');
const loader=fs.readFileSync(new URL('../assets/stainher-v1524-hp-loader-r72.js',import.meta.url),'utf8');
const index=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');

const oldExporter=()=>{};
const window={
  v1516ExportTurnReportPdf:oldExporter,
  ensurePdf(){},
  addEventListener(){},
};
const context={window,setInterval(){return 1;},clearInterval(){},setTimeout(fn){fn();return 1;},console};

vm.runInNewContext(source,context);
assert.equal(window.v1516ExportTurnReportPdf.__r106TurnPdfLayout,true,'R106 debe instalar el exportador personal');
assert.equal(window.v1516ExportTurnReportPdf.__r111RuntimeStable,true,'R111 debe identificar el enganche estable');

window.v1516ExportTurnReportPdf=oldExporter;
vm.runInNewContext(source,context);
assert.equal(window.v1516ExportTurnReportPdf.__r111RuntimeStable,true,'una segunda carga debe recuperar R106 después de una sobreescritura antigua');

assert.match(loader,/StainherTurnPdfR111\?\.install\?\.\(\)/,'el cargador debe reinstalar R111 explícitamente');
assert.match(loader,/20260924-r112-loader-consolidation/,'el cargador debe renovar caché');
assert.match(index,/file==='stainher-turn-pdf-final-r18\.js'\?'20260924-r112-loader-consolidation'/,'el punto de entrada debe renovar caché del PDF');

const detailPosition=source.indexOf('drawDetailGroup(selected[0]');
const calendarPosition=source.indexOf('drawPersonalCalendar(doc,r,selected[0]');
assert.ok(detailPosition>0&&calendarPosition>detailPosition,'el detalle personal debe dibujarse antes del calendario final');

console.log('turn-personal-report-runtime-r111: ok');
