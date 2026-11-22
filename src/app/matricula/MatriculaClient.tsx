'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  BookOpenCheck,
  CheckCircle2,
  Clock3,
  FileText,
  RefreshCw,
  ShieldAlert,
  X,
} from 'lucide-react'
import { getSupabaseClient } from '@/lib/supabase'

interface DisponibilidadHorario {
  nivel: string
  asignatura: string
  horario_id: string
  etiqueta: string
  cupos_libres: number
}

interface DisponibilidadRpcRow extends Omit<DisponibilidadHorario, 'cupos_libres'> {
  cupos_libres: number | string
}

interface OpcionHorario {
  key: string
  asignatura: string
  horarioId: string
  horario: string
  cuposDisponibles: number
}

const subjects = ['Matemáticas', 'Lenguaje', 'Inglés', 'Ciencias', 'Historia']
const FLOW_STORAGE_KEY = 'escencia-matricula-flow'
const PENDING_STORAGE_KEY = 'escencia-matricula-pending'

interface ReservaActiva {
  id: string
  expiresAt: string
  idempotencyKey: string
  deadline: number
}

interface SolicitudPendiente {
  nivel: string
  selecciones: Record<string, string>
  claveIdempotencia: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isUuid(value: unknown): value is string {
  return typeof value === 'string'
    && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
}

function normalizarHorario(horario: string) {
  return horario
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('es-CL')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function getTramoHorario(horario: string) {
  const match = horario.match(/^(.+?)\s+(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})$/)
  if (!match) return null

  const horaInicio = Number(match[2])
  const minutoInicio = Number(match[3])
  const horaTermino = Number(match[4])
  const minutoTermino = Number(match[5])
  if ([horaInicio, horaTermino].some((hora) => hora > 23)
    || [minutoInicio, minutoTermino].some((minuto) => minuto > 59)) return null

  const inicio = horaInicio * 60 + minutoInicio
  const termino = horaTermino * 60 + minutoTermino
  if (termino <= inicio) return null

  return {
    dia: normalizarHorario(match[1]),
    inicio,
    termino,
  }
}

function horariosSeCruzan(horarioA: string, horarioB: string) {
  const tramoA = getTramoHorario(horarioA)
  const tramoB = getTramoHorario(horarioB)

  if (!tramoA || !tramoB) {
    return normalizarHorario(horarioA) === normalizarHorario(horarioB)
  }

  return tramoA.dia === tramoB.dia
    && tramoA.inicio < tramoB.termino
    && tramoB.inicio < tramoA.termino
}

function isDisponibilidadHorario(value: unknown): value is DisponibilidadRpcRow {
  if (typeof value !== 'object' || value === null) return false

  const row = value as Record<string, unknown>
  return typeof row.nivel === 'string'
    && typeof row.asignatura === 'string'
    && typeof row.horario_id === 'string'
    && typeof row.etiqueta === 'string'
    && (
      typeof row.cupos_libres === 'number'
        ? Number.isFinite(row.cupos_libres)
        : typeof row.cupos_libres === 'string'
          && row.cupos_libres.trim() !== ''
          && Number.isFinite(Number(row.cupos_libres))
    )
}

function parseDisponibilidad(data: unknown): DisponibilidadHorario[] {
  if (!Array.isArray(data)) {
    throw new Error('La función de disponibilidad devolvió un formato inválido.')
  }

  return data.map((row: unknown) => {
    if (!isDisponibilidadHorario(row)) {
      throw new Error('La función de disponibilidad devolvió una fila inválida.')
    }

    return {
      ...row,
      cupos_libres: Number(row.cupos_libres),
    }
  })
}

export default function MatriculaPage() {
  const [bloques, setBloques] = useState<DisponibilidadHorario[]>([])
  const [nivel, setNivel] = useState('')
  const [selecciones, setSelecciones] = useState<Record<string, string>>({})
  const [etapa, setEtapa] = useState<'seleccion' | 'documentos' | 'pago'>('seleccion')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [documentosContinuados, setDocumentosContinuados] = useState(false)
  const [reserva, setReserva] = useState<ReservaActiva | null>(null)
  const [segundosRestantes, setSegundosRestantes] = useState(0)
  const [reservaVencida, setReservaVencida] = useState(false)
  const [recuperandoReserva, setRecuperandoReserva] = useState(false)
  const [creatingReservation, setCreatingReservation] = useState(false)
  const [restauracionCompleta, setRestauracionCompleta] = useState(false)
  const pendingRequest = useRef<SolicitudPendiente | null>(null)
  const reservationToRecover = useRef<string | null>(null)

  const cargarBloques = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const supabase = getSupabaseClient()
      const { data, error: queryError } = await supabase.rpc(
        'disponibilidad_matricula',
        { p_nivel: null },
      )

      if (queryError) {
        console.error('No se pudo cargar la oferta de horarios:', queryError)
        setError('No pudimos cargar los horarios disponibles. Intenta nuevamente.')
        return
      }

      const publishedBlocks = parseDisponibilidad(data ?? [])
      setBloques(publishedBlocks)
      setNivel((current) => current && publishedBlocks.some((block) => block.nivel === current)
        ? current
        : publishedBlocks[0]?.nivel ?? '')
    } catch (loadError) {
      console.error('Error inesperado al cargar la oferta de horarios:', loadError)
      setError('No pudimos conectar con la oferta de horarios. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void cargarBloques()
  }, [cargarBloques])

  useEffect(() => {
    if (loading || restauracionCompleta) return

    const restoreSelection = (savedLevel: string, savedSelections: unknown) => {
      if (!isRecord(savedSelections) || !bloques.some((block) => block.nivel === savedLevel)) return false

      const restored: Record<string, string> = {}
      for (const subject of subjects) {
        const key = savedSelections[subject]
        if (
          typeof key !== 'string'
          || !bloques.some((block) => block.nivel === savedLevel
            && `${block.asignatura}\u0000${block.horario_id}` === key)
        ) {
          return false
        }
        restored[subject] = key
      }

      setNivel(savedLevel)
      setSelecciones(restored)
      return true
    }

    const restore = async () => {
      try {
        const storedFlow = localStorage.getItem(FLOW_STORAGE_KEY)
        if (storedFlow) {
          const parsed: unknown = JSON.parse(storedFlow)
          if (
            isRecord(parsed)
            && typeof parsed.nivel === 'string'
            && isUuid(parsed.reserva_id)
            && isUuid(parsed.clave_idempotencia)
            && restoreSelection(parsed.nivel, parsed.selecciones)
          ) {
            reservationToRecover.current = parsed.reserva_id
            const response = await fetch(`/api/matricula/reservas/${parsed.reserva_id}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ accion: 'estado' }),
              cache: 'no-store',
            })
            const result: unknown = await response.json()

            if (response.ok && isRecord(result)) {
              const remaining = Number(result.segundos_restantes)
              if (
                ['activa', 'pago_pendiente'].includes(String(result.estado))
                && Number.isInteger(remaining)
                && remaining > 0
                && typeof result.vence_en === 'string'
              ) {
                const idempotencyKey = parsed.clave_idempotencia
                setReserva({
                  id: parsed.reserva_id,
                  expiresAt: result.vence_en,
                  idempotencyKey,
                  deadline: performance.now() + remaining * 1000,
                })
                setReservaVencida(false)
                setEtapa(parsed.etapa === 'pago' ? 'pago' : 'documentos')
                setDocumentosContinuados(parsed.documentosContinuados === true)
                reservationToRecover.current = null
              } else {
                localStorage.removeItem(FLOW_STORAGE_KEY)
                reservationToRecover.current = null
                setReservaVencida(true)
                setEtapa('seleccion')
                setNotice('La reserva venció o terminó. Puedes actualizar los cupos y comenzar nuevamente.')
              }
            } else {
              pendingRequest.current = {
                nivel: parsed.nivel,
                selecciones: parsed.selecciones as Record<string, string>,
                claveIdempotencia: parsed.clave_idempotencia,
              }
              setRecuperandoReserva(true)
              setEtapa('seleccion')
              setNotice('No pudimos verificar la reserva. Al reintentar, se recuperará con la misma solicitud sin renovar su vencimiento.')
            }

            setRestauracionCompleta(true)
            return
          }
          localStorage.removeItem(FLOW_STORAGE_KEY)
        }

        const storedPending = localStorage.getItem(PENDING_STORAGE_KEY)
        if (storedPending) {
          const parsed: unknown = JSON.parse(storedPending)
          if (
            isRecord(parsed)
            && typeof parsed.nivel === 'string'
            && isUuid(parsed.claveIdempotencia)
            && restoreSelection(parsed.nivel, parsed.selecciones)
          ) {
            pendingRequest.current = {
              nivel: parsed.nivel,
              selecciones: parsed.selecciones as Record<string, string>,
              claveIdempotencia: parsed.claveIdempotencia,
            }
            setNotice('Se recuperó una solicitud pendiente. Continúa para completar la verificación sin reiniciar su TTL.')
          } else {
            localStorage.removeItem(PENDING_STORAGE_KEY)
          }
        }
      } catch (restoreError) {
        console.error('No se pudo recuperar el estado local de matrícula:', restoreError)
        setNotice('No se pudo recuperar el estado guardado de matrícula en este navegador.')
      } finally {
        setRestauracionCompleta(true)
      }
    }

    void restore()
  }, [bloques, loading, restauracionCompleta])

  useEffect(() => {
    if (!reserva) return

    const updateRemaining = () => {
      const remaining = Math.max(0, Math.ceil((reserva.deadline - performance.now()) / 1000))
      setSegundosRestantes(remaining)
      if (remaining > 0) return

      setReserva(null)
      setReservaVencida(true)
      setEtapa('seleccion')
      setDocumentosContinuados(false)
      setNotice('La reserva venció. Sus cupos ya no están apartados; actualiza la disponibilidad antes de continuar.')
      void cargarBloques()
      try {
        localStorage.removeItem(FLOW_STORAGE_KEY)
        localStorage.removeItem(PENDING_STORAGE_KEY)
      } catch (storageError) {
        console.error('No se pudo limpiar el estado local de matrícula:', storageError)
      }
    }

    updateRemaining()
    const interval = window.setInterval(updateRemaining, 1000)
    return () => window.clearInterval(interval)
  }, [cargarBloques, reserva])

  useEffect(() => {
    if (!reserva) return

    try {
      localStorage.setItem(FLOW_STORAGE_KEY, JSON.stringify({
        nivel,
        selecciones,
        reserva_id: reserva.id,
        vence_en: reserva.expiresAt,
        clave_idempotencia: reserva.idempotencyKey,
        etapa,
        documentosContinuados,
      }))
    } catch (storageError) {
      console.error('No se pudo guardar la recuperación de la reserva:', storageError)
      setNotice('La reserva se creó, pero este navegador no permite guardar su recuperación local. No cierres esta página.')
    }
  }, [documentosContinuados, etapa, nivel, reserva, selecciones])

  const niveles = useMemo(
    () => [...new Set(bloques.map((bloque) => bloque.nivel))],
    [bloques],
  )

  const opcionesPorAsignatura = useMemo(() => {
    const groups = new Map<string, OpcionHorario>()

    for (const block of bloques) {
      if (block.nivel !== nivel || !subjects.includes(block.asignatura)) continue

      const key = `${block.asignatura}\u0000${block.horario_id}`
      const existing = groups.get(key)
      if (existing) {
        existing.cuposDisponibles += block.cupos_libres
      } else {
        groups.set(key, {
          key,
          asignatura: block.asignatura,
          horarioId: block.horario_id,
          horario: block.etiqueta,
          cuposDisponibles: block.cupos_libres,
        })
      }
    }

    return [...groups.values()].reduce<Record<string, OpcionHorario[]>>((result, option) => {
      result[option.asignatura] ??= []
      result[option.asignatura].push(option)
      return result
    }, {})
  }, [bloques, nivel])

  const seleccionCompleta = subjects.every((subject) => Boolean(selecciones[subject]))

  const seleccionarNivel = (newLevel: string) => {
    if (reserva) return
    setNivel(newLevel)
    setSelecciones({})
    setNotice(null)
    setReservaVencida(false)
    setActionError(null)
  }

  const confirmarSeleccion = async () => {
    if (!seleccionCompleta) return
    if (reserva) {
      setEtapa('documentos')
      return
    }

    setCreatingReservation(true)
    setActionError(null)
    setNotice(null)
    const pending = pendingRequest.current
    const idempotencyKey = pending
      && pending.nivel === nivel
      && subjects.every((subject) => pending.selecciones[subject] === selecciones[subject])
      ? pending.claveIdempotencia
      : crypto.randomUUID()
    const request: SolicitudPendiente = {
      nivel,
      selecciones: { ...selecciones },
      claveIdempotencia: idempotencyKey,
    }
    pendingRequest.current = request

    try {
      localStorage.setItem(PENDING_STORAGE_KEY, JSON.stringify(request))
      const selections = subjects.map((asignatura) => ({
        asignatura,
        horario_id: selecciones[asignatura].split('\u0000')[1],
      }))
      const response = await fetch('/api/matricula/reservas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nivel,
          clave_idempotencia: idempotencyKey,
          selecciones: selections,
        }),
        cache: 'no-store',
      })
      const result: unknown = await response.json()

      if (!response.ok || !isRecord(result)) {
        if (response.status < 500) {
          localStorage.removeItem(PENDING_STORAGE_KEY)
          pendingRequest.current = null
          if (reservationToRecover.current && response.status === 409) {
            localStorage.removeItem(FLOW_STORAGE_KEY)
            reservationToRecover.current = null
            setRecuperandoReserva(false)
            setReservaVencida(true)
            setNotice('La reserva anterior venció o terminó. Puedes modificar la selección y comenzar otra.')
          }
        }
        setActionError(isRecord(result) && typeof result.error === 'string'
          ? result.error
          : 'No se pudo crear la reserva. Intenta nuevamente.')
        return
      }

      const remaining = Number(result.segundos_restantes)
      if (
        typeof result.reserva_id !== 'string'
        || typeof result.vence_en !== 'string'
        || !Number.isInteger(remaining)
        || remaining <= 0
      ) {
        setActionError('El servidor no devolvió una reserva vigente. Actualiza la página e inténtalo nuevamente.')
        return
      }

      const activeReservation: ReservaActiva = {
        id: result.reserva_id,
        expiresAt: result.vence_en,
        idempotencyKey,
        deadline: performance.now() + remaining * 1000,
      }
      setReserva(activeReservation)
      setReservaVencida(false)
      setRecuperandoReserva(false)
      setDocumentosContinuados(false)
      setEtapa('documentos')
      reservationToRecover.current = null
      pendingRequest.current = null
      localStorage.removeItem(PENDING_STORAGE_KEY)
    } catch (reservationError) {
      console.error('No se pudo completar la solicitud de reserva:', reservationError)
      setActionError('No pudimos confirmar el resultado. Puedes reintentar; se usará la misma clave para evitar duplicados.')
    } finally {
      setCreatingReservation(false)
    }
  }

  const continuarAPago = () => {
    if (!reserva || segundosRestantes <= 0) return
    setDocumentosContinuados(true)
    setEtapa('pago')
  }

  const cancelarProceso = async () => {
    const reservationId = reserva?.id ?? reservationToRecover.current
    if (!window.confirm(reservationId
      ? '¿Quieres cancelar la reserva y liberar los cupos apartados?'
      : '¿Quieres borrar la selección actual? Todavía no hay una reserva creada.')) return

    if (reservationId) {
      try {
        const response = await fetch(`/api/matricula/reservas/${reservationId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accion: 'cancelar' }),
          cache: 'no-store',
        })
        const result: unknown = await response.json()
        if (!response.ok) {
          setActionError(isRecord(result) && typeof result.error === 'string'
            ? result.error
            : 'No se pudo cancelar la reserva. La selección se mantiene.')
          return
        }
      } catch (cancelError) {
        console.error('No se pudo cancelar la reserva:', cancelError)
        setActionError('No pudimos confirmar la cancelación. La reserva se mantiene y debes intentarlo nuevamente.')
        return
      }
    }

    try {
      localStorage.removeItem(FLOW_STORAGE_KEY)
      localStorage.removeItem(PENDING_STORAGE_KEY)
    } catch (storageError) {
      console.error('No se pudo limpiar el estado local de matrícula:', storageError)
    }
    pendingRequest.current = null
    reservationToRecover.current = null
    setRecuperandoReserva(false)
    setReserva(null)
    setReservaVencida(false)
    setSelecciones({})
    setDocumentosContinuados(false)
    setEtapa('seleccion')
    setError(null)
    setActionError(null)
    setNotice(reservationId
      ? 'La reserva fue cancelada y los cupos quedaron liberados.'
      : 'Se borró la selección de esta página. No había una reserva que cancelar.')
    if (reservationId) void cargarBloques()
  }

  return (
    <main className="min-h-screen bg-[#EAF2F8] px-4 py-10 text-[#1A2C42] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#4B8ECB] transition-colors hover:text-[#1A2C42]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Volver al inicio
        </Link>

        <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm sm:p-10">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#F5D372]/30 px-4 py-2 text-xs font-bold uppercase tracking-wide text-[#1A2C42]">
              <BookOpenCheck className="h-4 w-4" aria-hidden="true" />
              Matrícula 2027
            </span>
            <h1 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl">
              {etapa === 'seleccion'
                ? 'Selecciona los horarios de tu estudiante'
                : etapa === 'documentos'
                  ? 'Antecedentes y documentos'
                  : 'Confirmación y pago'}
            </h1>
            <p className="mt-4 text-sm leading-6 text-[var(--brand-subtext)] sm:text-base">
              {etapa === 'seleccion'
                ? 'Elige un horario para cada asignatura obligatoria. Las secciones equivalentes del mismo ramo y horario se muestran agrupadas.'
                : etapa === 'documentos'
                  ? 'Puedes continuar sin adjuntar archivos. La carga se habilitará cuando se definan los requisitos documentales.'
                  : 'La confirmación de matrícula y el pago estarán disponibles cuando la verificación segura esté conectada.'}
            </p>
            <div
              role="status"
              className="mt-6 rounded-2xl border border-[#5B9CD8]/30 bg-[#5B9CD8]/10 p-4 text-sm font-medium text-[#1A2C42]"
            >
              Los cupos consideran matrículas confirmadas y reservas temporales vigentes.
              {reserva
                ? ` Reserva creada y persistida. Tiempo restante: ${formatTime(segundosRestantes)}.`
                : reservaVencida
                  ? ' La reserva anterior venció; sus cupos ya no están apartados.'
                  : ' La selección no aparta cupos hasta crear una reserva.'}
            </div>
          </div>

          {loading || !restauracionCompleta ? (
            <div className="flex items-center justify-center gap-3 py-16 text-sm text-[var(--brand-subtext)]" role="status">
              <RefreshCw className="h-5 w-5 animate-spin" aria-hidden="true" />
              Cargando horarios...
            </div>
          ) : error ? (
            <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-[#E96A6A]/30 bg-[#E96A6A]/10 p-5 text-center" role="alert">
              <p className="font-semibold text-[#9F3030]">{error}</p>
              <button
                type="button"
                onClick={() => void cargarBloques()}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#5B9CD8] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#4B8ECB]"
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Reintentar
              </button>
            </div>
          ) : bloques.length === 0 ? (
            <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-slate-200 bg-[#F8FBFD] p-6 text-center">
              <ShieldAlert className="mx-auto h-8 w-8 text-[#F5D372]" aria-hidden="true" />
              <p className="mt-3 font-semibold">Aún no hay horarios publicados.</p>
              <p className="mt-1 text-sm text-[var(--brand-subtext)]">Vuelve a revisar más adelante.</p>
            </div>
          ) : etapa === 'pago' ? (
            <section className="mx-auto mt-10 max-w-3xl" aria-labelledby="pago-title">
              <div className="rounded-2xl border border-slate-200 bg-[#F8FBFD] p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#5B9CD8]/10 text-[#4B8ECB]">
                    <Clock3 className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <div>
                    <h2 id="pago-title" className="text-lg font-bold">Pago aún no disponible</h2>
                    <p className="mt-2 text-sm leading-6 text-[var(--brand-subtext)]">
                      No se inició una transacción con Transbank. Esta página no confirma pagos ni matrículas.
                      Cuando se habilite, el estado se verificará con el proveedor desde el servidor.
                    </p>
                  </div>
                </div>

                <div role="status" className="mt-6 rounded-xl border border-[#F5D372]/70 bg-[#F5D372]/20 p-4 text-sm">
                  {reserva
                    ? `Tu reserva ${reserva.id} sigue activa hasta ${new Date(reserva.expiresAt).toLocaleTimeString('es-CL')}. Quedan ${formatTime(segundosRestantes)}. No se inició una transacción con Transbank.`
                    : 'No hay una reserva vigente. No se inició una transacción con Transbank.'}
                </div>

                <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                  <button
                    type="button"
                    onClick={() => setEtapa('documentos')}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-[#1A2C42] transition-colors hover:bg-slate-50"
                  >
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    Volver a documentos
                  </button>
                  <button
                    type="button"
                    onClick={cancelarProceso}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E96A6A]/40 px-5 py-3 text-sm font-bold text-[#9F3030] transition-colors hover:bg-[#E96A6A]/10"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                    Cancelar selección
                  </button>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-slate-200 p-5">
                <h3 className="font-bold">Resumen de horarios elegidos</h3>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {subjects.map((subject) => {
                    const selectedKey = selecciones[subject]
                    const selectedOption = (opcionesPorAsignatura[subject] ?? [])
                      .find((option) => option.key === selectedKey)
                    return (
                      <li key={subject} className="rounded-lg bg-[#F8FBFD] p-3 text-sm">
                        <span className="font-semibold">{subject}:</span>{' '}
                        {selectedOption?.horario ?? 'Sin selección'}
                      </li>
                    )
                  })}
                </ul>
              </div>
            </section>
          ) : etapa === 'documentos' ? (
            <section className="mx-auto mt-10 max-w-3xl" aria-labelledby="documentos-title">
              <div className="rounded-2xl border border-slate-200 bg-[#F8FBFD] p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#5B9CD8]/10 text-[#4B8ECB]">
                    <FileText className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <div>
                    <h2 id="documentos-title" className="text-lg font-bold">Etapa documental</h2>
                    <p className="mt-2 text-sm leading-6 text-[var(--brand-subtext)]">
                      Por ahora no se solicitan documentos. No adjuntes ni envíes archivos en esta etapa.
                      La reserva y su vencimiento se conservan mientras continúas sin adjuntos.
                    </p>
                  </div>
                </div>

                <div className="mt-6 rounded-xl border border-[#F5D372]/70 bg-[#F5D372]/20 p-4 text-sm">
                  {reserva
                    ? `Reserva activa: ${reserva.id}. Tiempo restante: ${formatTime(segundosRestantes)}. El vencimiento persistido no se reinicia al volver o recargar.`
                    : 'No hay una reserva vigente; los cupos no están apartados.'}
                </div>

                {documentosContinuados && (
                  <p role="status" className="mt-4 rounded-xl border border-[#5B9CD8]/30 bg-[#5B9CD8]/10 p-4 text-sm">
                    Etapa documental completada sin adjuntar archivos. La reserva se mantiene y el pago todavía no está habilitado.
                  </p>
                )}

                <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                  <button
                    type="button"
                    onClick={() => setEtapa('seleccion')}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-[#1A2C42] transition-colors hover:bg-slate-50"
                  >
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    Volver a horarios
                  </button>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={cancelarProceso}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E96A6A]/40 px-5 py-3 text-sm font-bold text-[#9F3030] transition-colors hover:bg-[#E96A6A]/10"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={continuarAPago}
                      disabled={!reserva || segundosRestantes <= 0}
                      className="rounded-xl bg-[#5B9CD8] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#4B8ECB] disabled:cursor-default disabled:opacity-60"
                    >
                      Continuar a pago
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-slate-200 p-5">
                <h3 className="font-bold">Resumen de horarios elegidos</h3>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {subjects.map((subject) => {
                    const selectedKey = selecciones[subject]
                    const selectedOption = (opcionesPorAsignatura[subject] ?? [])
                      .find((option) => option.key === selectedKey)
                    return (
                      <li key={subject} className="rounded-lg bg-[#F8FBFD] p-3 text-sm">
                        <span className="font-semibold">{subject}:</span>{' '}
                        {selectedOption?.horario ?? 'Sin selección'}
                      </li>
                    )
                  })}
                </ul>
              </div>
            </section>
          ) : (
            <>
              <div className="mx-auto mt-10 max-w-sm">
                <label htmlFor="nivel" className="mb-2 block text-sm font-bold">
                  Nivel del estudiante
                </label>
                <select
                  id="nivel"
                  value={nivel}
                  onChange={(event) => seleccionarNivel(event.target.value)}
                  disabled={Boolean(reserva) || recuperandoReserva}
                  className="w-full rounded-xl border border-slate-300 bg-[#F8FBFD] p-3 text-sm"
                >
                  {niveles.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>

              {(reserva || recuperandoReserva) && (
                <p role="status" className="mx-auto mt-4 max-w-2xl rounded-xl border border-[#F5D372]/70 bg-[#F5D372]/20 p-4 text-sm">
                  Volver conserva la reserva y su TTL. Para cambiar horarios, cancela esta reserva y comienza otra; el sistema no tiene una operación que cambie sus bloques manteniendo el mismo vencimiento.
                </p>
              )}

              <div className="mt-10 space-y-8">
                {subjects.map((subject) => {
                  const options = opcionesPorAsignatura[subject] ?? []

                  return (
                    <fieldset key={subject} className="border-t border-slate-200 pt-6">
                      <legend className="px-2 text-lg font-bold">{subject}</legend>
                      {options.length === 0 ? (
                        <p className="mt-3 rounded-xl bg-[#F8FBFD] p-4 text-sm text-[var(--brand-subtext)]">
                          No hay horarios publicados para esta asignatura y nivel.
                        </p>
                      ) : (
                        <div role="radiogroup" className="mt-4 grid gap-3 md:grid-cols-2">
                          {options.map((option) => {
                            const full = option.cuposDisponibles === 0
                            const selected = selecciones[subject] === option.key
                            const horarioYaSeleccionado = !selected && subjects.some((otherSubject) => {
                              if (otherSubject === subject) return false

                              const selectedOption = (opcionesPorAsignatura[otherSubject] ?? [])
                                .find((candidate) => candidate.key === selecciones[otherSubject])

                              return selectedOption !== undefined
                                && horariosSeCruzan(selectedOption.horario, option.horario)
                            })

                            return (
                              <button
                                type="button"
                                role="radio"
                                key={option.key}
                                aria-checked={selected}
                                disabled={Boolean(reserva) || recuperandoReserva || (full && !selected) || horarioYaSeleccionado}
                                onClick={() => {
                                  setSelecciones((current) => {
                                    if (current[subject] === option.key) {
                                      const next = { ...current }
                                      delete next[subject]
                                      return next
                                    }

                                    return { ...current, [subject]: option.key }
                                  })
                                  setNotice(null)
                                  setActionError(null)
                                }}
                                className={`flex cursor-pointer gap-3 rounded-2xl border p-4 text-left transition-colors ${
                                  selected
                                    ? 'border-[#4B8ECB] bg-[#5B9CD8]/10'
                                    : 'border-slate-200 hover:border-[#5B9CD8]/60'
                                } ${(Boolean(reserva) || recuperandoReserva || ((full || horarioYaSeleccionado) && !selected)) ? 'cursor-not-allowed opacity-70' : ''}`}
                              >
                                <span
                                  aria-hidden="true"
                                  className={`mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                                    selected ? 'border-[#4B8ECB]' : 'border-slate-400'
                                  }`}
                                >
                                  {selected && <span className="h-2 w-2 rounded-full bg-[#4B8ECB]" />}
                                </span>
                                <span className="min-w-0 flex-1">
                                  <span className="block font-semibold">{option.horario}</span>
                                  <span className={`mt-2 block text-xs font-semibold ${full ? 'text-[#9F3030]' : 'text-[#3D7A56]'}`}>
                                    Quedan {option.cuposDisponibles} cupos libres
                                  </span>
                                  <span className="mt-1 block text-xs text-[var(--brand-subtext)]">
                                    Cupos calculados al momento; se vuelven a validar al reservar.
                                  </span>
                                  {horarioYaSeleccionado && (
                                    <span className="mt-1 block text-xs text-[#9F3030]">
                                      Este horario se cruza con otro ramo seleccionado.
                                    </span>
                                  )}
                                  {full && (
                                    <span className="mt-1 block text-xs text-[var(--brand-subtext)]">
                                      Puedes volver a revisar en 5 a 10 minutos; no se garantiza que se libere un cupo.
                                    </span>
                                  )}
                                </span>
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </fieldset>
                  )
                })}
              </div>

              <div className="mt-10 rounded-2xl border border-slate-200 bg-[#F8FBFD] p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-[var(--brand-subtext)]">
                    Asignaturas seleccionadas: <strong className="text-[#1A2C42]">{Object.keys(selecciones).length} de {subjects.length}</strong>
                  </p>
                  <button
                    type="button"
                    onClick={confirmarSeleccion}
                    disabled={!seleccionCompleta || creatingReservation}
                    className="rounded-xl bg-[#5B9CD8] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#4B8ECB] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {creatingReservation
                      ? 'Creando reserva...'
                      : reserva
                        ? 'Volver a documentos'
                        : recuperandoReserva
                          ? 'Recuperar reserva'
                          : 'Reservar y continuar'}
                  </button>
                </div>
                <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                  <Link
                    href="/"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-[#1A2C42] transition-colors hover:bg-slate-50"
                  >
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    Volver al inicio
                  </Link>
                  <button
                    type="button"
                    onClick={cancelarProceso}
                    disabled={Object.keys(selecciones).length === 0 || creatingReservation}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E96A6A]/40 px-5 py-3 text-sm font-bold text-[#9F3030] transition-colors hover:bg-[#E96A6A]/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                    {reserva || recuperandoReserva ? 'Cancelar reserva' : 'Cancelar selección'}
                  </button>
                </div>
                {notice && (
                  <p role="status" className="mt-4 rounded-xl border border-[#5B9CD8]/30 bg-[#5B9CD8]/10 p-4 text-sm">
                    <Clock3 className="mr-2 inline h-4 w-4" aria-hidden="true" />
                    {notice}
                  </p>
                )}
              </div>
            </>
          )}

          {actionError && (
            <p role="alert" className="mx-auto mt-6 max-w-3xl rounded-xl border border-[#E96A6A]/30 bg-[#E96A6A]/10 p-4 text-sm font-semibold text-[#9F3030]">
              {actionError}
            </p>
          )}

          <div className="mt-10 border-t border-slate-200 pt-6 text-center">
            <p className="text-sm text-[var(--brand-subtext)]">
              ¿Tienes consultas sobre el programa?
            </p>
            <Link
              href="/#contacto"
              className="mt-4 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#4B8ECB] ring-1 ring-slate-300 transition-colors hover:bg-[#F8FBFD]"
            >
              Ir a contacto
            </Link>
          </div>
        </section>

        <p className="py-6 text-center text-xs text-[var(--brand-subtext)]">
          © 2027 Escuela Virtual Escencia
        </p>
      </div>
    </main>
  )
}
