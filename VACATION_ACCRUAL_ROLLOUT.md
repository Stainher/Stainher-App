# Actualización del saldo de vacaciones al consultar

Preparado para publicación; no se ha aplicado la migración en producción.

## Comportamiento

- Al abrir Inicio, Mi cuenta, la edición del saldo o la vista previa de vacaciones, se consulta al servidor y se guarda la acumulación pendiente.
- También se actualiza dentro de la transacción de aprobación y de restitución de días. La regla de descuento por jornada no cambia.
- Base conservadora: cada saldo existente se considera vigente en la fecha de activación. Solo se suma el devengo posterior; no se vuelve a sumar toda la antigüedad.
- 1,25 días por mes completo y 1,25/30 por día restante. Aniversario mensual limitado al último día del mes; el resto se limita a 30 días. Se utiliza la fecha de Chile.
- Se redondea el acumulado a dos decimales y se abona la diferencia con lo ya abonado. Consultar diariamente o después de varias semanas da el mismo acumulado.
- Sin fecha de contrato: saldo preservado y aviso. Fecha futura: no se acumula antes del inicio. Una corrección de fecha comienza una nueva base sin recalcular saldos históricos.
- Al desactivar un perfil se liquida la acumulación pendiente y se pausa. La reactivación abre una nueva base sin sumar el intervalo inactivo.
- Los comprobantes emitidos mantienen sus saldos históricos. No se vuelven a aprobar solicitudes ni se envían correos.
- Los ajustes manuales del saldo siguen disponibles; abrir la edición consulta primero el saldo vigente.
- La simulación consulta el saldo guardado sin generar abonos. Los errores de actualización no se presentan como un saldo actualizado.

## Permisos y concurrencia

La función pública es SECURITY INVOKER. Delega en una función privada con un permiso limitado: solo saldo propio, Administrador/RRHH activos o el aprobador asignado. No acepta importes ni fechas del cliente. La tabla privada no tiene acceso directo para anon/authenticated y tiene RLS activado. Se bloquea primero el perfil y después su registro de devengo, de modo que consultas simultáneas no abonan dos veces.

## Verificación ejecutada

Pruebas con PostgreSQL embebido (PGlite 0.5.8): migración completa en base aislada; preservación del saldo 2,46; meses/años y año bisiesto; monotonicidad; consultas repetidas; ajustes manuales; fechas faltantes/futuras; inactividad; reactivación; permisos; descuento con devengo pendiente; comprobante histórico; restitución.

Pruebas de cliente: llamadas concurrentes comparten consulta; la siguiente consulta vuelve a actualizar; un error conserva el dato anterior sin etiquetarlo como vigente; avisos y cálculo calendario consistentes.

Sintaxis comprobada en los cuatro archivos JavaScript modificados y los 44 bloques de index.html.

## Activación

1. Verificar que main no tiene nuevos cambios incompatibles y volver a ejecutar pruebas si los hay.
2. Con autorización de publicación, aplicar `supabase/migrations/20260909011555_vacation_accrual_on_read.sql` en el proyecto Andina. La migración comprueba los puntos de integración antes de modificar las funciones existentes.
3. Ejecutar los asesores de seguridad del proyecto y revisar las funciones nuevas y los permisos de la tabla privada.
4. Publicar los cambios del cliente con sus claves de caché nuevas.
5. Comprobar una consulta con cada perfil autorizado, la segunda consulta sin incremento, el aviso de fecha faltante y una sesión sin permisos.

La migración no se debe volver a aplicar ni eliminar su tabla privada para reiniciar una publicación: allí se registra lo ya abonado.

## Ejecutar pruebas

Instalar `@electric-sql/pglite@0.5.8` en un directorio temporal y ejecutar:

```sh
PGLITE_MODULE=/ruta/node_modules/@electric-sql/pglite/dist/index.js node tests/vacation-accrual.mjs
node tests/vacation-balance-client.mjs
```
