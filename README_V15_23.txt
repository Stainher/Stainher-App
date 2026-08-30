STAINHER APP V15.23 — REVISIÓN EXHAUSTIVA DE ESTABILIDAD
Fecha de revisión: 30-08-2026

ESTADO DE LA ENTREGA
- Se mantiene exactamente la versión V15.23. No se creó V15.24 ni se cambió el nombre de los archivos.
- La capa V15.23 es el único punto activo de arranque, navegación, permisos y despacho de módulos.
- Las implementaciones históricas permanecen dentro del archivo como respaldo de funciones especializadas, pero ya no pueden iniciar la sesión, reescribir el despacho ni ejecutar observadores de interfaz en paralelo.

ORDEN DE PUBLICACIÓN
1. Conservar una copia del index.html actualmente publicado.
2. Ejecutar PATCH_V15_22.sql en Supabase SQL Editor. El nombre se mantiene por compatibilidad; el parche declara expresamente compatibilidad con V15.23 y es idempotente.
3. Confirmar que la ejecución termina en COMMIT y sin errores.
4. Reemplazar el index.html publicado por Stainher_App_V15.23.html.
5. Forzar recarga completa del navegador y borrar la caché del sitio si aún aparece una vista anterior.
6. Probar con cuentas reales de los diez perfiles siguiendo AUDITORIA_PERFILES_V15_23.md.

CONSOLIDACIÓN REALIZADA
- Arranque: una sola llamada, instalada después del núcleo V15.23; un solo listener de recuperación de contraseña.
- Renderizado: despacho directo para los 12 módulos y control de carreras al cambiar rápidamente de vista.
- Observadores: seis observadores heredados se desconectan antes del inicio; se retiraron temporizadores antiguos que limpiaban Inicio o reaplicaban permisos después del render final. Permanece un único supervisor V15.23 que solo bloquea el reenvío de formularios modales.
- Permisos: matriz canónica de 10 perfiles × 12 módulos; los permisos personalizados continúan prevaleciendo, pero las acciones sensibles exigen además permiso efectivo de edición.
- Solicitudes: el Administrador selecciona un Gerente activo; la asignación y su único aviso se confirman dentro del mismo RPC. Solo ese usuario ve la solicitud y puede aprobar. Los avisos históricos sin destinatario no se muestran como Solicitudes.
- Recuperación de solicitudes: si el registro se crea y falla la asignación, no se duplica. El mismo registro permite “Asignar / reenviar Gerente”; el aprobador también puede “Asignar / reenviar RR.HH.” si el segundo paso queda pendiente.
- Acciones idempotentes: aprobar, rechazar, cancelar, eliminar, asignar, reenviar correo y los formularios modales quedan bloqueados mientras se procesan. Un fallo auxiliar posterior nunca se informa como si hubiese fallado el cambio ya confirmado.
- Vacaciones: firma del solicitante, aprobación del Gerente asignado, asignación segura a un RR.HH. activo, tercera firma, comprobante y reintento de correo.
- Turnos: malla A/C/L, eventos superpuestos, tipos compatibles con la restricción SQL e Inicio agrupado por Turno A y Turno C.
- Preventivo: Plan Matriz, calendarización real y ejecución real. “Listado” usa una tabla detallada y “Carta Gantt” una matriz temporal independiente; el cambio de vista es inmediato y no necesita volver a consultar la base.
- Correctivo: una sola navegación, carga esperada, control de carreras, filtros adaptables, Confiabilidad e informe sin paneles superpuestos.
- Equipos: vista única, alta/edición protegida y eliminar o dar de baja conservando historial.
- Vehículos: carga única, edición protegida también frente al modo simulado, inventario adaptable, texto móvil reducido y contenido largo sin desbordes.
- Dotación: fuente única por nivel de permiso, datos sensibles excluidos de consulta y edición/eliminación protegidas también frente al modo simulado.
- Liderazgo: lectura no ejecuta controles; las acciones dependen del permiso efectivo y del perfil participante.
- Contrato: carga por pestaña con caché, conservación de la última información válida y barreras de edición en EDP, reembolsables y garantías.
- Usuarios: perfiles y Auth se combinan una vez; búsqueda, filtro por perfil, recuperación de contraseña y respaldo si falla la RPC administrativa.
- Correo: un único servicio, send-stainher-email; errores registrados y mostrados con información accionable.
- Diagnóstico: errores JavaScript y promesas rechazadas quedan visibles en Sistema durante la sesión.

COMPROBACIONES ESTÁTICAS SUPERADAS
- 38 bloques script: 6 externos y 32 internos analizados; 0 errores de sintaxis.
- 34 bloques CSS balanceados.
- 696 acciones inline revisadas; 203 llamadas distintas y 0 referencias sin definición.
- 84 identificadores HTML estáticos; 0 duplicados.
- Estructura principal HTML balanceada.
- 10 perfiles, 12 módulos y 120 niveles de permiso válidos.
- Prueba aislada de Preventivo: Listado genera solo la tabla, Carta Gantt genera solo la matriz y el contenido cambia al seleccionar la vista.
- Un único arranque y un único listener de recuperación.
- PATCH SQL transaccional, SECURITY DEFINER con search_path vacío, avisos dirigidos dentro de las RPC, permisos explícitos y recarga de caché PostgREST.

DEPENDENCIAS QUE DEBEN ESTAR ACTIVAS
- Migraciones Clean Core y v1521_stable_admin_actions previamente aplicadas.
- Edge Function send-stainher-email activa.
- Variables SMTP/Brevo válidas.
- Políticas RLS y RPC requeridas disponibles para las cuentas reales.

LÍMITE DE ESTA REVISIÓN
La estructura, sintaxis, permisos del cliente, rutas y conflictos heredados quedaron comprobados localmente. La validación real de RLS, escritura, correo y sesiones independientes requiere publicar estos archivos y ejecutar el recorrido con cuentas reales de Supabase. No se debe declarar aprobada la producción hasta completar esa prueba operativa.
