import assert from 'node:assert/strict';
import fs from 'node:fs';

const core=fs.readFileSync('assets/stainher-presupuestos-r80.js','utf8');
const migration=fs.readFileSync('supabase/migrations/20261019165000_sync_presupuestos_edp_r166.sql','utf8');

assert.match(core,/20261019-r166-sync-presupuestos-edp/,'Presupuestos debe cargar versión R166');
assert.match(core,/async function refreshAssignedContractData\(row\)/,'Debe refrescar el EDP local tras editar');
assert.match(core,/from\('estados_pago'\).*eq\('id',row\.estado_pago_id\)/s,'Debe refrescar Estado de Pago vinculado');
assert.match(core,/from\('gastos_reembolsables'\).*eq\('id',row\.gasto_reembolsable_id\)/s,'Debe refrescar GGRR vinculado');
assert.match(core,/existing\?\.estado_pago_id\?\s*'Presupuesto y Estado de Pago actualizados correctamente\.'/,'Debe confirmar sincronización al usuario');

assert.match(migration,/create or replace function public\.sync_presupuesto_asignado_r166\(\)/,'Debe crear función de sincronización');
assert.match(migration,/after update of[\s\S]*venta_neta/,'Debe ejecutarse al cambiar el valor neto');
assert.match(migration,/v_delta := v_nuevo_monto - coalesce\(v_ggrr\.monto_detalle,0\)::bigint/,'Debe calcular diferencia contra GGRR anterior');
assert.match(migration,/gastos_reembolsables=greatest\(0,coalesce\(gastos_reembolsables,0\)\+v_delta\)/,'Debe ajustar el EDP solo por la diferencia');
assert.match(migration,/monto_detalle=v_nuevo_monto/,'Debe actualizar monto del documento GGRR');
assert.match(migration,/detalle=v_detalle/,'Debe actualizar detalle del documento GGRR');
assert.match(migration,/where p\.tipo_imputacion='gasto_reembolsable'/,'Backfill debe limitarse a presupuestos GGRR');
assert.match(migration,/Estandarización se mantiene dinámica desde el propio presupuesto/,'Debe documentar que Estandarización usa el presupuesto actualizado');

new Function(core);
console.log('sync-presupuestos-edp-r166: ok');
