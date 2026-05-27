do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'cartagena_publication_evaluations'
  ) then
    alter table public.cartagena_publication_evaluations
      add column if not exists criteria_scores jsonb not null default '{}'::jsonb,
      add column if not exists total_score numeric(5,2),
      add column if not exists decision text,
      add column if not exists strengths text,
      add column if not exists improvements text,
      add column if not exists evaluated_at timestamptz;
  else
    create table public.cartagena_publication_evaluations (
      id uuid primary key default gen_random_uuid(),
      publication_id uuid not null references public.cartagena_producto_producto (id) on delete cascade,
      evaluator_id uuid not null references auth.users (id) on delete cascade,
      role public.user_role not null,
      action text not null,
      workflow_status public.cartagena_publication_workflow_status not null,
      criteria_scores jsonb not null default '{}'::jsonb,
      total_score numeric(5,2),
      decision text,
      strengths text,
      improvements text,
      comments text,
      evaluated_at timestamptz,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );
  end if;
end
$$;

alter table public.cartagena_publication_evaluations
  alter column criteria_scores set default '{}'::jsonb;

create or replace function public.cartagena_is_valid_evaluation_criteria_scores(
  p_criteria_scores jsonb
)
returns boolean
language plpgsql
immutable
as $$
declare
  v_keys text[];
  v_key text;
  v_value numeric;
begin
  if p_criteria_scores is null then
    return false;
  end if;

  if jsonb_typeof(p_criteria_scores) <> 'object' then
    return false;
  end if;

  if p_criteria_scores = '{}'::jsonb then
    return true;
  end if;

  select array_agg(key order by key)
  into v_keys
  from jsonb_object_keys(p_criteria_scores) as key;

  if v_keys is distinct from array[
    'calidad_academica',
    'claridad_redaccion',
    'pertinencia_tematica',
    'uso_metadatos_documentacion'
  ] then
    return false;
  end if;

  foreach v_key in array v_keys loop
    begin
      v_value := (p_criteria_scores ->> v_key)::numeric;
    exception
      when others then
        return false;
    end;

    if v_value < 1 or v_value > 5 or trunc(v_value) <> v_value then
      return false;
    end if;
  end loop;

  return true;
end;
$$;

create or replace function public.cartagena_is_complete_evaluation_criteria_scores(
  p_criteria_scores jsonb
)
returns boolean
language sql
immutable
as $$
  select
    public.cartagena_is_valid_evaluation_criteria_scores(p_criteria_scores)
    and p_criteria_scores <> '{}'::jsonb
$$;

alter table public.cartagena_publication_evaluations
  drop constraint if exists cartagena_publication_evaluations_total_score_check;

alter table public.cartagena_publication_evaluations
  add constraint cartagena_publication_evaluations_total_score_check
  check (
    total_score is null
    or (total_score >= 0 and total_score <= 20)
  );

alter table public.cartagena_publication_evaluations
  drop constraint if exists cartagena_publication_evaluations_decision_check;

alter table public.cartagena_publication_evaluations
  add constraint cartagena_publication_evaluations_decision_check
  check (
    decision is null
    or decision in ('approve', 'reject', 'return_with_observations')
  );

alter table public.cartagena_publication_evaluations
  drop constraint if exists cartagena_publication_evaluations_criteria_scores_check;

alter table public.cartagena_publication_evaluations
  add constraint cartagena_publication_evaluations_criteria_scores_check
  check (public.cartagena_is_valid_evaluation_criteria_scores(criteria_scores));

create or replace function public.cartagena_calculate_evaluation_total_score(
  p_criteria_scores jsonb
)
returns numeric(5,2)
language sql
immutable
as $$
  select coalesce(sum((value)::numeric), 0)::numeric(5,2)
  from jsonb_each_text(p_criteria_scores)
$$;

create or replace function public.cartagena_get_latest_complete_evaluation(
  p_publication_id uuid
)
returns public.cartagena_publication_evaluations
language sql
stable
security definer
set search_path = public, auth
as $$
  select evaluation.*
  from public.cartagena_publication_evaluations as evaluation
  where evaluation.publication_id = p_publication_id
    and public.cartagena_is_complete_evaluation_criteria_scores(evaluation.criteria_scores)
    and evaluation.total_score is not null
    and evaluation.decision is not null
    and evaluation.evaluated_at is not null
  order by evaluation.evaluated_at desc, evaluation.updated_at desc, evaluation.created_at desc
  limit 1
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
  v_strengths text;
  v_improvements text;
  v_comments text;
  v_decision text;
begin
  v_role := public.cartagena_effective_user_role();

  if auth.uid() is null then
    raise exception 'authentication required';
  end if;

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
    'enviada_a_evaluacion'::public.cartagena_publication_workflow_status,
    'en_evaluacion'::public.cartagena_publication_workflow_status
  ) then
    raise exception 'publication is not in an evaluable status';
  end if;

  if not public.cartagena_is_valid_evaluation_criteria_scores(p_criteria_scores) then
    raise exception 'criteria_scores must use the fixed academic rubric';
  end if;

  v_total_score := public.cartagena_calculate_evaluation_total_score(p_criteria_scores);
  v_decision := nullif(trim(coalesce(p_decision, '')), '');
  v_strengths := nullif(trim(coalesce(p_strengths, '')), '');
  v_improvements := nullif(trim(coalesce(p_improvements, '')), '');
  v_comments := nullif(trim(coalesce(p_comments, '')), '');

  if v_decision is not null then
    if not public.cartagena_is_complete_evaluation_criteria_scores(p_criteria_scores) then
      raise exception 'a final decision requires the 4 rubric criteria';
    end if;

    if v_decision not in ('approve', 'reject', 'return_with_observations') then
      raise exception 'unsupported evaluation decision';
    end if;

    if v_decision = 'approve' and v_total_score < 16 then
      raise exception 'approval requires a minimum score of 16 points';
    end if;

    if v_decision = 'reject' and coalesce(v_comments, v_improvements) is null then
      raise exception 'rejection requires a clear justification';
    end if;

    if v_decision = 'return_with_observations' and coalesce(v_improvements, v_comments) is null then
      raise exception 'return with observations requires improvement notes or comments';
    end if;
  end if;

  select *
  into v_existing
  from public.cartagena_publication_evaluations
  where publication_id = p_publication_id
    and evaluator_id = auth.uid()
  order by evaluated_at desc nulls last, updated_at desc, created_at desc
  limit 1
  for update;

  if found then
    update public.cartagena_publication_evaluations
    set role = v_role,
        action = case when v_decision is null then 'formal_evaluation_draft' else 'formal_evaluation' end,
        workflow_status = v_publication.workflow_status,
        criteria_scores = p_criteria_scores,
        total_score = case
          when public.cartagena_is_complete_evaluation_criteria_scores(p_criteria_scores)
            then v_total_score
          else null
        end,
        decision = v_decision,
        strengths = v_strengths,
        improvements = v_improvements,
        comments = v_comments,
        evaluated_at = now()
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
    case when v_decision is null then 'formal_evaluation_draft' else 'formal_evaluation' end,
    v_publication.workflow_status,
    p_criteria_scores,
    case
      when public.cartagena_is_complete_evaluation_criteria_scores(p_criteria_scores)
        then v_total_score
      else null
    end,
    v_decision,
    v_strengths,
    v_improvements,
    v_comments,
    now()
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
  v_comments text;
begin
  v_role := public.cartagena_effective_user_role();
  v_comments := nullif(trim(coalesce(p_comments, '')), '');

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

      select *
      into v_complete_evaluation
      from public.cartagena_get_latest_complete_evaluation(p_publication_id);

      if not found then
        raise exception 'a complete academic evaluation is required before approval';
      end if;

      if v_complete_evaluation.decision <> 'approve' then
        raise exception 'the latest academic evaluation does not support approval';
      end if;

      if coalesce(v_complete_evaluation.total_score, 0) < 16 then
        raise exception 'approval requires a minimum score of 16 points';
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

      select *
      into v_complete_evaluation
      from public.cartagena_get_latest_complete_evaluation(p_publication_id);

      if not found then
        raise exception 'a complete academic evaluation is required before rejection';
      end if;

      if v_complete_evaluation.decision <> 'reject' then
        raise exception 'the latest academic evaluation does not support rejection';
      end if;

      if coalesce(v_complete_evaluation.comments, v_complete_evaluation.improvements) is null then
        raise exception 'rejection requires a clear academic justification';
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

      select *
      into v_complete_evaluation
      from public.cartagena_get_latest_complete_evaluation(p_publication_id);

      if not found then
        raise exception 'a complete academic evaluation is required before returning a publication';
      end if;

      if v_complete_evaluation.decision <> 'return_with_observations' then
        raise exception 'the latest academic evaluation does not support return with observations';
      end if;

      if coalesce(v_complete_evaluation.improvements, v_complete_evaluation.comments) is null then
        raise exception 'return with observations requires improvements or comments';
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
    coalesce(v_comments, v_complete_evaluation.comments)
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
      v_comments
    );
  end if;

  return v_publication;
end;
$$;

drop policy if exists "cartagena_publication_evaluations_select_authenticated" on public.cartagena_publication_evaluations;
drop policy if exists "cartagena_publication_evaluations_select_academic" on public.cartagena_publication_evaluations;
create policy "cartagena_publication_evaluations_select_academic"
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

drop policy if exists "cartagena_publication_evaluations_insert_evaluator" on public.cartagena_publication_evaluations;
create policy "cartagena_publication_evaluations_insert_evaluator"
on public.cartagena_publication_evaluations
for insert
to authenticated
with check (
  evaluator_id = auth.uid()
  and (
    public.cartagena_is_evaluador_user()
    or public.is_admin_user()
  )
);

drop policy if exists "cartagena_publication_evaluations_update_evaluator" on public.cartagena_publication_evaluations;
create policy "cartagena_publication_evaluations_update_evaluator"
on public.cartagena_publication_evaluations
for update
to authenticated
using (
  evaluator_id = auth.uid()
  and (
    public.cartagena_is_evaluador_user()
    or public.is_admin_user()
  )
)
with check (
  evaluator_id = auth.uid()
  and (
    public.cartagena_is_evaluador_user()
    or public.is_admin_user()
  )
);

drop policy if exists "cartagena_publication_evaluations_delete_admin" on public.cartagena_publication_evaluations;
create policy "cartagena_publication_evaluations_delete_admin"
on public.cartagena_publication_evaluations
for delete
to authenticated
using (public.is_admin_user());
