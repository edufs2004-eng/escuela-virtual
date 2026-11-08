# Análisis del estado del proyecto

**Fecha de revisión:** 6 de noviembre de 2026  
**Base funcional:** archivos disponibles en el repositorio en esta fecha  
**Contextos contrastados:** [contexto del proyecto](../../contexto%20del%20proyecto.md) y [análisis anterior](../../colegio_virtual.txt)

## Resumen ejecutivo

El proyecto ya no es solamente la landing descrita en `colegio_virtual.txt`: ahora también contiene un inicio de sesión con Supabase y un panel administrativo para consultar, crear y eliminar bloques de ramos. El archivo `docs/desarrollo/contexto_supabase.txt` contiene el snapshot de esquema y políticas compartido por el usuario; no hay migraciones ejecutables en el repositorio. El flujo de matrícula descrito en la hoja de ruta —incluidas las reservas temporales con TTL— todavía no está implementado.

La prioridad recomendada es cerrar las definiciones operativas de matrícula y privacidad y, después, implementar la reserva de cupos de forma atómica en la base de datos. No conviene contar cupos ni aplicar expiraciones solamente desde la interfaz: dos familias podrían intentar reservar el último cupo al mismo tiempo.

## Qué existe actualmente

- **Sitio público:** una página de presentación con oferta, niveles, precios, contacto y enlaces entre secciones, en [`src/app/page.tsx`](../../src/app/page.tsx).
- **Inicio de sesión:** autenticación con correo y contraseña de Supabase y consulta del rol en `profiles`, en [`src/app/login/page.tsx`](../../src/app/login/page.tsx).
- **Acceso administrativo:** el panel verifica sesión y rol `admin` antes de mostrar la gestión de bloques, en [`src/app/admin/ramos/page.tsx`](../../src/app/admin/ramos/page.tsx).
- **Gestión de horarios y bloques:** el panel permite crear opciones en `horarios` seleccionando día y horas de inicio/término; normaliza esos valores como `Día HH:mm - HH:mm` y los guarda en `etiqueta`, sin solicitar ni mostrar `descripcion`. Los bloques se consultan, crean y eliminan en `bloques_ramos`; al crear, fija capacidad en 15 e inscritos en 0. El horario seleccionado se guarda como etiqueta en el campo textual `bloques_ramos.horario`; el profesor es opcional.
- **Entrada pública a matrícula:** los CTA de admisión llevan a `/matricula`, donde se consultan bloques publicados y se puede preparar una selección visual de las cinco asignaturas obligatorias.
- **Cliente de Supabase:** inicialización bajo demanda con `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`, en [`src/lib/supabase.ts`](../../src/lib/supabase.ts).
- **Interfaz:** Next.js 16, React 19, TypeScript, Tailwind CSS 4 y Lucide React. Los comandos definidos son `dev`, `build` y `start`.

## Qué está incompleto o no se encontró

- El formulario público de contacto es visual: no tiene envío, acción, nombres de campos ni confirmación de recepción.
- La selección de `/matricula` no crea ni persiste una reserva. Los cupos que presenta son capacidad nominal menos inscritos confirmados y no descuentan reservas temporales.
- No existe reserva temporal, contador TTL, vencimiento, liberación automática, confirmación de cupo ni control transaccional de concurrencia.
- La etapa documental existe como paso visual vacío; no hay carga de documentos ni datos de apoderado/alumno. La pantalla de pago solo informa que no está disponible; no hay integración con Transbank/WebPay.
- Los roles `docente` y `alumno` se reconocen al iniciar sesión, pero sus portales no están implementados.
- El panel permite crear y eliminar bloques, pero no editarlos.
- Las políticas del snapshot compartido permiten `ALL` a cualquier usuario autenticado sobre `bloques_ramos` y `horarios`; la comprobación de rol `admin` en el panel es de interfaz y no sustituye permisos de base de datos. La revisión de RLS/migraciones en Supabase corresponde al trabajo separado de preparación de backend.
- La navegación principal está oculta en pantallas pequeñas y no se encontró un menú móvil alternativo.
- `README.md` conserva el texto genérico de Next.js; `colegio_virtual.txt` es una evaluación anterior y debe leerse considerando el avance posterior de autenticación y administración.
- `package.json` no declara comandos de lint o test.

## Diferencias de requisitos que requieren confirmación

Los documentos y la página no describen exactamente la misma oferta:

- El contexto plantea cobertura de 1.º Básico a 4.º Medio; la página anuncia de 7.º Básico a 4.º Medio.
- El contexto menciona alternativas de 1, 3, 5 o 10 cuotas; la página muestra 1, 3 y 10.
- La marca visible de la página se actualizó a “Escencia” en la Fase 1.
- El contexto pide profesor opcional; el formulario administrativo ya permite omitirlo.
- La hoja de ruta fija 10 minutos como TTL inicial sujeto a validación posterior con usuarios; el flujo todavía no está implementado.

Validar con la institución los niveles, nombre oficial, precios, modalidades y período de admisión antes de sincronizar el contenido público y el sistema de matrícula.

## Riesgos y dependencias antes de abrir matrículas

1. **Integridad de cupos:** la disponibilidad y la creación/expiración de reservas deben resolverse en una operación atómica del servidor/base de datos, con límite de capacidad aplicado allí.
2. **Autorización:** las comprobaciones del navegador mejoran la experiencia, pero no reemplazan RLS y permisos de base de datos. Las operaciones administrativas y las reservas necesitan políticas probadas.
3. **Datos personales:** definir qué datos y documentos son realmente necesarios, quién puede verlos, cuánto tiempo se conservan y cómo se almacenan antes de aceptar información de estudiantes y apoderados.
4. **Expiración:** decidir cómo se detectan las reservas vencidas y cómo se asegura su liberación aunque ningún usuario vuelva a abrir la página.
5. **Configuración remota:** verificar variables y estructura de Supabase sin publicar sus valores. La presencia del cliente en el código no demuestra que el entorno remoto esté configurado o probado.

## Recomendación

El siguiente trabajo de interfaz es conectar el catálogo de bloques con la selección pública, manteniendo el formulario de contacto separado. La creación/expiración de reservas y el control atómico de cupos dependen del modelo y operaciones de backend; las políticas de Supabase deben revisarse por el responsable de backend antes de abrirlas a usuarios.

La integración de pago puede abordarse cuando el cupo y el estado de matrícula tengan reglas confiables. Mantener el pago separado evita confirmar una inscripción basada en una reserva ya vencida o en un cupo sobrevendido.

## Alcance de esta revisión

Este análisis inspecciona el código y los documentos presentes en el repositorio; no valida el proyecto Supabase remoto, los precios con la institución, requisitos legales ni el funcionamiento desplegado. El estado del repositorio ya contenía cambios locales en las páginas de administración e inicio de sesión y en el cliente de Supabase; esos archivos se revisaron sin modificarlos.
