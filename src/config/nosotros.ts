// Contenido de la página /nosotros. Lo entrega la dirección del colegio.
// Mientras un valor esté vacío, la página muestra "Pronto publicaremos esta información."

export type MiembroEquipo = {
  nombre: string
  cargo: string
  descripcion: string
  /** Ruta dentro de public/, por ejemplo '/images/equipo/directora.jpg'. null = se muestra la inicial del nombre. */
  foto: string | null
}

export const MISION: string = ''

export const VISION: string = ''

export const VALORES: { nombre: string; descripcion: string }[] = []

export const DIRECTORA: MiembroEquipo | null = null

export const PROFESORES: MiembroEquipo[] = []
