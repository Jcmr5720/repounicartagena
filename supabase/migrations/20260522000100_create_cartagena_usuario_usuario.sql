begin;

create table if not exists public.cartagena_usuario_usuario (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre text not null default '',
  correo text not null unique,
  usuario text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.cartagena_usuario_usuario enable row level security;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_cartagena_usuario_usuario_updated_at on public.cartagena_usuario_usuario;

create trigger set_cartagena_usuario_usuario_updated_at
before update on public.cartagena_usuario_usuario
for each row
execute function public.set_updated_at();

create or replace function public.sync_cartagena_usuario_usuario_from_auth()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_nombre text;
  v_usuario text;
begin
  if tg_op = 'DELETE' then
    delete from public.cartagena_usuario_usuario
    where id = old.id;
    return old;
  end if;

  v_nombre := coalesce(
    nullif(new.raw_user_meta_data ->> 'nombre', ''),
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'name', ''),
    split_part(new.email, '@', 1)
  );

  v_usuario := coalesce(
    nullif(new.raw_user_meta_data ->> 'usuario', ''),
    nullif(new.raw_user_meta_data ->> 'username', ''),
    split_part(new.email, '@', 1)
  );

  insert into public.cartagena_usuario_usuario (
    id,
    nombre,
    correo,
    usuario,
    created_at,
    updated_at
  )
  values (
    new.id,
    v_nombre,
    new.email,
    v_usuario,
    now(),
    now()
  )
  on conflict (id) do update
    set nombre = excluded.nombre,
        correo = excluded.correo,
        usuario = excluded.usuario,
        updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert or update on auth.users
for each row
execute function public.sync_cartagena_usuario_usuario_from_auth();

drop trigger if exists on_auth_user_deleted on auth.users;

create trigger on_auth_user_deleted
after delete on auth.users
for each row
execute function public.sync_cartagena_usuario_usuario_from_auth();

drop policy if exists "cartagena_usuario_usuario_select_own" on public.cartagena_usuario_usuario;

create policy "cartagena_usuario_usuario_select_own"
on public.cartagena_usuario_usuario
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "cartagena_usuario_usuario_update_own" on public.cartagena_usuario_usuario;

create policy "cartagena_usuario_usuario_update_own"
on public.cartagena_usuario_usuario
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

grant select, update on public.cartagena_usuario_usuario to authenticated;

commit;
