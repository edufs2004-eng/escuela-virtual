'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { BookOpen, Lock, Mail, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    // 1. Autenticar con Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError || !authData.user) {
      setErrorMsg('Credenciales inválidas. Por favor verifica tus datos.')
      setLoading(false)
      return
    }

    // 2. Consultar el rol del usuario en la tabla 'profiles'
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authData.user.id)
      .single()

    if (profileError || !profileData) {
      setErrorMsg('No se encontró un rol asociado a este usuario.')
      setLoading(false)
      return
    }

    // 3. Redirección basada estrictamente en el rol
    const role = profileData.role

    if (role === 'admin') {
      router.push('/admin/ramos')
    } else if (role === 'docente') {
      router.push('/docente/panel') // Próxima fase
    } else if (role === 'alumno') {
      router.push('/alumno/panel') // Próxima fase
    } else {
      setErrorMsg('Rol de usuario no autorizado.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#EAF2F8] text-[#1A2C42] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden p-8 space-y-8">
        
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 bg-[#5B9CD8]/10 rounded-2xl items-center justify-center text-[#4B8ECB] mb-2">
            <BookOpen className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#1A2C42]">Portal Escuela Virtual</h2>
          <p className="text-xs text-[#667A8A]">Ingresa con tu cuenta institucional</p>
        </div>

        {errorMsg && (
          <div className="bg-[#E96A6A]/10 border border-[#E96A6A]/30 text-[#E96A6A] text-xs p-3 rounded-xl text-center font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-[#1A2C42] mb-1.5">Correo Electrónico</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#667A8A]">
                <Mail className="w-4 h-4" />
              </span>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#EAF2F8] border border-slate-300 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B9CD8] transition-all text-[#1A2C42]" 
                placeholder="admin@escuelavirtual.cl" 
                required 
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1A2C42] mb-1.5">Contraseña</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#667A8A]">
                <Lock className="w-4 h-4" />
              </span>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#EAF2F8] border border-slate-300 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B9CD8] transition-all text-[#1A2C42]" 
                placeholder="••••••••" 
                required 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#5B9CD8] hover:bg-[#4B8ECB] text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Verificando acceso...' : 'Ingresar a la Plataforma'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100">
          <Link href="/" className="text-xs text-[#667A8A] hover:text-[#4B8ECB] font-medium transition-colors">
            ← Volver al sitio principal
          </Link>
        </div>

      </div>
    </div>
  )
}