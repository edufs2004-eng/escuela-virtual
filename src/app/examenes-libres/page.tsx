import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, ExternalLink } from 'lucide-react'
import Encabezado from '@/components/sitio/Encabezado'
import PieDePagina from '@/components/sitio/PieDePagina'

export const metadata: Metadata = {
  title: 'Exámenes libres | Colegio Virtual Esencia',
  description: 'Qué son los exámenes libres del MINEDUC, quiénes pueden rendirlos y cómo es el proceso.',
}

// Fuente oficial: Ayuda MINEDUC, ficha "Exámenes libres - menores de 18 años".
const AYUDA_MINEDUC_URL = 'https://www.ayudamineduc.cl/ficha/examenes-libres-menores-de-18-anos-11'

const PASOS = [
  {
    titulo: 'Inscripción',
    texto:
      'La realiza el padre, la madre o el tutor legal, dentro de los plazos que el MINEDUC publica cada año. El MINEDUC no acepta inscripciones hechas por instituciones.',
  },
  {
    titulo: 'Temarios',
    texto: 'Para cada curso, el MINEDUC publica un temario con los objetivos de aprendizaje que se evaluarán.',
  },
  {
    titulo: 'Rendición',
    texto:
      'Los exámenes se rinden en el establecimiento examinador que asigna el MINEDUC. De 1° a 4° básico se rinde una sola prueba; de 5° básico a IV medio, una prueba por asignatura, sin eximición de asignaturas.',
  },
  {
    titulo: 'Calendario',
    texto: 'Se pueden rendir exámenes de validación hasta dos veces al año, según el calendario oficial.',
  },
  {
    titulo: 'Resultado',
    texto: 'Al aprobar, el curso queda certificado por el MINEDUC.',
  },
]

const ASIGNATURAS = [
  { nivel: '1° a 4° básico', detalle: 'Una prueba global que integra las asignaturas del curso.' },
  {
    nivel: '5° básico a II medio',
    detalle:
      'Lenguaje y Comunicación o Lengua y Literatura (según el curso), Matemática, Ciencias Naturales, Historia, Geografía y Ciencias Sociales, e Inglés.',
  },
  {
    nivel: 'III y IV medio',
    detalle:
      'Lengua y Literatura, Matemática, Ciencias para la Ciudadanía, Filosofía, Educación Ciudadana e Inglés.',
  },
]

const claseBloque = 'space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8'
const claseTitulo = 'text-xl font-bold text-[#1A2C42] sm:text-2xl'
const claseTexto = 'text-sm leading-relaxed text-[#667A8A] sm:text-base'

export default function ExamenesLibresPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#EAF2F8] font-sans text-[#1A2C42]">
      <Encabezado />

      <main className="flex-1">
        <section className="bg-gradient-to-b from-[#4B8ECB] to-[#1A2C42] px-4 py-16 text-center text-white sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl space-y-4">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">Exámenes libres del MINEDUC</h1>
            <p className="text-lg text-blue-50">Qué son, quiénes pueden rendirlos y cómo es el proceso.</p>
          </div>
        </section>

        <div className="mx-auto max-w-3xl space-y-6 px-4 py-16 sm:px-6 lg:px-8">
          <article className={claseBloque}>
            <h2 className={claseTitulo}>¿Qué son?</h2>
            <p className={claseTexto}>
              Los exámenes libres, llamados oficialmente exámenes de validación de estudios, permiten certificar un curso de
              enseñanza básica o media cuando el estudiante no asiste a un colegio del sistema regular. Si el estudiante
              aprueba, el Ministerio de Educación (MINEDUC) certifica el curso rendido.
            </p>
          </article>

          <article className={claseBloque}>
            <h2 className={claseTitulo}>¿Quiénes pueden rendirlos?</h2>
            <p className={claseTexto}>
              Niños, niñas y jóvenes menores de 18 años que no realizan estudios regulares o que los interrumpieron. Los
              estudiantes con necesidades educativas especiales (NEE) también pueden rendirlos. El MINEDUC fija una edad
              mínima para cada curso.
            </p>
          </article>

          <article className={claseBloque}>
            <h2 className={claseTitulo}>¿Cómo es el proceso?</h2>
            <ol className="space-y-3">
              {PASOS.map((paso, indice) => (
                <li key={paso.titulo} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F5D372] text-sm font-bold text-[#1A2C42]">
                    {indice + 1}
                  </span>
                  <p className={claseTexto}>
                    <strong className="text-[#1A2C42]">{paso.titulo}:</strong> {paso.texto}
                  </p>
                </li>
              ))}
            </ol>
          </article>

          <article className={claseBloque}>
            <h2 className={claseTitulo}>¿Qué asignaturas se evalúan?</h2>
            <ul className="space-y-3">
              {ASIGNATURAS.map((fila) => (
                <li key={fila.nivel} className={claseTexto}>
                  <strong className="text-[#1A2C42]">{fila.nivel}:</strong> {fila.detalle}
                </li>
              ))}
            </ul>
          </article>

          <article className={claseBloque}>
            <h2 className={claseTitulo}>¿Cómo te acompaña Esencia?</h2>
            <p className={claseTexto}>
              Esencia es una institución privada que prepara y acompaña a sus estudiantes para rendir estos exámenes. La
              inscripción, la aplicación de las pruebas y la certificación corresponden al MINEDUC. Nuestro trabajo es que
              cada estudiante llegue preparado: clases en vivo, material disponible 24/7, ensayos periódicos, seguimiento de
              su avance y orientación permanente a la familia.
            </p>
          </article>

          <p className="text-xs leading-relaxed text-[#667A8A]">
            Información referencial basada en Ayuda MINEDUC. Revisa siempre los requisitos, plazos y temarios vigentes en el
            sitio oficial.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row">
            <a
              href={AYUDA_MINEDUC_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl border border-[#5B9CD8] bg-white px-6 py-3.5 font-semibold text-[#1A2C42] transition-colors hover:bg-[#EAF2F8]"
            >
              Ver información oficial en Ayuda MINEDUC
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
            <Link
              href="/matricula"
              className="flex items-center justify-center gap-2 rounded-xl bg-[#F5D372] px-6 py-3.5 font-bold text-[#1A2C42] shadow-md transition-all hover:bg-[#eac459] hover:shadow-lg"
            >
              Selecciona tu horario <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </main>

      <PieDePagina />
    </div>
  )
}
