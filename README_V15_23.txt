STAINHER APP V15.23 — REVISIÓN EXHAUSTIVA DE ESTABILIDAD
Fecha de revisión: 30-08-2026

ESTADO DE LA ENTREGA
- Se mantiene exactamente la versión V15.23. No se creó V15.24 ni se cambió el nombre de los archivos.
- La capa V15.23 es el único punto activo de arranque, navegación, permisos y despacho de módulos.
- Las implementaciones históricas permanecen dentro del archivo como respaldo de funciones especializadas, pero ya no pueden iniciar la sesión, reescribir el despacho ni ejecutar observadores de interfaz en paralelo.

ORDEN DE PUBLICACIÓN
1. PATCH_V15_22.sql y PATCH_V15_23_EMAIL_CORE.sql ya fueron aplicados en el proyecto conectado.
2. send-stainher-email V3 quedó desplegada con JWT obligatorio; las rutas anteriores responden 410 y no envían.
3. Publicar Stainher_App_V15.23.html como index.html sin cambiar la versión visible.
4. Forzar recarga completa del navegador y borrar la caché del sitio si aún aparece una vista anterior.
5. Probar con cuentas reales de los perfiles siguiendo AUDITORIA_PERFILES_V15_23.md.

CONSOLIDACIÓN REALIZADA
- Arranque: una sola llamada, instalada después del núcleo V15.23; un solo listener de recuperación de contraseña.
- Renderizado: despacho directo para los 12 módulos y control de carreras al cambiar rápidamente de vista.
- Versión visible: todas las constantes activas, encabezados, pestañas, fichas y modales se sincronizan con V15.23; cualquier etiqueta heredada se corrige después de cada renderizado.
- Observadores: seis observadores heredados se desconectan antes del inicio; se retiraron temporizadores antiguos que limpiaban Inicio o reaplicaban permisos después del render final. Permanece un único supervisor V15.23 que solo bloquea el reenvío de formularios modales.
- Permisos: matriz canónica de 10 perfiles × 12 módulos; los permisos personalizados continúan prevaleciendo, pero las acciones sensibles exigen además permiso efectivo de edición.
- Solicitudes: el Administrador selecciona un Gerente activo; la asignación y su único aviso se confirman dentro del mismo RPC. Solo ese usuario ve la solicitud y puede aprobar. Los avisos históricos sin destinatario no se muestran como Solicitudes.
- Centro de notificaciones: la campana se reinstala después de crear la navegación, permanece visible sin avisos, se integra dentro del encabezado móvil y conserva contador, acciones, descarte e historial administrativo.
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
- Correo: un único servicio, send-stainher-email V3; el backend omite nombres vacíos, valida destinatarios y permisos, resuelve copias configuradas, limita tamaño, evita duplicados y registra la trazabilidad autoritativa.
- Diagnóstico: errores JavaScript y promesas rechazadas quedan visibles en Sistema durante la sesión.
- Renderizado responsive: una sola capa final contiene los 34 estilos históricos; tarjetas, formularios, filtros y cuadros informativos pueden encogerse sin salir de la cuadrícula.
- Tablas, mallas y Carta Gantt conservan su ancho útil, pero el desplazamiento horizontal queda encapsulado dentro del componente y nunca ensancha la página completa.
- Móvil y tablet: navegación compacta activa hasta 900 px, incluida la orientación horizontal; encabezado, campana y barra inferior respetan las áreas seguras del dispositivo.
- Modales: ancho y altura limitados a la ventana, formularios en una columna móvil, firmas y adjuntos contenidos, y campos de 16 px para evitar ampliaciones automáticas de Safari.
- Auditoría de layout: `__STAINHER_LAYOUT_AUDIT__()` permite detectar en tiempo de ejecución cualquier elemento visible que exceda la pantalla fuera de una región de desplazamiento autorizada.

COMPROBACIONES ESTÁTICAS SUPERADAS
- 40 bloques script: 6 externos y 34 internos analizados; 0 errores de sintaxis.
- 35 bloques CSS balanceados.
- 696 acciones inline revisadas; 203 llamadas distintas y 0 referencias sin definición.
- 84 identificadores HTML estáticos; 0 duplicados.
- Estructura principal HTML balanceada.
- 10 perfiles, 12 módulos y 120 niveles de permiso válidos.
- Prueba aislada de Preventivo: Listado genera solo la tabla, Carta Gantt genera solo la matriz y el contenido cambia al seleccionar la vista.
- Prueba de versión: cuatro constantes heredadas activas apuntan a V15.23 y el sincronizador elimina cualquier etiqueta V15.21 residual del contenido visible.
- Prueba del centro de notificaciones: instalación autenticada, ubicación móvil, visibilidad sin avisos, apertura con estado de carga y recuperación ante error.
- Un único arranque y un único listener de recuperación.
- PATCH SQL transaccional, SECURITY DEFINER con search_path vacío, avisos dirigidos dentro de las RPC, permisos explícitos y recarga de caché PostgREST.

DEPENDENCIAS QUE DEBEN ESTAR ACTIVAS
- Migraciones Clean Core y v1521_stable_admin_actions previamente aplicadas.
- Migración v1523_email_core_authoritative_log aplicada.
- Edge Function send-stainher-email V3 activa y protegida con JWT.
- Variables SMTP/Brevo válidas.
- Políticas RLS y RPC requeridas disponibles para las cuentas reales.

CORRECCIÓN OPERATIVA DE CORREO · 30-08-2026
- Causa corregida: Brevo recibía `name` vacío en `to`; ahora el atributo se omite si el nombre no fue informado.
- La tabla email_envios_v1518 es de solo lectura para el navegador. Únicamente el servicio backend inserta y actualiza estados.
- Cada envío usa idempotencia. El comprobante de vacaciones reutiliza una clave lógica estable y no puede duplicarse por doble clic o reintento concurrente.
- El modo de prueba solo funciona para el Administrador real y siempre redirige a su correo autenticado.
- Los módulos Confiabilidad, Preventivo, Vehículos y Liderazgo exigen permiso efectivo de edición para enviar.
- El historial de Sistema muestra Operativo, Procesando o Requiere revisión según la trazabilidad real; ya no declara “Configurado” sin comprobarlo.
- Las funciones send-document-v155 y send-vacation-receipt quedaron neutralizadas; todo el frontend activo usa send-stainher-email.

LÍMITE DE ESTA REVISIÓN
La estructura, sintaxis, permisos del cliente, rutas y conflictos heredados quedaron comprobados localmente. La validación real de RLS, escritura, correo y sesiones independientes requiere publicar estos archivos y ejecutar el recorrido con cuentas reales de Supabase. No se debe declarar aprobada la producción hasta completar esa prueba operativa.
