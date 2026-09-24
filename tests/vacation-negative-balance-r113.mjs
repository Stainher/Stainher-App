import assert from 'node:assert/strict';
import fs from 'node:fs';

const base=fs.readFileSync('supabase/migrations/20260911183000_update_7x7_vacation_business_day_rule.sql','utf8');
const migration=fs.readFileSync('supabase/migrations/20260924163500_allow_negative_vacation_balances_r113.sql','utf8');
const guard="if anterior - descontar < 0 then\n    raise exception 'Saldo de vacaciones insuficiente: % días disponibles, % solicitados', anterior, descontar;\n  end if;";

assert.ok(base.includes(guard),'la migración base debe contener el bloqueo que R113 retira');
assert.match(migration,/pg_get_functiondef\('public\.aplicar_descuento_vacaciones_aprobadas\(\)'::regprocedure\)/,'R113 debe modificar la función instalada');
assert.match(migration,/position\(insufficient_balance_guard in definition\) = 0/,'R113 debe fallar de forma segura si la función cambió');
assert.match(migration,/execute replace\(/,'R113 debe retirar únicamente el bloqueo identificado');
assert.doesNotMatch(migration,/greatest\s*\(/i,'R113 no debe forzar el saldo final a cero');
assert.equal(Number((0.29-1).toFixed(2)),-0.71,'el saldo final negativo debe conservarse');

console.log('vacation-negative-balance-r113: ok');
