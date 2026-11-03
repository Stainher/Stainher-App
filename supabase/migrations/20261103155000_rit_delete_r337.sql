-- R337: permitir eliminación expresa de RIT por autor o administrador.
-- El cliente exige confirmación previa; RLS impide borrar registros ajenos.
drop policy if exists rit_delete_author_or_admin on public.rit_reuniones;
create policy rit_delete_author_or_admin on public.rit_reuniones
 for delete to authenticated
 using (created_by = (select auth.uid()) or lower((select public.mi_rol())) = 'administrador');