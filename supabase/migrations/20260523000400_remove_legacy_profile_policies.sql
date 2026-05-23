begin;

drop policy if exists "profiles_select_own" on public.cartagena_usuario_usuario;
drop policy if exists "profiles_update_own" on public.cartagena_usuario_usuario;

commit;
