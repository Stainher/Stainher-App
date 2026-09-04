# Stainher App V15.24 r16 — IA en Confiabilidad

## Alcance

La r16 agrega una capa de análisis técnico asistido por IA al flujo existente **Correctivo → Confiabilidad → Generar informe**.

La IA **no reemplaza ni recalcula** los KPI de Stainher. MTBF, MTTR, disponibilidad, horas, eventos y Pareto continúan siendo calculados por la aplicación. El servicio IA interpreta el detalle de las intervenciones y propone contenido para los campos editables de la revisión:

- Resumen ejecutivo
- Hallazgos
- Hipótesis de causa raíz
- Recomendaciones técnicas
- Conclusiones

El usuario de Confiabilidad o Administrador debe revisar y editar el resultado antes de aprobar el PDF.

## Datos utilizados

La Edge Function consulta `averias` para el período seleccionado y un histórico configurable de 6, 12, 18 o 24 meses. Se envían al modelo únicamente datos técnicos necesarios: equipo, guía, identificador de falla, fechas, estado final, duración, exclusión KPI y observaciones. No se envían nombres de técnicos en el prompt.

## Seguridad

La llamada al proveedor de IA se realiza exclusivamente desde la Supabase Edge Function `analyze-stainher-reliability` con `verify_jwt=true`. La función valida que el perfil sea `Administrador` o `Confiabilidad` y esté activo.

La clave del proveedor **no debe estar en el frontend ni en GitHub**. Debe configurarse como secreto del proyecto Supabase:

- `OPENAI_API_KEY` — obligatorio
- `OPENAI_MODEL` — opcional; por defecto `gpt-5.6-terra`

La implementación usa OpenAI Responses API con Structured Outputs y `store:false`.

## Trazabilidad

El resultado se incorpora a `confiabilidad_revision_v158.contenido` mediante el mismo flujo actual de revisión/aprobación. Se conservan metadatos `__ai_*` con modelo, fecha, histórico, cantidad de intervenciones, evidencias y firma de origen. Si cambian las intervenciones, la interfaz marca el análisis IA como desactualizado y solicita regenerarlo.

## Archivos r16

- `v1524r16/index.html`
- `v1524r16/stainher-reliability-ai-r16.js`
- `v1524r16/supabase/functions/analyze-stainher-reliability/index.ts`

## Publicación

Antes de publicar r16:

1. Configurar `OPENAI_API_KEY` en los secretos de Supabase.
2. Desplegar `analyze-stainher-reliability` con JWT obligatorio.
3. Probar con perfil Confiabilidad y Administrador.
4. Validar un informe con un equipo específico y otro con Todos los equipos.
5. Confirmar que el texto IA sigue siendo editable y que el PDF conserva los KPI calculados por Stainher.
6. Sólo después actualizar `release.json` y el `index.html` raíz a `v1524r16/`.
