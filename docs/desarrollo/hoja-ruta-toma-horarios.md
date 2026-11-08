# Hoja de ruta: toma de horarios y matrícula

**Fecha de revisión:** 6 de noviembre de 2026

**Documento de referencia analizado:** [`contexto_supabase.txt`](./contexto_supabase.txt)

**Propósito:** completar el flujo público de selección de ramos/horarios, reserva temporal, documentos y pago confirmado, terminando con una matrícula definitiva y una cuenta con rol `alumno`.

## 1. Resultado esperado

Una familia podrá iniciar desde la página pública con un llamado a la acción —**“Selecciona tu horario”** o **“Matricúlate aquí”**—, seleccionar los cinco ramos obligatorios y sus horarios, reservar cupos temporalmente, avanzar por una etapa de documentos (sin carga real hasta que se definan los requisitos) y pagar mediante Transbank. Solo una confirmación verificada del pago convertirá la reserva en matrícula definitiva, asignará los bloques internos y creará la cuenta/perfil institucional de tipo `alumno`.

Los cupos temporales vencidos o las matrículas cuyo pago no se confirme no deben quedar como cupos definitivos. El TTL inicial será de **10 minutos**, como valor de prueba sujeto a pruebas con usuarios y posible ajuste posterior. Al comenzar el proceso de pago, el sistema iniciará un nuevo período de 10 minutos para verificar el resultado.

La carga de documentos tendrá en esta primera implementación solo el paso/estructura de la experiencia. No se habilitará la carga real hasta que se definan los documentos, formatos y políticas.

## 2. Regla estricta de alcance

Esta ruta autoriza cambios únicamente en los archivos, componentes, datos y configuraciones indispensables para completar los requisitos escritos en este documento. Antes de editar, identificar el cambio concreto que satisface un requisito o criterio de aceptación de esta ruta.

- No modificar ni refactorizar funcionalidades, estilos, textos, dependencias, configuración, tablas o pantallas ajenas a este flujo.
- No realizar mejoras “aprovechando” la tarea, limpiezas generales, actualizaciones de versiones ni cambios preventivos no solicitados.
- No cambiar contratos existentes ni borrar datos, tablas o políticas fuera de las modificaciones necesarias y aprobadas para el flujo descrito.
- No interpretar esta ruta como autorización para construir el dashboard del alumno: ese dashboard queda para una fase posterior. En esta ruta sí se debe crear el perfil `alumno` y persistir su matrícula y asignación para que el dashboard futuro pueda mostrarlas.
- Si una implementación necesita un cambio fuera de este alcance, detenerse y solicitar aprobación antes de hacerlo; documentar la razón y los archivos afectados.
- Mantener intactos cambios locales preexistentes que no formen parte de una tarea autorizada.

La regla aplica durante todo el desarrollo, pruebas y despliegue. Los cambios de marca indicados a continuación sí son parte explícita del alcance.

## 3. Cambios de marca incluidos

Cambiar la marca visible del proyecto de **“Lila Castro”** a **“Escencia”** en todas las referencias controladas por el proyecto que presenten el nombre institucional, incluidos textos públicos, metadatos, etiquetas accesibles, títulos y documentación funcional que siga vigente.

Realizar una búsqueda acotada al código y documentos propios del repositorio y revisar cada coincidencia antes de modificarla. No hacer reemplazos ciegos ni modificar historial Git, dependencias (`node_modules`), archivos generados, cachés, secretos o valores de configuración que no sean parte de la marca. Mantener el resto del contenido sin cambios.

## 4. Estado y dependencias conocidas

El snapshot actual de Supabase compartido en `docs/desarrollo/contexto_supabase.txt` describe estas tablas:

- `bloques_ramos`: nivel, asignatura, horario, profesor opcional, capacidad máxima e inscritos.
- `profiles`: vinculado a `auth.users`, con los roles `admin`, `docente` y `alumno`.
- `horarios`: etiquetas y descripciones de horarios.
- `matriculas_temporales`: datos de apoderado/alumno, estado y vencimiento, con un único `bloque_horario_id`.

Según la aclaración del usuario, el SQL y las políticas de ese archivo fueron copiados directamente desde el proyecto Supabase conectado y representan su estado actualizado. La tabla `matriculas_temporales` ya existe en ese snapshot, pero su FK `bloque_horario_id` referencia `horarios(id)`, no `bloques_ramos(id)`, y el modelo representa una sola asignatura por fila. Esto no satisface por sí solo la selección requerida de cinco bloques ni permite asumir una relación correcta con las secciones. El snapshot no documenta tablas de transacciones de pago.

Las políticas incluidas permiten gestión a cualquier usuario autenticado sobre `bloques_ramos` y `horarios`, y lectura de perfiles a usuarios autenticados sin filtro de propietario. No se incluye una política para `matriculas_temporales`. Antes de abrir reservas hay que diseñar y verificar permisos apropiados para esas operaciones; una validación de interfaz no basta. La lista de políticas no indica explícitamente si RLS está habilitado en cada tabla.

El esquema de `horarios` conserva `etiqueta` y `descripcion`; la interfaz de administración genera la etiqueta a partir del día y las horas de inicio/término. La compatibilidad por nivel/asignatura y zona horaria no forma parte del catálogo actual.

## 5. Reglas de implementación de fases

- Antes de modificar archivos, inspeccionar la estructura real del proyecto y leer los archivos relacionados con la funcionalidad solicitada.
- Consultar el estado de Git e identificar los cambios locales preexistentes. No sobrescribirlos.
- Comparar el estado real del código y de Supabase con el documento de referencia.
- Presentar un plan de implementación que indique archivos que pretende modificar, motivo y requisitos asociados.
- Identificar contradicciones, dependencias y decisiones pendientes antes de implementar.
- No asumir que una funcionalidad existe simplemente porque aparece descrita en la documentación.
- No crear migraciones ni modificar políticas RLS hasta comprobar el esquema real y contar con las decisiones necesarias.
- Implementar exclusivamente la fase autorizada. No avanzar automáticamente a las siguientes.
- Ejecutar las pruebas pertinentes y comprobar que los cambios no rompen las funcionalidades existentes.
- Al finalizar, entregar un informe con archivos modificados, cambios realizados, pruebas ejecutadas, resultados y problemas pendientes.
- Una fase no se considera completada por haber implementado sus componentes. Debe satisfacer sus criterios de aceptación mediante pruebas verificables. No comenzar la siguiente fase sin autorización expresa del usuario. Si una dependencia impide completar la fase, detenerse, informar y solicitar instrucciones.

## 6. Fases de implementación

### Fase 0 — Cerrar reglas de negocio y auditar lo mínimo necesario

**Decisiones ya definidas**

- Usar 10 minutos como TTL inicial de prueba. No tratarlo como valor definitivo: validar con usuarios y ajustar posteriormente según resultados.
- Al crear la reserva temporal de toma de ramos empieza el primer TTL de 10 minutos.
- Al iniciar el proceso de pago, reiniciar el TTL a una nueva ventana de 10 minutos para verificar la transacción.
- Incluir un botón visible de **Cancelar** en cada fase y un botón **Volver** para regresar a la fase anterior. Volver conserva el estado y la hora de vencimiento original; no reinicia ni extiende el TTL.
- Si la persona sale de la página sin cancelar, el servidor conserva la reserva solo hasta el vencimiento persistido. Al reabrir/recargar, se muestra el tiempo restante real, sin reiniciar el contador.
- En la fase de documentos, pulsar **Cancelar** significa explícitamente que no continuará: cancelar la reserva temporal y eliminar los datos asociados según la política de limpieza. Los requisitos y la carga real de documentos quedan pendientes; por ahora solo existirá la etapa de flujo y se podrá continuar sin adjuntar archivos.
- La selección incluye obligatoriamente Matemáticas, Lenguaje, Inglés, Ciencias e Historia: exactamente un bloque por ramo y un alumno no puede seleccionar dos bloques del mismo ramo.
- Cada bloque/sección admite como máximo 15 alumnos. Secciones equivalentes del mismo ramo y horario se presentan agrupadas como una disponibilidad total; la asignación interna será equilibrada entre secciones con capacidad.
- Un bloque sin profesor asignado sigue disponible y se conserva para la matrícula, pero no se muestra información de profesor al alumno.
- El ID temporal será un registro de matrícula/reserva con identificador estable y estado temporal. El TTL corre mientras dicho registro está temporal; al confirmar el pago, el registro pasa a definitivo, deja de tener TTL y queda vinculado al usuario y perfil institucional `alumno`.
- Correo y teléfono institucional se preparan como estructura para contacto/consultas. No se usarán ahora para confirmar identidad, matrícula ni pagos. La confirmación de datos de contacto y el canal especializado de soporte se definirán más adelante.

**Pendientes de auditoría técnica antes de implementar fases que los requieran**

- Verificar en Supabase las tablas, columnas, triggers, funciones, políticas RLS y configuración de Auth/Storage existentes. El archivo de contexto no reemplaza la comprobación del entorno real.
- Precisar días, horas de inicio/fin y compatibilidad de cada bloque con nivel/asignatura, usando opciones controladas del panel.
- Acordar algoritmo verificable de equilibrio entre secciones equivalentes (por ejemplo, asignar primero a la sección menos ocupada y desempatar aleatoriamente), respetando capacidades y restricciones reales.
- Definir manejo de una confirmación de Transbank que llegue después del vencimiento de pago o después de liberar el cupo. No crear un alumno ni confirmar cupos sin una reserva/capacidad garantizada.
- Antes de la carga real, recibir y aprobar la lista de documentos, formatos/tamaño, retención, permisos y limpieza.
- Confirmar la configuración disponible de Transbank y el mecanismo de verificación de estado en backend.
- Recibir el contacto oficial de WhatsApp antes de habilitar el icono; mientras tanto permanecerá inactivo.
- La prueba de usuario del TTL de 10 minutos se realizará después de implementar el flujo, según la indicación del usuario; no bloquea el inicio de la Fase 1, pero debe completarse antes de considerar validada la duración.

**Trabajo**

- Traducir las decisiones confirmadas en estados del flujo, eventos de inicio/cancelación/vencimiento y criterios de aceptación comprobables.
- Comprobar con una prueba de concepto o pruebas automatizadas que los dos temporizadores tienen vencimientos separados: uno para toma/documentos y uno nuevo al iniciar pago.
- Registrar explícitamente el resultado de la prueba de usuario que determine si se conserva o ajusta el TTL inicial de 10 minutos. Según la indicación del usuario, esta prueba se realizará cuando el flujo esté implementado; hasta entonces, 10 minutos es solo el valor inicial acordado para desarrollo, no un TTL validado.

**Modelo de estados acordado (diseño; pendiente de implementación y verificación)**

| Estado | Entrada | Salidas y efectos |
|---|---|---|
| `seleccion_activa` | Se crea la reserva temporal; persistir `created_at` y `expires_at = created_at + 10 minutos`. | Continuar lleva a documentos sin cambiar el vencimiento. Volver solo cambia la pantalla. Cancelar termina la reserva y libera cupos. Al vencer, pasa a `expirada` y libera cupos. |
| `documentos` | Se continúa desde la selección con la misma reserva y expiración. | Se puede continuar sin archivos. Volver conserva selección y vencimiento. Cancelar termina la reserva y elimina los datos temporales asociados. Al vencer, pasa a `expirada` y libera cupos. |
| `pago_en_verificacion` | Se inicia el pago; persistir una nueva expiración de 10 minutos desde ese evento y la referencia técnica del proveedor. | Volver no renueva el plazo. Cancelar solicita/consulta la cancelación, pero no elimina datos ni informa éxito mientras el resultado sea incierto. Una confirmación verificada con cupos garantizados pasa a `confirmada`; rechazo o cancelación verificados terminan la reserva y liberan cupos. Al vencer sin confirmación verificada, pasa a `expirada` y libera cupos. |
| `confirmada` | El backend verifica el pago y completa de forma consistente matrícula, cupos y vínculo con el perfil `alumno`. | Estado terminal; reintentos deben ser idempotentes. |
| `cancelada` | Cancelación explícita antes del pago o resultado de pago cancelado/rechazado verificado. | Estado terminal; liberar cupos y limpiar datos temporales según la política aprobada. |
| `expirada` | Vence el `expires_at` persistido sin una confirmación verificada válida. | Estado terminal para la reserva y sus cupos. Una respuesta tardía se concilia solo con la política de pago tardío aprobada; nunca confirma matrícula ni asigna un cupo por sí sola. |

Salir o recargar no genera un evento de estado ni modifica `expires_at`. La expiración debe aplicarse en el servidor aunque la familia no vuelva al sitio. En el pago, una respuesta no verificable no equivale a rechazo ni a confirmación; al vencer, se libera la reserva y se conserva únicamente la referencia técnica mínima necesaria para conciliar una respuesta tardía. El repositorio todavía no implementa reservas ni temporizadores, por lo que este diseño no constituye una prueba del comportamiento real.

**Criterio para avanzar:** las decisiones marcadas como definidas están reflejadas en el diseño; el esquema remoto fue auditado antes de migrar; están acordados los estados y las condiciones de cupos definitivos. Las decisiones pendientes de documentos pueden bloquear únicamente la carga real, no el paso visual sin archivos.

### Fase 1 — Marca, acceso de entrada y horarios controlados en administración

**Trabajo**

- Cambiar la marca visible “Lila Castro” por “Escencia” en las superficies propias incluidas en el alcance de marca.
- Hacer que la toma de horario/matrícula se inicie desde un CTA claro en la página, usando un solo flujo público coherente.
- Mantener el correo/formulario como canal de contacto únicamente, separado de la matrícula.
- Añadir un icono de contacto directo por WhatsApp inactivo. No debe aparentar que funciona, abrir un destino inexistente ni capturar datos; dejarlo claramente deshabilitado hasta que se entregue el enlace/número oficial y se autorice activarlo.
- Dejar preparada la estructura de correo/teléfono institucional únicamente para consultas futuras. No implementar ni simular confirmaciones de matrícula, pagos o identidad por esos canales.
- En el panel administrador, sustituir el ingreso libre de horarios por una opción controlada: selector de lista de horarios disponibles o selector de hora/reloj limitado a valores válidos. Preferir la lista de horarios configurados si el catálogo de `horarios` puede representar las reglas aprobadas.
- Permitir crear opciones del catálogo desde el panel administrador mediante selectores de día y hora de inicio/término; generar automáticamente una etiqueta normalizada para guardarla en `horarios.etiqueta` y luego seleccionarla al crear bloques. La descripción no se solicita ni se utiliza en este flujo.
- Validar que el bloque solo pueda asociarse a una opción existente y compatible. El profesor debe seguir siendo opcional, según el contexto del proyecto.

**Criterios de aceptación**

- No es posible guardar un horario arbitrario escribiendo texto libre.
- El horario que se configura en administración es el mismo que se muestra y utiliza en la toma pública.
- El correo queda separado del proceso de matrícula; WhatsApp se muestra inactivo y no realiza navegación/acción.
- La estructura de contacto no envía confirmaciones ni se presenta como verificación institucional.
- Las referencias de marca que el usuario ve dentro del alcance dicen “Escencia”.

### Fase 2 — Modelo de reservas, disponibilidad agregada y concurrencia

**Trabajo**

- Diseñar, versionar y desplegar solo las estructuras mínimas requeridas para reservas temporales, selecciones de ramos, matrícula y relación con el pago. En esta ruta no activar almacenamiento/carga real de documentos; dejar solo el paso de interfaz hasta que se definan los requisitos. No implementar una base académica general fuera del flujo.
- Representar el ID temporal como un registro con identificador estable y estado/lifecycle temporal; incluir `created_at`, `expires_at` y estado de pago. Al confirmarse, convertir ese mismo registro a definitivo, retirar su vencimiento activo y vincularlo a la cuenta `alumno`.
- Implementar la creación y confirmación de reservas con operaciones atómicas del lado seguro (base de datos/servidor). Aplicar el límite de capacidad al confirmar la operación, no solamente al mostrar la disponibilidad.
- Contar como ocupantes los cupos definitivos y las reservas temporales que sigan vigentes. Liberar automáticamente las vencidas sin depender de que el usuario vuelva a la página.
- Agrupar en la disponibilidad pública las secciones que correspondan al mismo nivel, ramo y horario, cuando sean realmente intercambiables. Mostrar la suma de capacidades y cupos libres; conservar internamente las secciones individuales y sus capacidades.
- Cada bloque/sección tendrá capacidad máxima de 15. Repartir alumnos de manera equilibrada entre secciones equivalentes con capacidad y conservar la sección asignada.
- Si el conjunto está lleno, mostrar cero cupos y explicar que puede esperar entre 5 y 10 minutos y volver a revisar si se libera uno; no prometer que un cupo será liberado ni presentar el TTL como garantía de disponibilidad.
- Revisar y restringir RLS/permisos para que usuarios públicos no puedan cambiar cupos, perfiles, reservas ajenas, documentos ni estados de pago.

**Criterios de aceptación**

- Dos solicitudes simultáneas por el último cupo no pueden reservar ambas.
- Una reserva vigente descuenta capacidad; al vencer o cancelarse según regla acordada, deja de hacerlo.
- Disponibilidad agrupada equivale a la suma de las secciones compatibles; ninguna sección interna supera su capacidad.
- La selección requiere exactamente un bloque de Matemáticas, Lenguaje, Inglés, Ciencias e Historia; no admite duplicar un ramo.
- Los bloques sin profesor se mantienen seleccionables y no exponen un dato de profesor inexistente.
- Un usuario no puede leer ni modificar los datos privados de otra familia.

### Fase 3 — Flujo público de selección de ramos y toma de horarios

**Trabajo**

- Conectar el CTA de la página al flujo de matrícula.
- Permitir elegir nivel y seleccionar obligatoriamente un bloque por cada ramo: Matemáticas, Lenguaje, Inglés, Ciencias e Historia. Mostrar disponibilidad agregada y cupos por horario.
- Validar que no haya ramos duplicados, conflictos según las reglas aprobadas ni selecciones sin disponibilidad antes de crear la reserva.
- Al continuar, crear un ID temporal en Supabase y guardar asociados los datos mínimos de contacto/estudiante y la selección.
- Iniciar el TTL inicial de 10 minutos al crear la reserva temporal. El contador visible en una esquina debe basarse en la expiración persistida por servidor, no en un reloj de navegador que pueda reiniciarse.
- Incluir en cada fase botones visibles **Cancelar** y **Volver**. Volver conserva la reserva y vencimiento; permite revisar/cambiar horarios sin renovar el plazo y aplica el cambio de selección de forma consistente. Cancelar es una acción explícita que termina la reserva y libera sus cupos.
- Si se abandona/cierra la página sin cancelar, el vencimiento del servidor manda. Al volver, recuperar el tiempo restante o informar que expiró; nunca empezar otros 10 minutos por recargar.
- Al expirar, bloquear la continuación y liberar la disponibilidad mediante el mecanismo de expiración definido.

**Criterios de aceptación**

- El recorrido puede iniciarse desde el botón de matrícula, sin pasar por el formulario de contacto.
- La selección solo permite opciones reales publicadas por administración.
- La selección contiene los cinco ramos obligatorios y un solo bloque por ramo.
- Cancelar elimina/cancela el registro temporal y libera los cupos; volver no lo cancela ni reinicia el TTL.
- Al recargar o abrir otra pestaña, el vencimiento no se reinicia ni extiende accidentalmente.
- Una reserva vencida no puede pasar a carga final de documentos o pago.

### Fase 4 — Etapa de documentos y preparación de subida futura

**Trabajo**

- Crear la etapa de documentos ligada al ID temporal, con botones **Cancelar**, **Volver** y **Continuar**. En esta entrega no mostrar una carga operativa ni exigir archivos: se podrá continuar sin adjuntos hasta que se definan los documentos requeridos.
- Mantener la futura carga real fuera de alcance hasta aprobar documentos, formatos/tamaño, retención y permisos; no crear almacenamiento o rutas de archivos sin esa definición.
- Cuando se autorice una fase futura de carga real, usar almacenamiento privado, permisos acotados y validación de tipo/tamaño del lado servidor; no hacer los documentos públicamente descargables ni registrar datos sensibles innecesarios.
- Mantener preparada la relación futura entre metadatos/archivos y el ID temporal, sin crear ahora almacenamiento, rutas de archivos ni lógica de subida.
- Al pulsar **Cancelar** en esta etapa, tratarlo como un no explícito: cancelar la reserva temporal y eliminar sus datos temporales asociados. **Volver** permite revisar horarios con el TTL corriendo; salir de la página también deja que mande el TTL.
- Cuando se autorice la carga real en el futuro, definir limpieza segura de archivos vencidos/cancelados, incluyendo errores parciales.

**Criterios de aceptación**

- La etapa existe y se puede continuar sin archivos; no se solicitan ni guardan documentos en esta entrega.
- **Cancelar** en documentos cancela explícitamente el registro temporal; **Volver** conserva la reserva y su hora de vencimiento.
- La carga real solo se incorpora después de una autorización de fase posterior y de definir requisitos documentales.

### Fase 5 — Transbank, confirmación y matrícula definitiva

**Trabajo**

- Iniciar la transacción desde un endpoint/backend seguro y guardar la referencia de pago asociada al ID temporal.
- Al iniciar Transbank, comenzar un nuevo TTL de 10 minutos para la verificación del pago, reemplazando el vencimiento anterior. Persistir esa nueva expiración; no confiar en el reloj del navegador.
- Validar la confirmación consultando/verificando el resultado del proveedor en el backend. No considerar suficiente el retorno visual del navegador.
- Procesar confirmaciones de forma idempotente: reintentos o notificaciones duplicadas no deben cobrar/provisionar dos veces ni crear matrículas repetidas.
- Si el pago se confirma y la reserva sigue válida, completar la matrícula de forma consistente, convertir los cupos a definitivos, guardar la asignación interna de secciones y crear el usuario institucional con rol `alumno` y su perfil asociado.
- Definir recuperación ante fallas parciales (pago confirmado pero creación de Auth/perfil o matrícula falla), con reintento seguro y trazabilidad operativa; no marcar éxito si falta cualquiera de los componentes definitivos.
- Incluir **Cancelar** y **Volver** también en el paso de pago. Volver no reinicia ni extiende el TTL de pago. Cancelar inicia la cancelación/verificación con el proveedor; no afirmar que el pago fue cancelado ni borrar datos mientras el resultado pueda ser incierto.
- Si el pago se confirma dentro del plazo, finalizar la matrícula. Si Transbank confirma rechazo/cancelación, o al vencer los 10 minutos el backend verifica que no se confirmó, mostrar el estado correspondiente, volver a la página inicial del flujo con aviso de tiempo agotado/no se pudo verificar la transferencia y eliminar los datos temporales asociados, liberando los cupos.
- Conservar solo la referencia/estado técnico mínimo necesario para conciliar una respuesta tardía, sin dejar activa la matrícula ni exponer datos temporales. Definir qué hacer si después se confirma un pago ya vencido antes de implementar esta fase; no crear automáticamente una matrícula sin cupo garantizado.
- No crear usuario `alumno` ni matrícula definitiva ante pago pendiente, rechazado, no verificable o expirado.

**Criterios de aceptación**

- Solo una confirmación verificada de Transbank genera matrícula definitiva, cupos confirmados y perfil `alumno`.
- El temporizador de pago parte de una nueva expiración de 10 minutos persistida al iniciar la transacción; no se reutiliza el TTL anterior.
- Una notificación repetida produce el mismo resultado final sin duplicados.
- Rechazo/cancelación confirmado o vencimiento sin confirmación verificada devuelve al flujo inicial con un mensaje claro y limpia los datos de matrícula temporales/cupos según la regla acordada. Ningún pago no confirmado se presenta como exitoso.
- Volver no reinicia el temporizador; cancelar no se presenta como completado hasta conocer el resultado verificable del proveedor.
- El ID definitivo y la relación con la cuenta Auth quedan persistidos de forma coherente y disponible para el dashboard futuro.

### Fase 6 — Reparto interno y verificación integral

**Trabajo**

- Al completar el pago, asignar al alumno a una sección interna compatible de cada ramo/horario agrupado, eligiendo solo entre las que tengan capacidad máxima de 15.
- Repartir de forma equilibrada entre secciones equivalentes, con desempate aleatorio solo cuando las opciones estén igual de ocupadas; ejecutar y guardar la asignación sin duplicar cupos.
- El usuario debe recibir/consultar el resultado final por el mecanismo aprobado. Persistir ramo, horario, sección y profesor asignado para el futuro dashboard. No construir ese dashboard como parte de esta ruta.
- Si el bloque asignado aún no tiene profesor, conservar esa relación pero no mostrar información de profesor.
- Validar flujo completo y errores: doble clic/reintentos, concurrencia por último cupo, TTL, cambio de horario, cancelación, pagos pendientes/rechazados/duplicados y fallas parciales de provisioning. Validar cargas inválidas cuando exista una fase de subida real autorizada.
- Validar las acciones **Cancelar** y **Volver** en todas las etapas, salida de página, recarga y retorno antes/después de vencimiento.
- Validar permisos de admin, alumno y visitante; comprobar que no haya acceso cruzado a perfiles, reservas o documentos.
- Revisar únicamente las pantallas tocadas en móvil y escritorio y los textos de Escencia relacionados con esta ruta.

**Criterio de finalización de esta ruta:** una familia puede completar desde la web la selección de los cinco ramos, la reserva temporal, la etapa documental sin adjuntos y el pago; solo con pago confirmado queda una matrícula estable, cuenta `alumno`, ID definitivo y asignación interna. Los vencimientos, cancelaciones y pagos no confirmados liberan correctamente cupos y datos temporales de acuerdo con las reglas aprobadas. La carga efectiva de documentos requiere una fase posterior autorizada cuando se reciban sus requisitos.

## 6. Fuera de alcance de esta ruta

- Dashboard del alumno, visualización del horario desde ese dashboard, materiales, asistencia, notas y funciones de docente.
- Carga efectiva de documentos hasta que se entreguen y aprueben sus requisitos y se autorice esa fase.
- Mensajería por correo de confirmación de pago/matrícula; por ahora el correo se limita al contacto.
- Activación del acceso a WhatsApp hasta recibir y aprobar el dato oficial.
- Otros medios de pago, facturación o gestión financiera no solicitados.
- Rediseño general de la página, cambios en contenido institucional no relacionados con marca o matrícula, y refactorizaciones generales.
- Migración o limpieza de datos ajenos a bloques, reservas, matrículas, documentos y pagos de este flujo.

## 7. Decisiones que aún bloquean partes específicas

Las siguientes decisiones no impiden construir el esqueleto del flujo, selector, disponibilidad o TTL inicial, pero sí bloquean la funcionalidad asociada:

1. **Carga real de documentos:** lista, obligatoriedad, formatos/tamaño, retención y permisos. Hasta recibirla, solo existe el paso vacío y se continúa sin adjuntos.
2. **Pago tardío:** política ante confirmación de Transbank recibida después de expirar la ventana, cuando los cupos pudieron liberarse o reasignarse. No enrolar automáticamente sin cupo garantizado.
3. **Horario y compatibilidad:** catálogo real de días/horas, reglas para combinar los cinco ramos y criterio de secciones intercambiables.
4. **Cuenta institucional:** datos necesarios y mecanismo seguro para que el alumno acceda a su cuenta después de crear Auth/perfil.
5. **Transbank:** configuración del proyecto y mecanismo oficial de consulta/notificación para verificar estados.
6. **Prueba de usuario:** resultados para validar si el TTL inicial de 10 minutos es adecuado o requiere ajuste.
7. **Contacto:** dato oficial de WhatsApp y canal/correo especializado de soporte, que no se usarán para confirmaciones y permanecerán pendientes hasta su entrega.

No sustituir estas decisiones por valores elegidos únicamente por conveniencia técnica. Si una debe fijarse para implementar, obtener confirmación antes de cerrar esa fase.

## 8. Auditoría y tabla de avances

### Resultado de auditoría

- **Alineación funcional:** tras incorporar las decisiones indicadas, la ruta representa el flujo esperado: selección de cinco ramos, un bloque por ramo, reserva con TTL, etapa documental vacía, pago con una segunda ventana, confirmación y perfil `alumno`.
- **Cobertura de navegación:** se añadieron acciones de cancelar/volver para todas las etapas; volver conserva el vencimiento y salir de la página deja actuar al TTL persistido.
- **Protección de cupos:** la agregación pública no elimina las secciones internas; cada sección mantiene su límite de 15 y la asignación final se realiza solo entre secciones con capacidad.
- **Límite importante:** no conviene considerar la ruta completamente lista para implementar pagos mientras siga pendiente el tratamiento de una confirmación tardía y la configuración verificable de Transbank.
- **Alcance documental:** la etapa de documentos se implementará primero sin subida real. No se debe inventar ni solicitar información documental hasta recibir la lista aprobada.
- **Repositorio:** la aplicación usa `profiles`, `bloques_ramos` y el catálogo `horarios` desde el panel admin; no hay migraciones ejecutables locales. `.env.local` define los nombres de las variables públicas de Supabase; sus valores no se inspeccionaron ni divulgaron.
- **Fuente de auditoría de Supabase:** el usuario confirmó que `docs/desarrollo/contexto_supabase.txt` contiene el SQL y las políticas copiados directamente desde el proyecto conectado y que lo mantendrá actualizado. La revisión de esquema y políticas de esta ruta se basa en ese snapshot; la consulta REST de solo lectura registrada previamente también obtuvo HTTP 200 para `bloques_ramos`, `profiles` y `horarios` con `limit=0`, sin solicitar filas.
- **Hallazgos de esquema y permisos:** el snapshot define `matriculas_temporales`, cuya FK apunta a `horarios(id)` y cuya fila solo contiene un `bloque_horario_id`; `profiles` tiene lectura para cualquier usuario autenticado, mientras que `bloques_ramos` y `horarios` permiten gestión a usuarios autenticados sin restricción de rol admin y lectura pública. El snapshot no muestra políticas para `matriculas_temporales`.
- **Límite de auditoría:** el snapshot refleja el estado reportado por el usuario, pero no enumera explícitamente si RLS está habilitado por tabla ni grants, triggers o funciones. No se solicitaron filas ni datos personales. Antes de crear migraciones o exponer operaciones de reserva, resolver la incompatibilidad de la FK y verificar estos elementos en el proyecto.
- **Resultado:** la auditoría documental de esquema y políticas queda completada con la fuente actualizada confirmada por el usuario. Las restricciones de permisos y la incompatibilidad de `matriculas_temporales` deben resolverse en las fases correspondientes; pago y carga real siguen sujetos a sus decisiones específicas. No se modificó código ni configuración de Supabase.
- **Fase 1 iniciada con autorización del usuario:** se actualizaron las superficies visibles de marca, los llamados de matrícula llevan a una página pública que describe el proceso sin simular reservas/pagos, el contacto queda separado para consultas, WhatsApp aparece deshabilitado y el profesor es opcional al crear/listar bloques. El usuario indicó que la preparación de Supabase está a cargo de Gemini y que se continúe programando la web/portal usando el contexto como contrato actualizado, sin modificar la base remota.
- **Aclaración del usuario sobre el catálogo y su uso en web:** las opciones de `horarios` aplican a todos los niveles/asignaturas. El panel crea opciones estructuradas con día y horas, compone la etiqueta `Día HH:mm - HH:mm`, la persiste en `horarios.etiqueta` y permite seleccionarla al crear bloques; `bloques_ramos.horario` conserva esa etiqueta como texto, sin FK. La descripción existente en el esquema no se solicita ni se usa en la interfaz. La selección pública real de horarios y disponibilidad se conecta en el flujo público.
- **Avance de interfaz pública:** `/matricula` carga `bloques_ramos`, permite escoger nivel y una opción agrupada por ramo/horario para los cinco ramos, y deshabilita opciones cuyo conteo de inscritos llena su capacidad. El conteo mostrado es solo capacidad nominal menos inscritos confirmados; el snapshot no permite vincular las reservas temporales con esos bloques, por lo que la interfaz lo etiqueta como estimación y no crea ni garantiza una reserva. La etapa documental vacía permite volver, cancelar la selección local o continuar sin adjuntar archivos. La pantalla de pago es solo informativa y no inicia Transbank. Ninguna selección ni avance se guarda en el servidor; no hay ID temporal, timer ni mutación de reserva.

La tabla se actualizará al cerrar cada fase. Los archivos concretos se completan después de la inspección previa a esa fase; “No” significa que esta ruta todavía no implementó el requisito.

| Fase | Requisito | Archivo afectado | Implementado | Verificado |
|---|---|---|---|---|
| 0 | Modelo de estados, eventos terminales y reglas de los dos TTL | `docs/desarrollo/hoja-ruta-toma-horarios.md` | Sí (diseño) | Sí (revisión documental; no comportamiento de servidor) |
| 0 | TTL inicial de 10 minutos sujeto a prueba de usuario | Pendiente de prueba tras implementar el flujo | No | Pendiente; el usuario indicó que se probará después de implementar el flujo |
| 0 | Cancelar/volver/salir y sus efectos sobre el TTL | Pendiente de inspección | No | No |
| 0 | Cinco ramos obligatorios y un bloque por ramo | Pendiente de inspección | No | No |
| 0 | ID temporal con estado y transición a definitivo vinculado a `alumno` | Pendiente de inspección | No | No |
| 0 | Auditoría del esquema y políticas RLS de Supabase | `docs/desarrollo/contexto_supabase.txt` | Sí (solo lectura; fuente actual confirmada por el usuario) | Sí para el SQL y políticas incluidos en el snapshot; estado RLS habilitado, grants, triggers y funciones no aparecen explícitamente |
| 1 | Marca visible Escencia, CTA, contacto solo consultas y WhatsApp inactivo | `src/app/page.tsx`; `src/app/layout.tsx`; `src/app/matricula/page.tsx` | Sí: CTA lleva al flujo público separado del contacto; WhatsApp inactivo | Build y TypeScript correctos |
| 1 | Profesor opcional en la creación/listado de bloques | `src/app/admin/ramos/page.tsx` | Sí | Build y TypeScript correctos |
| 1 | Gestión del catálogo de horarios y selector controlado en el panel admin | `src/app/admin/ramos/page.tsx` | Sí: crea horarios con día y reloj de inicio/término, normaliza la etiqueta, no usa descripción, carga el catálogo, impide texto libre al crear bloques y guarda la etiqueta en `bloques_ramos.horario` | Build y TypeScript correctos |
| 2 | Reservas atómicas, TTL persistido y disponibilidad agregada | Pendiente de inspección | No | No |
| 2 | Límite de 15 por sección y controles de acceso | Pendiente de inspección | No | No |
| 3 | Selección pública de los cinco ramos y bloques publicados | `src/app/matricula/MatriculaClient.tsx` | Parcial: consulta bloques, permite nivel y una opción agrupada por ramo/horario; muestra libres según inscritos y explicita que no cuenta reservas temporales | Build/TypeScript correctos; no se verificó con datos remotos |
| 3 | Reserva persistida, timer TTL y navegación cancelar/volver | Pendiente de operación atómica backend descrita/actualizada por responsable Supabase | No | No: no se crea reserva ni se inicia TTL |
| 4 | Etapa documental vacía, sin carga de archivos en esta entrega | `src/app/matricula/MatriculaClient.tsx` | Parcial: etapa visual, resumen, continuar sin adjuntos, volver y cancelar la selección local | Build/TypeScript correctos; no está vinculada a un ID temporal ni cancela una reserva real |
| 5 | Transbank con segundo TTL, conciliación y matrícula/perfil definitivo | Pendiente de integración backend/proveedor | No; solo existe pantalla informativa deshabilitada | No se inicia transacción, no hay segundo TTL ni se confirma matrícula |
| 6 | Reparto equilibrado entre secciones y pruebas integrales | Pendiente de inspección | No | No |