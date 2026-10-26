import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const html=readFileSync('index.html','utf8');
assert.equal((html.match(/onclick="v1520PrevReportExcel\(\)"/g)||[]).length,3);
assert.equal((html.match(/onclick="v1520PrevReport\(\)"/g)||[]).length,3);
const begin=html.indexOf('function v1520PrevReportExcel(){');
const end=html.indexOf('function v1520PrevReport(){',begin);
assert.ok(begin>0&&end>begin);
const generated={};
const context={
 state:{v1520PrevFrom:'2026-10-21',v1520PrevTo:'2026-11-20',v1520PrevRows:[{anio:2026,mes:11,equipos:{nombre:'JAULA ALIMAK'},actividad:'Inspección',frecuencia:'Mensual',fecha_programada:'2026-11-05',fecha_ejecucion:null,observacion:'Programada'}]},
 XLSX:{utils:{book_new:()=>({sheets:[]}),aoa_to_sheet:a=>({data:a}),book_append_sheet:(book,sheet,name)=>book.sheets.push({name,sheet})},writeFile:(book,file)=>{generated.book=book;generated.file=file}},
 v1520Date:s=>s,v1520MonthLabel:()=> 'noviembre de 2026',v1520PrevComputed:()=>({label:'Programada'}),toast:msg=>{throw new Error(msg)},Date
};
context.window={XLSX:context.XLSX};
vm.runInNewContext(html.slice(begin,end)+'; v1520PrevReportExcel();',context);
assert.equal(generated.file,'Preventivo_2026-10-21_2026-11-20.xlsx');
assert.equal(generated.book.sheets.length,2);
assert.deepEqual(generated.book.sheets.map(x=>x.name),['Resumen','Plan preventivo']);
assert.equal(generated.book.sheets[1].sheet.data[1][1],'JAULA ALIMAK');
assert.equal(generated.book.sheets[1].sheet.data[1][4],'2026-11-05');
console.log('R289: Excel, PDF, período y registro consistente OK');
