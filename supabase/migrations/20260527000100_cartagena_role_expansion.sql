do $$
begin
  if not exists (
    select 1
    from pg_enum
    where enumtypid = 'public.user_role'::regtype
      and enumlabel = 'docente'
  ) then
    alter type public.user_role add value 'docente';
  end if;

  if not exists (
    select 1
    from pg_enum
    where enumtypid = 'public.user_role'::regtype
      and enumlabel = 'evaluador'
  ) then
    alter type public.user_role add value 'evaluador';
  end if;
end
$$;
