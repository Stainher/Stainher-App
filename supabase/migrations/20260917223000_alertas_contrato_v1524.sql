-- Stainher V15.24 R94 · Alertas accionables del contrato DAND
create table if not exists public.alertas_contrato_v1524 (
  id uuid primary key default gen_random_uuid(),
  source_key text not null unique,
  source_type text not null default 'monitor',
  source_ref text,
  categoria text not null check (categoria in ('Dotación','EDP / Facturación','Incidente operacional','Cumplimiento','Contrato / Garantía','Prevención','Otro')),
  titulo text not null,
  cambio text not null,
  impacto text not null,
  proximo_paso text not null,
  prioridad text not null default 'media' check (prioridad in ('alta','media','baja')),
  estado text not null default 'nueva' check (estado in ('nueva','en_gestion','cerrada')),
  responsable text,
  fecha_limite date,
  detectada_at timestamptz not null default now(),
  cerrada_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.alertas_contrato_v1524 enable row level security;
drop policy if exists "alertas_contrato_read_authenticated" on public.alertas_contrato_v1524;
create policy "alertas_contrato_read_authenticated" on public.alertas_contrato_v1524 for select to authenticated using (true);
drop policy if exists "alertas_contrato_manage_roles" on public.alertas_contrato_v1524;
create policy "alertas_contrato_manage_roles" on public.alertas_contrato_v1524 for all to authenticated
using (exists(select 1 from public.perfiles p where p.id=auth.uid() and lower(coalesce(p.rol,'')) in ('administrador','gerente','confiabilidad','planificador','prevencion','prevención','rrhh')))
with check (exists(select 1 from public.perfiles p where p.id=auth.uid() and lower(coalesce(p.rol,'')) in ('administrador','gerente','confiabilidad','planificador','prevencion','prevención','rrhh')));

insert into public.alertas_contrato_v1524(source_key,source_type,source_ref,categoria,titulo,cambio,impacto,proximo_paso,prioridad,estado,fecha_limite,detectada_at)
values
('workmate-salud-ronald-garcia-20261215','gmail','1a0a89a337294e98','Cumplimiento','Renovación examen de salud · Ronald García','El certificado de aprobación de exámenes de salud vence el 15-12-2026.','Puede afectar la habilitación del trabajador para el contrato si no se renueva oportunamente.','Confirmar con Prevención/RR.HH. la programación de renovación y controlar la carga del nuevo certificado.','media','nueva','2026-12-15','2026-09-17T12:00:00-03:00'),
('dand-qr-alcohol-drogas-20260917','gmail','1a0af2e787dcf138','Cumplimiento','Nuevo registro diario de alcohol y drogas','DAND liberó el código QR para el registro diario de controles de alcohol y drogas.','Los controles pueden quedar sin el registro formal exigido por DAND si no se adopta el nuevo mecanismo.','Confirmar con Prevención que el QR fue recibido, incorporado al procedimiento y utilizado en los controles posteriores.','alta','nueva',null,'2026-09-17T15:00:00-03:00'),
('nodo3500-control-aguas-20260917','gmail','1a0afe1cab24952b','Incidente operacional','Nodo 3500 · control de aguas','La inspección reportó aproximadamente 15 cm de agua en el pozo de la Jaula y capacidad limitada de la bomba disponible.','Mantiene riesgo operacional para la recuperación y operación del ascensor.','Definir o confirmar solución de bombeo adecuada y mantener seguimiento del nivel del pozo.','alta','nueva',null,'2026-09-17T17:00:00-03:00'),
('alimak-pinon-20260917','gmail','1a0afd7159e19300','Incidente operacional','ALIMAK · seguimiento desgaste de piñón','Se informó desgaste actual de 0,8 mm frente a referencia indicada de 1,2–1,4 mm.','Es un componente crítico de tracción y requiere tendencia y criterio de reemplazo trazable.','Mantener mediciones periódicas, confirmar límite de reemplazo y preparar intervención antes del desgaste admisible.','media','nueva',null,'2026-09-17T17:10:00-03:00'),
('portacount-aprobacion-20260917','gmail','1a0afa8c738bf692','Prevención','Portacount · aprobación pendiente','Se reiteró la solicitud de revisión y aprobación de cotizaciones para pruebas de ajuste Portacount.','La aprobación pendiente puede retrasar pruebas asociadas a protección respiratoria y cumplimiento preventivo.','Resolver aprobación de la cotización o emitir observaciones para que Prevención continúe.','alta','nueva',null,'2026-09-17T17:20:00-03:00')
on conflict(source_key) do nothing;
