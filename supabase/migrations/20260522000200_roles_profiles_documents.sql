begin;

create extension if not exists pgcrypto;

do $$
begin
  create type public.user_role as enum ('estudiante', 'moderador', 'admin');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.document_status as enum ('disponible', 'suspendido');
exception
  when duplicate_object then null;
end
$$;

alter table if exists public.cartagena_usuario_usuario rename to profiles;

alter table if exists public.profiles rename column nombre to full_name;
alter table if exists public.profiles rename column correo to email;
alter table if exists public.profiles rename column usuario to username;

alter table public.profiles
  alter column full_name drop not null;

alter table public.profiles
  alter column email set not null;

alter table public.profiles
  alter column username set not null;

alter table public.profiles
  add column if not exists role public.user_role not null default 'estudiante',
  add column if not exists programa text not null default '',
  add column if not exists telefono text not null default '',
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

update public.profiles
set
  role = coalesce(role, 'estudiante'::public.user_role),
  programa = coalesce(programa, ''),
  telefono = coalesce(telefono, ''),
  updated_at = now();

create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public, auth
as $$
  select role
  from public.profiles
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

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = id or public.is_admin_user());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id or public.is_admin_user())
with check (auth.uid() = id or public.is_admin_user());

drop trigger if exists set_profiles_updated_at on public.profiles;
drop trigger if exists set_cartagena_usuario_usuario_updated_at on public.profiles;

create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

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

drop trigger if exists prevent_profile_role_changes_trigger on public.profiles;

create trigger prevent_profile_role_changes_trigger
before update on public.profiles
for each row
execute function public.prevent_profile_role_changes();

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

  insert into public.profiles (
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

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text not null default '',
  autor text not null default '',
  programa text not null default '',
  anio integer not null default extract(year from now())::integer,
  linea_tematica text not null default '',
  palabras_clave text[] not null default '{}'::text[],
  status public.document_status not null default 'disponible',
  storage_path text,
  file_name text,
  file_size bigint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.documents enable row level security;

drop trigger if exists set_documents_updated_at on public.documents;

create trigger set_documents_updated_at
before update on public.documents
for each row
execute function public.set_updated_at();

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

drop trigger if exists prevent_document_permission_bypass_trigger on public.documents;

create trigger prevent_document_permission_bypass_trigger
before update on public.documents
for each row
execute function public.prevent_document_permission_bypass();

drop policy if exists "documents_select_available" on public.documents;
create policy "documents_select_available"
on public.documents
for select
to public
using (
  status = 'disponible'::public.document_status
  or public.is_admin_user()
  or public.is_moderator_user()
);

drop policy if exists "documents_insert_student_own" on public.documents;
create policy "documents_insert_student_own"
on public.documents
for insert
to authenticated
with check (
  owner_id = auth.uid()
  and status = 'disponible'::public.document_status
  and (
    public.current_user_role() = 'estudiante'::public.user_role
    or public.is_admin_user()
  )
);

drop policy if exists "documents_update_student_own" on public.documents;
create policy "documents_update_student_own"
on public.documents
for update
to authenticated
using (
  owner_id = auth.uid()
  and status = 'disponible'::public.document_status
  and public.current_user_role() = 'estudiante'::public.user_role
)
with check (
  owner_id = auth.uid()
  and public.current_user_role() = 'estudiante'::public.user_role
);

drop policy if exists "documents_update_moderator" on public.documents;
create policy "documents_update_moderator"
on public.documents
for update
to authenticated
using (public.is_moderator_user())
with check (public.is_moderator_user());

drop policy if exists "documents_update_admin" on public.documents;
create policy "documents_update_admin"
on public.documents
for update
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists "documents_delete_student_own" on public.documents;
create policy "documents_delete_student_own"
on public.documents
for delete
to authenticated
using (
  owner_id = auth.uid()
  and status = 'disponible'::public.document_status
  and public.current_user_role() = 'estudiante'::public.user_role
);

drop policy if exists "documents_delete_admin" on public.documents;
create policy "documents_delete_admin"
on public.documents
for delete
to authenticated
using (public.is_admin_user());

insert into storage.buckets (id, name, public)
values ('documents', 'documents', true)
on conflict (id) do update
set public = excluded.public,
    name = excluded.name;

drop policy if exists "documents_bucket_public_read" on storage.objects;
create policy "documents_bucket_public_read"
on storage.objects
for select
to public
using (bucket_id = 'documents');

drop policy if exists "documents_bucket_authenticated_insert" on storage.objects;
create policy "documents_bucket_authenticated_insert"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'documents'
  and (owner = auth.uid() or public.is_admin_user())
);

drop policy if exists "documents_bucket_authenticated_update" on storage.objects;
create policy "documents_bucket_authenticated_update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'documents'
  and (owner = auth.uid() or public.is_admin_user())
)
with check (
  bucket_id = 'documents'
  and (owner = auth.uid() or public.is_admin_user())
);

drop policy if exists "documents_bucket_authenticated_delete" on storage.objects;
create policy "documents_bucket_authenticated_delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'documents'
  and (owner = auth.uid() or public.is_admin_user())
);

commit;
