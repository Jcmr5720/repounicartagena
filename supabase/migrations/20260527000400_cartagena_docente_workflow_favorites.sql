update public.cartagena_producto_producto
set workflow_status = case
  when workflow_status = 'en_revision_docente'::public.cartagena_publication_workflow_status
    then 'enviada'::public.cartagena_publication_workflow_status
  when workflow_status = 'enviada_a_evaluacion'::public.cartagena_publication_workflow_status
    then 'enviada'::public.cartagena_publication_workflow_status
  else workflow_status
end
where workflow_status in (
  'en_revision_docente'::public.cartagena_publication_workflow_status,
  'enviada_a_evaluacion'::public.cartagena_publication_workflow_status
);

create table if not exists public.cartagena_publication_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  publication_id uuid not null references public.cartagena_producto_producto (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint cartagena_publication_favorites_user_publication_key unique (user_id, publication_id)
);

alter table public.cartagena_publication_favorites enable row level security;

drop policy if exists "cartagena_publication_favorites_select_own" on public.cartagena_publication_favorites;
create policy "cartagena_publication_favorites_select_own"
on public.cartagena_publication_favorites
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "cartagena_publication_favorites_insert_own" on public.cartagena_publication_favorites;
create policy "cartagena_publication_favorites_insert_own"
on public.cartagena_publication_favorites
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "cartagena_publication_favorites_delete_own" on public.cartagena_publication_favorites;
create policy "cartagena_publication_favorites_delete_own"
on public.cartagena_publication_favorites
for delete
to authenticated
using (user_id = auth.uid());

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

  if public.cartagena_effective_user_role() = 'docente'::public.user_role then
    if old.owner_id is distinct from auth.uid() then
      raise exception 'docentes can only edit their own publications';
    end if;

    if old.workflow_status not in (
      'borrador'::public.cartagena_publication_workflow_status,
      'ajustes_solicitados'::public.cartagena_publication_workflow_status
    ) then
      raise exception 'docentes can only edit draft or adjustment publications';
    end if;

    if new.workflow_status is distinct from old.workflow_status then
      raise exception 'workflow transitions must use the academic workflow function';
    end if;

    return new;
  end if;

  raise exception 'workflow transitions must use the academic workflow function';
end;
$$;

create or replace function public.cartagena_upsert_publication_evaluation(
  p_publication_id uuid,
  p_criteria_scores jsonb,
  p_decision text default null,
  p_strengths text default null,
  p_improvements text default null,
  p_comments text default null
)
returns public.cartagena_publication_evaluations
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_role public.user_role;
  v_publication public.cartagena_producto_producto%rowtype;
  v_existing public.cartagena_publication_evaluations%rowtype;
  v_total_score numeric(5,2);
  v_decision text;
  v_score_count integer;
  v_now timestamptz;
begin
  v_role := public.cartagena_effective_user_role();

  if v_role <> 'evaluador'::public.user_role and v_role <> 'admin'::public.user_role then
    raise exception 'only evaluadores or admins can save evaluations';
  end if;

  select *
  into v_publication
  from public.cartagena_producto_producto
  where id = p_publication_id;

  if not found then
    raise exception 'publication not found';
  end if;

  if v_publication.workflow_status not in (
    'enviada'::public.cartagena_publication_workflow_status,
    'en_evaluacion'::public.cartagena_publication_workflow_status
  ) then
    raise exception 'publication is not in an evaluable status';
  end if;

  v_score_count := coalesce(jsonb_object_length(coalesce(p_criteria_scores, '{}'::jsonb)), 0);
  v_total_score :=
    coalesce((p_criteria_scores ->> 'calidad_academica')::numeric, 0) +
    coalesce((p_criteria_scores ->> 'pertinencia_tematica')::numeric, 0) +
    coalesce((p_criteria_scores ->> 'claridad_redaccion')::numeric, 0) +
    coalesce((p_criteria_scores ->> 'uso_metadatos_documentacion')::numeric, 0);

  v_decision := nullif(trim(coalesce(p_decision, '')), '');
  v_now := case when v_score_count = 4 then now() else null end;

  select *
  into v_existing
  from public.cartagena_publication_evaluations
  where publication_id = p_publication_id
    and evaluator_id = auth.uid()
  order by created_at desc
  limit 1;

  if found then
    update public.cartagena_publication_evaluations
    set criteria_scores = coalesce(p_criteria_scores, '{}'::jsonb),
        total_score = v_total_score,
        decision = v_decision,
        strengths = nullif(trim(coalesce(p_strengths, '')), ''),
        improvements = nullif(trim(coalesce(p_improvements, '')), ''),
        comments = nullif(trim(coalesce(p_comments, '')), ''),
        evaluated_at = coalesce(v_now, evaluated_at),
        workflow_status = v_publication.workflow_status
    where id = v_existing.id
    returning * into v_existing;

    return v_existing;
  end if;

  insert into public.cartagena_publication_evaluations (
    publication_id,
    evaluator_id,
    role,
    action,
    workflow_status,
    criteria_scores,
    total_score,
    decision,
    strengths,
    improvements,
    comments,
    evaluated_at
  )
  values (
    p_publication_id,
    auth.uid(),
    v_role,
    'save_evaluation',
    v_publication.workflow_status,
    coalesce(p_criteria_scores, '{}'::jsonb),
    v_total_score,
    v_decision,
    nullif(trim(coalesce(p_strengths, '')), ''),
    nullif(trim(coalesce(p_improvements, '')), ''),
    nullif(trim(coalesce(p_comments, '')), ''),
    v_now
  )
  returning * into v_existing;

  return v_existing;
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
  v_complete_evaluation public.cartagena_publication_evaluations%rowtype;
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
      if v_role <> 'docente'::public.user_role and v_role <> 'admin'::public.user_role then
        raise exception 'only docentes or admins can submit publications';
      end if;
      if v_role = 'docente'::public.user_role and v_publication.owner_id <> auth.uid() then
        raise exception 'docentes can only submit their own publications';
      end if;
      if v_previous_status not in (
        'borrador'::public.cartagena_publication_workflow_status,
        'ajustes_solicitados'::public.cartagena_publication_workflow_status
      ) then
        raise exception 'publication cannot be submitted from current status';
      end if;
      v_next_status := 'enviada'::public.cartagena_publication_workflow_status;
    when 'start_evaluation' then
      if v_role <> 'evaluador'::public.user_role and v_role <> 'admin'::public.user_role then
        raise exception 'only evaluadores or admins can start evaluation';
      end if;
      if v_previous_status <> 'enviada'::public.cartagena_publication_workflow_status then
        raise exception 'publication is not ready to start evaluation';
      end if;
      v_next_status := 'en_evaluacion'::public.cartagena_publication_workflow_status;
    when 'approve' then
      if v_role <> 'evaluador'::public.user_role and v_role <> 'admin'::public.user_role then
        raise exception 'only evaluadores or admins can approve';
      end if;
      if v_previous_status not in (
        'enviada'::public.cartagena_publication_workflow_status,
        'en_evaluacion'::public.cartagena_publication_workflow_status
      ) then
        raise exception 'publication is not under evaluation';
      end if;

      select *
      into v_complete_evaluation
      from public.cartagena_get_latest_complete_evaluation(p_publication_id);

      if not found or coalesce(v_complete_evaluation.total_score, 0) < 16 then
        raise exception 'a complete academic evaluation with minimum 16/20 is required before approval';
      end if;

      v_next_status := 'aprobada'::public.cartagena_publication_workflow_status;
    when 'reject' then
      if v_role <> 'evaluador'::public.user_role and v_role <> 'admin'::public.user_role then
        raise exception 'only evaluadores or admins can reject';
      end if;
      if v_previous_status not in (
        'enviada'::public.cartagena_publication_workflow_status,
        'en_evaluacion'::public.cartagena_publication_workflow_status
      ) then
        raise exception 'publication is not under evaluation';
      end if;

      select *
      into v_complete_evaluation
      from public.cartagena_get_latest_complete_evaluation(p_publication_id);

      if not found or nullif(trim(coalesce(v_complete_evaluation.comments, '')), '') is null then
        raise exception 'a complete academic evaluation with justification is required before rejection';
      end if;

      v_next_status := 'rechazada'::public.cartagena_publication_workflow_status;
    when 'return_with_observations' then
      if v_role <> 'evaluador'::public.user_role and v_role <> 'admin'::public.user_role then
        raise exception 'only evaluadores or admins can return publications';
      end if;
      if v_previous_status not in (
        'enviada'::public.cartagena_publication_workflow_status,
        'en_evaluacion'::public.cartagena_publication_workflow_status
      ) then
        raise exception 'publication is not under evaluation';
      end if;

      select *
      into v_complete_evaluation
      from public.cartagena_get_latest_complete_evaluation(p_publication_id);

      if not found or (
        nullif(trim(coalesce(v_complete_evaluation.improvements, '')), '') is null
        and nullif(trim(coalesce(v_complete_evaluation.comments, '')), '') is null
      ) then
        raise exception 'a complete academic evaluation with observations is required before returning a publication';
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

  return v_publication;
end;
$$;

drop policy if exists "cartagena_producto_producto_insert_student_own" on public.cartagena_producto_producto;
drop policy if exists "cartagena_producto_producto_insert_docente_own" on public.cartagena_producto_producto;
create policy "cartagena_producto_producto_insert_docente_own"
on public.cartagena_producto_producto
for insert
to authenticated
with check (
  owner_id = auth.uid()
  and (
    public.cartagena_effective_user_role() = 'docente'::public.user_role
    or public.is_admin_user()
  )
);

drop policy if exists "cartagena_producto_producto_update_student_own" on public.cartagena_producto_producto;
drop policy if exists "cartagena_producto_producto_update_docente_own" on public.cartagena_producto_producto;
create policy "cartagena_producto_producto_update_docente_own"
on public.cartagena_producto_producto
for update
to authenticated
using (
  owner_id = auth.uid()
  and public.cartagena_effective_user_role() = 'docente'::public.user_role
  and workflow_status in (
    'borrador'::public.cartagena_publication_workflow_status,
    'ajustes_solicitados'::public.cartagena_publication_workflow_status
  )
)
with check (
  owner_id = auth.uid()
  and public.cartagena_effective_user_role() = 'docente'::public.user_role
);

drop policy if exists "cartagena_producto_producto_delete_student_own" on public.cartagena_producto_producto;
drop policy if exists "cartagena_producto_producto_delete_docente_own" on public.cartagena_producto_producto;
create policy "cartagena_producto_producto_delete_docente_own"
on public.cartagena_producto_producto
for delete
to authenticated
using (
  owner_id = auth.uid()
  and public.cartagena_effective_user_role() = 'docente'::public.user_role
  and workflow_status in (
    'borrador'::public.cartagena_publication_workflow_status,
    'ajustes_solicitados'::public.cartagena_publication_workflow_status,
    'rechazada'::public.cartagena_publication_workflow_status
  )
);
