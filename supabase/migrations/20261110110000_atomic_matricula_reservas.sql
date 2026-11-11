begin;

do $$
begin
  if to_regclass('public.bloques_ramos') is null
    or to_regclass('public.horarios') is null
    or to_regclass('public.matriculas_temporales') is null
    or to_regclass('public.reservas_matricula') is null
    or to_regclass('public.reserva_matricula_bloques') is null then
    raise exception 'Faltan tablas del modelo de matrícula descritas en contexto_supabase.txt.';
  end if;

  if exists (
    select 1
    from public.bloques_ramos
    where capacidad_maxima is not null
      and (capacidad_maxima < 1 or capacidad_maxima > 15)
  ) then
    raise exception 'Hay bloques con capacidad fuera del rango 1..15; corrige esos datos antes de aplicar esta migración.';
  end if;

  if exists (
    select 1
    from public.bloques_ramos
    where inscritos_count is not null
      and (
        inscritos_count < 0
        or inscritos_count > coalesce(capacidad_maxima, 15)
      )
  ) then
    raise exception 'Hay bloques con inscritos fuera de su capacidad; corrige esos datos antes de aplicar esta migración.';
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.bloques_ramos'::regclass
      and conname = 'bloques_ramos_capacidad_maxima_15_check'
  ) then
    alter table public.bloques_ramos
      add constraint bloques_ramos_capacidad_maxima_15_check
      check (capacidad_maxima is null or capacidad_maxima between 1 and 15)
      not valid;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.bloques_ramos'::regclass
      and conname = 'bloques_ramos_inscritos_dentro_capacidad_check'
  ) then
    alter table public.bloques_ramos
      add constraint bloques_ramos_inscritos_dentro_capacidad_check
      check (
        inscritos_count is null
        or (
          inscritos_count >= 0
          and inscritos_count <= coalesce(capacidad_maxima, 15)
        )
      )
      not valid;
  end if;
end;
$$;

alter table public.bloques_ramos
  alter column capacidad_maxima set default 15;
alter table public.bloques_ramos
  validate constraint bloques_ramos_capacidad_maxima_15_check;
alter table public.bloques_ramos
  validate constraint bloques_ramos_inscritos_dentro_capacidad_check;

create index if not exists reserva_matricula_bloques_bloque_idx
  on public.reserva_matricula_bloques (bloque_ramo_id);

create index if not exists reservas_matricula_expiracion_idx
  on public.reservas_matricula (expires_at)
  where estado in ('activa', 'pago_pendiente');

alter table public.matriculas_temporales enable row level security;
alter table public.reservas_matricula enable row level security;
alter table public.reserva_matricula_bloques enable row level security;

revoke all privileges on table public.matriculas_temporales
  from public, anon, authenticated;
revoke all privileges on table public.reservas_matricula
  from public, anon, authenticated;
revoke all privileges on table public.reserva_matricula_bloques
  from public, anon, authenticated;

grant all privileges on table public.matriculas_temporales to service_role;
grant all privileges on table public.reservas_matricula to service_role;
grant all privileges on table public.reserva_matricula_bloques to service_role;

create or replace function public.disponibilidad_matricula(p_nivel text default null)
returns table (
  nivel text,
  asignatura text,
  horario_id uuid,
  etiqueta text,
  capacidad_total bigint,
  inscritos bigint,
  reservas_vigentes bigint,
  cupos_libres bigint
)
language sql
stable
security definer
set search_path = ''
as $$
  with reservas as (
    select
      rb.bloque_ramo_id,
      pg_catalog.count(*)::bigint as cantidad
    from public.reserva_matricula_bloques rb
    join public.reservas_matricula r on r.id = rb.reserva_id
    where r.estado = 'confirmada'
       or (
         r.estado in ('activa', 'pago_pendiente')
         and r.expires_at > pg_catalog.statement_timestamp()
       )
    group by rb.bloque_ramo_id
  ),
  secciones as (
    select
      b.id,
      b.nivel,
      b.asignatura,
      b.horario_id,
      h.etiqueta as horario_etiqueta,
      coalesce(b.capacidad_maxima, 15)::bigint as capacidad,
      coalesce(b.inscritos_count, 0)::bigint as inscritos,
      coalesce(r.cantidad, 0)::bigint as reservas,
      greatest(
        coalesce(b.capacidad_maxima, 15)::bigint
          - coalesce(b.inscritos_count, 0)::bigint
          - coalesce(r.cantidad, 0)::bigint,
        0
      )::bigint as libres
    from public.bloques_ramos b
    join public.horarios h on h.id = b.horario_id
    left join reservas r on r.bloque_ramo_id = b.id
    where (p_nivel is null or b.nivel = p_nivel)
  )
  select
    s.nivel,
    s.asignatura,
    s.horario_id,
    s.horario_etiqueta,
    pg_catalog.sum(s.capacidad)::bigint,
    pg_catalog.sum(s.inscritos)::bigint,
    pg_catalog.sum(s.reservas)::bigint,
    pg_catalog.sum(s.libres)::bigint
  from secciones s
  group by s.nivel, s.asignatura, s.horario_id, s.horario_etiqueta
  order by s.nivel, s.asignatura, s.horario_etiqueta;
$$;

create function public.crear_reserva_matricula(
  p_nivel text,
  p_selecciones jsonb,
  p_clave_idempotencia uuid
)
returns table (
  reserva_id uuid,
  token_acceso uuid,
  estado text,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_existente public.reservas_matricula%rowtype;
  v_seleccion record;
  v_bloque_asignado uuid;
  v_reserva_id uuid;
  v_token_acceso uuid;
  v_estado text;
  v_expires_at timestamptz;
  v_cantidad integer;
  v_asignaturas_distintas integer;
begin
  if p_nivel is null or pg_catalog.btrim(p_nivel) = ''
    or p_clave_idempotencia is null
    or p_selecciones is null
    or pg_catalog.jsonb_typeof(p_selecciones) <> 'array'
    or pg_catalog.jsonb_array_length(p_selecciones) <> 5 then
    raise exception using
      errcode = '22023',
      message = 'Se requieren nivel, cinco horarios y una clave de idempotencia.';
  end if;

  select
    pg_catalog.count(*),
    pg_catalog.count(distinct s.asignatura)
  into v_cantidad, v_asignaturas_distintas
  from pg_catalog.jsonb_to_recordset(p_selecciones)
    as s(asignatura text, horario_id uuid);

  if v_cantidad <> 5 or v_asignaturas_distintas <> 5
    or exists (
      select 1
      from pg_catalog.jsonb_to_recordset(p_selecciones)
        as s(asignatura text, horario_id uuid)
      where s.asignatura is null or s.horario_id is null
    ) then
    raise exception using
      errcode = '22023',
      message = 'Cada selección debe tener una asignatura y un horario distintos.';
  end if;

  if exists (
    select required.asignatura
    from (values
      ('Matemáticas'::text),
      ('Lenguaje'::text),
      ('Inglés'::text),
      ('Ciencias'::text),
      ('Historia'::text)
    ) as required(asignatura)
    except
    select s.asignatura
    from pg_catalog.jsonb_to_recordset(p_selecciones)
      as s(asignatura text, horario_id uuid)
  ) or exists (
    select s.asignatura
    from pg_catalog.jsonb_to_recordset(p_selecciones)
      as s(asignatura text, horario_id uuid)
    except
    select required.asignatura
    from (values
      ('Matemáticas'::text),
      ('Lenguaje'::text),
      ('Inglés'::text),
      ('Ciencias'::text),
      ('Historia'::text)
    ) as required(asignatura)
  ) then
    raise exception using
      errcode = '22023',
      message = 'La reserva debe incluir Matemáticas, Lenguaje, Inglés, Ciencias e Historia.';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_clave_idempotencia::text, 0)
  );

  select r.*
  into v_existente
  from public.reservas_matricula r
  where r.clave_idempotencia = p_clave_idempotencia
  for update;

  if found then
    if v_existente.nivel <> p_nivel
      or (
        select pg_catalog.count(*)
        from public.reserva_matricula_bloques rb
        where rb.reserva_id = v_existente.id
      ) <> 5
      or exists (
        select 1
        from pg_catalog.jsonb_to_recordset(p_selecciones)
          as s(asignatura text, horario_id uuid)
        where not exists (
          select 1
          from public.reserva_matricula_bloques rb
          join public.bloques_ramos b on b.id = rb.bloque_ramo_id
          where rb.reserva_id = v_existente.id
            and rb.asignatura = s.asignatura
            and b.horario_id = s.horario_id
        )
      ) then
      raise exception using
        errcode = '22023',
        message = 'La clave de idempotencia ya se usó para otra selección.';
    end if;

    if v_existente.estado in ('activa', 'pago_pendiente')
      and v_existente.expires_at <= pg_catalog.clock_timestamp() then
      update public.reservas_matricula r
      set estado = 'expirada'
      where r.id = v_existente.id
      returning r.* into v_existente;
    end if;

    return query
      select v_existente.id, v_existente.token_acceso,
        v_existente.estado, v_existente.expires_at;
    return;
  end if;

  if exists (
    select 1
    from pg_catalog.jsonb_to_recordset(p_selecciones)
      as s(asignatura text, horario_id uuid)
    where not exists (
      select 1
      from public.bloques_ramos b
      where b.nivel = p_nivel
        and b.asignatura = s.asignatura
        and b.horario_id = s.horario_id
    )
  ) then
    raise exception using
      errcode = '22023',
      message = 'Uno o más horarios no tienen una sección publicada para el nivel y ramo elegidos.';
  end if;

  perform b.id
  from public.bloques_ramos b
  join pg_catalog.jsonb_to_recordset(p_selecciones)
    as s(asignatura text, horario_id uuid)
    on s.asignatura = b.asignatura
    and s.horario_id = b.horario_id
  where b.nivel = p_nivel
  order by b.id
  for update of b;

  insert into public.reservas_matricula (
    clave_idempotencia,
    nivel,
    estado,
    expires_at
  )
  values (
    p_clave_idempotencia,
    p_nivel,
    'activa',
    pg_catalog.clock_timestamp() + interval '10 minutes'
  )
  returning reservas_matricula.id, reservas_matricula.token_acceso,
    reservas_matricula.estado, reservas_matricula.expires_at
  into v_reserva_id, v_token_acceso, v_estado, v_expires_at;

  for v_seleccion in
    select s.asignatura, s.horario_id
    from pg_catalog.jsonb_to_recordset(p_selecciones)
      as s(asignatura text, horario_id uuid)
    order by s.asignatura
  loop
    v_bloque_asignado := null;

    select b.id
    into v_bloque_asignado
    from public.bloques_ramos b
    where b.nivel = p_nivel
      and b.asignatura = v_seleccion.asignatura
      and b.horario_id = v_seleccion.horario_id
      and coalesce(b.inscritos_count, 0)::bigint + (
        select pg_catalog.count(*)
        from public.reserva_matricula_bloques rb
        join public.reservas_matricula r on r.id = rb.reserva_id
        where rb.bloque_ramo_id = b.id
          and (
            r.estado = 'confirmada'
            or (
              r.estado in ('activa', 'pago_pendiente')
              and r.expires_at > pg_catalog.clock_timestamp()
            )
          )
      ) < coalesce(b.capacidad_maxima, 15)
    order by
      coalesce(b.inscritos_count, 0)::bigint + (
        select pg_catalog.count(*)
        from public.reserva_matricula_bloques rb
        join public.reservas_matricula r on r.id = rb.reserva_id
        where rb.bloque_ramo_id = b.id
          and (
            r.estado = 'confirmada'
            or (
              r.estado in ('activa', 'pago_pendiente')
              and r.expires_at > pg_catalog.clock_timestamp()
            )
          )
      ),
      b.id
    limit 1;

    if v_bloque_asignado is null then
      raise exception using
        errcode = 'P0001',
        message = 'No hay cupos disponibles para uno o más horarios seleccionados.';
    end if;

    insert into public.reserva_matricula_bloques (
      reserva_id,
      bloque_ramo_id,
      asignatura
    )
    values (v_reserva_id, v_bloque_asignado, v_seleccion.asignatura);
  end loop;

  reserva_id := v_reserva_id;
  token_acceso := v_token_acceso;
  estado := v_estado;
  expires_at := v_expires_at;

  return next;
end;
$$;

create function public.estado_reserva_matricula(
  p_reserva_id uuid,
  p_token_acceso uuid
)
returns table (
  reserva_id uuid,
  estado text,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_reserva public.reservas_matricula%rowtype;
begin
  select r.*
  into v_reserva
  from public.reservas_matricula r
  where r.id = p_reserva_id
    and r.token_acceso = p_token_acceso
  for update;

  if not found then
    return;
  end if;

  if v_reserva.estado in ('activa', 'pago_pendiente')
    and v_reserva.expires_at <= pg_catalog.clock_timestamp() then
    update public.reservas_matricula r
    set estado = 'expirada'
    where r.id = v_reserva.id
    returning r.* into v_reserva;
  end if;

  return query select v_reserva.id, v_reserva.estado, v_reserva.expires_at;
end;
$$;

create function public.cancelar_reserva_matricula(
  p_reserva_id uuid,
  p_token_acceso uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_estado text;
  v_expires_at timestamptz;
begin
  select r.estado, r.expires_at
  into v_estado, v_expires_at
  from public.reservas_matricula r
  where r.id = p_reserva_id
    and r.token_acceso = p_token_acceso
  for update;

  if not found then
    return false;
  end if;

  if v_estado in ('activa', 'pago_pendiente')
    and v_expires_at <= pg_catalog.clock_timestamp() then
    update public.reservas_matricula r
    set estado = 'expirada'
    where r.id = p_reserva_id;
    return false;
  end if;

  if v_estado = 'cancelada' then
    return true;
  end if;

  if v_estado not in ('activa', 'pago_pendiente') then
    return false;
  end if;

  update public.reservas_matricula r
  set estado = 'cancelada'
  where r.id = p_reserva_id;

  return true;
end;
$$;

create function public.expirar_reservas_matricula()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_cantidad integer;
begin
  update public.reservas_matricula r
  set estado = 'expirada'
  where r.estado in ('activa', 'pago_pendiente')
    and r.expires_at <= pg_catalog.clock_timestamp();

  get diagnostics v_cantidad = row_count;
  return v_cantidad;
end;
$$;

revoke all privileges on function public.disponibilidad_matricula(text)
  from public, anon, authenticated;
revoke all privileges on function public.crear_reserva_matricula(text, jsonb, uuid)
  from public, anon, authenticated;
revoke all privileges on function public.estado_reserva_matricula(uuid, uuid)
  from public, anon, authenticated;
revoke all privileges on function public.cancelar_reserva_matricula(uuid, uuid)
  from public, anon, authenticated;
revoke all privileges on function public.expirar_reservas_matricula()
  from public, anon, authenticated;

grant execute on function public.disponibilidad_matricula(text)
  to anon, authenticated;
grant execute on function public.crear_reserva_matricula(text, jsonb, uuid)
  to service_role;
grant execute on function public.estado_reserva_matricula(uuid, uuid)
  to service_role;
grant execute on function public.cancelar_reserva_matricula(uuid, uuid)
  to service_role;
grant execute on function public.expirar_reservas_matricula()
  to service_role;

do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron')
    and to_regclass('cron.job') is not null then
    execute $schedule$
      select cron.schedule(
        'expirar-reservas-matricula',
        '* * * * *',
        'select public.expirar_reservas_matricula()'
      )
    $schedule$;
  else
    raise warning 'pg_cron no está habilitado: los cupos vencidos se liberan por expires_at, pero el estado requerirá expirar_reservas_matricula() o un cron externo.';
  end if;
end;
$$;

commit;
