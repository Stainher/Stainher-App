# STAINHER Dashboard V1 — carga manual de averías

Esta versión usa Supabase como backend 

## Módulos
- Inicio con KPIs y parque de equipos.
- Preventivo.
- Correctivo con carga manual de Excel/CSV.
- Equipos editables.
- Usuarios con creación mediante la Edge Function `create-user`.

## Correctivo
En el módulo Correctivo, los roles `administrador` y `planificador` pueden pulsar **Importar Excel / CSV**.

La importación espera las columnas actuales de la bitácora:
- Equipo
- Número de guía de trabajo
- Nombre Supervisor/Técnico
- Fecha inicio trabajo
- Hora inicio trabajo
- Fecha término de trabajo
- Hora término de trabajo
- Estado final del equipo
- Observaciones

Antes de importar se muestra una vista previa con:
- Registros leídos
- Nuevos
- Duplicados
- Excluidos por corresponder claramente a preventivo/inspección/apoyo
- Registros con error

Los duplicados se detectan usando una clave derivada de equipo, guía, fecha/hora de inicio y fecha/hora de término.

## Despliegue
1. Ejecutar `schema.sql` en Supabase si se parte desde cero. Si ya se crearon las tablas `averias` e `importaciones_averias`, no es necesario volver a ejecutar el esquema completo.
2. Verificar que el usuario administrador exista en `public.perfiles`.
3. Mantener `config.js` con la URL y Publishable/Anon Key de Supabase.
4. Subir `index.html` y `config.js` a GitHub Pages.
5. Para creación de usuarios, desplegar únicamente la Edge Function `create-user` si se desea usar esa función desde el dashboard.

## Seguridad
No colocar en `config.js`, GitHub ni el navegador:
- `service_role`
- contraseña de base de datos
- tokens privados
