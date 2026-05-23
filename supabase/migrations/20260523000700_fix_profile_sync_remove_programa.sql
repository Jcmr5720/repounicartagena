begin;

create or replace function public.sync_profile_from_auth()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_full_name text;
  v_username text;
begin
  if tg_op = 'DELETE' then
    return old;
  end if;

  v_full_name := coalesce(
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'nombre', ''),
    nullif(new.raw_user_meta_data ->> 'name', ''),
    split_part(new.email, '@', 1)
  );

  v_username := coalesce(
    nullif(new.raw_user_meta_data ->> 'username', ''),
    nullif(new.raw_user_meta_data ->> 'usuario', ''),
    split_part(new.email, '@', 1)
  );

  insert into public.cartagena_usuario_usuario (
    id,
    email,
    full_name,
    username,
    role,
    telefono,
    created_at,
    updated_at
  )
  values (
    new.id,
    new.email,
    v_full_name,
    v_username,
    'estudiante'::public.user_role,
    '',
    now(),
    now()
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = excluded.full_name,
        username = excluded.username,
        updated_at = now();

  return new;
end;
$$;

commit;
