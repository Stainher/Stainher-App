import assert from 'node:assert/strict';
import fs from 'node:fs';

const core=fs.readFileSync('assets/stainher-presupuestos-r80.js','utf8');
const history=fs.readFileSync('assets/stainher-presupuestos-history-r150.js','utf8');
const moduleSrc=fs.readFileSync('assets/stainher-presupuestos-ggrr-r152.js','utf8');
const loader=fs.readFileSync('assets/stainher-v1524-hp-loader-r72.js','utf8');
const migration=fs.readFileSync('supabase/migrations/20261019111500_presupuestos_ggrr_r152.sql','utf8');

assert.doesNotMatch(core,/<th>Estado<\/th>/,'Histórico no debe mostrar columna Estado');
assert.doesNotMatch(core,/>Venta neta<\/th>/,'Histórico no debe mostrar Venta neta');
assert.doesNotMatch(core,/>IVA<\/th>/,'Histórico no debe mostrar IVA');
assert.match(core,/<th style="text-align:right">Total<\/th>/,'Debe conservar Total');
assert.match(core,/colspan="5"/,'Histórico vacío debe usar 5 columnas');

assert.match(history,/td\.colSpan=5/,'Detalle R150 debe abarcar 5 columnas');
assert.doesNotMatch(history,/Estado: \$\{esc\(row\.estado/,'Detalle no debe mostrar Estado');

assert.match(moduleSrc,/Asignar GGRR/,'Debe agregar acción de asignación');
assert.match(moduleSrc,/Monto neto a registrar en GGRR/,'Debe informar que GGRR usa monto neto');
assert.match(moduleSrc,/p_presupuesto_id:id/,'Debe invocar RPC con presupuesto');
assert.match(moduleSrc,/p_estado_pago_id:epId/,'Debe invocar RPC con EDP seleccionado');
assert.match(moduleSrc,/periodo_inicio/,'Debe proponer EDP según fecha del presupuesto');
assert.match(moduleSrc,/row\.estado_pago_id/,'Debe bloquear presupuestos ya asignados');
assert.match(moduleSrc,/EP\$\{ep\.ep_num\} GGRR/,'Debe mostrar el EP asignado');

assert.match(loader,/stainher-presupuestos-ggrr-r152\.js/,'Loader debe cargar R152');
assert.match(loader,/StainherPresupuestosGgrrR152\?\.install/,'Loader debe instalar R152');
assert.match(loader,/stainher:presupuestos-r152-ready/,'Loader debe emitir evento R152');

assert.match(migration,/add column if not exists estado_pago_id uuid references public\.estados_pago/,'Debe guardar EDP asignado');
assert.match(migration,/add column if not exists gasto_reembolsable_id uuid references public\.gastos_reembolsables/,'Debe guardar GGRR generado');
assert.match(migration,/create or replace function public\.asignar_presupuesto_ggrr_r152/,'Debe crear RPC transaccional');
assert.match(migration,/v_monto := greatest\(0, round\(coalesce\(v_budget\.venta_neta,0\)\)::bigint\)/,'Debe asignar venta neta a GGRR');
assert.match(migration,/v_nuevo := coalesce\(v_ep\.gastos_reembolsables,0\) \+ v_monto/,'Debe sumar monto al GGRR reconocido del EDP');
assert.match(migration,/tipo_documento,\n    equipo,/,'Debe registrar el presupuesto como documento GGRR');
assert.match(migration,/if v_budget\.gasto_reembolsable_id is not null or v_budget\.estado_pago_id is not null/,'Debe impedir doble asignación');
assert.match(migration,/v_role = 'confiabilidad' and v_budget\.created_by is distinct from v_uid/,'Confiabilidad solo asigna presupuestos propios');
assert.match(migration,/tiene_permiso\('contrato','editar'\)/,'Debe respetar permiso de edición del contrato');

new Function(core);
new Function(history);
new Function(moduleSrc);
new Function(loader);

console.log('presupuestos-ggrr-r152: ok');
