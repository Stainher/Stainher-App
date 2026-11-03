-- R338: RLS alone does not grant DELETE to authenticated clients.
-- Keep rit_delete_author_or_admin policy in force; only grant the table privilege.
grant delete on table public.rit_reuniones to authenticated;
