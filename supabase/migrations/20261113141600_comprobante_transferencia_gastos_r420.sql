alter table public.gastos_transferencias_r348
  add column comprobante_path text unique;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('comprobantes-transferencias', 'comprobantes-transferencias', false, 10485760,
  array['image/jpeg','image/png','image/webp','application/pdf']);

create policy transfer_proof_insert on storage.objects for insert to authenticated
with check (bucket_id='comprobantes-transferencias'
  and (select public.mi_rol())='administrador'
  and (storage.foldername(name))[1]=(select auth.uid())::text);

create policy transfer_proof_read on storage.objects for select to authenticated
using (bucket_id='comprobantes-transferencias'
  and (
    ((select public.mi_rol())='administrador' and (storage.foldername(name))[1]=(select auth.uid())::text)
    or exists(select 1 from public.gastos_transferencias_r348 t where t.comprobante_path=name and not t.anulada)
  ));

create policy transfer_proof_delete_unlinked on storage.objects for delete to authenticated
using (bucket_id='comprobantes-transferencias'
  and (select public.mi_rol())='administrador'
  and (storage.foldername(name))[1]=(select auth.uid())::text
  and not exists(select 1 from public.gastos_transferencias_r348 t where t.comprobante_path=name));

create function public.adjuntar_comprobante_transferencia_r420(p_transferencia uuid, p_archivo text)
returns void language plpgsql security invoker set search_path='' as $$
begin
  if (select public.mi_rol()) is distinct from 'administrador'
     or (storage.foldername(p_archivo))[1] is distinct from (select auth.uid())::text then
    raise exception 'Acceso no autorizado';
  end if;
  if not exists(select 1 from storage.objects where bucket_id='comprobantes-transferencias' and name=p_archivo) then
    raise exception 'No se encontró el archivo cargado';
  end if;
  update public.gastos_transferencias_r348 set comprobante_path=p_archivo
   where id=p_transferencia and not anulada and comprobante_path is null;
  if not found then raise exception 'La transferencia no admite un nuevo comprobante'; end if;
end $$;

create function public.registrar_transferencia_gastos_r420(p_gastos uuid[], p_fecha date, p_pagado_por text, p_archivo text)
returns uuid language plpgsql security invoker set search_path='' as $$
declare transferencia uuid;
begin
  transferencia := public.registrar_transferencia_gastos_r348(p_gastos,p_fecha,p_pagado_por);
  perform public.adjuntar_comprobante_transferencia_r420(transferencia,p_archivo);
  return transferencia;
end $$;

revoke all on function public.adjuntar_comprobante_transferencia_r420(uuid,text),
  public.registrar_transferencia_gastos_r420(uuid[],date,text,text) from public,anon;
grant execute on function public.adjuntar_comprobante_transferencia_r420(uuid,text),
  public.registrar_transferencia_gastos_r420(uuid[],date,text,text) to authenticated;
