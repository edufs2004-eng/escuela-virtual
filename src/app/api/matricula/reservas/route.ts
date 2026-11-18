import { randomInt } from 'node:crypto'
import { NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase-admin'
import {
  esSeleccionReserva,
  esUuid,
  isSameOriginRequest,
  leerJsonLimitado,
  SeleccionReserva,
  tieneCrucesDeHorario,
} from '@/lib/server/matricula-reservas'

const MAX_INTENTOS_RESERVA = 10

interface BloqueCandidato {
  id: string
  asignatura: string
  horario_id: string
  capacidad_maxima: number | null
  inscritos_count: number | null
  ocupados: number
}

interface ResultadoReserva {
  reserva_id: string
  token_acceso: string
  vence_en: string
}

function responderConReserva(reservation: ResultadoReserva, status = 201) {
  const response = NextResponse.json({
    reserva_id: reservation.reserva_id,
    vence_en: reservation.vence_en,
    segundos_restantes: Math.max(0, Math.ceil((Date.parse(reservation.vence_en) - Date.now()) / 1000)),
  }, { status })
  response.headers.set('Cache-Control', 'no-store')
  response.cookies.set(
    `reserva_matricula_${reservation.reserva_id.replace(/-/g, '_')}`,
    reservation.token_acceso,
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: `/api/matricula/reservas/${reservation.reserva_id}`,
      maxAge: Math.max(0, Math.floor((Date.parse(reservation.vence_en) - Date.now()) / 1000)),
    },
  )
  return response
}

async function recuperarReservaIdempotente(
  supabase: ReturnType<typeof getSupabaseAdminClient>,
  nivel: string,
  selections: SeleccionReserva[],
  idempotencyKey: string,
) {
  const { data: reservation, error } = await supabase
    .from('reservas_matricula')
    .select('id, token_acceso, nivel, estado, expires_at')
    .eq('clave_idempotencia', idempotencyKey)
    .maybeSingle()

  if (error) throw error
  if (!reservation) return null

  const { data: details, error: detailError } = await supabase
    .from('reserva_matricula_bloques')
    .select('bloque_ramo_id, asignatura')
    .eq('reserva_id', reservation.id)

  if (detailError) throw detailError

  const blockIds = (details ?? []).map((detail) => detail.bloque_ramo_id)
  const { data: blocks, error: blocksError } = blockIds.length
    ? await supabase
      .from('bloques_ramos')
      .select('id, asignatura, horario_id')
      .in('id', blockIds)
    : { data: [], error: null }

  if (blocksError) throw blocksError

  const savedSelection = new Set((blocks ?? []).map((block) => `${block.asignatura}\u0000${block.horario_id}`))
  const requestedSelection = new Set(selections.map((selection) => `${selection.asignatura}\u0000${selection.horario_id}`))
  if (
    reservation.nivel !== nivel
    || savedSelection.size !== selections.length
    || [...requestedSelection].some((selection) => !savedSelection.has(selection))
  ) {
    return { mismatch: true as const }
  }

  if (
    !['activa', 'pago_pendiente'].includes(reservation.estado)
    || Date.parse(reservation.expires_at) <= Date.now()
  ) {
    return { expired: true as const }
  }

  return {
    reservation: {
      reserva_id: reservation.id,
      token_acceso: reservation.token_acceso,
      vence_en: reservation.expires_at,
    },
  }
}

async function cargarCandidatos(
  supabase: ReturnType<typeof getSupabaseAdminClient>,
  nivel: string,
  selecciones: SeleccionReserva[],
) {
  const queries = await Promise.all(selecciones.map((selection) => supabase
    .from('bloques_ramos')
    .select('id, asignatura, horario_id, capacidad_maxima, inscritos_count')
    .eq('nivel', nivel)
    .eq('asignatura', selection.asignatura)
    .eq('horario_id', selection.horario_id)))

  const queryError = queries.find((query) => query.error)?.error
  if (queryError) throw queryError

  const blocks = queries.flatMap((query) => query.data ?? []) as Omit<BloqueCandidato, 'ocupados'>[]
  const blockIds = blocks.map((block) => block.id)
  const detailQuery = blockIds.length
    ? await supabase
      .from('reserva_matricula_bloques')
      .select('bloque_ramo_id, reserva_id')
      .in('bloque_ramo_id', blockIds)
    : { data: [], error: null }

  if (detailQuery.error) throw detailQuery.error

  const reserveIds = [...new Set((detailQuery.data ?? []).map((detail) => detail.reserva_id))]
  const reservationsQuery = reserveIds.length
    ? await supabase
      .from('reservas_matricula')
      .select('id, estado, expires_at')
      .in('id', reserveIds)
    : { data: [], error: null }

  if (reservationsQuery.error) throw reservationsQuery.error

  const now = Date.now()
  const activeIds = new Set((reservationsQuery.data ?? [])
    .filter((reservation) => (
      reservation.estado === 'confirmada'
      || (
        ['activa', 'pago_pendiente'].includes(reservation.estado)
        && Date.parse(reservation.expires_at) > now
      )
    ))
    .map((reservation) => reservation.id))

  const reservationsByBlock = new Map<string, number>()
  for (const detail of detailQuery.data ?? []) {
    if (!activeIds.has(detail.reserva_id)) continue
    reservationsByBlock.set(
      detail.bloque_ramo_id,
      (reservationsByBlock.get(detail.bloque_ramo_id) ?? 0) + 1,
    )
  }

  return selecciones.map((selection) => {
    const candidates = blocks
      .filter((block) => (
        block.asignatura === selection.asignatura
        && block.horario_id === selection.horario_id
      ))
      .map((block) => ({
        ...block,
        ocupados: Number(block.inscritos_count ?? 0) + (reservationsByBlock.get(block.id) ?? 0),
      }))
      .filter((block) => block.ocupados < Math.min(Number(block.capacidad_maxima ?? 15), 15))
      .sort((left, right) => left.ocupados - right.ocupados)

    for (let start = 0; start < candidates.length;) {
      let end = start + 1
      while (end < candidates.length && candidates[end].ocupados === candidates[start].ocupados) end += 1
      for (let index = end - 1; index > start; index -= 1) {
        const swapIndex = randomInt(start, index + 1)
        const candidate = candidates[index]
        candidates[index] = candidates[swapIndex]
        candidates[swapIndex] = candidate
      }
      start = end
    }

    return candidates
  })
}

function parseResultadoReserva(value: unknown): ResultadoReserva | null {
  const row = Array.isArray(value) ? value[0] : value
  if (typeof row !== 'object' || row === null) return null

  const result = row as Record<string, unknown>
  if (
    !esUuid(result.reserva_id)
    || !esUuid(result.token_acceso)
    || typeof result.vence_en !== 'string'
    || !Number.isFinite(Date.parse(result.vence_en))
  ) {
    return null
  }

  return {
    reserva_id: result.reserva_id,
    token_acceso: result.token_acceso,
    vence_en: result.vence_en,
  }
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: 'Solicitud no permitida.' }, { status: 403 })
  }

  const { body, tooLarge } = await leerJsonLimitado(request)
  if (tooLarge) {
    return NextResponse.json({ error: 'La solicitud excede el tamaño permitido.' }, { status: 413 })
  }

  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ error: 'La solicitud de reserva no es válida.' }, { status: 400 })
  }

  const payload = body as Record<string, unknown>
  if (
    typeof payload.nivel !== 'string'
    || !payload.nivel.trim()
    || payload.nivel.length > 100
    || !esUuid(payload.clave_idempotencia)
    || !esSeleccionReserva(payload.selecciones)
  ) {
    return NextResponse.json({ error: 'Selecciona los cinco ramos y un nivel válidos.' }, { status: 400 })
  }

  try {
    const supabase = getSupabaseAdminClient()
    const selections = payload.selecciones
    const existing = await recuperarReservaIdempotente(
      supabase,
      payload.nivel,
      selections,
      payload.clave_idempotencia,
    )

    if (existing && 'mismatch' in existing) {
      return NextResponse.json({ error: 'La clave de solicitud ya corresponde a otra selección.' }, { status: 409 })
    }
    if (existing && 'expired' in existing) {
      return NextResponse.json({ error: 'La reserva asociada a esta solicitud ya venció o terminó.' }, { status: 409 })
    }
    if (existing && 'reservation' in existing) {
      return responderConReserva(existing.reservation)
    }

    const horarioIds = [...new Set(selections.map((selection) => selection.horario_id))]
    const horariosQuery = await supabase
      .from('horarios')
      .select('id, etiqueta')
      .in('id', horarioIds)

    if (horariosQuery.error) throw horariosQuery.error
    if ((horariosQuery.data ?? []).length !== horarioIds.length) {
      return NextResponse.json({ error: 'Uno o más horarios ya no están publicados.' }, { status: 409 })
    }

    const etiquetas = new Map((horariosQuery.data ?? []).map((schedule) => [schedule.id, schedule.etiqueta]))
    if (tieneCrucesDeHorario(selections.map((selection) => etiquetas.get(selection.horario_id) ?? ''))) {
      return NextResponse.json({ error: 'La selección contiene horarios que se cruzan.' }, { status: 400 })
    }

    let lastTriedIds: string[] = []
    for (let attempt = 0; attempt < MAX_INTENTOS_RESERVA; attempt += 1) {
      const candidateGroups = await cargarCandidatos(supabase, payload.nivel, selections)
      if (candidateGroups.some((group) => group.length === 0)) {
        return NextResponse.json(
          { error: 'Uno o más horarios se quedaron sin cupos. Actualiza la disponibilidad e inténtalo otra vez.' },
          { status: 409 },
        )
      }

      const blockIds = candidateGroups.map((group) => group[0].id)
      if (blockIds.every((id, index) => id === lastTriedIds[index])) {
        return NextResponse.json(
          { error: 'Los cupos cambiaron al intentar reservar. Actualiza la disponibilidad e inténtalo otra vez.' },
          { status: 409 },
        )
      }
      lastTriedIds = blockIds

      const { data, error } = await supabase.rpc('crear_reserva_atomica', {
        p_nivel: payload.nivel,
        p_bloque_ids: blockIds,
        p_clave_idempotencia: payload.clave_idempotencia,
      })

      if (error?.code === 'P0001') continue
      if (error) {
        console.error('Falló crear_reserva_atomica:', error)
        return NextResponse.json({ error: 'No se pudo crear la reserva. Intenta nuevamente.' }, { status: 502 })
      }

      const reservation = parseResultadoReserva(data)
      if (!reservation) {
        console.error('crear_reserva_atomica devolvió un resultado inválido.')
        return NextResponse.json({ error: 'El servidor no pudo confirmar la reserva.' }, { status: 502 })
      }

      return responderConReserva(reservation)
    }

    return NextResponse.json(
      { error: 'No quedan cupos disponibles para completar esta combinación. Actualiza e inténtalo otra vez.' },
      { status: 409 },
    )
  } catch (error) {
    console.error('Error al procesar la reserva de matrícula:', error)
    return NextResponse.json(
      { error: 'El servicio de reservas no está disponible. Intenta nuevamente más tarde.' },
      { status: 503 },
    )
  }
}
