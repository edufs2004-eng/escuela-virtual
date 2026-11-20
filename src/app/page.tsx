import Image from 'next/image'
import Link from 'next/link'
import {
  BookOpenCheck,
  ChevronDown,
  ChevronRight,
  Clock,
  GraduationCap,
  HeartHandshake,
  MessageCircle,
  Play,
  ShieldCheck,
  Smile,
  Sparkles,
  Users,
} from 'lucide-react'
import logoTexto from '@/assets/Logo_2.webp'
import HeroFraseVideo from '@/components/inicio/HeroFraseVideo'
import BotonesRedes from '@/components/sitio/BotonesRedes'
import Encabezado from '@/components/sitio/Encabezado'
import PieDePagina from '@/components/sitio/PieDePagina'
import {
  FOTO_LILA_CASTRO,
  LILA_CASTRO_ANIOS,
  VIDEO_DIRECTORA,
  VIDEO_INICIO,
} from '@/config/sitio'

const TARJETAS_NEE = [
  {
    titulo: 'Acompañamiento personalizado',
    texto:
      'Orientación y seguimiento, con acompañamiento especializado desde primero básico a cuarto medio. Contamos con psicopedagoga y educadora diferencial.',
    Icono: HeartHandshake,
    colorIcono: 'text-[#5B9CD8]',
  },
  {
    titulo: 'Grupos Pequeños, entorno seguro y libre de sobreestímulos',
    texto:
      'Máximo 15 alumnos por clase en vivo. La modalidad online reduce la ansiedad social y las barreras sensoriales del aula tradicional, además nuestras clases duran 45 minutos, que es lo recomendado por especialistas en neuroeducación y atención. Permitiendo que niños y jóvenes se concentren y desarrollen su forma de aprender en un espacio de confianza.',
    Icono: Users,
    colorIcono: 'text-[#71C997]',
  },
  {
    titulo: 'Metodologías activas y flexibles',
    texto:
      'Aplicamos principios de Diseño Universal para el Aprendizaje (DUA) material visual e interactivo y apoyo pedagógico constante.',
    Icono: BookOpenCheck,
    colorIcono: 'text-[#5B9CD8]',
  },
  {
    titulo: 'Alianza con la familia',
    texto:
      'Sabemos lo importante que es el apoyo de la familia y por eso les entregamos retroalimentación periódica y estamos en constante comunicación con los apoderados.',
    Icono: MessageCircle,
    colorIcono: 'text-[#71C997]',
  },
]

const ARANCELES = [
  { nivel: '1° a 4° básico', matricula: '$75.000', arancel: '$600.000' },
  { nivel: '5° básico a IV medio', matricula: '$95.000', arancel: '$750.000' },
]

const NIVELES = [
  '1° Básico',
  '2° Básico',
  '3° Básico',
  '4° Básico',
  '5° Básico',
  '6° Básico',
  '7° Básico',
  '8° Básico',
  'I Medio',
  'II Medio',
  'III Medio',
  'IV Medio',
]

const claseCuadro =
  'space-y-5 rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xs transition-shadow duration-300 hover:shadow-xl sm:p-10'
const claseTextoCuadro = 'space-y-4 text-sm leading-relaxed text-[#667A8A] sm:text-base'
const claseItemPlan = 'rounded-2xl border border-[#5B9CD8]/30 bg-[#EAF2F8] p-5'
const claseCampo =
  'w-full bg-[#EAF2F8] border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B9CD8] transition-all'

export default function Home() {

  return (
    <div className="min-h-screen bg-[#EAF2F8] text-[#1A2C42] flex flex-col font-sans selection:bg-[#71C997] selection:text-white">
      <Encabezado />

      {/* Zona 2: Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#4B8ECB] to-[#1A2C42] px-4 py-24 text-center text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-6 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/20 px-4 py-1.5 text-xs font-semibold text-white shadow-xs backdrop-blur-md">
            <Sparkles className="h-4 w-4 text-[#F5D372]" aria-hidden="true" />
            <span>Educación flexible, con estructura</span>
          </div>

          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-blue-50 sm:text-xl">
            Podrás elegir el horario de clases en vivo que más te acomode, con metas definidas, ensayos periódicos y
            material a tu disposición 24/7.
          </p>

          <HeroFraseVideo frase="Cada estudiante es único, su forma de aprender también" video={VIDEO_INICIO} />

          <Link
            href="/examenes-libres"
            className="mx-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-[#F5D372]/60 bg-[#F5D372]/15 px-5 py-3 text-xl font-bold leading-tight text-[#F5D372] shadow-lg transition-all hover:bg-[#F5D372]/25 hover:text-white sm:px-7 sm:py-4 sm:text-2xl"
          >
            PREPARACIÓN PARA EXÁMENES LIBRES DEL MINEDUC
            <ChevronRight className="h-6 w-6 shrink-0" aria-hidden="true" />
          </Link>

          <p className="mx-auto max-w-2xl text-base leading-relaxed text-blue-50 sm:text-lg">
            Máximo 15 estudiantes por curso, nivelación académica, talleres formativos y PAES matemática y lenguaje para
            3 y 4 medios, acompañamiento docente continuo.
          </p>

          <div className="flex flex-col justify-center gap-4 pt-4 sm:flex-row">
            <Link
              href="/matricula"
              className="bg-[#F5D372] hover:bg-[#eac459] text-[#1A2C42] font-bold px-7 py-3.5 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2"
            >
              Selecciona tu horario <ChevronRight className="w-5 h-5" aria-hidden="true" />
            </Link>
            <a
              href="#oferta"
              className="bg-white/10 hover:bg-white/20 text-white border border-white/30 font-semibold px-7 py-3.5 rounded-xl transition-all hover:-translate-y-0.5"
            >
              Ver Plan Académico
            </a>
          </div>
        </div>
      </section>

      {/* Zona 3 (blanca): Programa Especial NEE */}
      <section id="inclusion" className="scroll-mt-32 border-y border-slate-200/80 bg-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="mx-auto max-w-3xl space-y-6 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#71C997]/40 bg-[#71C997]/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#1A2C42]">
              <Smile className="h-4 w-4 text-[#71C997]" aria-hidden="true" />
              Entorno Seguro
            </span>
            <h2 className="text-3xl font-bold text-[#1A2C42] sm:text-4xl">
              Educación adaptada para necesidades educativas especiales (NEE)
            </h2>
            <p className="leading-relaxed text-[#667A8A]">
              Sabemos que cada estudiante aprende a su propio ritmo. Nuestro colegio promueve un entorno educativo que se
              adapta a tus necesidades, en un ambiente respetuoso.
            </p>

          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {TARJETAS_NEE.filter((_, indice) => indice !== 1).map((tarjeta, indice) => (
              <article
                key={tarjeta.titulo}
                className={`flex items-start gap-4 rounded-2xl border p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                  indice === 0
                    ? 'border-[#4B8ECB]/60 bg-[#1A2C42] text-white'
                    : indice === 1
                    ? 'border-[#4B8ECB]/50 bg-[#4B8ECB]/10'
                    : 'border-[#71C997]/50 bg-white'
                }`}
              >
                <tarjeta.Icono
                  className={`mt-0.5 h-6 w-6 shrink-0 ${
                    indice === 0 ? 'text-[#71C997]' : tarjeta.colorIcono
                  }`}
                  aria-hidden="true"
                />
                <div>
                  <h3 className={`text-base font-bold ${indice === 0 ? 'text-[#F5D372]' : 'text-[#1A2C42]'}`}>
                    {tarjeta.titulo}
                  </h3>
                  <p className={`mt-1 text-sm leading-relaxed ${indice === 0 ? 'text-slate-300' : 'text-[#667A8A]'}`}>
                    {tarjeta.texto}
                  </p>
                </div>
              </article>
            ))}

            <article className="relative flex items-start gap-4 overflow-hidden rounded-2xl border border-[#4B8ECB]/60 bg-[#1A2C42] p-5 text-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-[#5B9CD8]/20 blur-2xl" aria-hidden="true"></div>
              <HeartHandshake className="relative mt-0.5 h-6 w-6 shrink-0 text-[#71C997]" aria-hidden="true" />
              <div className="relative">
                <h3 className="text-base font-bold text-[#F5D372]">Acompañamiento integral</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-300">
                  Fomentamos la autonomía del estudiante garantizando canales directos de comunicación con los profesores y el
                  área psicoeducativa, previniendo el desbalance académico antes de que se convierta en un problema.
                </p>
              </div>
            </article>
          </div>

          {TARJETAS_NEE.filter((_, indice) => indice === 1).map((tarjeta) => (
            <article
              key={tarjeta.titulo}
              className="flex items-start gap-4 rounded-2xl border border-[#4B8ECB]/60 bg-[#4B8ECB]/10 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <tarjeta.Icono className={`mt-0.5 h-6 w-6 shrink-0 ${tarjeta.colorIcono}`} aria-hidden="true" />
              <div>
                <h3 className="text-base font-bold text-[#1A2C42]">{tarjeta.titulo}</h3>
                <p className="mt-1 text-sm leading-relaxed text-[#667A8A]">{tarjeta.texto}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Zona 3 (azul): ¿Cómo nace Esencia? */}
      <section id="historia" className="scroll-mt-32 bg-[#EAF2F8] px-4 py-16 sm:px-6 lg:px-8">
        <details className="group mx-auto max-w-7xl rounded-3xl bg-[#2E6DA4] px-5 py-5 text-white shadow-xl sm:px-8 sm:py-6 lg:px-10">
          <summary className="flex cursor-pointer list-none flex-col items-center justify-center gap-3 text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">¿Cómo nace Esencia?</h2>
            <p className="max-w-3xl text-sm leading-relaxed text-blue-50 sm:text-base">
              El colegio virtual Esencia nace para llevar a los hogares de los niños y jóvenes de Chile una forma de
              enseñar humana, cálida y única. Esta mirada proviene de los años de experiencia y vocación que nos heredó en
              aulas y clases particulares la profesora normalista y fonoaudióloga <strong>Lila Castro</strong>.
            </p>
            <ChevronDown
              className="h-6 w-6 shrink-0 transition-transform duration-300 group-open:rotate-180"
              aria-hidden="true"
            />
          </summary>

          <div className="mt-6 border-t border-white/20 pt-6">
            <div className="grid items-start gap-6 lg:grid-cols-5">
            <div className="space-y-4 lg:col-span-2">
              <figure className="space-y-3">
                {FOTO_LILA_CASTRO ? (
                  <Image
                    src={FOTO_LILA_CASTRO}
                    alt="Lila Castro recibiendo su título de Fonoaudiología en diciembre de 1958"
                    width={1200}
                    height={900}
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="h-auto w-full rounded-lg border-4 border-white shadow-xl"
                  />
                ) : (
                  <div className="flex aspect-[4/3] w-full items-center justify-center rounded-lg border-4 border-white/70 bg-white/10 p-6 text-center text-sm text-white/90 shadow-xl">
                    Foto de Lila Castro recibiendo su título (pendiente)
                  </div>
                )}
                <figcaption className="text-sm italic leading-relaxed text-white/90">
                  Lila Castro recibiendo el primer título de Fonoaudiología en Chile (diciembre de 1958, Universidad de
                  Chile) de manos del decano de la Facultad de Medicina, Dr. Hernán Alessandri Rodríguez, junto a la cohorte
                  fundacional de 21 profesoras normalistas.
                </figcaption>
              </figure>
              <p className="text-sm font-semibold text-white">
                En reconocimiento de la trayectoria de Lila Yolanda Castro Gárate
                {LILA_CASTRO_ANIOS ? ` (${LILA_CASTRO_ANIOS})` : ''}
              </p>
            </div>

            <div className="space-y-3 leading-relaxed text-white lg:col-span-3">
              <h3 className="pt-1 text-xl font-bold text-[#F5D372] sm:text-2xl">
                Su legado: ciencia y dedicación al servicio del aprendizaje
              </h3>

              <p>
                Lila inició su camino como profesora normalista, ejerciendo durante más de cinco años en el sistema escolar,
                en una escuelita rural del sur de Chile.
              </p>
              <p>
                En abril de 1956, tras una rigurosa selección impulsada por la Facultad de Medicina de la Universidad de
                Chile y el Ministerio de Educación, integró la cohorte fundacional de 21 maestras que cursaron el primer
                programa de Fonoaudiología del país, egresando en diciembre de 1958 como una de las primeras especialistas de
                Chile en voz, habla, lenguaje y audición.
              </p>
              <p>
                Durante la década de 1960 formó parte del equipo clínico pionero del Hospital Clínico José Joaquín Aguirre y
                participó en la organización de la Sociedad Chilena de Fonoaudiología.
              </p>
              <p>
                Convencida de la necesidad de profesionalizar la disciplina, impulsó junto a colegas y médicos
                otorrinolaringólogos el proyecto que dio vida a la carrera universitaria de Fonoaudiología en la Universidad
                de Chile en marzo de 1972. Tras defender la continuidad de la escuela en tiempos complejos, su persistencia
                ayudó a concretar su reapertura definitiva el <strong>22 de noviembre de 1974</strong>, fecha que hoy se
                conmemora en todo el país como el <strong>Día Nacional del Fonoaudiólogo y la Fonoaudióloga.</strong>
              </p>
              <p>
                En la segunda mitad de su carrera, unió su base pedagógica normalista con su formación clínica para diseñar
                metodologías directas dirigidas a niños y niñas con trastornos específicos del aprendizaje y dificultades
                escolares, dejando un aporte precursor para la psicopedagogía clínica y la educación diferencial en Chile.
              </p>

              <blockquote className="border-l-4 border-[#F5D372] pl-4 text-base italic">
                “La certeza de que no existen los malos estudiantes es el fruto del arduo trabajo de personas que, como ella,
                dedicaron su vida a despertar y potenciar las capacidades de otros”.
              </blockquote>
            </div>
            </div>

            {/* Cierre con la frase del logo, sin el dibujo */}
            <div className="mt-8 flex justify-center">
              <div className="rounded-2xl bg-white px-6 py-3 shadow-lg">
                <Image
                  src={logoTexto}
                  alt="Esencia, Colegio Virtual: Tu camino, guiado por nuestra experiencia"
                  className="h-14 w-auto sm:h-16"
                />
              </div>
            </div>
          </div>
        </details>
      </section>

      {/* Zona 4 (franja celestita): Nuestra Propuesta */}
      <section id="propuesta" className="scroll-mt-32 bg-[#EAF2F8] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-16 max-w-3xl space-y-3 text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-[#4B8ECB]">Nuestra Propuesta</span>
            <h2 className="text-3xl font-bold text-[#1A2C42]">¿Por qué elegir el colegio virtual Esencia?</h2>
            <p className="text-[#667A8A]">
              Integramos la flexibilidad del entorno digital con la calidez y estructura del acompañamiento pedagógico
              humano.
            </p>
          </div>

          <div className="mx-auto max-w-5xl space-y-6">
            {/* Cuadro 1 */}
            <article className={`${claseCuadro} border-[#5B9CD8]/50 bg-gradient-to-br from-white to-[#EAF2F8] p-6 sm:p-8`}>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#71C997]/20 text-[#71C997]">
                  <GraduationCap className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold text-[#1A2C42] sm:text-2xl">Alternativa al sistema tradicional</h3>
              </div>
              <div className={claseTextoCuadro}>
                <p>
                  El sistema tradicional presencial está colapsado: faltan cupos y el trayecto a la escuela suele ser un
                  momento de preocupación para las familias.
                </p>
                <p>
                  Muchos alumnos enfrentan bullying, desmotivación, ansiedad, rigidez escolar, sumado a una enseñanza que no
                  va al ritmo de su aprendizaje, horas de tiempo muerto, profesores ausentes y atraso en los contenidos
                  exigidos por el currículum del MINEDUC.
                </p>
                <p>
                  Esto refleja el estrés de un modelo que no ha logrado adaptarse a las nuevas realidades ni prepararlos para
                  el presente y el futuro.
                </p>
                <p>
                  En Esencia creemos que la educación debe brindar herramientas que les permitan desarrollar las habilidades
                  necesarias y el pensamiento crítico suficiente para integrar el conocimiento ilimitado que esta era puso a
                  disposición de nuestros niños y jóvenes.
                </p>
                <p>
                  Nuestra metodología de trabajo fomenta desde pequeños la capacidad de ser autodidactas, dentro de una
                  estructura guiada por los mejores profesionales.
                </p>
                <p>No es solo aprobar exámenes, es educación real y estructurada.</p>
              </div>
            </article>

            {/* Cuadro 2 */}
            <article
              className={`${claseCuadro} border-[#5B9CD8]/50 bg-gradient-to-br from-white to-[#EAF2F8] p-6 sm:p-8`}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F5D372]/30 text-[#1A2C42]">
                  <Clock className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold text-[#1A2C42] sm:text-2xl">Flexibilidad curricular y talleres</h3>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-[#667A8A] sm:text-base">
                <div className="space-y-2 rounded-xl border-l-4 border-[#71C997] bg-white/80 px-5 py-4">
                  <p>
                    <strong className="text-[#1A2C42]">Nuestro colegio se adapta a ti:</strong> Modelo innovador de
                    flexibilidad real con una malla dinámica, que te permite ajustar tu carga académica a tu propio ritmo de
                    vida.
                  </p>
                  <p>
                    Es ideal si eres deportista, artista o si tu familia tiene jornadas variables, trabajos por turnos o
                    agendas dinámicas.
                  </p>
                </div>

                <div className="grid gap-3 pt-1 md:grid-cols-2">
                  <div className="rounded-2xl border border-[#5B9CD8]/30 bg-[#EAF2F8]/60 p-4 sm:p-5">
                    <h4 className="mb-3 font-bold text-[#1A2C42]">Tu estudio, a tu ritmo:</h4>
                    <ul className="list-none space-y-3">
                      <li className="border-l-2 border-[#5B9CD8]/50 pl-3">
                        <strong className="text-[#1A2C42]">Elige tus horarios (5° básico a IV medio):</strong> Combina clases
                        en vivo en bloques de mañana o de tarde según tu semana, sin quedar atado a una sola jornada. Si un
                        día no puedes conectarte, la clase queda grabada en tu plataforma.
                      </li>
                      <li className="border-l-2 border-[#5B9CD8]/50 pl-3">
                        <strong className="text-[#1A2C42]">Para los más pequeños (1° a 4° básico):</strong> Clases en vivo
                        en jornada fija de mañana, material interactivo 24/7 y acompañamiento docente y psicopedagógico
                        permanente.
                      </li>
                      <li className="border-l-2 border-[#5B9CD8]/50 pl-3">
                        <strong className="text-[#1A2C42]">Clases dinámicas:</strong> Máximo 15 estudiantes por grupo, en
                        sesiones de 45 minutos, tiempo recomendado según estudios de atención y neuroeducación, para que
                        aproveches cada minuto.
                      </li>
                      <li className="border-l-2 border-[#5B9CD8]/50 pl-3">
                        <strong className="text-[#1A2C42]">Nunca te quedas con dudas:</strong> Tienes una hora diaria de
                        consultas en vivo de lunes a viernes con tus profesores, además de mensajería directa fuera de
                        horario.
                      </li>
                      <li className="border-l-2 border-[#5B9CD8]/50 pl-3">
                        <strong className="text-[#1A2C42]">Un plan hecho para ti:</strong> Arma tu ruta de estudio junto a
                        nuestros especialistas, respetando tus intereses y rutinas fuera de la pantalla.
                      </li>
                    </ul>
                  </div>
                  <div className="rounded-2xl border border-[#71C997]/40 bg-[#71C997]/10 p-4 sm:p-5">
                    <h4 className="mb-3 font-bold text-[#1A2C42]">Prepárate para hoy y para el futuro:</h4>
                    <ul className="list-none space-y-3">
                      <li className="border-l-2 border-[#71C997]/70 pl-3">
                        <strong className="text-[#1A2C42]">Base académica sólida:</strong> Nivelación inicial en las materias
                        del MINEDUC para exámenes libres, inglés en todos los niveles y reforzamiento PAES en Matemática y
                        Competencia Lectora.
                      </li>
                      <li className="border-l-2 border-[#71C997]/70 pl-3">
                        <strong className="text-[#1A2C42]">Talleres para la vida (5° básico a IV medio):</strong> Filosofía,
                        educación cívica, lectura y redacción, tecnología e inteligencia artificial, finanzas personales,
                        administración empresarial, debate y oratoria.
                      </li>
                    </ul>
                  </div>
                </div>

                <p className="rounded-xl border-l-4 border-[#71C997] bg-white/80 p-4 font-medium text-[#1A2C42]">
                  En Esencia no solo nos adaptamos a tu horario, te entregamos herramientas reales para que descubras todo
                  lo que eres capaz de lograr.
                </p>
              </div>
            </article>

            {/* Cuadro 3 */}
            <article
              className={`${claseCuadro} border-[#4B8ECB]/50 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-xl motion-reduce:transform-none`}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#5B9CD8]/20 text-[#5B9CD8]">
                  <ShieldCheck className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold text-[#1A2C42] sm:text-2xl">Acompañamiento permanente y estructura clara</h3>
              </div>
              <div className={claseTextoCuadro}>
                <p>Desarrollamos una plataforma tecnológica integrada para apoderados y alumnos.</p>
                <p>
                  La mayoría de los alumnos que intentan preparar exámenes libres por su cuenta, abandonan o reprueban. Esto
                  suele generar ansiedad en los apoderados por el miedo a que los niños queden &quot;atrasados&quot; o sin
                  guía escolar.
                </p>
                <p>
                  Estar en un espacio digital no significa estar solo, en Esencia apoyamos a nuestros estudiantes y a sus
                  familias para que cuenten con material actualizado, orientación permanente de nuestro equipo docente y el
                  contenido que deben estudiar claro desde el inicio.
                </p>
                <p>
                  Tendrán acceso a guías, videos, clases en vivo y grabadas, evaluaciones periódicas, reforzamiento,
                  seguimiento de avances personalizado, informes mensuales a los padres y acompañamiento pedagógico.
                </p>
                <p>
                  Nosotros sabemos cómo preparar a los estudiantes para sus exámenes libres, brindándoles, además, las
                  herramientas para que nunca dejen de explorar el conocimiento. Porque creemos que, con el apoyo y la
                  motivación adecuados, el estudio deja de ser una obligación y se convierte en el impulso que les permite
                  desarrollar su autonomía y alcanzar su máximo potencial.
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Zona 5: franja de título "Plan académico" + recuadro derecho con el video de la directora */}
      <section id="oferta" className="scroll-mt-32 bg-white">
        <div className="bg-[#4B8ECB] px-4 py-8 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white">Plan académico</h2>
        </div>

        <div className="mx-auto grid max-w-7xl items-start gap-10 px-4 py-16 sm:px-6 lg:grid-cols-5 lg:px-8">
          <div className="space-y-5 leading-relaxed text-[#667A8A] lg:col-span-3">
            <p>
              Desarrollamos todos los contenidos exigidos por el currículum oficial del MINEDUC desde{' '}
              <strong className="text-[#1A2C42]">1° básico hasta IV medio</strong>, combinando estructura, acompañamiento
              docente y autonomía real.
            </p>
            <p>
              <strong className="text-[#1A2C42]">Matemática, Comprensión Lectora, Ciencias, Historia e Inglés</strong> en
              todos los niveles.
            </p>

            <ul className="space-y-4 text-sm sm:text-base">
              <li className={`${claseItemPlan} relative overflow-hidden`}>
                <BookOpenCheck className="pointer-events-none absolute -bottom-2 right-3 h-16 w-16 text-[#5B9CD8]/15" aria-hidden="true" />
                <div className="relative z-10">
                  <strong className="text-[#1A2C42]">Clases en vivo con propósito</strong> (1 sesión semanal por
                  asignatura): No buscamos que los estudiantes pasen horas frente a la pantalla cumpliendo horario. Nuestras
                  clases en vivo están diseñadas como instancias estratégicas de guía, resolución de dudas y profundización,
                  complementadas con material interactivo y seguimiento continuo en nuestra plataforma.
                </div>
              </li>
              <li className={`${claseItemPlan} relative overflow-hidden`}>
                <Clock className="pointer-events-none absolute -bottom-2 right-3 h-16 w-16 text-[#71C997]/20" aria-hidden="true" />
                <div className="relative z-10">
                  <strong className="text-[#1A2C42]">1° a 4° básico (Jornada de mañana):</strong> Un bloque diario de clases
                  en vivo de lunes a viernes, con dos opciones de horario a elección del apoderado:{' '}
                  <strong className="text-[#1A2C42]">08:30 a 09:15 hrs</strong> o{' '}
                  <strong className="text-[#1A2C42]">09:30 a 10:15 hrs</strong>{' '}
                  <em>
                    (la apertura de cada bloque está sujeta a alcanzar el quórum mínimo de estudiantes; de lo contrario, se
                    unificarán en un solo horario).
                  </em>
                </div>
              </li>
              <li className={`${claseItemPlan} relative overflow-hidden`}>
                <GraduationCap className="pointer-events-none absolute -bottom-2 right-3 h-16 w-16 text-[#5B9CD8]/15" aria-hidden="true" />
                <div className="relative z-10">
                  <strong className="text-[#1A2C42]">5° básico a IV medio (Currículum flexible):</strong> Cada estudiante
                  arma su propio horario eligiendo sus bloques según disponibilidad.{' '}
                  <em>
                    Te recomendamos asegurar tu matrícula con anticipación para acceder a la mayor variedad de horarios
                    antes del cierre de cupos.
                  </em>
                </div>
              </li>
              <li className={`${claseItemPlan} relative overflow-hidden`}>
                <Sparkles className="pointer-events-none absolute -bottom-2 right-3 h-16 w-16 text-[#71C997]/20" aria-hidden="true" />
                <div className="relative z-10">
                  <strong className="text-[#1A2C42]">Programa de nivelación académica:</strong> Reforzamiento voluntario al
                  inicio del año escolar, focalizado en contenidos clave de Matemática y Lenguaje para partir con una base
                  sólida.
                </div>
              </li>
              <li className={`${claseItemPlan} relative overflow-hidden`}>
                <HeartHandshake className="pointer-events-none absolute -bottom-2 right-3 h-16 w-16 text-[#5B9CD8]/15" aria-hidden="true" />
                <div className="relative z-10">
                  <strong className="text-[#1A2C42]">Talleres complementarios:</strong> Espacios prácticos de hábitos de
                  estudio, habilidades digitales, técnicas de organización escolar y orientación vocacional.
                </div>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            {VIDEO_DIRECTORA ? (
              <video
                controls
                playsInline
                preload="metadata"
                src={VIDEO_DIRECTORA.src}
                poster={VIDEO_DIRECTORA.poster ?? undefined}
                aria-label="Video de la directora"
                className="aspect-video w-full rounded-3xl bg-[#1A2C42] shadow-xl"
              />
            ) : (
              <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-[#5B9CD8]/40 bg-[#EAF2F8] text-center text-[#667A8A]">
                <Play className="h-10 w-10 text-[#5B9CD8]" aria-hidden="true" />
                <span className="text-sm font-semibold">Video de la directora</span>
                <span className="text-xs">Próximamente</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Zona 6: Aranceles */}
      <section id="precios" className="scroll-mt-32 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-12 max-w-3xl space-y-3 text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-[#4B8ECB]">Inversión Educativa</span>
            <h2 className="text-3xl font-bold text-[#1A2C42]">Valores transparentes y accesibles</h2>
          </div>

          <div className="mx-auto grid max-w-3xl gap-6 md:grid-cols-2">
            {ARANCELES.map((plan) => (
              <div key={plan.nivel} className="overflow-hidden rounded-3xl border-2 border-[#5B9CD8] bg-white shadow-xl">
                <div className="bg-gradient-to-r from-[#4B8ECB] to-[#5B9CD8] px-6 py-4 text-center">
                  <h3 className="text-lg font-bold text-white">{plan.nivel}</h3>
                </div>
                <table className="w-full text-sm">
                  <caption className="sr-only">Valores para {plan.nivel}</caption>
                  <tbody>
                    <tr className="border-b border-slate-100">
                      <th scope="row" className="px-6 py-4 text-left font-medium text-[#667A8A]">
                        Matrícula
                      </th>
                      <td className="px-6 py-4 text-right text-lg font-extrabold text-[#1A2C42]">{plan.matricula}</td>
                    </tr>
                    <tr>
                      <th scope="row" className="px-6 py-4 text-left font-medium text-[#667A8A]">
                        Arancel
                      </th>
                      <td className="px-6 py-4 text-right text-lg font-extrabold text-[#1A2C42]">{plan.arancel}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ))}
          </div>

          <div className="mx-auto mt-10 max-w-3xl space-y-6">
            <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <h3 className="text-lg font-bold text-[#1A2C42]">Asegura tu horario hoy y comienza a pagar en enero</h3>
              <p className="text-sm leading-relaxed text-[#667A8A]">
                Sabemos que diciembre es un mes lleno de gastos y celebraciones, por eso no queremos agobiar el presupuesto
                de tu familia.
              </p>
              <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-[#667A8A]">
                <li>
                  <strong className="text-[#1A2C42]">Reserva tu malla académica en diciembre:</strong> Pagando únicamente la
                  matrícula este mes, aseguras tu cupo y accedes de inmediato a la mayor variedad de bloques horarios.
                </li>
                <li>
                  <strong className="text-[#1A2C42]">Paga el arancel en enero,</strong> con la comodidad de dividirlo en
                  cuotas a través de tu tarjeta bancaria.
                </li>
              </ul>
            </div>

            <p className="text-sm leading-relaxed text-[#667A8A]">
              <strong className="text-[#1A2C42]">Formación completa desde el primer día:</strong> Todos nuestros planes
              incluyen acceso a talleres, nivelación inicial y reforzamiento académico para acompañar cada etapa de tu
              aprendizaje.
            </p>

            <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm">
              <h3 className="font-bold text-[#4B8ECB]">Modalidades de pago</h3>
              <ul className="mt-2 list-inside list-disc space-y-1 text-[#667A8A]">
                <li>Contado mediante nuestra plataforma</li>
                <li>En cuotas con tarjetas bancarias</li>
              </ul>
            </div>

            <Link
              href="/matricula"
              className="block rounded-xl bg-[#F5D372] py-3.5 text-center font-bold text-[#1A2C42] shadow-md transition-all hover:bg-[#eac459] hover:shadow-lg active:scale-95"
            >
              Iniciar matrícula
            </Link>
          </div>
        </div>
      </section>

      {/* Zona 7: Contacto */}
      <section id="contacto" className="scroll-mt-32 bg-[#1A2C42] px-4 py-20 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-8 text-center">
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#71C997]">Contacto Directo</span>
            <h2 className="text-3xl font-bold">¿Tienes dudas sobre el colegio virtual Esencia?</h2>
            <p className="text-sm text-slate-300">
              Visita nuestras redes sociales o déjanos tus datos y nuestro equipo administrativo se pondrá en contacto
              contigo a la brevedad.
            </p>
          </div>

          <BotonesRedes />

          <form className="bg-white text-[#1A2C42] p-8 rounded-3xl shadow-xl text-left space-y-5 border border-slate-200">
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-[#1A2C42] mb-1.5">Nombre del Apoderado</label>
                <input type="text" className={claseCampo} placeholder="Ej. Constanza Silva" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#1A2C42] mb-1.5">Correo Electrónico</label>
                <input type="email" className={claseCampo} placeholder="ejemplo@correo.cl" required />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-[#1A2C42] mb-1.5">Teléfono de Contacto</label>
                <input type="tel" className={claseCampo} placeholder="+56 9 1234 5678" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#1A2C42] mb-1.5">Nivel Educativo de Interés</label>
                <select className={claseCampo}>
                  {NIVELES.map((nivel) => (
                    <option key={nivel}>{nivel}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1A2C42] mb-1.5">Mensaje o Consulta Especial</label>
              <textarea
                rows={4}
                className={claseCampo}
                placeholder="Cuéntanos si requieres nivelación, apoyo psicopedagógico o consultas de horarios..."
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-[#5B9CD8] hover:bg-[#4B8ECB] text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 text-base cursor-pointer"
            >
              Enviar Consulta
            </button>
          </form>
        </div>
      </section>

      <PieDePagina />
    </div>
  )
}
