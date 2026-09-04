# Stainher App V15.24 r16 — IA en Confiabilidad

## Alcance

La r16 agrega una capa de análisis técnico asistido por IA al flujo existente **Correctivo → Confiabilidad → Generar informe**.

La IA **no reemplaza ni recalcula** los KPI de Stainher. MTBF, MTTR, disponibilidad, horas, eventos y Pareto continúan siendo calculados por la aplicación. Gemini interpreta el detalle de las intervenciones y propone contenido para los campos editables de la revisión:

- Resumen ejecutivo
- Hallazgos
- Hipótesis de causa raíz
- Recomendaciones técnicas
- Conclusiones

El usuario de Confiabilidad o Administrador debe revisar y editar el resultado antes de aprobar el PDF.

## Datos utilizados

La Edge Function consulta `averias` para el período seleccionado y un histórico configurable de 6, 12, 18 o 24 meses. Se envían al modelo únicamente datos técnicos necesarios: equipo, guía, identificador de falla, fechas, estado final, duración, exclusión KPI y observaciones. No se envían nombres de técnicos en el prompt.

Para limitar consumo y tamaño de contexto, la función envía como máximo las 120 intervenciones más recientes del período y 180 intervenciones históricas previas. Los KPI se transmiten como valores calculados por Stainher y el modelo recibe instrucciones explícitas de no recalcularlos ni alterarlos.

## Proveedor IA: Gemini

La r16 usa **Google Gemini API** mediante la operación `generateContent` con salida JSON estructurada (`responseMimeType: application/json` + `responseSchema`).

Secretos requeridos en Supabase:

- `GEMINI_API_KEY` — obligatorio
- `GEMINI_MODEL` — opcional; por defecto `gemini-2.5-flash`

`gemini-2.5-flash` dispone de nivel gratuito según la tabla pública de precios de Gemini Developer API. El límite gratuito depende de las cuotas vigentes de Google; si se alcanza, Stainher muestra un mensaje y permite reintentar más tarde.

En el nivel gratuito Google indica que el contenido enviado puede utilizarse para mejorar sus productos. Por ese motivo esta integración excluye nombres de técnicos y envía únicamente información técnica necesaria para el análisis.

## Seguridad

La llamada a Gemini se realiza exclusivamente desde la Supabase Edge Function `analyze-stainher-reliability` con `verify_jwt=true`. La función valida que el perfil sea `Administrador` o `Confiabilidad` y esté activo.

La clave Gemini **no debe estar en el frontend ni en GitHub**. Debe configurarse únicamente como secreto del proyecto Supabase bajo el nombre `GEMINI_API_KEY`.

Las observaciones de las averías se consideran datos no confiables como instrucciones. La función indica explícitamente al modelo que ignore cualquier prompt u orden incluida dentro de las observaciones y que no invente causas ni componentes.

## Trazabilidad

El resultado se incorpora a `confiabilidad_revision_v158.contenido` mediante el mismo flujo actual de revisión/aprobación. Se conservan metadatos `__ai_*` con proveedor, modelo, fecha, histórico, cantidad de intervenciones, evidencias y firma de origen. Si cambian las intervenciones, la interfaz marca el análisis IA como desactualizado y solicita regenerarlo.

## Archivos r16

- `v1524r16/index.html`
- `v1524r16/stainher-reliability-ai-r16.js`
- `v1524r16/supabase/functions/analyze-stainher-reliability/index.ts`

## Publicación

Antes de publicar r16:

1. Crear una API key en Google AI Studio.
2. Configurar `GEMINI_API_KEY` en los secretos de Supabase.
3. Desplegar `analyze-stainher-reliability` con JWT obligatorio.
4. Probar con perfil Confiabilidad y Administrador.
5. Validar un informe con un equipo específico y otro con Todos los equipos.
6. Confirmar que el texto IA sigue siendo editable y que el PDF conserva los KPI calculados por Stainher.
7. Sólo después actualizar `release.json` y el `index.html` raíz a `v1524r16/`.
