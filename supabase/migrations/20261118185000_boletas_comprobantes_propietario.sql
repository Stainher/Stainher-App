-- Los comprobantes siguen privados y se autorizan por la boleta reintegrada.
create policy boletas_r354_read_own_transfer_proof
on storage.objects for select to authenticated
using (
  bucket_id = 'boletas-rendir-r354'
  and (storage.foldername(name)) = array[
    '44b92981-9398-42cb-a334-a51baa876125', 'comprobantes-transferencia'
  ]
  and exists (
    select 1
    from public.boletas_rendir_r354 as boleta
    where boleta.user_id = (select auth.uid())
      and boleta.estado = 'reintegrado'
      and storage.filename(storage.objects.name) = coalesce(boleta.transferencia_id, boleta.id)::text
      and (
        boleta.transferencia_id is null
        or exists (
          select 1 from public.boletas_reintegros_r354 as reintegro
          where reintegro.id = boleta.transferencia_id
            and reintegro.user_id = boleta.user_id
        )
      )
  )
);
