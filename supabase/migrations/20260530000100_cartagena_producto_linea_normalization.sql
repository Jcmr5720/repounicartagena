begin;

create table if not exists public.cartagena_producto_linea (
  id uuid primary key default gen_random_uuid(),
  programa_id uuid not null,
  nombre text not null,
  slug text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.cartagena_producto_linea
  alter column programa_id set not null,
  alter column nombre set not null,
  alter column slug set not null;

alter table public.cartagena_producto_linea
  drop constraint if exists cartagena_producto_linea_nombre_not_blank,
  add constraint cartagena_producto_linea_nombre_not_blank
    check (nullif(btrim(nombre), '') is not null),
  drop constraint if exists cartagena_producto_linea_slug_not_blank,
  add constraint cartagena_producto_linea_slug_not_blank
    check (nullif(btrim(slug), '') is not null),
  drop constraint if exists cartagena_producto_linea_unique_programa_nombre,
  add constraint cartagena_producto_linea_unique_programa_nombre
    unique (programa_id, nombre),
  drop constraint if exists cartagena_producto_linea_unique_programa_slug,
  add constraint cartagena_producto_linea_unique_programa_slug
    unique (programa_id, slug);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'cartagena_producto_linea_programa_id_fkey'
  ) then
    alter table public.cartagena_producto_linea
      add constraint cartagena_producto_linea_programa_id_fkey
      foreign key (programa_id)
      references public.cartagena_producto_programa (id)
      on update cascade
      on delete cascade;
  end if;
end;
$$;

alter table public.cartagena_producto_linea enable row level security;

drop trigger if exists cartagena_set_producto_linea_updated_at on public.cartagena_producto_linea;
create trigger cartagena_set_producto_linea_updated_at
before update on public.cartagena_producto_linea
for each row
execute function public.set_updated_at();

drop policy if exists "cartagena_producto_linea_select_all" on public.cartagena_producto_linea;
create policy "cartagena_producto_linea_select_all"
on public.cartagena_producto_linea
for select
to public
using (true);

drop policy if exists "cartagena_producto_linea_insert_admin" on public.cartagena_producto_linea;
create policy "cartagena_producto_linea_insert_admin"
on public.cartagena_producto_linea
for insert
to authenticated
with check (public.is_admin_user());

drop policy if exists "cartagena_producto_linea_update_admin" on public.cartagena_producto_linea;
create policy "cartagena_producto_linea_update_admin"
on public.cartagena_producto_linea
for update
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists "cartagena_producto_linea_delete_admin" on public.cartagena_producto_linea;
create policy "cartagena_producto_linea_delete_admin"
on public.cartagena_producto_linea
for delete
to authenticated
using (public.is_admin_user());

grant select on table public.cartagena_producto_linea to anon, authenticated;

insert into public.cartagena_producto_programa (nombre)
values
  ('Matemáticas'),
  ('Lengua castellana'),
  ('Inglés'),
  ('Ciencias naturales'),
  ('Biología'),
  ('Química'),
  ('Física'),
  ('Ciencias sociales'),
  ('Historia'),
  ('Geografía'),
  ('Constitución política y democracia'),
  ('Educación ética y valores humanos'),
  ('Educación religiosa'),
  ('Educación artística y cultural'),
  ('Educación física, recreación y deportes'),
  ('Tecnología e informática'),
  ('Filosofía'),
  ('Ciencias económicas'),
  ('Ciencias políticas'),
  ('Emprendimiento'),
  ('Competencias ciudadanas'),
  ('Lectura crítica'),
  ('Proyecto de vida')
on conflict (nombre) do update
set updated_at = now();

with cartagena_catalogo_lineas(programa, nombre, slug) as (
  values
    ('Matemáticas', 'Aritmética', 'aritmetica'),
    ('Matemáticas', 'Álgebra', 'algebra'),
    ('Matemáticas', 'Geometría', 'geometria'),
    ('Matemáticas', 'Estadística', 'estadistica'),
    ('Matemáticas', 'Probabilidad', 'probabilidad'),
    ('Lengua castellana', 'Comprensión lectora', 'comprension-lectora'),
    ('Lengua castellana', 'Producción textual', 'produccion-textual'),
    ('Lengua castellana', 'Gramática', 'gramatica'),
    ('Lengua castellana', 'Literatura', 'literatura'),
    ('Lengua castellana', 'Ortografía', 'ortografia'),
    ('Inglés', 'Vocabulario', 'vocabulario'),
    ('Inglés', 'Gramática inglesa', 'gramatica-inglesa'),
    ('Inglés', 'Comprensión oral', 'comprension-oral'),
    ('Inglés', 'Comprensión lectora', 'comprension-lectora'),
    ('Inglés', 'Conversación', 'conversacion'),
    ('Ciencias naturales', 'Seres vivos', 'seres-vivos'),
    ('Ciencias naturales', 'Materia y energía', 'materia-y-energia'),
    ('Ciencias naturales', 'Ecosistemas', 'ecosistemas'),
    ('Ciencias naturales', 'Método científico', 'metodo-cientifico'),
    ('Ciencias naturales', 'Ambiente', 'ambiente'),
    ('Biología', 'Célula', 'celula'),
    ('Biología', 'Sistemas del cuerpo humano', 'sistemas-del-cuerpo-humano'),
    ('Biología', 'Genética', 'genetica'),
    ('Biología', 'Evolución', 'evolucion'),
    ('Biología', 'Biodiversidad', 'biodiversidad'),
    ('Química', 'Materia', 'materia'),
    ('Química', 'Átomos y moléculas', 'atomos-y-moleculas'),
    ('Química', 'Reacciones químicas', 'reacciones-quimicas'),
    ('Química', 'Tabla periódica', 'tabla-periodica'),
    ('Química', 'Mezclas y soluciones', 'mezclas-y-soluciones'),
    ('Física', 'Movimiento', 'movimiento'),
    ('Física', 'Fuerza', 'fuerza'),
    ('Física', 'Energía', 'energia'),
    ('Física', 'Electricidad', 'electricidad'),
    ('Física', 'Ondas', 'ondas'),
    ('Ciencias sociales', 'Sociedad y cultura', 'sociedad-y-cultura'),
    ('Ciencias sociales', 'Organización política', 'organizacion-politica'),
    ('Ciencias sociales', 'Territorio', 'territorio'),
    ('Ciencias sociales', 'Conflictos sociales', 'conflictos-sociales'),
    ('Ciencias sociales', 'Derechos humanos', 'derechos-humanos'),
    ('Historia', 'Historia antigua', 'historia-antigua'),
    ('Historia', 'Historia de Colombia', 'historia-de-colombia'),
    ('Historia', 'Historia universal', 'historia-universal'),
    ('Historia', 'Independencia', 'independencia'),
    ('Historia', 'Siglo XX', 'siglo-xx'),
    ('Geografía', 'Territorio', 'territorio'),
    ('Geografía', 'Clima', 'clima'),
    ('Geografía', 'Relieve', 'relieve'),
    ('Geografía', 'Población', 'poblacion'),
    ('Geografía', 'Regiones naturales', 'regiones-naturales'),
    ('Constitución política y democracia', 'Constitución colombiana', 'constitucion-colombiana'),
    ('Constitución política y democracia', 'Derechos y deberes', 'derechos-y-deberes'),
    ('Constitución política y democracia', 'Participación ciudadana', 'participacion-ciudadana'),
    ('Constitución política y democracia', 'Estado colombiano', 'estado-colombiano'),
    ('Constitución política y democracia', 'Democracia escolar', 'democracia-escolar'),
    ('Educación ética y valores humanos', 'Valores personales', 'valores-personales'),
    ('Educación ética y valores humanos', 'Convivencia', 'convivencia'),
    ('Educación ética y valores humanos', 'Resolución de conflictos', 'resolucion-de-conflictos'),
    ('Educación ética y valores humanos', 'Responsabilidad', 'responsabilidad'),
    ('Educación ética y valores humanos', 'Proyecto de vida', 'proyecto-de-vida'),
    ('Educación religiosa', 'Creencias y espiritualidad', 'creencias-y-espiritualidad'),
    ('Educación religiosa', 'Valores religiosos', 'valores-religiosos'),
    ('Educación religiosa', 'Cultura religiosa', 'cultura-religiosa'),
    ('Educación religiosa', 'Respeto por la diversidad', 'respeto-por-la-diversidad'),
    ('Educación religiosa', 'Sentido de vida', 'sentido-de-vida'),
    ('Educación artística y cultural', 'Dibujo', 'dibujo'),
    ('Educación artística y cultural', 'Música', 'musica'),
    ('Educación artística y cultural', 'Teatro', 'teatro'),
    ('Educación artística y cultural', 'Danza', 'danza'),
    ('Educación artística y cultural', 'Expresión cultural', 'expresion-cultural'),
    ('Educación física, recreación y deportes', 'Condición física', 'condicion-fisica'),
    ('Educación física, recreación y deportes', 'Deportes', 'deportes'),
    ('Educación física, recreación y deportes', 'Recreación', 'recreacion'),
    ('Educación física, recreación y deportes', 'Hábitos saludables', 'habitos-saludables'),
    ('Educación física, recreación y deportes', 'Trabajo en equipo', 'trabajo-en-equipo'),
    ('Tecnología e informática', 'Herramientas digitales', 'herramientas-digitales'),
    ('Tecnología e informática', 'Programación básica', 'programacion-basica'),
    ('Tecnología e informática', 'Ofimática', 'ofimatica'),
    ('Tecnología e informática', 'Internet seguro', 'internet-seguro'),
    ('Tecnología e informática', 'Innovación tecnológica', 'innovacion-tecnologica'),
    ('Filosofía', 'Pensamiento crítico', 'pensamiento-critico'),
    ('Filosofía', 'Ética filosófica', 'etica-filosofica'),
    ('Filosofía', 'Lógica', 'logica'),
    ('Filosofía', 'Antropología filosófica', 'antropologia-filosofica'),
    ('Filosofía', 'Teoría del conocimiento', 'teoria-del-conocimiento'),
    ('Ciencias económicas', 'Economía básica', 'economia-basica'),
    ('Ciencias económicas', 'Consumo responsable', 'consumo-responsable'),
    ('Ciencias económicas', 'Finanzas personales', 'finanzas-personales'),
    ('Ciencias económicas', 'Mercado', 'mercado'),
    ('Ciencias económicas', 'Producción', 'produccion'),
    ('Ciencias políticas', 'Poder político', 'poder-politico'),
    ('Ciencias políticas', 'Estado y gobierno', 'estado-y-gobierno'),
    ('Ciencias políticas', 'Participación política', 'participacion-politica'),
    ('Ciencias políticas', 'Ciudadanía', 'ciudadania'),
    ('Ciencias políticas', 'Sistemas políticos', 'sistemas-politicos'),
    ('Emprendimiento', 'Ideas de negocio', 'ideas-de-negocio'),
    ('Emprendimiento', 'Plan de negocio', 'plan-de-negocio'),
    ('Emprendimiento', 'Innovación', 'innovacion'),
    ('Emprendimiento', 'Finanzas básicas', 'finanzas-basicas'),
    ('Emprendimiento', 'Proyecto productivo', 'proyecto-productivo'),
    ('Competencias ciudadanas', 'Convivencia', 'convivencia'),
    ('Competencias ciudadanas', 'Participación democrática', 'participacion-democratica'),
    ('Competencias ciudadanas', 'Pluralidad', 'pluralidad'),
    ('Competencias ciudadanas', 'Derechos humanos', 'derechos-humanos'),
    ('Competencias ciudadanas', 'Resolución pacífica de conflictos', 'resolucion-pacifica-de-conflictos'),
    ('Lectura crítica', 'Análisis de textos', 'analisis-de-textos'),
    ('Lectura crítica', 'Argumentación', 'argumentacion'),
    ('Lectura crítica', 'Inferencia', 'inferencia'),
    ('Lectura crítica', 'Interpretación', 'interpretacion'),
    ('Lectura crítica', 'Evaluación de información', 'evaluacion-de-informacion'),
    ('Proyecto de vida', 'Autoconocimiento', 'autoconocimiento'),
    ('Proyecto de vida', 'Metas personales', 'metas-personales'),
    ('Proyecto de vida', 'Orientación vocacional', 'orientacion-vocacional'),
    ('Proyecto de vida', 'Toma de decisiones', 'toma-de-decisiones'),
    ('Proyecto de vida', 'Habilidades socioemocionales', 'habilidades-socioemocionales')
)
insert into public.cartagena_producto_linea (programa_id, nombre, slug)
select programa.id, catalogo.nombre, catalogo.slug
from cartagena_catalogo_lineas catalogo
join public.cartagena_producto_programa programa
  on programa.nombre = catalogo.programa
on conflict (programa_id, nombre) do update
set slug = excluded.slug,
    updated_at = now();

alter table public.cartagena_producto_producto
  add column if not exists linea_id uuid;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'cartagena_producto_producto_linea_id_fkey'
  ) then
    alter table public.cartagena_producto_producto
      add constraint cartagena_producto_producto_linea_id_fkey
      foreign key (linea_id)
      references public.cartagena_producto_linea (id)
      on update cascade
      on delete restrict;
  end if;
end;
$$;

create or replace function public.cartagena_validate_programa_linea(
  p_programa_id uuid,
  p_linea_id uuid
)
returns boolean
language sql
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.cartagena_producto_linea linea
    where linea.id = p_linea_id
      and linea.programa_id = p_programa_id
  );
$$;

create or replace function public.cartagena_sync_producto_linea_tematica()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_linea public.cartagena_producto_linea%rowtype;
begin
  if new.programa_id is null then
    raise exception 'cartagena_producto_producto.programa_id is required';
  end if;

  if new.linea_id is null then
    raise exception 'cartagena_producto_producto.linea_id is required';
  end if;

  select *
  into v_linea
  from public.cartagena_producto_linea
  where id = new.linea_id;

  if not found then
    raise exception 'selected linea does not exist';
  end if;

  if v_linea.programa_id <> new.programa_id then
    raise exception 'selected linea does not belong to the selected programa';
  end if;

  new.linea_tematica := v_linea.nombre;
  return new;
end;
$$;

drop trigger if exists cartagena_validate_producto_programa_linea_trigger on public.cartagena_producto_producto;
create trigger cartagena_validate_producto_programa_linea_trigger
before insert or update of programa_id, linea_id, linea_tematica
on public.cartagena_producto_producto
for each row
execute function public.cartagena_sync_producto_linea_tematica();

do $$
declare
  v_programa_id uuid;
  v_linea_id uuid;
begin
  select id
  into v_programa_id
  from public.cartagena_producto_programa
  where nombre = 'Matemáticas'
  limit 1;

  if v_programa_id is null then
    raise exception 'Programa Matemáticas not found in cartagena_producto_programa';
  end if;

  select linea.id
  into v_linea_id
  from public.cartagena_producto_linea linea
  where linea.programa_id = v_programa_id
    and linea.nombre = 'Álgebra'
  limit 1;

  if v_linea_id is null then
    raise exception 'Línea Álgebra not found for Matemáticas';
  end if;

  perform set_config('cartagena.workflow_transition', 'on', true);

  update public.cartagena_producto_producto
  set programa_id = v_programa_id,
      linea_id = v_linea_id,
      linea_tematica = 'Álgebra';

  alter table public.cartagena_producto_producto
    alter column linea_id set not null;
end;
$$;

delete from public.cartagena_producto_linea
where (programa_id, nombre) not in (
  select programa.id, catalogo.nombre
  from public.cartagena_producto_programa programa
  join (
    values
      ('Matemáticas', 'Aritmética'),
      ('Matemáticas', 'Álgebra'),
      ('Matemáticas', 'Geometría'),
      ('Matemáticas', 'Estadística'),
      ('Matemáticas', 'Probabilidad'),
      ('Lengua castellana', 'Comprensión lectora'),
      ('Lengua castellana', 'Producción textual'),
      ('Lengua castellana', 'Gramática'),
      ('Lengua castellana', 'Literatura'),
      ('Lengua castellana', 'Ortografía'),
      ('Inglés', 'Vocabulario'),
      ('Inglés', 'Gramática inglesa'),
      ('Inglés', 'Comprensión oral'),
      ('Inglés', 'Comprensión lectora'),
      ('Inglés', 'Conversación'),
      ('Ciencias naturales', 'Seres vivos'),
      ('Ciencias naturales', 'Materia y energía'),
      ('Ciencias naturales', 'Ecosistemas'),
      ('Ciencias naturales', 'Método científico'),
      ('Ciencias naturales', 'Ambiente'),
      ('Biología', 'Célula'),
      ('Biología', 'Sistemas del cuerpo humano'),
      ('Biología', 'Genética'),
      ('Biología', 'Evolución'),
      ('Biología', 'Biodiversidad'),
      ('Química', 'Materia'),
      ('Química', 'Átomos y moléculas'),
      ('Química', 'Reacciones químicas'),
      ('Química', 'Tabla periódica'),
      ('Química', 'Mezclas y soluciones'),
      ('Física', 'Movimiento'),
      ('Física', 'Fuerza'),
      ('Física', 'Energía'),
      ('Física', 'Electricidad'),
      ('Física', 'Ondas'),
      ('Ciencias sociales', 'Sociedad y cultura'),
      ('Ciencias sociales', 'Organización política'),
      ('Ciencias sociales', 'Territorio'),
      ('Ciencias sociales', 'Conflictos sociales'),
      ('Ciencias sociales', 'Derechos humanos'),
      ('Historia', 'Historia antigua'),
      ('Historia', 'Historia de Colombia'),
      ('Historia', 'Historia universal'),
      ('Historia', 'Independencia'),
      ('Historia', 'Siglo XX'),
      ('Geografía', 'Territorio'),
      ('Geografía', 'Clima'),
      ('Geografía', 'Relieve'),
      ('Geografía', 'Población'),
      ('Geografía', 'Regiones naturales'),
      ('Constitución política y democracia', 'Constitución colombiana'),
      ('Constitución política y democracia', 'Derechos y deberes'),
      ('Constitución política y democracia', 'Participación ciudadana'),
      ('Constitución política y democracia', 'Estado colombiano'),
      ('Constitución política y democracia', 'Democracia escolar'),
      ('Educación ética y valores humanos', 'Valores personales'),
      ('Educación ética y valores humanos', 'Convivencia'),
      ('Educación ética y valores humanos', 'Resolución de conflictos'),
      ('Educación ética y valores humanos', 'Responsabilidad'),
      ('Educación ética y valores humanos', 'Proyecto de vida'),
      ('Educación religiosa', 'Creencias y espiritualidad'),
      ('Educación religiosa', 'Valores religiosos'),
      ('Educación religiosa', 'Cultura religiosa'),
      ('Educación religiosa', 'Respeto por la diversidad'),
      ('Educación religiosa', 'Sentido de vida'),
      ('Educación artística y cultural', 'Dibujo'),
      ('Educación artística y cultural', 'Música'),
      ('Educación artística y cultural', 'Teatro'),
      ('Educación artística y cultural', 'Danza'),
      ('Educación artística y cultural', 'Expresión cultural'),
      ('Educación física, recreación y deportes', 'Condición física'),
      ('Educación física, recreación y deportes', 'Deportes'),
      ('Educación física, recreación y deportes', 'Recreación'),
      ('Educación física, recreación y deportes', 'Hábitos saludables'),
      ('Educación física, recreación y deportes', 'Trabajo en equipo'),
      ('Tecnología e informática', 'Herramientas digitales'),
      ('Tecnología e informática', 'Programación básica'),
      ('Tecnología e informática', 'Ofimática'),
      ('Tecnología e informática', 'Internet seguro'),
      ('Tecnología e informática', 'Innovación tecnológica'),
      ('Filosofía', 'Pensamiento crítico'),
      ('Filosofía', 'Ética filosófica'),
      ('Filosofía', 'Lógica'),
      ('Filosofía', 'Antropología filosófica'),
      ('Filosofía', 'Teoría del conocimiento'),
      ('Ciencias económicas', 'Economía básica'),
      ('Ciencias económicas', 'Consumo responsable'),
      ('Ciencias económicas', 'Finanzas personales'),
      ('Ciencias económicas', 'Mercado'),
      ('Ciencias económicas', 'Producción'),
      ('Ciencias políticas', 'Poder político'),
      ('Ciencias políticas', 'Estado y gobierno'),
      ('Ciencias políticas', 'Participación política'),
      ('Ciencias políticas', 'Ciudadanía'),
      ('Ciencias políticas', 'Sistemas políticos'),
      ('Emprendimiento', 'Ideas de negocio'),
      ('Emprendimiento', 'Plan de negocio'),
      ('Emprendimiento', 'Innovación'),
      ('Emprendimiento', 'Finanzas básicas'),
      ('Emprendimiento', 'Proyecto productivo'),
      ('Competencias ciudadanas', 'Convivencia'),
      ('Competencias ciudadanas', 'Participación democrática'),
      ('Competencias ciudadanas', 'Pluralidad'),
      ('Competencias ciudadanas', 'Derechos humanos'),
      ('Competencias ciudadanas', 'Resolución pacífica de conflictos'),
      ('Lectura crítica', 'Análisis de textos'),
      ('Lectura crítica', 'Argumentación'),
      ('Lectura crítica', 'Inferencia'),
      ('Lectura crítica', 'Interpretación'),
      ('Lectura crítica', 'Evaluación de información'),
      ('Proyecto de vida', 'Autoconocimiento'),
      ('Proyecto de vida', 'Metas personales'),
      ('Proyecto de vida', 'Orientación vocacional'),
      ('Proyecto de vida', 'Toma de decisiones'),
      ('Proyecto de vida', 'Habilidades socioemocionales')
  ) as catalogo(programa, nombre)
    on programa.nombre = catalogo.programa
);

delete from public.cartagena_producto_programa
where nombre not in (
  'Matemáticas',
  'Lengua castellana',
  'Inglés',
  'Ciencias naturales',
  'Biología',
  'Química',
  'Física',
  'Ciencias sociales',
  'Historia',
  'Geografía',
  'Constitución política y democracia',
  'Educación ética y valores humanos',
  'Educación religiosa',
  'Educación artística y cultural',
  'Educación física, recreación y deportes',
  'Tecnología e informática',
  'Filosofía',
  'Ciencias económicas',
  'Ciencias políticas',
  'Emprendimiento',
  'Competencias ciudadanas',
  'Lectura crítica',
  'Proyecto de vida'
);

do $$
declare
  v_programa_id uuid;
  v_linea_id uuid;
  v_invalid_count integer;
begin
  select id into v_programa_id
  from public.cartagena_producto_programa
  where nombre = 'Matemáticas'
  limit 1;

  select id into v_linea_id
  from public.cartagena_producto_linea
  where programa_id = v_programa_id
    and nombre = 'Álgebra'
  limit 1;

  select count(*)
  into v_invalid_count
  from public.cartagena_producto_producto
  where programa_id is null;

  if v_invalid_count > 0 then
    raise exception 'There are % publications without programa_id', v_invalid_count;
  end if;

  select count(*)
  into v_invalid_count
  from public.cartagena_producto_producto
  where linea_id is null;

  if v_invalid_count > 0 then
    raise exception 'There are % publications without linea_id', v_invalid_count;
  end if;

  select count(*)
  into v_invalid_count
  from public.cartagena_producto_producto
  where programa_id <> v_programa_id;

  if v_invalid_count > 0 then
    raise exception 'There are % publications with a program outside Matemáticas', v_invalid_count;
  end if;

  select count(*)
  into v_invalid_count
  from public.cartagena_producto_producto
  where linea_id <> v_linea_id
     or linea_tematica <> 'Álgebra';

  if v_invalid_count > 0 then
    raise exception 'There are % publications with a thematic line outside Álgebra', v_invalid_count;
  end if;

  select count(*)
  into v_invalid_count
  from public.cartagena_producto_linea
  where programa_id is null;

  if v_invalid_count > 0 then
    raise exception 'There are % lines without programa_id', v_invalid_count;
  end if;

  select count(*)
  into v_invalid_count
  from public.cartagena_producto_programa
  where nombre not in (
    'Matemáticas',
    'Lengua castellana',
    'Inglés',
    'Ciencias naturales',
    'Biología',
    'Química',
    'Física',
    'Ciencias sociales',
    'Historia',
    'Geografía',
    'Constitución política y democracia',
    'Educación ética y valores humanos',
    'Educación religiosa',
    'Educación artística y cultural',
    'Educación física, recreación y deportes',
    'Tecnología e informática',
    'Filosofía',
    'Ciencias económicas',
    'Ciencias políticas',
    'Emprendimiento',
    'Competencias ciudadanas',
    'Lectura crítica',
    'Proyecto de vida'
  );

  if v_invalid_count > 0 then
    raise exception 'There are % programs outside the new catalog', v_invalid_count;
  end if;

  select count(*)
  into v_invalid_count
  from public.cartagena_producto_linea linea
  left join public.cartagena_producto_programa programa
    on programa.id = linea.programa_id
  where programa.id is null;

  if v_invalid_count > 0 then
    raise exception 'There are % orphan thematic lines', v_invalid_count;
  end if;
end;
$$;

commit;
