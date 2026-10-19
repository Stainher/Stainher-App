import assert from 'node:assert/strict';
import fs from 'node:fs';

const core=fs.readFileSync('assets/stainher-presupuestos-r80.js','utf8');
const history=fs.readFileSync('assets/stainher-presupuestos-history-r150.js','utf8');
const moduleSrc=fs.readFileSync('assets/stainher-presupuestos-ggrr-r152.js','utf8');
const loader=fs.readFileSync('assets/stainher-v1524-hp-loader-r72.js','utf8');
const migration=fs.readFileSync('supabase/migrations/20261019153500_presupuestos_destino_edp_r160.sql','utf8');

assert.doesNotMatch(core,/<th>Estado<\/th>/,'Histórico no debe mostrar columna Estado');
assert.doesNotMatch(core,/>Venta neta<\/th>/,'Histórico no debe mostrar Venta neta');
assert.match(core,/Total \(Iva Incluido\)/,'Debe conservar Total IVA incluido');
assert.match(core,/colspan="6"/,'Histórico vacío debe usar seis columnas');

assert.doesNotMatch(history,/btn\.textContent='Detalle'/,'No debe restaurar acción Detalle');

assert.match(moduleSrc,/return 'Asignar'/,'Presupuesto sin imputación debe mostrar acción Asignar');
assert.match(moduleSrc,/id="r160Destination"/,'Modal debe permitir seleccionar destino');
assert.match(moduleSrc,/value="gasto_reembolsable">Gastos Reembolsables/,'Debe ofrecer GGRR');
assert.match(moduleSrc,/value="estandarizacion">Estandarización/,'Debe ofrecer Estandarización');
assert.match(moduleSrc,/asignar_presupuesto_edp_r160/,'Debe usar RPC R160');
assert.match(moduleSrc,/p_tipo_imputacion:destination/,'Debe enviar destino seleccionado');
assert.match(moduleSrc,/p_estado_pago_id:epId/,'Debe enviar EDP seleccionado');
assert.match(moduleSrc,/No aumentará el monto de Gastos Reembolsables/,'Debe explicar efecto de Estandarización');
assert.match(moduleSrc,/destination==='gasto_reembolsable'&&ep&&data\?\.nuevo_total_ggrr/,'Solo GGRR debe actualizar total local de reembolsables');
assert.match(moduleSrc,/EP\$\{ep\.ep_num\} GGRR/,'Debe mostrar EP asignado a GGRR');
assert.match(moduleSrc,/r152-type-line">Estandarización/,'Debe mostrar Estandarización en segunda línea');

assert.match(loader,/stainher-presupuestos-ggrr-r152\.js/,'Loader debe cargar módulo de asignación');
assert.match(loader,/StainherPresupuestosGgrrR152\?\.install/,'Loader debe instalar módulo');

assert.match(migration,/create or replace function public\.asignar_presupuesto_edp_r160/,'Debe crear RPC R160');
assert.match(migration,/v_tipo not in \('gasto_reembolsable','estandarizacion'\)/,'Debe validar los dos destinos');
assert.match(migration,/if v_tipo='gasto_reembolsable' then/,'Solo GGRR debe crear gasto reembolsable');
assert.match(migration,/v_nuevo := coalesce\(v_ep\.gastos_reembolsables,0\)\+v_monto/,'GGRR debe sumar monto neto al EDP');
assert.match(migration,/tipo_imputacion=v_tipo/,'Debe guardar destino seleccionado');
assert.match(migration,/estado_pago_id=v_ep\.id/,'Debe guardar EDP seleccionado');
assert.match(migration,/asignado_edp_at=now\(\)/,'Debe guardar trazabilidad genérica de asignación');
assert.match(migration,/v_budget\.estado_pago_id is not null/,'Debe impedir doble asignación');

new Function(core);
new Function(history);
new Function(moduleSrc);
new Function(loader);

console.log('presupuestos-ggrr-r160: ok');
