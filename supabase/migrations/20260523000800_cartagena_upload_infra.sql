begin;

insert into storage.buckets (id, name, public)
values ('documents', 'documents', true)
on conflict (id) do update
set name = excluded.name,
    public = excluded.public;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'cartagena_producto_producto_owner_id_fkey'
  ) then
    alter table public.cartagena_producto_producto
      add constraint cartagena_producto_producto_owner_id_fkey
      foreign key (owner_id)
      references public.cartagena_usuario_usuario (id)
      on delete cascade;
  end if;
end;
$$;

commit;
