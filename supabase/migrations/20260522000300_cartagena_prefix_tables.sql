begin;

alter table if exists public.profiles rename to cartagena_usuario_usuario;

create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public, auth
as $$
  select role
  from public.cartagena_usuario_usuario
  where id = auth.uid()
$$;

create or replace function public.is_admin_user()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select public.current_user_role() = 'admin'::public.user_role
$$;

create or replace function public.is_moderator_user()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select public.current_user_role() = 'moderador'::public.user_role
$$;

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
    programa,
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

create or replace function public.prevent_profile_role_changes()
returns trigger
language plpgsql
as $$
begin
  if new.role is distinct from old.role and not public.is_admin_user() then
    raise exception 'only administrators can change roles';
  end if;

  return new;
end;
$$;

create or replace function public.prevent_document_permission_bypass()
returns trigger
language plpgsql
as $$
begin
  if public.is_admin_user() then
    return new;
  end if;

  if public.is_moderator_user() then
    if new.owner_id is distinct from old.owner_id
      or new.title is distinct from old.title
      or new.description is distinct from old.description
      or new.autor is distinct from old.autor
      or new.programa is distinct from old.programa
      or new.anio is distinct from old.anio
      or new.linea_tematica is distinct from old.linea_tematica
      or new.palabras_clave is distinct from old.palabras_clave
      or new.storage_path is distinct from old.storage_path
      or new.file_name is distinct from old.file_name
      or new.file_size is distinct from old.file_size then
      raise exception 'moderators can only change document status';
    end if;

    return new;
  end if;

  if old.owner_id = auth.uid() then
    if new.status is distinct from old.status then
      raise exception 'students cannot suspend or reactivate documents';
    end if;

    return new;
  end if;

  raise exception 'not allowed to modify this document';
end;
$$;

drop policy if exists "profiles_select_own" on public.cartagena_usuario_usuario;
create policy "profiles_select_own"
on public.cartagena_usuario_usuario
for select
to authenticated
using (auth.uid() = id or public.is_admin_user());

drop policy if exists "profiles_update_own" on public.cartagena_usuario_usuario;
create policy "profiles_update_own"
on public.cartagena_usuario_usuario
for update
to authenticated
using (auth.uid() = id or public.is_admin_user())
with check (auth.uid() = id or public.is_admin_user());

drop trigger if exists set_profiles_updated_at on public.cartagena_usuario_usuario;
create trigger set_profiles_updated_at
before update on public.cartagena_usuario_usuario
for each row
execute function public.set_updated_at();

drop trigger if exists prevent_profile_role_changes_trigger on public.cartagena_usuario_usuario;
create trigger prevent_profile_role_changes_trigger
before update on public.cartagena_usuario_usuario
for each row
execute function public.prevent_profile_role_changes();

drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.sync_profile_from_auth();
create trigger on_auth_user_updated
after update on auth.users
for each row
execute function public.sync_profile_from_auth();

alter table public.cartagena_usuario_usuario enable row level security;

commit;
