'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { BookOpen, Users, Plus, Trash2, ShieldAlert, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface BloqueRamo {
  id: string
  nivel: string
  asignatura: string
  horario: string
  profesor: string
  capacidad_maxima: number
  inscritos_count: number
}

export default function AdminRamosPage() {
  const [bloques, setBloques] = useState<BloqueRamo[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Estados para el formulario de nuevo bloque
  const [nivel, setNivel] = useState('1.º Medio')
  const [asignatura, setAsignatura] = useState('Matemáticas')
  const [horario, setHorario] = useState('Lunes 10:00 - 11:30')
  const [profesor, setProfesor] = useState('')

  useEffect(() => {
    fetchBloques()
  }, [])

  const fetchBloques = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('bloques_ramos').select('*').order('nivel', { ascending: true })
    if (error) {
      console.error('Error al cargar bloques:', error)
    } else {
      setBloques(data || [])
    }
    setLoading(false)
  }

  const handleCrearBloque = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profesor) return alert('Debes indicar el nombre del profesor.')

    const { error } = await supabase.from('bloques_ramos').insert([
      {
        nivel,
        asignatura,
        horario,
        profesor,
        capacidad_maxima: 15,
        inscritos_count: 0
      }
    ])

    if (error) {
      alert('Hubo un error al crear el bloque.')
      console.error(error)
    } else {
      setProfesor('')
      fetchBloques()
    }
  }

  const handleEliminarBloque = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este bloque horario?')) return

    const { error } = await supabase.from('bloques_ramos').delete().eq('id', id)
    if (error) {
      alert('Error al eliminar el bloque.')
    } else {
      fetchBloques()
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
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
              <input 
                type="text" 
                value={horario} 
                onChange={(e) => setHorario(e.target.value)} 
                className="w-full bg-[#EAF2F8] border border-slate-300 rounded-xl p-2.5 text-xs" 
                placeholder="Ej. Martes 09:00 - 10:30" 
                required 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1A2C42] mb-1">Profesor a Cargo</label>
              <input 
                type="text" 
                value={profesor} 
                onChange={(e) => setProfesor(e.target.value)} 
                className="w-full bg-[#EAF2F8] border border-slate-300 rounded-xl p-2.5 text-xs" 
                placeholder="Ej. Prof. Carlos Soto" 
                required 
              />
            </div>

            <button type="submit" className="bg-[#5B9CD8] hover:bg-[#4B8ECB] text-white font-bold py-2.5 px-4 rounded-xl text-xs transition shadow-sm cursor-pointer h-[38px] flex items-center justify-center gap-1">
              <Plus className="w-4 h-4" /> Guardar Bloque
            </button>
          </form>
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
                      <td className="p-4">{b.profesor}</td>
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