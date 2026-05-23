begin;

create table if not exists public.cartagena_producto_programa (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.cartagena_producto_programa enable row level security;

drop trigger if exists set_cartagena_producto_programa_updated_at on public.cartagena_producto_programa;
create trigger set_cartagena_producto_programa_updated_at
before update on public.cartagena_producto_programa
for each row
execute function public.set_updated_at();

drop policy if exists "cartagena_producto_programa_select_all" on public.cartagena_producto_programa;
create policy "cartagena_producto_programa_select_all"
on public.cartagena_producto_programa
for select
to public
using (true);

grant select on table public.cartagena_producto_programa to anon, authenticated;

insert into public.cartagena_producto_programa (nombre)
values
  ('Ingeniería de Sistemas'),
  ('Ingeniería Civil'),
  ('Ingeniería Ambiental'),
  ('Ingeniería Química'),
  ('Medicina'),
  ('Enfermería'),
  ('Odontología'),
  ('Derecho'),
  ('Administración de Empresas'),
  ('Contaduría Pública'),
  ('Economía'),
  ('Licenciatura en Matemáticas'),
  ('Licenciatura en Lenguas Extranjeras'),
  ('Trabajo Social'),
  ('Comunicación Social'),
  ('Historia'),
  ('Filosofía'),
  ('Química Farmacéutica')
on conflict (nombre) do nothing;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'cartagena_producto_producto'
      and column_name = 'programa'
  ) then
    alter table public.cartagena_producto_producto
      add column if not exists programa_id uuid;

    update public.cartagena_producto_producto p
    set programa_id = pr.id
    from public.cartagena_producto_programa pr
    where trim(p.programa) = pr.nombre
      and p.programa_id is null;

    update public.cartagena_producto_producto
    set programa_id = (
      select id
      from public.cartagena_producto_programa
      where nombre = 'Ingeniería de Sistemas'
      limit 1
    )
    where programa_id is null;

    alter table public.cartagena_producto_producto
      alter column programa_id set not null;

    alter table public.cartagena_producto_producto
      drop column if exists programa;
  else
    alter table public.cartagena_producto_producto
      add column if not exists programa_id uuid;

    update public.cartagena_producto_producto
    set programa_id = coalesce(programa_id, (
      select id
      from public.cartagena_producto_programa
      where nombre = 'Ingeniería de Sistemas'
      limit 1
    ));

    alter table public.cartagena_producto_producto
      alter column programa_id set not null;
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'cartagena_producto_producto_programa_id_fkey'
  ) then
    alter table public.cartagena_producto_producto
      add constraint cartagena_producto_producto_programa_id_fkey
      foreign key (programa_id)
      references public.cartagena_producto_programa (id)
      on update cascade
      on delete restrict;
  end if;
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
      or new.programa_id is distinct from old.programa_id
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

commit;
