import assert from 'node:assert/strict';
import fs from 'node:fs';

const hp=fs.readFileSync('assets/stainher-v1524-weekly-hp-report.js','utf8');

assert.match(hp,/WEEKLY_HP_REPORT_VERSION__='R115'/,'R115 debe ser la implementación HP activa');
assert.match(hp,/if\(td==='C'.*?oper\+=4;/s,'Turno C debe cargar 4 h el día de inicio');
assert.match(hp,/if\(prev==='C'.*?oper\+=8;/s,'Turno C debe cargar 8 h al día siguiente');
assert.match(hp,/tipo==='hora_extra'\)return false/,'Horas extra deben quedar excluidas del HP');

const coverageBlock=hp.match(/function coverageExtraNovelty[\s\S]*?function noveltyToken/)?.[0]||'';
assert.ok(coverageBlock,'Debe existir la clasificación de cobertura extraordinaria');
assert.doesNotMatch(coverageBlock,/encierro_dentro_de_turno|encierro_planificado/,'Encierro dentro de turno no debe sumar horas esporádicas');

assert.match(hp,/buildCoverageAllocation/,'Debe existir conciliación de suspensión y reemplazo');
assert.match(hp,/suspensionTransferred/,'La suspensión debe transferir horas al reemplazante cuando está identificado');
assert.match(hp,/replacementOperationalHours/,'La cobertura del reemplazante debe registrarse como operativa');
assert.match(hp,/sporadicOperationalHours/,'Solo coberturas adicionales no conciliadas deben quedar como esporádicas');
assert.match(hp,/!blocked\(uid,prevDate\)/,'El tramo de 8 h nocturno debe validar la ausencia en la fecha de inicio del turno');

console.log('hp-coverage-r115: ok');
