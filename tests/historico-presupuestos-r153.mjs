import assert from 'node:assert/strict';
import fs from 'node:fs';

const moduleSrc=fs.readFileSync('assets/stainher-presupuestos-ggrr-r152.js','utf8');
const migration=fs.readFileSync('supabase/migrations/20261019115000_historico_presupuestos_r153.sql','utf8');

assert.match(moduleSrc,/tipo_imputacion==='estandarizacion'/,'Debe distinguir Estandarización');
assert.match(moduleSrc,/EP\$\{ep\.ep_num\} · Estandarización/,'Debe mostrar EP de Estandarización');
assert.match(migration,/registro_historico boolean not null default false/,'Debe marcar registros históricos');
assert.match(migration,/tipo_documento_origen text/,'Debe conservar tipo de documento');
assert.match(migration,/estado_origen text/,'Debe conservar estado APROBADO de origen');
assert.match(migration,/HILTON03-PE-0309-25-01.*43113367.*5,'estandarizacion'/s,'Hilton 03 debe ir a EDP5 como Estandarización');
assert.match(migration,/ASEA-PE-1004-26.*4486125.*11,'estandarizacion'/s,'ASEA debe ir a EDP11 como Estandarización');
assert.equal((migration.match(/'gasto_reembolsable'\)/g)||[]).length>=36,true,'Debe contener 36 referencias GGRR');
assert.match(migration,/v_count < 38 or v_ggrr < 36 or v_std < 2/,'Debe validar 38 históricos');

new Function(moduleSrc);
console.log('historico-presupuestos-r153: ok');
