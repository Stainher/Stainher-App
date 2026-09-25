import assert from 'node:assert/strict';
import fs from 'node:fs';

const hp=fs.readFileSync('assets/stainher-v1524-weekly-hp-report.js','utf8');

assert.match(hp,/WEEKLY_HP_REPORT_VERSION__='R116'/,'R116 debe ser la implementación HP activa');
assert.match(hp,/if\(td==='A'.*?oper\+=12;/s,'Turno A debe cargar 12 h');
assert.match(hp,/if\(td==='C'.*?oper\+=4;/s,'Turno C debe cargar 4 h el día de inicio');
assert.match(hp,/if\(prev==='C'.*?oper\+=8;/s,'Turno C debe cargar 8 h al día siguiente');
assert.match(hp,/tipo==='hora_extra'\)return false/,'Horas extra deben quedar excluidas del HP');

const coverageBlock=hp.match(/function coverageExtraNovelty[\s\S]*?function buildCoverageAllocation/)?.[0]||'';
assert.ok(coverageBlock,'Debe existir la clasificación de cobertura extraordinaria');
assert.doesNotMatch(coverageBlock,/encierro_dentro_de_turno|encierro_planificado/,'Encierro dentro de turno no debe sumar esporádicas');

assert.match(hp,/return novelties\(uid,date\)\.some\(n=>coverageExtraNovelty\(n,uid,date\)\)\?12:0/,'Día adicional/encierro fuera deben conservar 12 h esporádicas');
assert.doesNotMatch(hp,/function replacementOperationalHours/,'La cobertura no debe convertirse en horas operativas del reemplazante');
assert.doesNotMatch(hp,/usedExtras|assignments:new Map/,'La conciliación no debe consumir ni reclasificar horas esporádicas');
assert.match(hp,/buildCoverageAllocation/,'Debe mantenerse conciliación entre suspensión y cobertura');
assert.match(hp,/suspended\(uid,d\)&&suspensionTransferred\(uid,d\)/,'Una suspensión conciliada debe descontar las horas base del suspendido');
assert.match(hp,/!blocked\(uid,prevDate\)/,'El tramo de 8 h nocturno debe validar la ausencia al inicio del turno');

console.log('hp-coverage-r116: ok');
