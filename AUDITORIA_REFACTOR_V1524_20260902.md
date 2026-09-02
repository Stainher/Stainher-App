# Auditoría y refactorización controlada V15.24

## Alcance

Revisión de la versión publicada `56ce8d3`, sin publicar el frontend. Se revisaron carga de módulos, renderizadores, permisos, RLS, administración y estilos; las migraciones aprobadas se aplicaron el 2026-09-02.

## Diagnóstico

- El archivo base mantiene 43 bloques JavaScript históricos y una cadena final de módulos autoritativos.
- Hay redefiniciones repetidas de renderizadores y formularios. La última definición funciona, pero el orden de carga sigue siendo una dependencia crítica.
- La asociación UUID Usuario/Supervisor de Dotación existía en una capa intermedia, pero una redefinición posterior de `openPersonModal` la eliminaba del formulario efectivo. La capa modular final la restaura.
- `dotacion_contrato.user_id` tenía un índice no único. La migración autorizada y aplicada agrega unicidad parcial para impedir asociaciones duplicadas.
- Usuarios, perfiles, equipos, vehículos, dotación, turnos, programación preventiva y controles de liderazgo ya poseen soporte de datos para administración.
- Las tablas revisadas tienen RLS. Las operaciones quedan condicionadas por `tiene_permiso(...)`; Preventivo reserva altas y eliminaciones al Planificador.
- Asesores Supabase posteriores a las migraciones: 51 advertencias heredadas por RPC `SECURITY DEFINER`, 1 por protección de contraseñas filtradas, 1 FK sin índice, 40 índices sin uso y 2 grupos de políticas permisivas múltiples. Los totales no aumentaron.
- Eliminar físicamente usuarios, equipos o vehículos con historial puede romper referencias. La operación segura es desactivar, retirar o dar de baja.
- Una actividad preventiva ejecutada o con reprogramaciones no se elimina, porque su borrado también afectaría la trazabilidad asociada.
- Los colores oscuros están repetidos como valores literales en capas antiguas; el tema claro requiere una capa final autoritativa, no reemplazos masivos.
- Confiabilidad se cargaba excepcionalmente desde `v1524r4`, fuera del cargador modular. Se trasladó a `config.js` y se eliminó esa inyección especial del cargador público.

## Refactorización aplicada

- `stainher-v1524-admin-crud.js`: concentra mejoras administrativas, baja segura de equipos, eliminación individual preventiva y matriz de cobertura CRUD.
- `stainher-v1524-theme.js`: tema claro/oscuro persistente, preferencia del sistema y contraste de componentes principales.
- `stainher-v1524-runtime-audit.js`: verifica carga, funciones autoritativas y módulos de compatibilidad desde Sistema sin escribir datos.
- El selector de tema se reinstala dentro de `Mi cuenta` cuando las capas históricas reconstruyen ese menú.
- Ambos módulos cargan al final desde `config.js`, por lo que no alteran el código histórico operativo.
- `v1524r4` queda limitado a recuperar la base, establecer su ruta y arrancar `config.js`; ya no modifica funcionalidades de negocio.
- La identificación inicial del documento se actualiza de V15.23 a V15.24 para evitar una versión visual incorrecta si falla un módulo posterior.

## Comparación funcional

| Área | Antes | Revisión nueva |
|---|---|---|
| Tema | Solo oscuro | Claro/oscuro, persistente y automático en primera visita |
| Equipos | Alta y edición; retiro poco visible | Alta, consulta, edición y retiro con historial desde cada ficha |
| Preventivo | Alta y edición en línea; borrado masivo | Se añade eliminación individual, limitada al Planificador |
| Tipos de perfil | Solo creación visible | Gestor para consultar, editar permisos/participación y desactivar perfiles personalizados |
| Administración | Acciones repartidas por módulos | Panel central de cobertura y acceso directo por módulo |
| Usuario en turnos | Asociación perdida por una redefinición posterior | Dotación vuelve a asociar cuenta y supervisor/grupo sin duplicar usuarios |
| Historial | Riesgo al borrar entidades referenciadas | Regla explícita de desactivar/retirar cuando existe historial |
| Base de datos | Asociación de cuenta no única y permisos personalizados incoherentes | Cuenta de Dotación única y permisos esenciales normalizados |
| Carga modular | Fallos visibles solo por consola | Diagnóstico de módulos y funciones disponible para Administrador |

## Parches evaluados

| Archivo | Estado | Motivo |
|---|---|---|
| `stainher-v1524-reliability-actions.js` | Consolidado | Pasa del cargador público a la cadena modular |
| `hotfix1` | Compatibilidad necesaria | Prepara datos y generación del informe de Turnos |
| `hotfix2` | Compatibilidad necesaria | Mantiene apertura y detalle de la celda seleccionada |
| `hotfix3` | Compatibilidad necesaria | Conserva leyenda, colores y estructura de la malla |
| `report-hotfix4` | Compatibilidad necesaria | Completa el informe visible y sus exportaciones |
| Inyección funcional en `v1524r4` | Retirada | La carga ya pertenece a `config.js` |

## Validación por perfiles

- Los 9 tipos de perfil activos tienen acceso a Inicio y Turnos según la configuración vigente de Supabase.
- Gerente tiene `puede_solicitar = true` y Solicitudes en edición; la función final `v1517CanCreateRequest` respeta esa capacidad.
- Consulta mantiene Turnos en lectura, pero no recibe permisos de edición ni participación operacional.
- Supervisor y Técnico consultan únicamente registros publicados de su grupo. La restricción se aplica tanto a `turnos_malla_v1512` como a `turnos_novedades_v15` mediante RLS.
- Inicio utiliza la misma separación: los perfiles generales consultan el personal del día y Supervisor/Técnico consumen `dotacion_grupo_visible_v159`.
- Las funciones históricas conservan matrices antiguas distintas, pero `v1519EffectivePermissions` aplica al final los permisos del tipo de perfil almacenado en Supabase.
- Todos los usuarios actuales tienen permisos personalizados. Se detectó una cuenta de Confiabilidad sin Inicio y seis cuentas autorizadas a solicitar con Solicitudes oculto, incluida la cuenta Administrador.
- Se aplicó `20260902173000_normalizar_permisos_esenciales.sql` para garantizar Inicio y Turnos en lectura a todos, conservar niveles de edición y habilitar Solicitudes únicamente cuando `puede_solicitar = true`. La verificación posterior registró cero inconsistencias entre los 20 usuarios activos.

## Pendientes antes de publicar

- Validación visual completa del tema claro en todos los roles y gráficos.
- Pruebas funcionales con cuentas Administrador, Planificador, Gerente, Supervisor y Técnico.
- Confirmar que cada fila preventiva expone un identificador estable para el botón de eliminación.
- Revisar contraste de componentes históricos que aún usan colores literales.
- Preparar una migración adicional solo si se decide agregar auditoría detallada para cada modificación CRUD.
