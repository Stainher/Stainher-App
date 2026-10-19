import assert from 'node:assert/strict';
import fs from 'node:fs';

const moduleSrc=fs.readFileSync('assets/stainher-presupuestos-ggrr-r152.js','utf8');
const migration=fs.readFileSync('supabase/migrations/20261019120500_ggrr_budget_items_r154.sql','utf8');

assert.match(moduleSrc,/R154 · Presupuestos en GGRR con detalle real de ítems/,'Debe identificar R154');
assert.match(moduleSrc,/function budgetDetail\(row\)/,'Debe construir detalle desde presupuesto');
assert.match(moduleSrc,/row\?\.materiales/,'Debe usar materiales');
assert.match(moduleSrc,/row\?\.fletes/,'Debe usar fletes');
assert.match(moduleSrc,/lines\.join\('\\n'\)/,'Debe separar ítems en líneas');
assert.match(moduleSrc,/detalle:budgetDetail\(row\)/,'Estado local de GGRR debe usar detalle real');

assert.match(migration,/presupuesto_detalle_ggrr_r154/,'Debe crear función de detalle');
assert.match(migration,/jsonb_array_elements\(coalesce\(p_materiales/,'Debe procesar materiales');
assert.match(migration,/jsonb_array_elements\(coalesce\(p_fletes/,'Debe procesar fletes');
assert.match(migration,/g\.detalle='Presupuesto técnico comercial · ' \|\| p\.codigo/,'Solo debe normalizar detalles genéricos');
assert.match(migration,/v_detalle := public\.presupuesto_detalle_ggrr_r154/,'RPC debe usar detalle real');
assert.match(migration,/v_detalle,/,'Insert GGRR debe guardar detalle construido');

new Function(moduleSrc);
console.log('ggrr-budget-items-r154: ok');
