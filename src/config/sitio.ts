// Valores del sitio público que entrega la dirección del colegio.
// Para cambiar logo, videos, foto, años o redes sociales, edita SOLO este archivo.

export type VideoSitio = {
  /** Ruta dentro de public/, por ejemplo '/videos/inicio.mp4' */
  src: string
  /** Imagen que se ve antes de reproducir, por ejemplo '/videos/inicio.jpg'. null = sin imagen. */
  poster: string | null
}

/** Logo del encabezado: 'v1' = letras ESENCIA azul claro; 'v2' = letras ESENCIA azul oscuro. */
export const LOGO_VARIANTE: 'v1' | 'v2' = 'v1'

/** Video que reemplaza la frase del inicio. null = se muestra solo la frase. */
export const VIDEO_INICIO: VideoSitio | null = null

/** Video de la directora (recuadro derecho de "Plan académico"). null = recuadro "Próximamente". */
export const VIDEO_DIRECTORA: VideoSitio | null = null

/** Foto de Lila Castro recibiendo su título, dentro de public/ (ej. '/images/lila-castro-titulo.jpg'). null = recuadro "pendiente". */
export const FOTO_LILA_CASTRO: string | null = null

/** Años de nacimiento y defunción de Lila Castro, por ejemplo '1930–2015'. Vacío = no se muestran. */
export const LILA_CASTRO_ANIOS: string = ''

export type RedSocialId = 'instagram' | 'facebook' | 'tiktok' | 'youtube'

/** Redes sociales. URL vacía = botón deshabilitado "Próximamente". */
export const REDES_SOCIALES: { id: RedSocialId; nombre: string; url: string }[] = [
  { id: 'instagram', nombre: 'Instagram', url: '' },
  { id: 'facebook', nombre: 'Facebook', url: '' },
  { id: 'tiktok', nombre: 'TikTok', url: '' },
  { id: 'youtube', nombre: 'YouTube', url: '' },
]

/** Enlace oficial de WhatsApp, por ejemplo 'https://wa.me/56912345678'. Vacío = botón deshabilitado. */
export const WHATSAPP_URL: string = ''

/** Pestañas del menú, en el orden pedido por la dirección. */
export const ENLACES_MENU = [
  { texto: 'Propuesta', href: '/#propuesta' },
  { texto: 'Programa Especial NEE', href: '/#inclusion' },
  { texto: 'Plan Académico', href: '/#oferta' },
  { texto: 'Aranceles', href: '/#precios' },
  { texto: 'Contacto', href: '/#contacto' },
] as const
