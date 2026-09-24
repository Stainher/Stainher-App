import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=path=>fs.readFileSync(new URL(path,import.meta.url),'utf8');
const index=read('../index.html');
const audit=read('../assets/stainher-v1524-runtime-audit.js');
const loader=read('../assets/stainher-v1524-hp-loader-r72.js');
const ux=read('../assets/stainher-v1524-ux-runtime.js');

assert.doesNotMatch(ux,/stainher-v1524-weekly-hp-report\.js/,'UX no debe cargar HP fuera del cargador autenticado');

assert.match(audit,/__STAINHER_RUNTIME_AUDIT_R112__/);
assert.match(audit,/stainher-v1524-hp-loader-r72\.js/);
assert.doesNotMatch(audit,/load\([^\n]+stainher-presupuestos-r80\.js/,'runtime-audit no debe duplicar Presupuestos');
assert.doesNotMatch(audit,/load\([^\n]+stainher-v1524-leadership-mail\.js/,'runtime-audit no debe duplicar Liderazgo');
assert.doesNotMatch(audit,/load\([^\n]+stainher-v1524-leadership-record-pdf-r86\.js/,'runtime-audit no debe duplicar el PDF de Liderazgo');

assert.match(loader,/__STAINHER_HP_LOADER_VERSION__==='R112'/);
assert.match(loader,/load\('stainher-weekly-hp-runtime-r78','stainher-v1524-weekly-hp-report\.js'\)/,'el cargador autenticado debe conservar HP');
assert.match(loader,/async function bootstrapR112\(\)/);
assert.match(loader,/window\.StainherHPR112=api/);
const ordered=[
  'await refreshAccessR107()',
  'await refreshBudgets()',
  'await refreshContractForecast()',
  'await refreshTurnReport()',
  'await refreshVehicleExpiryR109()',
  'await refreshLeadership()',
  'await refreshSystem()',
  'await refreshSignature()',
  'await refreshFreeReport()',
  'await refresh()'
];
let previous=-1;
for(const call of ordered){
  const position=loader.indexOf(call);
  assert.ok(position>previous,`${call} debe mantener el orden determinista`);
  previous=position;
}

assert.doesNotMatch(index,/"stainher-v1524-turn-report-onepage\.js"/,'el exportador antiguo no debe cargarse');
assert.match(index,/stainher-v1524-runtime-audit\.js\?build=20260924-r112-loader-consolidation/);
assert.match(index,/stainher-v1524-ux-runtime\.js\?build=20260924-r112-loader-consolidation/);
assert.match(index,/revision:'r112',build:'20260924-r112-loader-consolidation'/);

console.log('runtime-loader-consolidation-r112: ok');
