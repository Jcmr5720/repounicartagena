begin;

alter table if exists public.cartagena_usuario_usuario
  drop column if exists programa;

commit;
