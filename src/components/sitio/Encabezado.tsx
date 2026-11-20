import Image from 'next/image'
import Link from 'next/link'
import logo from '@/assets/logo_1.webp'
import { ENLACES_MENU } from '@/config/sitio'
import MenuMovil from './MenuMovil'

// Zona 1 (franja azul pequeña) y Zona 2 superior (franja blanca con logo, pestañas y accesos).
export default function Encabezado() {
  return (
    <>
      {/* Zona 1: franja azul pequeña, solo con el botón amarillo "Admisión 2027" */}
      <div className="flex items-center justify-center bg-[#4B8ECB] px-4 py-2 shadow-inner">
        <span className="animate-pulse rounded-full bg-[#F5D372] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#1A2C42] motion-reduce:animate-none">
          Admisión 2027
        </span>
      </div>

      {/* Zona 2: franja blanca con el logo completo (dibujo + palabras, sin separar) */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:h-24 sm:px-6 lg:h-28 lg:px-8">
          <Link href="/" aria-label="Colegio Virtual Esencia, ir al inicio" className="shrink-0">
            <Image src={logo} alt="Colegio Virtual Esencia" loading="eager" className="h-16 w-auto sm:h-20 lg:h-24" />
          </Link>

          <nav aria-label="Menú principal" className="hidden items-center gap-6 text-sm font-semibold text-[#667A8A] xl:flex">
            {ENLACES_MENU.map((enlace) => (
              <a key={enlace.href} href={enlace.href} className="transition-colors duration-200 hover:text-[#4B8ECB]">
                {enlace.texto}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden text-xs font-bold text-[#667A8A] transition-colors hover:text-[#4B8ECB] sm:inline-block"
            >
              Acceso Alumnos
            </Link>
            <Link
              href="/matricula"
              className="inline-block animate-pulse rounded-full bg-[#F5D372] px-3 py-2 text-xs font-bold uppercase tracking-wide text-[#1A2C42] shadow-sm transition-colors hover:bg-[#eac459] hover:shadow-md motion-reduce:animate-none sm:px-5 sm:py-2.5 sm:text-sm"
            >
              Matricúlate aquí
            </Link>
            <MenuMovil />
          </div>
        </div>
      </header>
    </>
  )
}
