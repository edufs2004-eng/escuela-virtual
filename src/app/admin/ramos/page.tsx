'use client'

import { useState, useEffect } from 'react'
import { getSupabaseClient } from '@/lib/supabase'
import { BookOpen, Clock, Users, Plus, Trash2, ShieldAlert, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface BloqueRamo {
  id: string
  nivel: string
  asignatura: string
  horario: string
  profesor: string | null
  capacidad_maxima: number
  inscritos_count: number
}

interface Horario {
  id: string
  etiqueta: string
}

const diasSemana = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
]

interface OperationFeedback {
  type: 'error' | 'success'
  title: string
  message: string
  code?: string
  details?: string
  hint?: string
}

function getErrorField(error: unknown, field: string): string | undefined {
  if (typeof error !== 'object' || error === null || !(field in error)) {
    return undefined
  }

  const value = error[field as keyof typeof error]
  return typeof value === 'string' ? value : undefined
}

function getInsertErrorFeedback(error: unknown): OperationFeedback {
  const code = getErrorField(error, 'code')
  const message = getErrorField(error, 'message') ?? 'No se recibió un mensaje de error desde Supabase.'
  const details = getErrorField(error, 'details')
  const hint = getErrorField(error, 'hint')

  let title = 'No se pudo crear el bloque'
  let explanation = message

  if (code === '42501') {
    title = 'Supabase rechazó el permiso para crear el bloque'
    explanation = 'Revisa los permisos INSERT y la política RLS de bloques_ramos para el usuario autenticado.'
  } else if (code === '23502') {
    title = 'Falta un dato obligatorio en la tabla'
    explanation = 'La tabla exige un campo que el formulario no está enviando. Revisa las columnas NOT NULL de bloques_ramos.'
  } else if (code === 'PGRST205' || code === '42P01') {
    title = 'Supabase no encuentra la tabla bloques_ramos'
    explanation = 'Confirma que la tabla exista en el esquema public y que la API de Supabase la tenga disponible.'
  } else if (error instanceof TypeError || /failed to fetch|networkerror|fetch failed|load failed/i.test(message)) {
    title = 'No se pudo conectar con Supabase'
    explanation = 'Comprueba la conexión a internet y las variables de entorno de Supabase.'
  }

  return { type: 'error', title, message: explanation, code, details, hint }
}

export default function AdminRamosPage() {
  const [bloques, setBloques] = useState<BloqueRamo[]>([])
  const [horarios, setHorarios] = useState<Horario[]>([])
  const [loading, setLoading] = useState(true)
  const [horariosLoading, setHorariosLoading] = useState(true)
  const [horariosError, setHorariosError] = useState<string | null>(null)
  const [horarioDia, setHorarioDia] = useState(diasSemana[0])
  const [horarioInicio, setHorarioInicio] = useState('')
  const [horarioFin, setHorarioFin] = useState('')
  const [savingHorario, setSavingHorario] = useState(false)
  const [horarioFeedback, setHorarioFeedback] = useState<OperationFeedback | null>(null)
  const [savingBlock, setSavingBlock] = useState(false)
  const [blockFeedback, setBlockFeedback] = useState<OperationFeedback | null>(null)
  const [authChecking, setAuthChecking] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()

  // Estados para el formulario de nuevo bloque
  const [nivel, setNivel] = useState('1.º Medio')
  const [asignatura, setAsignatura] = useState('Matemáticas')
  const [horarioId, setHorarioId] = useState('')
  const [profesor, setProfesor] = useState('')

  const fetchBloques = async () => {
    setLoading(true)
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from('bloques_ramos').select('*').order('nivel', { ascending: true })
    if (error) {
      console.error('Error al cargar bloques:', error)
    } else {
      setBloques(data || [])
    }
    setLoading(false)
  }

  const fetchHorarios = async () => {
    setHorariosLoading(true)
    setHorariosError(null)

    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('horarios')
      .select('id, etiqueta')
      .order('etiqueta', { ascending: true })

    if (error) {
      console.error('Error al cargar el catálogo de horarios:', error)
      setHorarios([])
      setHorariosError('No se pudo cargar el catálogo de horarios. Intenta actualizar el panel.')
    } else {
      setHorarios(data ?? [])
    }

    setHorariosLoading(false)
  }

  useEffect(() => {
    let cancelled = false

    const verifyAdmin = async () => {
      try {
        const supabase = getSupabaseClient()
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          console.error('No se pudo leer la sesión:', sessionError)
          router.replace('/login')
          return
        }

        if (!sessionData.session) {
          router.replace('/login')
          return
        }

        const { data: authData, error: authError } = await supabase.auth.getUser()

        if (authError || !authData.user) {
          if (authError) {
            console.error('No se pudo verificar el usuario de la sesión:', authError)
          }
          router.replace('/login')
          return
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', authData.user.id)
          .maybeSingle()

        if (profileError) {
          console.error('No se pudo verificar el rol del usuario:', profileError)
          const { error: signOutError } = await supabase.auth.signOut({ scope: 'local' })
          if (signOutError) {
            console.error('No se pudo limpiar la sesión sin perfil verificable:', signOutError)
          }
          router.replace('/login')
          return
        }

        if (profile?.role !== 'admin') {
          const { error: signOutError } = await supabase.auth.signOut({ scope: 'local' })
          if (signOutError) {
            console.error('No se pudo limpiar la sesión sin permisos de administrador:', signOutError)
          }
          router.replace('/login')
          return
        }

        if (!cancelled) {
          setIsAdmin(true)
          await Promise.all([fetchBloques(), fetchHorarios()])
        }
      } catch (error) {
        console.error('Error inesperado al verificar el acceso al panel:', error)
        router.replace('/login')
      } finally {
        if (!cancelled) {
          setAuthChecking(false)
        }
      }
    }

    void verifyAdmin()

    return () => {
      cancelled = true
    }
  }, [router])

  const handleCrearBloque = async (e: React.FormEvent) => {
    e.preventDefault()

    const selectedHorario = horarios.find((option) => option.id === horarioId)
    if (!selectedHorario) {
      setBlockFeedback({
        type: 'error',
        title: 'Selecciona un horario disponible',
        message: 'El horario debe elegirse desde el catálogo configurado.',
      })
      return
    }

    setSavingBlock(true)
    setBlockFeedback(null)

    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.from('bloques_ramos').insert({
        nivel,
        asignatura,
        horario: selectedHorario.etiqueta,
        profesor: profesor.trim() || null,
        capacidad_maxima: 15,
        inscritos_count: 0,
      })

      if (error) {
        const feedback = getInsertErrorFeedback(error)
        console.error('Error al crear el bloque en Supabase:', {
          code: feedback.code,
          message: getErrorField(error, 'message'),
          details: feedback.details,
          hint: feedback.hint,
          status: getErrorField(error, 'status'),
        })
        setBlockFeedback(feedback)
        return
      }

      setProfesor('')
      setBlockFeedback({
        type: 'success',
        title: 'Bloque creado',
        message: 'El bloque se guardó correctamente.',
      })
      await fetchBloques()
    } catch (error) {
      const feedback = getInsertErrorFeedback(error)
      console.error('Error inesperado al crear el bloque:', error)
      setBlockFeedback(feedback)
    } finally {
      setSavingBlock(false)
    }
  }

  const handleCrearHorario = async (e: React.FormEvent) => {
    e.preventDefault()

    const etiqueta = `${horarioDia} ${horarioInicio} - ${horarioFin}`
    const inicioMinutos = horarioInicio.split(':').reduce((hours, part, index) => (
      index === 0 ? Number(part) * 60 : hours + Number(part)
    ), 0)
    const finMinutos = horarioFin.split(':').reduce((hours, part, index) => (
      index === 0 ? Number(part) * 60 : hours + Number(part)
    ), 0)

    if (!horarioInicio || !horarioFin) {
      setHorarioFeedback({
        type: 'error',
        title: 'Completa el horario',
        message: 'Selecciona la hora de inicio y la hora de término.',
      })
      return
    }

    if (finMinutos <= inicioMinutos) {
      setHorarioFeedback({
        type: 'error',
        title: 'El horario no es válido',
        message: 'La hora de término debe ser posterior a la hora de inicio.',
      })
      return
    }

    if (horarios.some((horario) => horario.etiqueta.localeCompare(etiqueta, undefined, { sensitivity: 'base' }) === 0)) {
      setHorarioFeedback({
        type: 'error',
        title: 'El horario ya existe',
        message: 'El catálogo ya contiene ese día y rango de horas.',
      })
      return
    }

    setSavingHorario(true)
    setHorarioFeedback(null)

    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.from('horarios').insert({
        etiqueta,
      })

      if (error) {
        const code = getErrorField(error, 'code')
        const message = getErrorField(error, 'message') ?? 'No se recibió un mensaje de error desde Supabase.'
        console.error('Error al crear la opción en el catálogo de horarios:', error)
        setHorarioFeedback({
          type: 'error',
          title: code === '42501' ? 'Supabase rechazó el permiso para crear el horario' : 'No se pudo crear el horario',
          message: code === '42501'
            ? 'La cuenta debe tener permiso para insertar opciones en la tabla horarios.'
            : message,
          code,
          details: getErrorField(error, 'details'),
          hint: getErrorField(error, 'hint'),
        })
        return
      }

      setHorarioInicio('')
      setHorarioFin('')
      setHorarioFeedback({
        type: 'success',
        title: 'Horario agregado al catálogo',
        message: 'Ya puedes seleccionarlo al crear un bloque de ramo.',
      })
      await fetchHorarios()
    } catch (error) {
      console.error('Error inesperado al crear la opción en el catálogo de horarios:', error)
      setHorarioFeedback({
        type: 'error',
        title: 'No se pudo crear el horario',
        message: error instanceof Error ? error.message : 'Ocurrió un error inesperado al guardar el horario.',
      })
    } finally {
      setSavingHorario(false)
    }
  }

  const handleEliminarBloque = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este bloque horario?')) return

    const supabase = getSupabaseClient()
    const { error } = await supabase.from('bloques_ramos').delete().eq('id', id)
    if (error) {
      alert('Error al eliminar el bloque.')
    } else {
      fetchBloques()
    }
  }

  const handleLogout = async () => {
    const supabase = getSupabaseClient()
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error al cerrar sesión:', error)
      alert('No se pudo cerrar la sesión. Inténtalo nuevamente.')
      return
    }
    router.push('/login')
  }

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#EAF2F8] text-[#667A8A] flex items-center justify-center text-sm">
        Verificando acceso...
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#EAF2F8] text-[#1A2C42] flex flex-col font-sans">
      
      {/* Barra superior de Administración */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#5B9CD8]/10 rounded-xl flex items-center justify-center text-[#4B8ECB]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-[#1A2C42]">Panel de Administración</h1>
              <span className="text-xs text-[#667A8A]">Gestión de Bloques Horarios y Cupos</span>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 bg-[#E96A6A]/10 hover:bg-[#E96A6A]/20 text-[#E96A6A] px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-10">

        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-[#1A2C42] flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#5B9CD8]" /> Catálogo de Horarios
            </h2>
            <p className="mt-1 text-xs text-[#667A8A]">
              Crea las opciones disponibles. Después podrás asignarlas a los bloques de ramos.
            </p>
          </div>

          <form onSubmit={handleCrearHorario} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
            <div>
              <label htmlFor="horario-dia" className="mb-1 block text-xs font-bold text-[#1A2C42]">
                Día
              </label>
              <select
                id="horario-dia"
                value={horarioDia}
                onChange={(event) => setHorarioDia(event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-[#EAF2F8] p-2.5 text-xs"
                required
              >
                {diasSemana.map((dia) => <option key={dia} value={dia}>{dia}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="horario-inicio" className="mb-1 block text-xs font-bold text-[#1A2C42]">
                Hora de inicio
              </label>
              <input
                id="horario-inicio"
                type="time"
                step={60}
                value={horarioInicio}
                onChange={(event) => setHorarioInicio(event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-[#EAF2F8] p-2.5 text-xs"
                required
              />
            </div>
            <div>
              <label htmlFor="horario-fin" className="mb-1 block text-xs font-bold text-[#1A2C42]">
                Hora de término
              </label>
              <input
                id="horario-fin"
                type="time"
                step={60}
                value={horarioFin}
                onChange={(event) => setHorarioFin(event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-[#EAF2F8] p-2.5 text-xs"
                required
              />
            </div>
            <button
              type="submit"
              disabled={savingHorario || horariosLoading || horariosError !== null}
              className="flex h-[38px] items-center justify-center gap-1 rounded-xl bg-[#5B9CD8] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#4B8ECB] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              {savingHorario ? 'Guardando...' : 'Agregar horario'}
            </button>
            {horarioInicio && horarioFin && (
              <p className="text-xs text-[#667A8A] sm:col-span-2 lg:col-span-4">
                Se guardará como: <strong className="text-[#1A2C42]">{horarioDia} {horarioInicio} - {horarioFin}</strong>
              </p>
            )}
          </form>

          {horarioFeedback && (
            <div
              role={horarioFeedback.type === 'error' ? 'alert' : 'status'}
              aria-live="polite"
              className={`space-y-1 rounded-xl border p-4 text-xs ${
                horarioFeedback.type === 'error'
                  ? 'border-[#E96A6A]/30 bg-[#E96A6A]/10 text-[#9F3030]'
                  : 'border-[#71C997]/40 bg-[#71C997]/15 text-[#1A2C42]'
              }`}
            >
              <p className="font-bold">{horarioFeedback.title}</p>
              <p>{horarioFeedback.message}</p>
              {horarioFeedback.code && <p>Código: <span className="font-mono">{horarioFeedback.code}</span></p>}
              {horarioFeedback.details && <p>Detalle: {horarioFeedback.details}</p>}
              {horarioFeedback.hint && <p>Sugerencia de Supabase: {horarioFeedback.hint}</p>}
            </div>
          )}

          {horariosLoading ? (
            <p role="status" className="text-xs text-[#667A8A]">Cargando catálogo...</p>
          ) : horariosError ? (
            <p role="alert" className="text-xs text-[#9F3030]">{horariosError}</p>
          ) : horarios.length === 0 ? (
            <p className="rounded-xl bg-[#F8FBFD] p-4 text-xs text-[#667A8A]">
              Aún no hay opciones en el catálogo. Agrega un horario para poder crear bloques de ramos.
            </p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {horarios.map((horario) => (
                <li key={horario.id} className="rounded-xl border border-slate-200 bg-[#F8FBFD] p-4">
                  <p className="text-sm font-bold text-[#1A2C42]">{horario.etiqueta}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
        
        {/* Formulario para Crear Nuevo Bloque */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-[#1A2C42] flex items-center gap-2">
            <Plus className="w-5 h-5 text-[#5B9CD8]" /> Crear Nuevo Bloque de Ramo
          </h3>
          
          <form onSubmit={handleCrearBloque} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold text-[#1A2C42] mb-1">Nivel</label>
              <select value={nivel} onChange={(e) => setNivel(e.target.value)} className="w-full bg-[#EAF2F8] border border-slate-300 rounded-xl p-2.5 text-xs">
                <option>7.º Básico</option>
                <option>8.º Básico</option>
                <option>1.º Medio</option>
                <option>2.º Medio</option>
                <option>3.º Medio</option>
                <option>4.º Medio</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1A2C42] mb-1">Asignatura</label>
              <select value={asignatura} onChange={(e) => setAsignatura(e.target.value)} className="w-full bg-[#EAF2F8] border border-slate-300 rounded-xl p-2.5 text-xs">
                <option>Matemáticas</option>
                <option>Lenguaje</option>
                <option>Ciencias</option>
                <option>Historia</option>
                <option>Inglés</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1A2C42] mb-1">Horario</label>
              <select
                value={horarioId}
                onChange={(e) => setHorarioId(e.target.value)}
                className="w-full bg-[#EAF2F8] border border-slate-300 rounded-xl p-2.5 text-xs"
                required
                disabled={horariosLoading || horariosError !== null || horarios.length === 0}
              >
                <option value="">
                  {horariosLoading ? 'Cargando horarios...' : 'Selecciona un horario'}
                </option>
                {horarios.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.etiqueta}
                  </option>
                ))}
              </select>
              {horariosError ? (
                <p role="alert" className="mt-2 text-xs text-[#9F3030]">{horariosError}</p>
              ) : !horariosLoading && horarios.length === 0 ? (
                <p className="mt-2 text-xs text-[#667A8A]">
                  No hay horarios disponibles en el catálogo.
                </p>
              ) : null}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1A2C42] mb-1">Profesor a Cargo (opcional)</label>
              <input 
                type="text" 
                value={profesor} 
                onChange={(e) => setProfesor(e.target.value)} 
                className="w-full bg-[#EAF2F8] border border-slate-300 rounded-xl p-2.5 text-xs" 
                placeholder="Ej. Prof. Carlos Soto" 
              />
            </div>

            <button type="submit" disabled={savingBlock || horariosLoading || horariosError !== null || horarios.length === 0} className="bg-[#5B9CD8] hover:bg-[#4B8ECB] text-white font-bold py-2.5 px-4 rounded-xl text-xs transition shadow-sm cursor-pointer h-[38px] flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed">
              <Plus className="w-4 h-4" /> {savingBlock ? 'Guardando...' : 'Guardar Bloque'}
            </button>
          </form>

          {blockFeedback && (
            <div
              role={blockFeedback.type === 'error' ? 'alert' : 'status'}
              aria-live="polite"
              className={`rounded-xl border p-4 text-xs space-y-1 ${
                blockFeedback.type === 'error'
                  ? 'bg-[#E96A6A]/10 border-[#E96A6A]/30 text-[#9F3030]'
                  : 'bg-[#71C997]/15 border-[#71C997]/40 text-[#1A2C42]'
              }`}
            >
              <p className="font-bold">{blockFeedback.title}</p>
              <p>{blockFeedback.message}</p>
              {blockFeedback.code && <p>Código: <span className="font-mono">{blockFeedback.code}</span></p>}
              {blockFeedback.details && <p>Detalle: {blockFeedback.details}</p>}
              {blockFeedback.hint && <p>Sugerencia de Supabase: {blockFeedback.hint}</p>}
            </div>
          )}
        </section>

        {/* Listado / Tabla de Bloques Existentes */}
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-slate-200 flex justify-between items-center">
            <h3 className="text-lg font-bold text-[#1A2C42]">Bloques y Cupos Activos</h3>
            <span className="bg-[#71C997]/20 text-[#1A2C42] text-xs font-bold px-3 py-1 rounded-full">
              {bloques.length} Bloques Registrados
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-[#667A8A]">Cargando oferta académica...</div>
          ) : bloques.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#667A8A] flex flex-col items-center gap-2">
              <ShieldAlert className="w-8 h-8 text-[#F5D372]" />
              No hay bloques registrados todavía. Crea el primero arriba.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#EAF2F8] text-[#1A2C42] font-bold border-b border-slate-200">
                    <th className="p-4 pl-6">Nivel</th>
                    <th className="p-4">Asignatura</th>
                    <th className="p-4">Horario</th>
                    <th className="p-4">Profesor</th>
                    <th className="p-4 text-center">Cupos (Inscritos / Máx)</th>
                    <th className="p-4 pr-6 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[#667A8A]">
                  {bloques.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 pl-6 font-bold text-[#1A2C42]">{b.nivel}</td>
                      <td className="p-4 font-semibold text-[#1A2C42]">{b.asignatura}</td>
                      <td className="p-4">{b.horario}</td>
                      <td className="p-4">{b.profesor || 'Sin asignar'}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full font-bold ${
                          b.inscritos_count >= b.capacidad_maxima 
                            ? 'bg-[#E96A6A]/10 text-[#E96A6A]' 
                            : 'bg-[#71C997]/20 text-[#1A2C42]'
                        }`}>
                          {b.inscritos_count} / {b.capacidad_maxima}
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <button 
                          onClick={() => handleEliminarBloque(b.id)}
                          className="p-2 text-[#E96A6A] hover:bg-[#E96A6A]/10 rounded-lg transition-colors cursor-pointer"
                          title="Eliminar bloque"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </main>
    </div>
  )
}