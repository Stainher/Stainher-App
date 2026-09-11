import assert from 'node:assert/strict';
await import('../assets/stainher-v1524-vacation-7x7-rule.js');
const rule=globalThis.StainherVacation7x7Rule;
assert.ok(rule?.calculate,'Debe exportar el cálculo 7x7');

let r=rule.calculate('2026-09-11','2026-09-13',new Set());
assert.equal(r.habiles,1);
assert.equal(r.fines,2);
assert.equal(r.descontar,1,'Rango con viernes + fin de semana descuenta solo el viernes');
assert.equal(r.modo,'habiles');

r=rule.calculate('2026-09-12','2026-09-13',new Set());
assert.equal(r.habiles,0);
assert.equal(r.fines,2);
assert.equal(r.descontar,2,'Fin de semana aislado sí descuenta saldo');
assert.equal(r.modo,'fin_semana');

r=rule.calculate('2026-09-18','2026-09-18',new Set(['2026-09-18']));
assert.equal(r.habiles,0);
assert.equal(r.fines,0);
assert.equal(r.festivos,1);
assert.equal(r.descontar,0,'Festivo aislado no descuenta saldo');
assert.equal(r.modo,'solo_festivos');

r=rule.calculate('2026-09-17','2026-09-21',new Set(['2026-09-18','2026-09-19']));
assert.equal(r.habiles,2);
assert.equal(r.fines,2);
assert.equal(r.festivos,2);
assert.equal(r.descontar,2,'Rango mixto descuenta solo jueves y lunes');
assert.equal(r.modo,'habiles');

r=rule.calculate('2026-09-18','2026-09-20',new Set(['2026-09-18','2026-09-19']));
assert.equal(r.habiles,0);
assert.equal(r.fines,2);
assert.equal(r.descontar,2,'Festivo + fin de semana, sin hábiles, descuenta solo el fin de semana');

console.log('vacation-7x7-business-days: OK');
