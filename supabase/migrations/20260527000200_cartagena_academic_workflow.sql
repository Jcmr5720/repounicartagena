update public.cartagena_usuario_usuario
set role = 'evaluador'::public.user_role
where role = 'moderador'::public.user_role;

do $$
begin
  create type public.cartagena_publication_workflow_status as enum (
    'borrador',
    'enviada',
    'en_revision_docente',
    'ajustes_solicitados',
    'enviada_a_evaluacion',
    'en_evaluacion',
    'aprobada',
    'rechazada',
    'publicada',
    'suspendida'
  );
exception
  when duplicate_object then null;
end
$$;

drop trigger if exists prevent_cartagena_producto_producto_permission_bypass_trigger on public.cartagena_producto_producto;
drop trigger if exists cartagena_producto_producto_prevent_permission_bypass on public.cartagena_producto_producto;

alter table public.cartagena_producto_producto
  add column if not exists workflow_status public.cartagena_publication_workflow_status;

update public.cartagena_producto_producto
set workflow_status = case
  when status = 'disponible'::public.document_status then 'publicada'::public.cartagena_publication_workflow_status
  else 'suspendida'::public.cartagena_publication_workflow_status
end
where workflow_status is null;

alter table public.cartagena_producto_producto
  alter column workflow_status set not null,
  alter column workflow_status set default 'borrador'::public.cartagena_publication_workflow_status;

create table if not exists public.cartagena_publication_reviews (
  id uuid primary key default gen_random_uuid(),
  publication_id uuid not null references public.cartagena_producto_producto (id) on delete cascade,
  reviewer_id uuid not null references auth.users (id) on delete cascade,
  role public.user_role not null,
  action text not null,
  workflow_status public.cartagena_publication_workflow_status not null,
  comments text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cartagena_publication_evaluations (
  id uuid primary key default gen_random_uuid(),
  publication_id uuid not null references public.cartagena_producto_producto (id) on delete cascade,
  evaluator_id uuid not null references auth.users (id) on delete cascade,
  role public.user_role not null,
  action text not null,
  workflow_status public.cartagena_publication_workflow_status not null,
  comments text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cartagena_publication_workflow_events (
  id uuid primary key default gen_random_uuid(),
  publication_id uuid not null references public.cartagena_producto_producto (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.user_role not null,
  action text not null,
  previous_status public.cartagena_publication_workflow_status,
  next_status public.cartagena_publication_workflow_status not null,
  comments text,
  created_at timestamptz not null default now()
);

alter table public.cartagena_publication_reviews enable row level security;
alter table public.cartagena_publication_evaluations enable row level security;
alter table public.cartagena_publication_workflow_events enable row level security;

drop trigger if exists cartagena_publication_reviews_set_updated_at on public.cartagena_publication_reviews;
create trigger cartagena_publication_reviews_set_updated_at
before update on public.cartagena_publication_reviews
for each row
execute function public.set_updated_at();

drop trigger if exists cartagena_publication_evaluations_set_updated_at on public.cartagena_publication_evaluations;
create trigger cartagena_publication_evaluations_set_updated_at
before update on public.cartagena_publication_evaluations
for each row
execute function public.set_updated_at();

create or replace function public.cartagena_effective_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public, auth
as $$
  select case
    when public.current_user_role() = 'moderador'::public.user_role then 'evaluador'::public.user_role
    else public.current_user_role()
  end
$$;

create or replace function public.cartagena_is_docente_user()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select public.cartagena_effective_user_role() = 'docente'::public.user_role
$$;

create or replace function public.cartagena_is_evaluador_user()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select public.cartagena_effective_user_role() = 'evaluador'::public.user_role
$$;

create or replace function public.cartagena_sync_publication_visibility()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.workflow_status = 'publicada'::public.cartagena_publication_workflow_status then
    new.status := 'disponible'::public.document_status;
  else
    new.status := 'suspendido'::public.document_status;
  end if;

  return new;
end;
$$;

create or replace function public.cartagena_log_initial_publication_event()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_role public.user_role;
begin
  select role
  into v_role
  from public.cartagena_usuario_usuario
  where id = new.owner_id;

  insert into public.cartagena_publication_workflow_events (
    publication_id,
    user_id,
    role,
    action,
    previous_status,
    next_status,
    comments
  )
  values (
    new.id,
    new.owner_id,
    coalesce(v_role, 'estudiante'::public.user_role),
    'created',
    null,
    new.workflow_status,
    null
  );

  return new;
end;
$$;

create or replace function public.cartagena_prevent_publication_permission_bypass()
returns trigger
language plpgsql
set search_path = public, auth
as $$
begin
  if current_setting('cartagena.workflow_transition', true) = 'on' then
    return new;
  end if;

  if public.is_admin_user() then
    return new;
  end if;

  if public.cartagena_effective_user_role() = 'estudiante'::public.user_role then
    if old.owner_id is distinct from auth.uid() then
      raise exception 'students can only edit their own publications';
    end if;

    if old.workflow_status not in (
      'borrador'::public.cartagena_publication_workflow_status,
      'ajustes_solicitados'::public.cartagena_publication_workflow_status
    ) then
      raise exception 'students can only edit draft or adjustment publications';
    end if;

    if new.workflow_status is distinct from old.workflow_status then
      raise exception 'workflow transitions must use the academic workflow function';
    end if;

    return new;
  end if;

  raise exception 'workflow transitions must use the academic workflow function';
end;
$$;

create or replace function public.cartagena_apply_publication_workflow_action(
  p_publication_id uuid,
  p_action text,
  p_comments text default null
)
returns public.cartagena_producto_producto
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_role public.user_role;
  v_publication public.cartagena_producto_producto%rowtype;
  v_previous_status public.cartagena_publication_workflow_status;
  v_next_status public.cartagena_publication_workflow_status;
begin
  v_role := public.cartagena_effective_user_role();

  select *
  into v_publication
  from public.cartagena_producto_producto
  where id = p_publication_id;

  if not found then
    raise exception 'publication not found';
  end if;

  v_previous_status := v_publication.workflow_status;
  v_next_status := v_previous_status;

  case p_action
    when 'submit_for_review' then
      if v_role <> 'estudiante'::public.user_role and v_role <> 'admin'::public.user_role then
        raise exception 'only students or admins can submit publications';
      end if;
      if v_role = 'estudiante'::public.user_role and v_publication.owner_id <> auth.uid() then
        raise exception 'students can only submit their own publications';
      end if;
      if v_previous_status not in (
        'borrador'::public.cartagena_publication_workflow_status,
        'ajustes_solicitados'::public.cartagena_publication_workflow_status
      ) then
        raise exception 'publication cannot be submitted from current status';
      end if;
      v_next_status := 'enviada'::public.cartagena_publication_workflow_status;
    when 'start_docente_review' then
      if v_role <> 'docente'::public.user_role and v_role <> 'admin'::public.user_role then
        raise exception 'only docentes or admins can start review';
      end if;
      if v_previous_status <> 'enviada'::public.cartagena_publication_workflow_status then
        raise exception 'publication is not ready for docente review';
      end if;
      v_next_status := 'en_revision_docente'::public.cartagena_publication_workflow_status;
    when 'request_adjustments' then
      if v_role <> 'docente'::public.user_role and v_role <> 'admin'::public.user_role then
        raise exception 'only docentes or admins can request adjustments';
      end if;
      if v_previous_status not in (
        'enviada'::public.cartagena_publication_workflow_status,
        'en_revision_docente'::public.cartagena_publication_workflow_status
      ) then
        raise exception 'publication is not in docente review';
      end if;
      v_next_status := 'ajustes_solicitados'::public.cartagena_publication_workflow_status;
    when 'send_to_evaluation' then
      if v_role <> 'docente'::public.user_role and v_role <> 'admin'::public.user_role then
        raise exception 'only docentes or admins can send to evaluation';
      end if;
      if v_previous_status not in (
        'enviada'::public.cartagena_publication_workflow_status,
        'en_revision_docente'::public.cartagena_publication_workflow_status
      ) then
        raise exception 'publication is not ready for evaluation';
      end if;
      v_next_status := 'enviada_a_evaluacion'::public.cartagena_publication_workflow_status;
    when 'start_evaluation' then
      if v_role <> 'evaluador'::public.user_role and v_role <> 'admin'::public.user_role then
        raise exception 'only evaluadores or admins can start evaluation';
      end if;
      if v_previous_status <> 'enviada_a_evaluacion'::public.cartagena_publication_workflow_status then
        raise exception 'publication is not ready to start evaluation';
      end if;
      v_next_status := 'en_evaluacion'::public.cartagena_publication_workflow_status;
    when 'approve' then
      if v_role <> 'evaluador'::public.user_role and v_role <> 'admin'::public.user_role then
        raise exception 'only evaluadores or admins can approve';
      end if;
      if v_previous_status not in (
        'enviada_a_evaluacion'::public.cartagena_publication_workflow_status,
        'en_evaluacion'::public.cartagena_publication_workflow_status
      ) then
        raise exception 'publication is not under evaluation';
      end if;
      v_next_status := 'aprobada'::public.cartagena_publication_workflow_status;
    when 'reject' then
      if v_role <> 'evaluador'::public.user_role and v_role <> 'admin'::public.user_role then
        raise exception 'only evaluadores or admins can reject';
      end if;
      if v_previous_status not in (
        'enviada_a_evaluacion'::public.cartagena_publication_workflow_status,
        'en_evaluacion'::public.cartagena_publication_workflow_status
      ) then
        raise exception 'publication is not under evaluation';
      end if;
      v_next_status := 'rechazada'::public.cartagena_publication_workflow_status;
    when 'return_with_observations' then
      if v_role <> 'evaluador'::public.user_role and v_role <> 'admin'::public.user_role then
        raise exception 'only evaluadores or admins can return publications';
      end if;
      if v_previous_status not in (
        'enviada_a_evaluacion'::public.cartagena_publication_workflow_status,
        'en_evaluacion'::public.cartagena_publication_workflow_status
      ) then
        raise exception 'publication is not under evaluation';
      end if;
      v_next_status := 'ajustes_solicitados'::public.cartagena_publication_workflow_status;
    when 'publish' then
      if v_role <> 'admin'::public.user_role then
        raise exception 'only admins can publish';
      end if;
      if v_previous_status <> 'aprobada'::public.cartagena_publication_workflow_status then
        raise exception 'only approved publications can be published';
      end if;
      v_next_status := 'publicada'::public.cartagena_publication_workflow_status;
    when 'suspend' then
      if v_role <> 'admin'::public.user_role then
        raise exception 'only admins can suspend';
      end if;
      if v_previous_status not in (
        'publicada'::public.cartagena_publication_workflow_status,
        'aprobada'::public.cartagena_publication_workflow_status
      ) then
        raise exception 'publication cannot be suspended from current status';
      end if;
      v_next_status := 'suspendida'::public.cartagena_publication_workflow_status;
    else
      raise exception 'unsupported workflow action';
  end case;

  perform set_config('cartagena.workflow_transition', 'on', true);

  update public.cartagena_producto_producto
  set workflow_status = v_next_status
  where id = p_publication_id
  returning * into v_publication;

  insert into public.cartagena_publication_workflow_events (
    publication_id,
    user_id,
    role,
    action,
    previous_status,
    next_status,
    comments
  )
  values (
    p_publication_id,
    auth.uid(),
    v_role,
    p_action,
    v_previous_status,
    v_next_status,
    nullif(trim(coalesce(p_comments, '')), '')
  );

  if v_role = 'docente'::public.user_role or (v_role = 'admin'::public.user_role and p_action in ('start_docente_review', 'request_adjustments', 'send_to_evaluation')) then
    insert into public.cartagena_publication_reviews (
      publication_id,
      reviewer_id,
      role,
      action,
      workflow_status,
      comments
    )
    values (
      p_publication_id,
      auth.uid(),
      v_role,
      p_action,
      v_next_status,
      nullif(trim(coalesce(p_comments, '')), '')
    );
  end if;

  if v_role = 'evaluador'::public.user_role or (v_role = 'admin'::public.user_role and p_action in ('start_evaluation', 'approve', 'reject', 'return_with_observations')) then
    insert into public.cartagena_publication_evaluations (
      publication_id,
      evaluator_id,
      role,
      action,
      workflow_status,
      comments
    )
    values (
      p_publication_id,
      auth.uid(),
      v_role,
      p_action,
      v_next_status,
      nullif(trim(coalesce(p_comments, '')), '')
    );
  end if;

  return v_publication;
end;
$$;

drop trigger if exists cartagena_producto_producto_sync_visibility on public.cartagena_producto_producto;
create trigger cartagena_producto_producto_sync_visibility
before insert or update on public.cartagena_producto_producto
for each row
execute function public.cartagena_sync_publication_visibility();

drop trigger if exists prevent_cartagena_producto_producto_permission_bypass_trigger on public.cartagena_producto_producto;
drop trigger if exists cartagena_producto_producto_prevent_permission_bypass on public.cartagena_producto_producto;
create trigger cartagena_producto_producto_prevent_permission_bypass
before update on public.cartagena_producto_producto
for each row
execute function public.cartagena_prevent_publication_permission_bypass();

drop trigger if exists cartagena_producto_producto_log_initial_workflow_event on public.cartagena_producto_producto;
create trigger cartagena_producto_producto_log_initial_workflow_event
after insert on public.cartagena_producto_producto
for each row
execute function public.cartagena_log_initial_publication_event();

drop policy if exists "cartagena_producto_producto_select_available" on public.cartagena_producto_producto;
create policy "cartagena_producto_producto_select_available"
on public.cartagena_producto_producto
for select
to public
using (status = 'disponible'::public.document_status);

drop policy if exists "cartagena_producto_producto_select_authenticated" on public.cartagena_producto_producto;
create policy "cartagena_producto_producto_select_authenticated"
on public.cartagena_producto_producto
for select
to authenticated
using (
  owner_id = auth.uid()
  or public.is_admin_user()
  or public.cartagena_is_docente_user()
  or public.cartagena_is_evaluador_user()
);

drop policy if exists "cartagena_producto_producto_insert_student_own" on public.cartagena_producto_producto;
create policy "cartagena_producto_producto_insert_student_own"
on public.cartagena_producto_producto
for insert
to authenticated
with check (
  owner_id = auth.uid()
  and (
    public.cartagena_effective_user_role() = 'estudiante'::public.user_role
    or public.is_admin_user()
  )
);

drop policy if exists "cartagena_producto_producto_update_student_own" on public.cartagena_producto_producto;
create policy "cartagena_producto_producto_update_student_own"
on public.cartagena_producto_producto
for update
to authenticated
using (
  owner_id = auth.uid()
  and public.cartagena_effective_user_role() = 'estudiante'::public.user_role
  and workflow_status in (
    'borrador'::public.cartagena_publication_workflow_status,
    'ajustes_solicitados'::public.cartagena_publication_workflow_status
  )
)
with check (
  owner_id = auth.uid()
  and public.cartagena_effective_user_role() = 'estudiante'::public.user_role
);

drop policy if exists "cartagena_producto_producto_update_moderator" on public.cartagena_producto_producto;
drop policy if exists "cartagena_producto_producto_update_admin" on public.cartagena_producto_producto;
create policy "cartagena_producto_producto_update_admin"
on public.cartagena_producto_producto
for update
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists "cartagena_producto_producto_delete_student_own" on public.cartagena_producto_producto;
create policy "cartagena_producto_producto_delete_student_own"
on public.cartagena_producto_producto
for delete
to authenticated
using (
  owner_id = auth.uid()
  and public.cartagena_effective_user_role() = 'estudiante'::public.user_role
  and workflow_status in (
    'borrador'::public.cartagena_publication_workflow_status,
    'ajustes_solicitados'::public.cartagena_publication_workflow_status,
    'rechazada'::public.cartagena_publication_workflow_status
  )
);

drop policy if exists "cartagena_producto_producto_delete_admin" on public.cartagena_producto_producto;
create policy "cartagena_producto_producto_delete_admin"
on public.cartagena_producto_producto
for delete
to authenticated
using (public.is_admin_user());

drop policy if exists "cartagena_publication_reviews_select_authenticated" on public.cartagena_publication_reviews;
create policy "cartagena_publication_reviews_select_authenticated"
on public.cartagena_publication_reviews
for select
to authenticated
using (
  public.is_admin_user()
  or public.cartagena_is_docente_user()
  or public.cartagena_is_evaluador_user()
  or exists (
    select 1
    from public.cartagena_producto_producto publication
    where publication.id = publication_id
      and publication.owner_id = auth.uid()
  )
);

drop policy if exists "cartagena_publication_evaluations_select_authenticated" on public.cartagena_publication_evaluations;
create policy "cartagena_publication_evaluations_select_authenticated"
on public.cartagena_publication_evaluations
for select
to authenticated
using (
  public.is_admin_user()
  or public.cartagena_is_docente_user()
  or public.cartagena_is_evaluador_user()
  or exists (
    select 1
    from public.cartagena_producto_producto publication
    where publication.id = publication_id
      and publication.owner_id = auth.uid()
  )
);

drop policy if exists "cartagena_publication_workflow_events_select_authenticated" on public.cartagena_publication_workflow_events;
create policy "cartagena_publication_workflow_events_select_authenticated"
on public.cartagena_publication_workflow_events
for select
to authenticated
using (
  public.is_admin_user()
  or public.cartagena_is_docente_user()
  or public.cartagena_is_evaluador_user()
  or exists (
    select 1
    from public.cartagena_producto_producto publication
    where publication.id = publication_id
      and publication.owner_id = auth.uid()
  )
);
