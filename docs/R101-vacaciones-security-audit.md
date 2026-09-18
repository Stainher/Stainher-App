# R101 · Auditoría de vacaciones y SECURITY DEFINER

## Vacaciones
- Baseline maestro: informe RRHH `informe_centros.pdf` con corte 09-09-2026.
- Exclusiones: Christian Morales, Alejandro Silva y Cristian Lagos.
- Cristian Flores: fecha validada manualmente en 01-06-2025.
- Ronald Garcia: discrepancia pendiente App 26-01-2026 vs informe 29-01-2026; no corregir automáticamente.
- Pablo Lillo: baseline oficial 0 y 1 día aprobado después del corte; no reconciliar automáticamente.
- Regla de conciliación: saldo oficial al corte menos vacaciones aprobadas después del corte.
- No reconstruir saldo histórico solo con 1,25 días/mes: el informe oficial demuestra reglas/acumulaciones no reproducibles de forma uniforme.

## SECURITY DEFINER
### Cerrar exposición RPC directa
Funciones internas o trigger que no necesitan EXECUTE de clientes:
- crear_perfil_usuario()
- sync_dotacion_links_v158()
- v14_proteger_estado_dotacion()
- v14_validar_cumplimiento_liderazgo()
- v15_auditar()
- permisos_base_rol(text) como helper interno

### Mantener por ahora
RPC de negocio que validan auth.uid(), rol o tiene_permiso internamente.
No hacer revocación masiva porque rompería flujos válidos.

### Candidatas a retiro o SECURITY INVOKER
Funciones SECURITY DEFINER sin guardia explícita y sin referencias encontradas en el repositorio:
- hitos_contractuales_v95()
- proximos_cumpleanos_v153()
- proximos_cumpleanos_v95()
- supervisores_activos_v95()

No se modifican en R101 hasta verificar que ninguna ruta histórica las invoque en runtime.

### Otros hallazgos
- Leaked Password Protection está deshabilitado en Supabase Auth.
- stainher_private.vacation_accrual tiene RLS sin policy intencionalmente; acceso directo debe permanecer denegado.
