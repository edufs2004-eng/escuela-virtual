import type { ComponentType } from 'react'
import { REDES_SOCIALES, WHATSAPP_URL, type RedSocialId } from '@/config/sitio'
import { IconoFacebook, IconoInstagram, IconoTikTok, IconoWhatsApp, IconoYouTube } from './IconosRedes'

const ICONOS: Record<RedSocialId, ComponentType<{ className?: string }>> = {
  instagram: IconoInstagram,
  facebook: IconoFacebook,
  tiktok: IconoTikTok,
  youtube: IconoYouTube,
}

const claseActiva =
  'inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/20'
const claseInactiva =
  'inline-flex cursor-not-allowed items-center gap-2 rounded-xl border border-slate-600 bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-400 opacity-70'

// Botones de acceso directo a redes sociales y WhatsApp (Zona 7, antes del formulario).
// Mientras una URL esté vacía en src/config/sitio.ts, su botón se muestra deshabilitado.
export default function BotonesRedes() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {REDES_SOCIALES.map((red) => {
        const Icono = ICONOS[red.id]
        return red.url ? (
          <a key={red.id} href={red.url} target="_blank" rel="noopener noreferrer" className={claseActiva}>
            <Icono className="h-5 w-5" />
            {red.nombre}
          </a>
        ) : (
          <button
            key={red.id}
            type="button"
            disabled
            aria-label={`${red.nombre} no disponible por ahora`}
            className={claseInactiva}
          >
            <Icono className="h-5 w-5" />
            {red.nombre} · Próximamente
          </button>
        )
      })}

      {WHATSAPP_URL ? (
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-bold text-[#1A2C42] transition-colors hover:bg-[#1ebe5a]"
        >
          <IconoWhatsApp className="h-5 w-5" />
          WhatsApp
        </a>
      ) : (
        <button
          type="button"
          disabled
          aria-label="WhatsApp no disponible; falta el enlace oficial"
          className={claseInactiva}
        >
          <IconoWhatsApp className="h-5 w-5" />
          WhatsApp · No disponible por ahora
        </button>
      )}
    </div>
  )
}
