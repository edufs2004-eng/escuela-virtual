import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase-admin'
import {
  esUuid,
  getReservaCookieName,
  isSameOriginRequest,
  leerJsonLimitado,
} from '@/lib/server/matricula-reservas'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function POST(request: Request, context: RouteContext) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: 'Solicitud no permitida.' }, { status: 403 })
  }

  const { id } = await context.params
  if (!esUuid(id)) {
    return NextResponse.json({ error: 'La reserva indicada no es válida.' }, { status: 400 })
  }

  const { body, tooLarge } = await leerJsonLimitado(request)
  if (tooLarge) {
    return NextResponse.json({ error: 'La solicitud excede el tamaño permitido.' }, { status: 413 })
  }

  if (
    typeof body !== 'object'
    || body === null
    || !['estado', 'cancelar'].includes(String((body as Record<string, unknown>).accion))
  ) {
    return NextResponse.json({ error: 'La operación solicitada no es válida.' }, { status: 400 })
  }

  const cookieStore = await cookies()
  const token = cookieStore.get(getReservaCookieName(id))?.value
  if (!token || !esUuid(token)) {
    return NextResponse.json({ error: 'No se encontró una sesión válida para esta reserva.' }, { status: 401 })
  }

  try {
    const supabase = getSupabaseAdminClient()

    if ((body as Record<string, unknown>).accion === 'cancelar') {
      const { data, error } = await supabase.rpc('cancelar_reserva', {
        p_reserva_id: id,
        p_token_acceso: token,
      })

      if (error) {
        console.error('Falló cancelar_reserva:', error)
        return NextResponse.json({ error: 'No se pudo cancelar la reserva.' }, { status: 502 })
      }

      if (data !== true) {
        return NextResponse.json(
          { error: 'La reserva ya venció o no se puede cancelar.' },
          { status: 409 },
        )
      }

      const response = NextResponse.json({ cancelada: true })
      response.headers.set('Cache-Control', 'no-store')
      response.cookies.set(getReservaCookieName(id), '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: `/api/matricula/reservas/${id}`,
        maxAge: 0,
      })
      return response
    }

    const { data, error } = await supabase
      .from('reservas_matricula')
      .select('id, estado, expires_at')
      .eq('id', id)
      .eq('token_acceso', token)
      .maybeSingle()

    if (error) {
      console.error('Falló la consulta de estado de reserva:', error)
      return NextResponse.json({ error: 'No se pudo verificar el estado de la reserva.' }, { status: 502 })
    }

    if (!data) {
      return NextResponse.json({ error: 'La reserva indicada no existe.' }, { status: 404 })
    }

    const estado = (
      ['activa', 'pago_pendiente'].includes(data.estado)
      && Date.parse(data.expires_at) <= Date.now()
    ) ? 'expirada' : data.estado

    const response = NextResponse.json({
      reserva_id: data.id,
      estado,
      vence_en: data.expires_at,
      segundos_restantes: Math.max(0, Math.ceil((Date.parse(data.expires_at) - Date.now()) / 1000)),
    })
    response.headers.set('Cache-Control', 'no-store')
    return response
  } catch (error) {
    console.error('Error al gestionar la reserva de matrícula:', error)
    return NextResponse.json(
      { error: 'El servicio de reservas no está disponible. Intenta nuevamente más tarde.' },
      { status: 503 },
    )
  }
}
