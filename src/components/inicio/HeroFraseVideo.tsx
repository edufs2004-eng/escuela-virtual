'use client'

import { useEffect, useRef, useState } from 'react'
import { Play, Volume2, VolumeX, X } from 'lucide-react'
import type { VideoSitio } from '@/config/sitio'

type Props = {
  frase: string
  video: VideoSitio | null
}

const claseFrase = 'text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl'
const claseBotonControl = 'absolute rounded-full bg-black/60 p-2 text-white transition-colors hover:bg-black/80'

// Frase principal del inicio. Si hay video configurado:
// 1. Al cargar, el video aparece "desde atrás" en el lugar de la frase y se reproduce (en silencio, como exigen los navegadores).
// 2. Al terminar, el video queda pequeño debajo de la frase y la frase vuelve al centro.
// 3. Al pulsar el video pequeño, se vuelve a reproducir en grande, con sonido.
export default function HeroFraseVideo({ frase, video }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [modo, setModo] = useState<'grande' | 'mini'>('mini')
  const [silenciado, setSilenciado] = useState(true)
  const src = video?.src ?? null

  useEffect(() => {
    const elemento = videoRef.current
    if (!src || !elemento) return
    // Si el sistema del visitante pide reducir el movimiento, no se reproduce solo.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    elemento.muted = true
    setSilenciado(true)
    setModo('grande')
    elemento.play().catch(() => setModo('mini'))
  }, [src])

  if (!video) {
    return <h1 className={claseFrase}>{frase}</h1>
  }

  const grande = modo === 'grande'

  const reproducir = () => {
    const elemento = videoRef.current
    if (!elemento) return
    elemento.currentTime = 0
    elemento.muted = false
    setSilenciado(false)
    setModo('grande')
    elemento.play().catch(() => {
      elemento.muted = true
      setSilenciado(true)
      elemento.play().catch(() => setModo('mini'))
    })
  }

  const cerrar = () => {
    videoRef.current?.pause()
    setModo('mini')
  }

  const alternarSonido = () => {
    const elemento = videoRef.current
    if (!elemento) return
    elemento.muted = !elemento.muted
    setSilenciado(elemento.muted)
  }

  return (
    <div className="flex flex-col items-center">
      <h1
        className={`${claseFrase} overflow-hidden transition-all duration-500 ease-out ${
          grande ? 'max-h-0 scale-90 opacity-0' : 'max-h-[40rem] scale-100 opacity-100'
        }`}
      >
        {frase}
      </h1>

      <div
        className={`relative w-full transition-all duration-700 ease-out ${
          grande ? 'max-w-3xl' : 'mt-6 max-w-44 sm:max-w-52'
        }`}
      >
        <video
          ref={videoRef}
          src={video.src}
          poster={video.poster ?? undefined}
          playsInline
          preload="metadata"
          onEnded={() => setModo('mini')}
          aria-label="Video de presentación del Colegio Virtual Esencia"
          className={`aspect-video w-full rounded-2xl bg-[#1A2C42] object-cover shadow-2xl ring-2 ring-white/60 ${
            grande ? 'animate-video-entrada' : ''
          }`}
        />

        {grande ? (
          <>
            <button
              type="button"
              onClick={alternarSonido}
              aria-label={silenciado ? 'Activar sonido' : 'Silenciar'}
              className={`${claseBotonControl} bottom-3 left-3`}
            >
              {silenciado ? (
                <VolumeX className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Volume2 className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
            <button
              type="button"
              onClick={cerrar}
              aria-label="Cerrar video"
              className={`${claseBotonControl} right-3 top-3`}
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={reproducir}
            aria-label="Reproducir video"
            className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/30 text-white transition-colors hover:bg-black/45"
          >
            <Play className="h-8 w-8" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  )
}
