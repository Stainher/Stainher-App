import assert from 'node:assert/strict';
import fs from 'node:fs';

const r113=fs.readFileSync(
  'supabase/migrations/20260924163500_allow_negative_vacation_balances_r113.sql',
  'utf8',
);
const r114=fs.readFileSync(
  'supabase/migrations/20260924183709_drop_nonnegative_vacation_balance_constraint_r114.sql',
  'utf8',
);

assert.match(
  r113,
  /saldo negativo queda registrado y visible/,
  'R113 debe permitir el descuento negativo en la función',
);
assert.match(
  r114,
  /alter table public\.perfiles\s+drop constraint if exists perfiles_saldo_vacaciones_nonnegative/i,
  'R114 debe retirar exactamente el CHECK que bloquea el saldo negativo',
);
assert.doesNotMatch(
  r114,
  /add constraint|saldo_vacaciones\s*>=\s*0|greatest\s*\(/i,
  'R114 no debe reintroducir un límite inferior en el saldo',
);
assert.equal(Number((0.29-1).toFixed(2)),-0.71);

console.log('vacation-negative-balance-r114: ok');
