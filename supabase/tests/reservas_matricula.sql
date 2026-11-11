begin;

do $$
declare
  v_nivel text := 'Prueba ' || pg_catalog.gen_random_uuid()::text;
  v_horario_id uuid;
  v_selecciones jsonb;
  v_clave_primera uuid := pg_catalog.gen_random_uuid();
  v_clave_segunda uuid := pg_catalog.gen_random_uuid();
  v_clave_fallida uuid := pg_catalog.gen_random_uuid();
  v_primera record;
  v_segunda record;
  v_reintento record;
  v_expirada record;
  v_libres bigint;
  v_solicitud_rechazada boolean := false;
  v_seleccion_invalida_rechazada boolean := false;
begin
  insert into public.horarios (etiqueta)
  values ('Prueba de reservas ' || pg_catalog.gen_random_uuid()::text)
  returning id into v_horario_id;

  insert into public.bloques_ramos (
    nivel,
    asignatura,
    horario_id,
    capacidad_maxima,
    inscritos_count
  )
  select v_nivel, r.asignatura, v_horario_id, 1, 0
  from (values
    ('Matemáticas'::text),
    ('Lenguaje'::text),
    ('Inglés'::text),
    ('Ciencias'::text),
    ('Historia'::text)
  ) as r(asignatura)
  cross join generate_series(1, 2);

  select pg_catalog.jsonb_agg(
    pg_catalog.jsonb_build_object(
      'asignatura', required.asignatura,
      'horario_id', v_horario_id
    )
  )
  into v_selecciones
  from (values
    ('Matemáticas'::text),
    ('Lenguaje'::text),
    ('Inglés'::text),
    ('Ciencias'::text),
    ('Historia'::text)
  ) as required(asignatura);

  begin
    perform public.crear_reserva_matricula(
      v_nivel,
      v_selecciones - 0,
      v_clave_fallida
    );
  exception
    when sqlstate '22023' then
      v_seleccion_invalida_rechazada := true;
  end;

  if not v_seleccion_invalida_rechazada then
    raise exception 'Se aceptó una selección con menos de cinco asignaturas.';
  end if;

  select *
  into v_primera
  from public.crear_reserva_matricula(v_nivel, v_selecciones, v_clave_primera);

  if v_primera.estado <> 'activa'
    or v_primera.expires_at <= pg_catalog.clock_timestamp()
    or v_primera.expires_at > pg_catalog.clock_timestamp() + interval '10 minutes'
    or (
      select pg_catalog.count(*)
      from public.reserva_matricula_bloques
      where reserva_id = v_primera.reserva_id
    ) <> 5 then
    raise exception 'La primera reserva no tiene cinco bloques activos y TTL de 10 minutos.';
  end if;

  select *
  into v_reintento
  from public.crear_reserva_matricula(v_nivel, v_selecciones, v_clave_primera);

  if v_reintento.reserva_id <> v_primera.reserva_id
    or v_reintento.token_acceso <> v_primera.token_acceso then
    raise exception 'El reintento idempotente no devolvió la reserva original.';
  end if;

  select *
  into v_segunda
  from public.crear_reserva_matricula(
    v_nivel,
    v_selecciones,
    v_clave_segunda
  );

  if exists (
    select rb.asignatura
    from public.reserva_matricula_bloques rb
    where rb.reserva_id in (v_primera.reserva_id, v_segunda.reserva_id)
    group by rb.asignatura
    having pg_catalog.count(distinct rb.bloque_ramo_id) <> 2
  ) then
    raise exception 'Las reservas no se distribuyeron entre secciones equivalentes.';
  end if;

  select d.cupos_libres
  into v_libres
  from public.disponibilidad_matricula(v_nivel) d
  where d.asignatura = 'Matemáticas'
    and d.horario_id = v_horario_id;

  if v_libres <> 0 then
    raise exception 'La disponibilidad agregada no descontó las dos reservas.';
  end if;

  begin
    perform public.crear_reserva_matricula(
      v_nivel,
      v_selecciones,
      v_clave_fallida
    );
  exception
    when sqlstate 'P0001' then
      v_solicitud_rechazada := true;
  end;

  if not v_solicitud_rechazada then
    raise exception 'Se aceptó una tercera reserva sin cupos.';
  end if;

  if exists (
    select 1
    from public.reservas_matricula
    where clave_idempotencia = v_clave_fallida
  ) then
    raise exception 'La solicitud sin cupos dejó una reserva parcial.';
  end if;

  if not public.cancelar_reserva_matricula(
    v_primera.reserva_id,
    v_primera.token_acceso
  ) then
    raise exception 'No se pudo cancelar la reserva activa.';
  end if;

  select *
  into v_expirada
  from public.crear_reserva_matricula(
    v_nivel,
    v_selecciones,
    v_clave_fallida
  );

  update public.reservas_matricula
  set expires_at = pg_catalog.clock_timestamp() - interval '1 second'
  where id = v_expirada.reserva_id;

  if public.expirar_reservas_matricula() < 1 then
    raise exception 'La función de expiración no actualizó reservas vencidas.';
  end if;

  select *
  into v_expirada
  from public.estado_reserva_matricula(
    v_expirada.reserva_id,
    v_expirada.token_acceso
  );

  if v_expirada.estado <> 'expirada' then
    raise exception 'Una reserva vencida no quedó expirada.';
  end if;

  select d.cupos_libres
  into v_libres
  from public.disponibilidad_matricula(v_nivel) d
  where d.asignatura = 'Matemáticas'
    and d.horario_id = v_horario_id;

  if v_libres <> 1 then
    raise exception 'La cancelación y expiración no liberaron cupos.';
  end if;
end;
$$;

rollback;
