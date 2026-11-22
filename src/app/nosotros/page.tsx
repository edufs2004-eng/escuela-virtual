import type { Metadata } from 'next'
import Image from 'next/image'
import Encabezado from '@/components/sitio/Encabezado'
import PieDePagina from '@/components/sitio/PieDePagina'
import { DIRECTORA, MISION, PROFESORES, VALORES, VISION, type MiembroEquipo } from '@/config/nosotros'

export const metadata: Metadata = {
  title: 'Misión, visión y equipo | Colegio Virtual Esencia',
  description: 'Misión, visión y valores del Colegio Virtual Esencia, y el equipo que acompaña a sus estudiantes.',
}

const PENDIENTE = 'Pronto publicaremos esta información.'

const claseBloque = 'space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8'
const claseTitulo = 'text-xl font-bold text-[#1A2C42] sm:text-2xl'
const claseTexto = 'text-sm leading-relaxed text-[var(--brand-subtext)] sm:text-base'

function TarjetaMiembro({ miembro }: { miembro: MiembroEquipo }) {
  return (
    <article className="flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-xs">
      {miembro.foto ? (
        <Image
          src={miembro.foto}
          alt={miembro.nombre}
          width={320}
          height={320}
          className="h-32 w-32 rounded-full object-cover"
        />
      ) : (
        <div
          className="flex h-32 w-32 items-center justify-center rounded-full bg-[#EAF2F8] text-3xl font-bold text-[#4B8ECB]"
          aria-hidden="true"
        >
          {miembro.nombre.charAt(0)}
        </div>
      )}
      <div>
        <h4 className="text-lg font-bold text-[#1A2C42]">{miembro.nombre}</h4>
        <p className="text-sm font-semibold text-[#4B8ECB]">{miembro.cargo}</p>
      </div>
      <p className="text-sm leading-relaxed text-[var(--brand-subtext)]">{miembro.descripcion}</p>
    </article>
  )
}

export default function NosotrosPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#EAF2F8] font-sans text-[#1A2C42]">
      <Encabezado />

      <main className="flex-1">
        <section className="bg-gradient-to-b from-[#4B8ECB] to-[#1A2C42] px-4 py-16 text-center text-white sm:px-6 lg:px-8">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">Misión, visión, valores y equipo</h1>
        </section>

        <div className="mx-auto max-w-5xl space-y-8 px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2">
            <article className={claseBloque}>
              <h2 className={claseTitulo}>Misión</h2>
              <p className={claseTexto}>{MISION || PENDIENTE}</p>
            </article>
            <article className={claseBloque}>
              <h2 className={claseTitulo}>Visión</h2>
              <p className={claseTexto}>{VISION || PENDIENTE}</p>
            </article>
          </div>

          <article className={claseBloque}>
            <h2 className={claseTitulo}>Valores</h2>
            {VALORES.length > 0 ? (
              <ul className="grid gap-4 md:grid-cols-2">
                {VALORES.map((valor) => (
                  <li key={valor.nombre} className={claseTexto}>
                    <strong className="text-[#1A2C42]">{valor.nombre}:</strong> {valor.descripcion}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={claseTexto}>{PENDIENTE}</p>
            )}
          </article>

          <section className="space-y-6">
            <h2 className={`${claseTitulo} text-center`}>Nuestro equipo</h2>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#4B8ECB]">Directora</h3>
              {DIRECTORA ? (
                <div className="max-w-sm">
                  <TarjetaMiembro miembro={DIRECTORA} />
                </div>
              ) : (
                <p className={claseTexto}>{PENDIENTE}</p>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#4B8ECB]">Profesores</h3>
              {PROFESORES.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {PROFESORES.map((profesor) => (
                    <TarjetaMiembro key={profesor.nombre} miembro={profesor} />
                  ))}
                </div>
              ) : (
                <p className={claseTexto}>{PENDIENTE}</p>
              )}
            </div>
          </section>
        </div>
      </main>

      <PieDePagina />
    </div>
  )
}
