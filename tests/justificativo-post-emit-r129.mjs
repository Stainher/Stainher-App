import assert from 'node:assert/strict';
import fs from 'node:fs';

const just=fs.readFileSync('stainher-justificativos-r19.js','utf8');
const index=fs.readFileSync('index.html','utf8');
const migration=fs.readFileSync('supabase/migrations/20260928150000_justificativo_edit_post_emit_r129.sql','utf8');

assert.match(just,/20260928-r129-justificativo-post-emit-edit/,'Debe cargar build R129');
assert.match(just,/canEditIssuedJustification/,'Debe validar permiso de edición post emisión');
assert.match(just,/r==='administrador'/,'Administrador debe poder editar justificativos emitidos');
assert.match(just,/r!=='recursos_humanos'/,'RR.HH. debe ser el otro perfil habilitado');
assert.match(just,/Editar justificativo/,'Debe mostrar botón Editar justificativo');
assert.match(just,/v1524EditIssuedJustification/,'Debe exponer modal de edición');
assert.match(just,/Editar justificativo emitido/,'El modal debe identificar documento emitido');
assert.match(just,/Guardar cambios/,'Debe permitir guardar cambios');
assert.match(just,/editar_justificativo_emitido_v1524/,'Debe usar RPC específica para post emisión');
assert.match(just,/La próxima descarga utilizará la versión corregida/,'Debe confirmar uso de nueva versión');
assert.match(just,/postEmitEdit:true/,'Debe marcar funcionalidad activa');

assert.match(index,/stainher-justificativos-r19\.js\?build=20260928-r129-justificativo-post-emit-edit/,'Index debe invalidar cache del módulo');

assert.match(migration,/justificativo_editado_at/,'Debe registrar fecha de edición');
assert.match(migration,/justificativo_editado_por/,'Debe registrar autor de edición');
assert.match(migration,/editar_justificativo_emitido_v1524/,'Debe crear RPC de edición');
assert.match(migration,/v_role not in \('recursos_humanos','administrador'\)/,'RPC debe restringir a RR.HH. y Administrador');
assert.match(migration,/r\.estado<>'aprobada'/,'Solo debe editar justificativos emitidos');
assert.match(migration,/r\.etapa<>'finalizada'/,'Debe mantener finalizado');
assert.match(migration,/justificativo_emitido_at=now\(\)/,'La versión corregida debe actualizar fecha de emisión');
assert.match(migration,/Justificativo laboral actualizado/,'Debe notificar al solicitante');

new Function(just);
console.log('justificativo-post-emit-r129: ok');
