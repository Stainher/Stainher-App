import assert from 'node:assert/strict';
import fs from 'node:fs';

const hp=fs.readFileSync('assets/stainher-v1524-weekly-hp-report.js','utf8');
const history=fs.readFileSync('assets/stainher-v1524-hp-history-r71.js','utf8');

assert.match(hp,/WEEKLY_HP_REPORT_VERSION__='R117'/,'R117 debe ser la implementación HP activa');
assert.match(history,/HP_HISTORY_VERSION__='R117'/,'R117 debe ser la comparación histórica activa');

const match=hp.match(/const OFFICIAL_CLOSED_MONTHS=(\{[\s\S]*?\n  \});/);
assert.ok(match,'Debe existir snapshot oficial de meses cerrados');
const snapshots=Function(`"use strict";return (${match[1]})`)();
const july=snapshots['2026-07'];
assert.ok(july,'Debe existir cierre oficial julio 2026');
assert.equal(july.registered,2450);
assert.equal(july.outside,256);
assert.equal(july.inFaena,2194);
assert.equal(july.admin,306);
assert.equal(july.oper,1888);
assert.equal(july.spor,0);
assert.equal(july.dotacion,17);
assert.equal(july.rows.length,17,'La dotación oficial de julio debe contener 17 personas');

const sumDaily=row=>row.daily.reduce((a,b)=>a+Number(b||0),0);
const admin=july.rows.filter(r=>r.bucket==='admin').reduce((s,r)=>s+sumDaily(r),0);
const oper=july.rows.filter(r=>r.bucket==='oper').reduce((s,r)=>s+sumDaily(r),0);
assert.equal(admin,306,'HH administrativas en faena julio');
assert.equal(oper,1888,'HH operativas julio');
assert.equal(admin+oper,2194,'HH en faena julio');

const byName=new Map(july.rows.map(r=>[r.nombre,r]));
assert.equal(sumDaily(byName.get('Ismael Galvez Reyes')),30,'Ismael: 30 HH Codelco');
assert.equal(sumDaily(byName.get('Juan Ignacio Soto Muñoz')),0,'Juan: 0 HH Codelco');
assert.equal(sumDaily(byName.get('Cinthia Carolina Gallardo Madrid')),138,'Cinthia: 138 HH Codelco');
assert.equal(sumDaily(byName.get('Jose Antonio Humberto Cisternas Pirul')),138,'Jose: 138 HH Codelco');
assert.equal(sumDaily(byName.get('Alex Silva')),0,'Alex: 0 HH');

assert.match(history,/'2026-07':\{admin:306,oper:1888,spor:0,total:2194/,'Histórico debe usar total oficial de julio');
assert.match(hp,/if\(state\.official\)\{/,'El reporte seleccionado debe priorizar el cierre oficial');
assert.match(hp,/if\(Array\.isArray\(person\.officialDaily\)\)/,'El detalle por trabajador debe usar datos oficiales diarios');
assert.match(hp,/if\(state\.official\)return'';/,'Mes oficial no debe permitir ajustes manuales HP');

console.log('hp-july-official-r117: ok');
