# Punto de recuperación previo a R141

Fecha: 2026-10-02

## Producción congelada
- Rama de recuperación: `recovery/pre-r141-20261002`
- Commit productivo: `b8cfea802d75a3a543d12e3faa58e724a40940cd`
- Última migración Supabase antes de R141:
  `20260929193803 · reassign_approved_requests_cristian_r138`

## Alcance de R141
R141 agrega únicamente:
- módulo frontend Estandarización;
- tabla `estandarizacion_actividades_v141`;
- trigger y función `touch_estandarizacion_v141`;
- precarga de 55 actividades.

No altera tablas productivas previas.

## Recuperación
1. Restaurar el frontend desde `recovery/pre-r141-20261002`.
2. Ejecutar `supabase/rollback/20261002_standardization_r141_rollback.sql`.
3. Verificar que la aplicación vuelva al commit productivo indicado arriba.

Este punto debe conservarse hasta confirmar que R141 funciona correctamente en producción.
