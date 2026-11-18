export const ASIGNATURAS_OBLIGATORIAS = [
  'Matemáticas',
  'Lenguaje',
  'Inglés',
  'Ciencias',
  'Historia',
] as const

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export interface SeleccionReserva {
  asignatura: string
  horario_id: string
}

export function esUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID_PATTERN.test(value)
}

export function esSeleccionReserva(value: unknown): value is SeleccionReserva[] {
  if (!Array.isArray(value) || value.length !== ASIGNATURAS_OBLIGATORIAS.length) return false

  const subjects = new Set<string>()
  for (const selection of value) {
    if (typeof selection !== 'object' || selection === null) return false
    const row = selection as Record<string, unknown>
    if (
      typeof row.asignatura !== 'string'
      || !ASIGNATURAS_OBLIGATORIAS.includes(row.asignatura as typeof ASIGNATURAS_OBLIGATORIAS[number])
      || !esUuid(row.horario_id)
      || subjects.has(row.asignatura)
    ) {
      return false
    }
    subjects.add(row.asignatura)
  }

  return ASIGNATURAS_OBLIGATORIAS.every((subject) => subjects.has(subject))
}

function getTramoHorario(etiqueta: string) {
  const match = etiqueta.match(/^(.+?)\s+(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})$/)
  if (!match) return null

  const inicioHora = Number(match[2])
  const inicioMinuto = Number(match[3])
  const terminoHora = Number(match[4])
  const terminoMinuto = Number(match[5])
  if ([inicioHora, terminoHora].some((hour) => hour > 23)
    || [inicioMinuto, terminoMinuto].some((minute) => minute > 59)) return null

  const inicio = inicioHora * 60 + inicioMinuto
  const termino = terminoHora * 60 + terminoMinuto
  if (termino <= inicio) return null

  return {
    dia: match[1].trim().replace(/\s+/g, ' ').toLocaleLowerCase('es-CL')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
    inicio,
    termino,
  }
}

export function tieneCrucesDeHorario(etiquetas: string[]) {
  for (let index = 0; index < etiquetas.length; index += 1) {
    for (let otherIndex = index + 1; otherIndex < etiquetas.length; otherIndex += 1) {
      const current = getTramoHorario(etiquetas[index])
      const other = getTramoHorario(etiquetas[otherIndex])

      if (!current || !other) {
        const normalize = (value: string) => value.trim().replace(/\s+/g, ' ').toLocaleLowerCase('es-CL')
        if (normalize(etiquetas[index]) === normalize(etiquetas[otherIndex])) return true
        continue
      }

      if (
        current.dia === other.dia
        && current.inicio < other.termino
        && other.inicio < current.termino
      ) {
        return true
      }
    }
  }

  return false
}

export function getReservaCookieName(reservaId: string) {
  return `reserva_matricula_${reservaId.replace(/-/g, '_')}`
}

export function isSameOriginRequest(request: Request) {
  const origin = request.headers.get('origin')
  if (!origin) return false

  try {
    const requestUrl = new URL(request.url)
    const forwardedHost = request.headers.get('x-forwarded-host')?.split(',')[0].trim()
    const requestHost = forwardedHost ?? request.headers.get('host') ?? requestUrl.host
    const forwardedProtocol = request.headers.get('x-forwarded-proto')?.split(',')[0].trim()
    const requestProtocol = forwardedProtocol
      ? `${forwardedProtocol}:`
      : requestUrl.protocol
    const originUrl = new URL(origin)

    return originUrl.host.toLowerCase() === requestHost.toLowerCase()
      && originUrl.protocol === requestProtocol
  } catch {
    return false
  }
}

export async function leerJsonLimitado(request: Request, maxBytes = 8192) {
  const contentLength = Number(request.headers.get('content-length') ?? 0)
  if (contentLength > maxBytes) {
    return { body: null, tooLarge: true }
  }

  if (!request.body) return { body: null, tooLarge: false }

  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let totalBytes = 0

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    totalBytes += value.byteLength
    if (totalBytes > maxBytes) {
      await reader.cancel()
      return { body: null, tooLarge: true }
    }
    chunks.push(value)
  }

  const rawBody = new Uint8Array(totalBytes)
  let offset = 0
  for (const chunk of chunks) {
    rawBody.set(chunk, offset)
    offset += chunk.byteLength
  }

  try {
    return { body: JSON.parse(new TextDecoder().decode(rawBody)) as unknown, tooLarge: false }
  } catch {
    return { body: null, tooLarge: false }
  }
}
