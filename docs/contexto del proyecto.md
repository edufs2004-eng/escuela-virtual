# Contexto del Proyecto: Escuela Virtual Ecencia

## 1. Descripción General y Propósito
Plataforma web full-stack para la gestión académica de la "Escuela Virtual escencia", orientada a la educación virtual y preparacion de examenes libres en Chile (de 1.º Básico a 4.º Medio). 
- **Enfoque Institucional:** Clases en vivo en grupos reducidos (máximo 15 estudiantes por bloque), asignaturas obligatorias (Matemáticas, Lenguaje, Ciencias, Historia, ingles),  programa de nivelación académica y talleres complementarios.
- **Inclusión:** Espacio seguro y adaptado para estudiantes neurodivergentes (TEA, TDAH) con apoyo psicopedagógico y bajo nivel de estrés por sobreestimulación.
- **Modelo Comercial:** Arancel anual fijo , con opciones de pago al contado, 3 cuotas, 5 cuotas o 10 cuotas mensuales.

## 2. Stack Tecnológico
- **Frontend:** Next.js 16 (App Router, Turbopack), Tailwind CSS v4, Lucide React (iconos).
- **Backend / Base de Datos:** Supabase (Auth, PostgreSQL Database, Storage).
- **Despliegue:** Vercel.

## 3. Arquitectura y Módulos Activos
- **Roles de Usuario (Tabla `profiles`):**
  - `admin`: Acceso al panel de control de administración (`/admin/ramos`).
  - `docente`: Portal de profesor (próxima fase).
  - `alumno`: Portal de estudiante/apoderado.
- **Gestión de Ramos y Bloques (`bloques_ramos`):**
  - Permite crear, modificar y eliminar bloques horarios por nivel, asignatura y capacidad máxima (15 cupos).
  - **Regla del Profesor Opcional:** El campo `profesor` puede ser nulo/vacío (`NULL`). Si no hay un profesor asignado, la interfaz del alumno **no debe mostrar** ningún dato del docente. El administrador puede editar el bloque más adelante para asignarlo cuando esté disponible.

## 4. Fase Actual en Desarrollo: Flujo de Matrícula y Reservas Temporales (TTL)
- **Objetivo:** Implementar reservas temporales de 5 a 10 minutos para evitar sobre-inscripciones en tiempo real.
- **Flujo:** 
  1. El apoderado selecciona un bloque con cupos disponibles.
  2. Se crea un registro temporal en Supabase con un ID único y temporizador (TTL).
  3. Se bloquea 1 cupo temporalmente para otros usuarios. Si otro usuario ve el bloque lleno o con cupos en proceso, se le indica que espere de 5 a 10 min por si se libera.
  4. El apoderado carga sus documentos y datos personales. Si completa el proceso, pasa a la pasarela de pago (Transbank/Webpay en la siguiente fase). Si expira el tiempo o abandona, el cupo se libera automáticamente.