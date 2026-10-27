import Image from 'next/image'
import Link from 'next/link'
import { 
  Users, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  ChevronRight, 
  Sparkles, 
  AlertCircle, 
  HeartHandshake, 
  BookOpenCheck, 
  Languages, 
  GraduationCap, 
  Smile 
} from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#EAF2F8] text-[#1A2C42] flex flex-col font-sans selection:bg-[#71C997] selection:text-white">
      {/* Banner Superior Promocional */}
      <div className="bg-[#4B8ECB] text-white text-xs py-2 px-4 text-center font-medium flex items-center justify-center gap-2 shadow-inner">
        <span className="bg-[#F5D372] text-[#1A2C42] px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide animate-pulse">
          Proceso 2027
        </span>
        <span>Admisión Abierta para 7.º Básico a 4.º Medio — Reserva tu cupo anticipado</span>
      </div>

      {/* Header / Navegación */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo Corporativo */}
          <Link href="/" className="flex items-center gap-3 group transition-transform duration-200 hover:scale-[1.02]">
            <div className="relative w-11 h-11 bg-[#5B9CD8]/10 rounded-xl flex items-center justify-center overflow-hidden border border-[#5B9CD8]/30 shadow-xs">
              <Image 
                src="/logo.png" 
                alt="Logo Escuela Virtual Lila Castro" 
                width={44} 
                height={44} 
                className="object-contain p-1"
                priority
              />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-[#1A2C42] block group-hover:text-[#4B8ECB] transition-colors">
                Escuela Virtual Lila Castro
              </span>
              <span className="text-[10px] uppercase tracking-wider text-[#667A8A] font-semibold block">
                Educación Virtual Chile
              </span>
            </div>
          </Link>

          {/* Menú de Navegación con Smooth Scroll */}
          <nav className="hidden md:flex space-x-7 text-sm font-semibold text-[#667A8A]">
            <a href="#propuesta" className="hover:text-[#4B8ECB] transition-colors duration-200">Propuesta</a>
            <a href="#inclusion" className="hover:text-[#4B8ECB] transition-colors duration-200">Inclusión</a>
            <a href="#oferta" className="hover:text-[#4B8ECB] transition-colors duration-200">Niveles y Talleres</a>
            <a href="#precios" className="hover:text-[#4B8ECB] transition-colors duration-200">Aranceles</a>
            <a href="#contacto" className="hover:text-[#4B8ECB] transition-colors duration-200">Contacto</a>
          </nav>

          {/* Botón Acción Rápida */}
          <div>
            <a 
              href="#contacto" 
              className="bg-[#5B9CD8] hover:bg-[#4B8ECB] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all inline-block"
            >
              Postular Ahora
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#4B8ECB] to-[#1A2C42] text-white py-24 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-xs">
            <Sparkles className="w-4 h-4 text-[#F5D372]" />
            <span>Educación flexible, cercana y estructurada</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Una escuela pensada para el ritmo de vida de tu familia
          </h1>

          <p className="text-lg sm:text-xl text-blue-50 max-w-2xl mx-auto leading-relaxed">
            Clases en vivo en grupos reducidos de máximo 15 estudiantes, con nivelación académica, talleres formativos y acompañamiento docente continuo.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <a 
              href="#contacto" 
              className="bg-[#F5D372] hover:bg-[#eac459] text-[#1A2C42] font-bold px-7 py-3.5 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2"
            >
              Iniciar Postulación <ChevronRight className="w-5 h-5" />
            </a>
            <a 
              href="#oferta" 
              className="bg-white/10 hover:bg-white/20 text-white border border-white/30 font-semibold px-7 py-3.5 rounded-xl transition-all hover:-translate-y-0.5"
            >
              Ver Plan Académico
            </a>
          </div>
        </div>
      </section>

       {/* Sección Inclusión y Neurodivergencia */}
      <section id="inclusion" className="bg-gradient-to-r from-white via-[#EAF2F8] to-white py-20 px-4 sm:px-6 lg:px-8 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="bg-[#71C997]/20 text-[#1A2C42] border border-[#71C997]/40 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
              <Smile className="w-4 h-4 text-[#71C997]" />
              Entorno Seguro
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1A2C42]">
              Educación adaptada a la neurodivergencia y diversidad de aprendizaje
            </h2>
            <p className="text-[#667A8A] leading-relaxed">
              Sabemos que cada estudiante aprende a un ritmo distinto. Nuestra escuela promueve un ambiente respetuoso, de bajo nivel de ansiedad y adaptado para estudiantes con condición del espectro autista (TEA), TDAH u otras condiciones neurodivergentes.
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <HeartHandshake className="w-6 h-6 text-[#5B9CD8] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-[#1A2C42] text-sm">Apoyo Psicopedagógico Profesional</h4>
                  <p className="text-xs text-[#667A8A]">Orientación y seguimiento para casos que requieran adecuaciones y acompañamiento especializado.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <CheckCircle2 className="w-6 h-6 text-[#71C997] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-[#1A2C42] text-sm">Grupos Pequeños sin Sobrestimulación</h4>
                  <p className="text-xs text-[#667A8A]">Máximo 15 estudiantes por grupo para facilitar la concentración y una comunicación amigable.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#1A2C42] text-white p-8 sm:p-10 rounded-3xl shadow-xl space-y-6 relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-[#5B9CD8]/20 rounded-full blur-2xl"></div>
            <h3 className="text-2xl font-bold text-[#F5D372]">Acompañamiento Integral</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Fomentamos la autonomía del estudiante garantizando canales directos de comunicación con los docentes y el área psicoeducativa, previniendo el desbalance académico antes de que se convierta en un problema.
            </p>
            <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-2xl text-xs space-y-2 text-slate-300">
              <p className="font-semibold text-white">✨ Pilares del programa:</p>
              <p>• Respeto por los tiempos de procesamiento y concentración.</p>
              <p>• Comunicación constante y transparente con apoderados.</p>
              <p>• Clases estructuradas y previsibles para evitar el estrés escolar.</p>
            </div>
          </div>
        </div>
      </section>


      {/* Propuesta de Valor */}
      <section id="propuesta" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-[#4B8ECB] font-bold text-xs uppercase tracking-widest">Nuestra Propuesta</span>
          <h2 className="text-3xl font-bold text-[#1A2C42]">¿Por qué elegir la Escuela Virtual Lila Castro?</h2>
          <p className="text-[#667A8A]">Combinamos la flexibilidad del entorno digital con la calidez y estructura del acompañamiento pedagógico humano.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 space-y-4">
            <div className="w-12 h-12 bg-[#71C997]/20 rounded-xl flex items-center justify-center text-[#71C997]">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-[#1A2C42]">Grupos Reducidos</h3>
            <p className="text-[#667A8A] text-sm leading-relaxed">
              Planificamos un máximo de 15 estudiantes por curso para garantizar interacción real, participación constante y atención personalizada.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 space-y-4">
            <div className="w-12 h-12 bg-[#F5D372]/30 rounded-xl flex items-center justify-center text-[#1A2C42]">
              <Clock className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-[#1A2C42]">Clases en Vivo</h3>
            <p className="text-[#667A8A] text-sm leading-relaxed">
              Bloques semanales de 90 minutos por asignatura obligatoria, más idioma Inglés y espacios de resolución de dudas.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 space-y-4">
            <div className="w-12 h-12 bg-[#5B9CD8]/20 rounded-xl flex items-center justify-center text-[#5B9CD8]">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-[#1A2C42]">Gestión Centralizada</h3>
            <p className="text-[#667A8A] text-sm leading-relaxed">
              Plataforma tecnológica integrada para apoderados y alumnos: control de horarios, material de estudio y seguimiento académico.
            </p>
          </div>
        </div>
      </section>

      {/* Oferta Educativa, Nivelación e Inglés */}
      <section id="oferta" className="bg-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-[#71C997] font-bold text-xs uppercase tracking-widest">Niveles y Complementos</span>
            <h2 className="text-3xl font-bold text-[#1A2C42]">Oferta Académica Completa</h2>
            <p className="text-[#667A8A]">
              Estructura curricular alineada con los programas oficiales chileno-virtuales de 7.º Básico a 4.º Medio.
            </p>
          </div>

          {/* Asignaturas Principales e Inglés */}
          <div className="grid lg:grid-cols-2 gap-8 items-stretch">
            <div className="bg-[#EAF2F8] p-8 rounded-3xl border border-[#5B9CD8]/30 flex flex-col justify-between space-y-6">
              <div>
                <h3 className="text-xl font-bold text-[#1A2C42] border-b border-slate-300/80 pb-3 flex items-center gap-2">
                  <GraduationCap className="w-6 h-6 text-[#5B9CD8]" />
                  Asignaturas del Paquete Base
                </h3>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="bg-white p-3.5 rounded-xl font-bold text-[#1A2C42] border border-slate-200 text-sm shadow-2xs">
                    📐 Matemáticas
                  </div>
                  <div className="bg-white p-3.5 rounded-xl font-bold text-[#1A2C42] border border-slate-200 text-sm shadow-2xs">
                    📚 Lenguaje
                  </div>
                  <div className="bg-white p-3.5 rounded-xl font-bold text-[#1A2C42] border border-slate-200 text-sm shadow-2xs">
                    🔬 Ciencias
                  </div>
                  <div className="bg-white p-3.5 rounded-xl font-bold text-[#1A2C42] border border-slate-200 text-sm shadow-2xs">
                    🌍 Historia
                  </div>
                </div>
              </div>

              {/* Módulo de Inglés */}
              <div className="bg-white p-4 rounded-2xl border border-[#71C997]/40 flex items-center gap-4">
                <div className="w-10 h-10 bg-[#71C997]/20 rounded-xl flex items-center justify-center text-[#71C997] shrink-0">
                  <Languages className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-[#1A2C42] text-sm">Asignatura de Inglés Incluida</h4>
                  <p className="text-xs text-[#667A8A]">Módulo semanal para el desarrollo de competencias de lectura y conversación.</p>
                </div>
              </div>
            </div>

            {/* Nivelación y Talleres */}
            <div className="bg-[#EAF2F8] p-8 rounded-3xl border border-[#5B9CD8]/30 flex flex-col justify-between space-y-6">
              <div>
                <h3 className="text-xl font-bold text-[#1A2C42] border-b border-slate-300/80 pb-3 flex items-center gap-2">
                  <BookOpenCheck className="w-6 h-6 text-[#71C997]" />
                  Nivelación y Talleres Informativos
                </h3>
                <div className="space-y-3 mt-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200">
                    <h4 className="font-bold text-[#1A2C42] text-sm flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#F5D372]"></span>
                      Programa de Nivelación Académica
                    </h4>
                    <p className="text-xs text-[#667A8A] mt-1">
                      Reforzamiento voluntario focalizado en contenidos clave de Matemáticas y Lenguaje al inicio del año lectivo.
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200">
                    <h4 className="font-bold text-[#1A2C42] text-sm flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#71C997]"></span>
                      Talleres Complementarios
                    </h4>
                    <p className="text-xs text-[#667A8A] mt-1">
                      Espacios de hábitos de estudio, habilidades digitales, orientación vocacional y técnicas de organización escolar.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-[#667A8A]">
                <AlertCircle className="w-4 h-4 text-[#E96A6A] shrink-0" />
                <span>Consulte disponibilidad de cupos y horarios por nivel.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Precios */}
      <section id="precios" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-[#4B8ECB] font-bold text-xs uppercase tracking-widest">Inversión Educativa</span>
          <h2 className="text-3xl font-bold text-[#1A2C42]">Modelo de Precios Transparente</h2>
          <p className="text-[#667A8A]">Valores claros diseñados para entregar previsibilidad financiera a las familias.</p>
        </div>

        <div className="max-w-md mx-auto bg-white rounded-3xl border-2 border-[#5B9CD8] shadow-2xl overflow-hidden hover:scale-[1.01] transition-transform duration-300">
          <div className="bg-gradient-to-r from-[#4B8ECB] to-[#5B9CD8] text-white p-8 text-center">
            <span className="bg-[#F5D372] text-[#1A2C42] text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              Arancel Anual Completo
            </span>
            <h3 className="text-2xl font-bold mt-3">Matrícula y Colegiatura</h3>
            <p className="text-blue-100 text-xs mt-1">Acceso a todas las asignaturas, inglés y talleres</p>
          </div>

          <div className="p-8 space-y-6">
            <div className="text-center">
              <span className="text-4xl font-extrabold text-[#1A2C42]">$695.000</span>
              <span className="text-[#667A8A] text-xs block mt-1">Total Primer Año (CLP)</span>
            </div>

            <div className="space-y-3 text-sm text-[#667A8A] border-t border-b border-slate-100 py-4">
              <div className="flex justify-between">
                <span>Matrícula:</span>
                <span className="font-bold text-[#1A2C42]">$95.000 CLP</span>
              </div>
              <div className="flex justify-between">
                <span>Arancel Anual:</span>
                <span className="font-bold text-[#1A2C42]">$600.000 CLP</span>
              </div>
            </div>

            <div className="bg-[#EAF2F8] p-4 rounded-xl text-xs space-y-2 text-[#1A2C42]">
              <p className="font-bold text-[#4B8ECB]">Modalidades de Pago Disponibles:</p>
              <ul className="space-y-1 text-[#667A8A] list-disc list-inside">
                <li>1 Cuota al contado</li>
                <li>3 Cuotas durante el año</li>
                <li>10 Cuotas mensuales</li>
              </ul>
            </div>

            <a 
              href="#contacto" 
              className="block text-center bg-[#F5D372] hover:bg-[#eac459] text-[#1A2C42] font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              Solicitar Reserva de Cupo
            </a>
          </div>
        </div>
      </section>

      {/* Formulario de Contacto */}
      <section id="contacto" className="bg-[#1A2C42] text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="space-y-3">
            <span className="text-[#71C997] font-bold text-xs uppercase tracking-widest">Contacto Directo</span>
            <h2 className="text-3xl font-bold">¿Tienes dudas o quieres postular a la Escuela Virtual Lila Castro?</h2>
            <p className="text-slate-300 text-sm">Déjanos tus datos y nuestro equipo administrativo se pondrá en contacto contigo a la brevedad.</p>
          </div>

          <form className="bg-white text-[#1A2C42] p-8 rounded-3xl shadow-xl text-left space-y-5 border border-slate-200">
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-[#1A2C42] mb-1.5">Nombre del Apoderado</label>
                <input 
                  type="text" 
                  className="w-full bg-[#EAF2F8] border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B9CD8] transition-all" 
                  placeholder="Ej. Constanza Silva" 
                  required 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#1A2C42] mb-1.5">Correo Electrónico</label>
                <input 
                  type="email" 
                  className="w-full bg-[#EAF2F8] border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B9CD8] transition-all" 
                  placeholder="ejemplo@correo.cl" 
                  required 
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-[#1A2C42] mb-1.5">Teléfono de Contacto</label>
                <input 
                  type="tel" 
                  className="w-full bg-[#EAF2F8] border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B9CD8] transition-all" 
                  placeholder="+56 9 1234 5678" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#1A2C42] mb-1.5">Nivel Educativo de Interés</label>
                <select className="w-full bg-[#EAF2F8] border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B9CD8] transition-all">
                  <option>7.º Básico</option>
                  <option>8.º Básico</option>
                  <option>1.º Medio</option>
                  <option>2.º Medio</option>
                  <option>3.º Medio</option>
                  <option>4.º Medio</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1A2C42] mb-1.5">Mensaje o Consulta Especial</label>
              <textarea 
                rows={4} 
                className="w-full bg-[#EAF2F8] border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B9CD8] transition-all" 
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

      {/* Footer */}
      <footer className="bg-[#1A2C42] border-t border-slate-800 text-[#667A8A] py-8 px-4 text-center text-xs">
        <p>© 2027 Escuela Virtual Lila Castro. Todos los derechos reservados.</p>
      </footer>
    </div>
  )
}