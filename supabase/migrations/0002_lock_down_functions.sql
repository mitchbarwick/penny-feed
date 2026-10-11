-- Applied after 0001 following the Supabase security advisor.
-- is_owner() is only needed by signed-in users (RLS policies call it).
revoke execute on function public.is_owner() from public, anon;
grant execute on function public.is_owner() to authenticated, service_role;
-- Supabase's own helper for the "automatic RLS" option; nobody should call it over the API.
do $$ begin
  if exists (select 1 from pg_proc where proname = 'rls_auto_enable' and pronamespace = 'public'::regnamespace) then
    revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
  end if;
end $$;
