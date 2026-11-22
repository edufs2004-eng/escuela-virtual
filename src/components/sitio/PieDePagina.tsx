import Link from 'next/link'

export default function PieDePagina() {
  return (
    <footer className="border-t border-slate-800 bg-[#1A2C42] px-4 py-8 text-center text-xs text-[var(--brand-subtext)]">
      <nav
        aria-label="Más información"
        className="mb-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-semibold text-slate-300"
      >
        <Link href="/examenes-libres" className="transition-colors hover:text-white">
          Exámenes libres
        </Link>
        <Link href="/nosotros" className="transition-colors hover:text-white">
          Misión, visión y equipo
        </Link>
      </nav>
      <p>© 2027 Colegio Virtual Esencia. Todos los derechos reservados.</p>
    </footer>
  )
}
