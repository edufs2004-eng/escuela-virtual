'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
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

interface BloqueRamo {
  id: string
  nivel: string
  asignatura: string
  horario: string
  profesor: string | null
  capacidad_maxima: number | null
  inscritos_count: number | null
}

interface OpcionHorario {
  key: string
  asignatura: string
  horario: string
  bloques: BloqueRamo[]
  cuposDisponibles: number
}

const subjects = ['Matemáticas', 'Lenguaje', 'Inglés', 'Ciencias', 'Historia']

function getAvailability(block: BloqueRamo) {
  const capacity = block.capacidad_maxima ?? 15
  const enrolled = block.inscritos_count ?? 0
  return Math.max(0, capacity - enrolled)
}

export default function MatriculaPage() {
  const [bloques, setBloques] = useState<BloqueRamo[]>([])
  const [nivel, setNivel] = useState('')
  const [selecciones, setSelecciones] = useState<Record<string, string>>({})
  const [etapa, setEtapa] = useState<'seleccion' | 'documentos' | 'pago'>('seleccion')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [documentosContinuados, setDocumentosContinuados] = useState(false)

  const cargarBloques = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const supabase = getSupabaseClient()
      const { data, error: queryError } = await supabase
        .from('bloques_ramos')
        .select('id, nivel, asignatura, horario, profesor, capacidad_maxima, inscritos_count')
        .order('nivel', { ascending: true })
        .order('asignatura', { ascending: true })
        .order('horario', { ascending: true })

      if (queryError) {
        console.error('No se pudo cargar la oferta de horarios:', queryError)
        setError('No pudimos cargar los horarios disponibles. Intenta nuevamente.')
        return
      }

      const publishedBlocks = data ?? []
      setBloques(publishedBlocks)
      setNivel((current) => current && publishedBlocks.some((block) => block.nivel === current)
        ? current
        : publishedBlocks[0]?.nivel ?? '')
      setSelecciones({})
      setEtapa('seleccion')
      setDocumentosContinuados(false)
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

  const niveles = useMemo(
    () => [...new Set(bloques.map((bloque) => bloque.nivel))],
    [bloques],
  )

  const opcionesPorAsignatura = useMemo(() => {
    const groups = new Map<string, OpcionHorario>()

    for (const block of bloques) {
      if (block.nivel !== nivel || !subjects.includes(block.asignatura)) continue

      const key = `${block.asignatura}\u0000${block.horario}`
      const existing = groups.get(key)
      if (existing) {
        existing.bloques.push(block)
        existing.cuposDisponibles += getAvailability(block)
      } else {
        groups.set(key, {
          key,
          asignatura: block.asignatura,
          horario: block.horario,
          bloques: [block],
          cuposDisponibles: getAvailability(block),
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
    setNivel(newLevel)
    setSelecciones({})
    setNotice(null)
  }

  const confirmarSeleccion = () => {
    if (!seleccionCompleta) return
    setNotice(null)
    setDocumentosContinuados(false)
    setEtapa('documentos')
  }

  const continuarAPago = () => {
    setDocumentosContinuados(true)
    setEtapa('pago')
  }

  const cancelarProceso = () => {
    if (!window.confirm('¿Quieres cancelar y borrar la selección actual? Todavía no hay una reserva ni un pago iniciado.')) return
    setSelecciones({})
    setDocumentosContinuados(false)
    setEtapa('seleccion')
    setNotice('Se borró la selección de esta página. No había ninguna reserva ni pago activo que cancelar.')
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
            <p className="mt-4 text-sm leading-6 text-[#667A8A] sm:text-base">
              {etapa === 'seleccion'
                ? 'Elige un horario para cada asignatura obligatoria. Las secciones equivalentes del mismo ramo y horario se muestran agrupadas.'
                : etapa === 'documentos'
                  ? 'Esta etapa está preparada para continuar sin adjuntar archivos. La carga se habilitará cuando se definan los requisitos documentales.'
                  : 'La confirmación de matrícula y el pago estarán disponibles cuando la verificación segura esté conectada.'}
            </p>
            <div
              role="status"
              className="mt-6 rounded-2xl border border-[#5B9CD8]/30 bg-[#5B9CD8]/10 p-4 text-sm font-medium text-[#1A2C42]"
            >
              Esta selección todavía no crea una reserva ni garantiza disponibilidad. Los cupos
              se confirmarán cuando la reserva segura esté habilitada.
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-3 py-16 text-sm text-[#667A8A]" role="status">
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
              <p className="mt-1 text-sm text-[#667A8A]">Vuelve a revisar más adelante.</p>
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
                    <p className="mt-2 text-sm leading-6 text-[#667A8A]">
                      No se inició una transacción con Transbank. Esta página no confirma pagos ni matrículas.
                      Cuando se habilite, el estado se verificará con el proveedor desde el servidor.
                    </p>
                  </div>
                </div>

                <div role="status" className="mt-6 rounded-xl border border-[#F5D372]/70 bg-[#F5D372]/20 p-4 text-sm">
                  Tu selección solo se conserva en esta página; no hay una reserva vigente ni un temporizador de pago.
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
                    <p className="mt-2 text-sm leading-6 text-[#667A8A]">
                      Por ahora no se solicitan documentos. No adjuntes ni envíes archivos en esta etapa.
                      Podrás continuar sin documentos cuando el flujo de matrícula esté conectado.
                    </p>
                  </div>
                </div>

                <div className="mt-6 rounded-xl border border-[#F5D372]/70 bg-[#F5D372]/20 p-4 text-sm">
                  La selección de horarios se conserva mientras permanezcas en esta página.
                  Aún no se ha creado una reserva, no hay temporizador y los cupos no están apartados.
                </div>

                {documentosContinuados && (
                  <p role="status" className="mt-4 rounded-xl border border-[#5B9CD8]/30 bg-[#5B9CD8]/10 p-4 text-sm">
                    Etapa documental completada en esta vista. La selección no se guardó en el servidor
                    y el pago todavía no está habilitado.
                  </p>
                )}

                <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setDocumentosContinuados(false)
                      setEtapa('seleccion')
                    }}
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
                  className="w-full rounded-xl border border-slate-300 bg-[#F8FBFD] p-3 text-sm"
                >
                  {niveles.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>

              <div className="mt-10 space-y-8">
                {subjects.map((subject) => {
                  const options = opcionesPorAsignatura[subject] ?? []

                  return (
                    <fieldset key={subject} className="border-t border-slate-200 pt-6">
                      <legend className="px-2 text-lg font-bold">{subject}</legend>
                      {options.length === 0 ? (
                        <p className="mt-3 rounded-xl bg-[#F8FBFD] p-4 text-sm text-[#667A8A]">
                          No hay horarios publicados para esta asignatura y nivel.
                        </p>
                      ) : (
                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                          {options.map((option) => {
                            const full = option.cuposDisponibles === 0
                            const selected = selecciones[subject] === option.key

                            return (
                              <label
                                key={option.key}
                                className={`flex cursor-pointer gap-3 rounded-2xl border p-4 transition-colors ${
                                  selected
                                    ? 'border-[#4B8ECB] bg-[#5B9CD8]/10'
                                    : 'border-slate-200 hover:border-[#5B9CD8]/60'
                                } ${full ? 'cursor-not-allowed opacity-70' : ''}`}
                              >
                                <input
                                  type="radio"
                                  name={`asignatura-${subject}`}
                                  value={option.key}
                                  checked={selected}
                                  disabled={full}
                                  onChange={() => {
                                    setSelecciones((current) => ({ ...current, [subject]: option.key }))
                                    setNotice(null)
                                  }}
                                  className="mt-1 accent-[#4B8ECB]"
                                />
                                <span className="min-w-0 flex-1">
                                  <span className="block font-semibold">{option.horario}</span>
                                  <span className={`mt-2 block text-xs font-semibold ${full ? 'text-[#9F3030]' : 'text-[#3D7A56]'}`}>
                                    Quedan {option.cuposDisponibles} cupos libres
                                  </span>
                                  <span className="mt-1 block text-xs text-[#667A8A]">
                                    No considera reservas temporales y no garantiza disponibilidad.
                                  </span>
                                  {full && (
                                    <span className="mt-1 block text-xs text-[#667A8A]">
                                      Puedes volver a revisar en 5 a 10 minutos; no se garantiza que se libere un cupo.
                                    </span>
                                  )}
                                </span>
                              </label>
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
                  <p className="text-sm text-[#667A8A]">
                    Asignaturas seleccionadas: <strong className="text-[#1A2C42]">{Object.keys(selecciones).length} de {subjects.length}</strong>
                  </p>
                  <button
                    type="button"
                    onClick={confirmarSeleccion}
                    disabled={!seleccionCompleta}
                    className="rounded-xl bg-[#5B9CD8] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#4B8ECB] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Revisar selección
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
                    disabled={Object.keys(selecciones).length === 0}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E96A6A]/40 px-5 py-3 text-sm font-bold text-[#9F3030] transition-colors hover:bg-[#E96A6A]/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                    Cancelar selección
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

          <div className="mt-10 border-t border-slate-200 pt-6 text-center">
            <p className="text-sm text-[#667A8A]">
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

        <p className="py-6 text-center text-xs text-[#667A8A]">
          © 2027 Escuela Virtual Escencia
        </p>
      </div>
    </main>
  )
}
