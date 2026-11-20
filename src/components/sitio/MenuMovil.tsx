'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { ENLACES_MENU } from '@/config/sitio'

// Menú desplegable para pantallas menores a 1280 px, donde no caben las pestañas junto al logo.
export default function MenuMovil() {
  const [abierto, setAbierto] = useState(false)

  return (
    <div className="relative xl:hidden">
      <button
        type="button"
        onClick={() => setAbierto((valor) => !valor)}
        aria-expanded={abierto}
        aria-controls="menu-movil"
        aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'}
        className="rounded-xl p-2 text-[#1A2C42] transition-colors hover:bg-[#EAF2F8]"
      >
        {abierto ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
      </button>

      {abierto && (
        <nav
          id="menu-movil"
          aria-label="Menú principal"
          className="absolute right-0 top-full z-50 mt-3 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl"
        >
          {ENLACES_MENU.map((enlace) => (
            <a
              key={enlace.href}
              href={enlace.href}
              onClick={() => setAbierto(false)}
              className="block rounded-xl px-4 py-3 text-sm font-semibold text-[#1A2C42] transition-colors hover:bg-[#EAF2F8] hover:text-[#4B8ECB]"
            >
              {enlace.texto}
            </a>
          ))}
          <Link
            href="/login"
            onClick={() => setAbierto(false)}
            className="mt-1 block rounded-xl border-t border-slate-100 px-4 py-3 text-sm font-bold text-[#667A8A] transition-colors hover:bg-[#EAF2F8] hover:text-[#4B8ECB]"
          >
            Acceso Alumnos
          </Link>
        </nav>
      )}
    </div>
  )
}
