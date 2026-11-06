'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase'
import { BookOpen, Lock, Mail, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface LoginError {
  title: string
  message: string
  code?: string
}

function getErrorCode(error: unknown): string | undefined {
  if (typeof error !== 'object' || error === null || !('code' in error)) {
    return undefined
  }

  return typeof error.code === 'string' ? error.code : undefined
}

function getLoginError(error: unknown): LoginError {
  const code = getErrorCode(error)
  const message = error instanceof Error ? error.message : ''
  const errorName =
    typeof error === 'object' && error !== null && 'name' in error && typeof error.name === 'string'
      ? error.name
      : ''

  if (message === 'SUPABASE_CONFIG_MISSING') {
    return {
      title: 'Falta configurar la conexión con Supabase',
      message: 'Configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en el entorno de este despliegue y vuelve a publicar.',
      code: 'SUPABASE_CONFIG_MISSING',
    }
  }

  if (message === 'SUPABASE_URL_INVALID') {
    return {
      title: 'La URL de Supabase no es válida',
      message: 'Revisa que NEXT_PUBLIC_SUPABASE_URL sea una URL completa que comience con https:// y vuelve a publicar.',
      code: 'SUPABASE_URL_INVALID',
    }
  }

  if (
    errorName === 'AuthRetryableFetchError' ||
    error instanceof TypeError ||
    /failed to fetch|networkerror|fetch failed|load failed/i.test(message)
  ) {
    return {
      title: 'No se pudo conectar con Supabase',
      message: 'Revisa tu conexión a internet y que la URL de Supabase esté disponible. Si persiste, comprueba el estado del proyecto y las variables de entorno.',
      code: code ?? (errorName || 'NETWORK_ERROR'),
    }
  }

  if (code === 'email_not_confirmed') {
    return {
      title: 'Correo pendiente de confirmación',
      message: 'Confirma la dirección de correo desde el mensaje enviado por Supabase y vuelve a intentarlo.',
      code,
    }
  }

  if (code === 'too_many_requests' || code === 'over_request_rate_limit') {
    return {
      title: 'Demasiados intentos',
      message: 'Espera un momento antes de volver a intentar iniciar sesión.',
      code,
    }
  }

  if (
    code === 'invalid_credentials' ||
    code === 'user_not_found' ||
    code === 'invalid_grant' ||
    (typeof error === 'object' && error !== null && 'status' in error && error.status === 400)
  ) {
    return {
      title: 'Correo o contraseña incorrectos',
      message: 'Verifica ambos datos. Por seguridad, el sistema no indica si el correo existe.',
      code: code ?? 'INVALID_CREDENTIALS',
    }
  }

  return {
    title: 'No se pudo completar el inicio de sesión',
    message: message || 'Ocurrió un error inesperado. Intenta nuevamente.',
    code,
  }
}

async function clearLocalSession(): Promise<void> {
  try {
    const { error } = await getSupabaseClient().auth.signOut({ scope: 'local' })
    if (error) {
      console.error('No se pudo limpiar la sesión local tras rechazar el acceso:', error)
    }
  } catch (error) {
    console.error('Error al limpiar la sesión local tras rechazar el acceso:', error)
  }
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [loginError, setLoginError] = useState<LoginError | null>(null)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setLoginError(null)

    try {
      const supabase = getSupabaseClient()
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError || !authData.user) {
        const error = authError ?? new Error('La autenticación no devolvió un usuario.')
        console.error('Error de autenticación:', error)
        setLoginError(getLoginError(error))
        return
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .maybeSingle()

      if (profileError || !profileData) {
        if (profileError) {
          console.error('Error al consultar el perfil/RLS:', profileError)
          setLoginError({
            title: 'La cuenta inició sesión, pero no se pudo consultar su perfil',
            message: 'Comprueba que exista una fila en public.profiles con el mismo ID que auth.users y que las políticas RLS permitan al usuario leer su propio perfil.',
            code: getErrorCode(profileError) ?? 'PROFILE_QUERY_ERROR',
          })
        } else {
          setLoginError({
            title: 'La cuenta no tiene un perfil visible',
            message: 'Comprueba que exista una fila en public.profiles con el mismo ID que auth.users y que RLS permita leerla.',
            code: 'PROFILE_NOT_FOUND',
          })
        }
        await clearLocalSession()
        return
      }

      const role = profileData.role

      if (role === 'admin') {
        router.replace('/admin/ramos')
      } else if (role === 'docente' || role === 'alumno') {
        setLoginError({
          title: 'El perfil existe, pero su portal aún no está disponible',
          message: `El rol "${role}" todavía no tiene una página implementada. Contacta al administrador del sistema.`,
          code: 'ROLE_PORTAL_NOT_IMPLEMENTED',
        })
        await clearLocalSession()
      } else {
        setLoginError({
          title: 'El perfil tiene un rol no reconocido',
          message: 'El rol debe ser admin, docente o alumno. Corrige el valor en public.profiles.',
          code: 'UNKNOWN_PROFILE_ROLE',
        })
        await clearLocalSession()
      }
    } catch (err) {
      console.error('Error inesperado durante el inicio de sesión:', err)
      setLoginError(getLoginError(err))
    } finally {
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

        {loginError && (
          <div
            role="alert"
            aria-live="polite"
            className="bg-[#E96A6A]/10 border border-[#E96A6A]/30 text-[#9F3030] text-xs p-4 rounded-xl space-y-1"
          >
            <p className="font-bold">{loginError.title}</p>
            <p>{loginError.message}</p>
            {loginError.code && (
              <p className="pt-1 font-mono text-[10px] text-[#667A8A]">
                Código de diagnóstico: {loginError.code}
              </p>
            )}
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