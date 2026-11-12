/*
  DATOS DE PRUEBA — todo inventado. Nada de esto es de 1001Carros ni de clientes reales.
  Lo que en la app real vendría de Sugar (leads con nombre y cédula) aquí se simula.
*/
window.DATOS = {
  // Asesores ficticios. 'historial' son las acciones del mes (claves de CONFIG.acciones),
  // 'mesAnterior' son los puntos con que cerró el mes pasado (para la mayor mejora).
  asesores: [
    { id: 'ana', horasAnio: 84, nombre: 'Ana Ejemplo', agencia: 'Agencia Norte (prueba)', mesAnterior: 104,
      historial: ['slaSemanal', 'seguimientoATiempo', 'seguimientoATiempo', 'ventaCerrada', 'caritaExcelente', 'leadVencido', 'ventaCerrada', 'caritaBuena', 'cotizacionSinSeguimiento', 'ventaCerrada', 'caritaAceptable', 'ventaCerrada', 'leadVencido'] },
    { id: 'bruno', horasAnio: 88, nombre: 'Bruno Ejemplo', agencia: 'Agencia Sur (prueba)', mesAnterior: 128,
      historial: ['slaSemanal', 'slaSemanal', 'slaSemanal', 'seguimientoATiempo', 'seguimientoATiempo', 'seguimientoATiempo', 'ventaCerrada', 'ventaCerrada', 'ventaCerrada', 'caritaExcelente', 'caritaExcelente', 'capacitacionNota91', 'leadVencido', 'ventaCerrada'] },
    { id: 'carla', horasAnio: 92, nombre: 'Carla Ejemplo', agencia: 'Agencia Centro (prueba)', mesAnterior: 125,
      historial: ['slaSemanal', 'slaSemanal', 'seguimientoATiempo', 'seguimientoATiempo', 'ventaCerrada', 'ventaCerrada', 'caritaExcelente', 'caritaExcelente', 'caritaBuena', 'capacitacionNota95', 'ventaCerrada'] },
    { id: 'diego', horasAnio: 62, nombre: 'Diego Ejemplo', agencia: 'Agencia Norte (prueba)', mesAnterior: 112,
      historial: ['seguimientoATiempo', 'ventaCerrada', 'caritaBuena', 'leadVencido', 'leadVencido', 'cotizacionSinSeguimiento', 'capacitacionIncompleta', 'ventaCerrada'] },
    { id: 'elena', horasAnio: 80, nombre: 'Elena Ejemplo', agencia: 'Agencia Valle (prueba)', mesAnterior: 115,
      historial: ['slaSemanal', 'seguimientoATiempo', 'seguimientoATiempo', 'ventaCerrada', 'ventaCerrada', 'caritaExcelente', 'leadVencido', 'ventaCerrada'] },
    { id: 'fernando', horasAnio: 54, nombre: 'Fernando Ejemplo', agencia: 'Agencia Sur (prueba)', mesAnterior: 97,
      historial: ['seguimientoATiempo', 'ventaCerrada', 'caritaAceptable', 'leadVencido', 'cotizacionSinSeguimiento', 'leadVencido'] },
    { id: 'gabriela', horasAnio: 90, nombre: 'Gabriela Ejemplo', agencia: 'Agencia Centro (prueba)', mesAnterior: 120,
      historial: ['slaSemanal', 'slaSemanal', 'seguimientoATiempo', 'ventaCerrada', 'ventaCerrada', 'caritaBuena', 'caritaExcelente', 'capacitacionNota91', 'ventaCerrada'] },
    { id: 'hugo', horasAnio: 46, nombre: 'Hugo Ejemplo', agencia: 'Agencia Valle (prueba)', mesAnterior: 99,
      historial: ['ventaCerrada', 'leadVencido', 'leadVencido', 'cotizacionSinSeguimiento', 'capacitacionIncompleta'] }
  ],

  // Antes y después: números mensuales del asesor (inventados pero coherentes) y cuándo se capacitó.
  // 'mes' es la posición en 'meses'. Antes = promedio de los 2 meses previos; después = de los 2 siguientes.
  impacto: {
    meses: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct'],
    indicadores: {
      conversion: { nombre: 'Conversión', unidad: '%', valores: [10.5, 10.8, 11.0, 10.9, 11.2, 12.0, 12.3, 11.8, 12.2, 14.3] },
      ventas: { nombre: 'Ventas al mes', unidad: '', valores: [3, 4, 3, 4, 4, 5, 5, 4, 5, 6] },
      satisfaccion: { nombre: 'Clientes satisfechos', unidad: '%', valores: [80, 81, 80, 82, 83, 86, 87, 86, 87, 90] }
    },
    // Meses (posición en 'meses') de las capacitaciones que se comparan antes y después.
    marcas: [4, 8]
  },

  // Capa de juego: cómo arranca el asesor que entra.
  juego: { racha: 4, retoAvance: 3, preguntasCorrectas: 3 },

  // Pregunta del día: una por día, sale de lo que enseñan los cursos.
  preguntasDelDia: [
    { texto: '¿Cuántos puntos tiene la revisión que se le hace a cada auto?', opciones: ['50', '150', '300'], correcta: 1, explicacion: 'Cada auto pasa una revisión de 150 puntos antes de salir a la venta.' },
    { texto: 'El cliente dice que en Marketplace está $900 más barato. ¿Qué haces primero?', opciones: ['Bajo el precio', 'Comparo lo que incluye cada opción', 'Le digo que compre allá'], correcta: 1, explicacion: 'La diferencia es el respaldo: revisión, garantía, devolución y trámites.' },
    { texto: '¿Cuánto dura la garantía de satisfacción?', opciones: ['7 días o 300 km', '30 días', '1 año'], correcta: 0, explicacion: 'Si no le convence, tiene 7 días o 300 km.' },
    { texto: '«¿Para cuándo me lo entregan?» es…', opciones: ['Una objeción', 'Una señal de compra', 'Una queja'], correcta: 1, explicacion: 'Es una señal de compra: es momento de proponer el cierre.' },
    { texto: '¿Qué cubre la garantía mecánica?', opciones: ['6 meses', '1 año o 20.000 km', '2 años sin límite'], correcta: 1, explicacion: 'La garantía mecánica es de 1 año o 20.000 km.' },
    { texto: '¿Cuándo conviene preguntar por la forma de pago?', opciones: ['Al final', 'Desde el primer contacto', 'Solo si el cliente pregunta'], correcta: 1, explicacion: 'Saber pronto cómo piensa pagar ayuda a ofrecer el financiamiento a tiempo.' }
  ],

  // Semana del asesor que entra: leads atendidos dentro del tiempo / total (para el +4 semanal).
  semana: { dentroDelTiempo: 8, total: 9, bonoEntregado: false },

  // Leads simulados (vendrían de Sugar). 'minutosDesdeIngreso' se fija al entrar y luego corre en vivo.
  leads: [
    { id: 'l1', nombre: 'María Fernanda Ejemplo', cedula: '1700000011', canal: 'Página web', minutosDesdeIngreso: 47, atendido: false,
      ficha: { vehiculo: 'SUV mediana 2021', presupuesto: '18.000 – 22.000', uso: '', cuando: '', pago: '', partePago: '', ocupacion: '' } },
    { id: 'l2', nombre: 'Jorge Prueba', cedula: '1700000022', canal: 'Facebook', minutosDesdeIngreso: 51, atendido: false,
      ficha: { vehiculo: 'Sedán automático', presupuesto: '', uso: '', cuando: '', pago: '', partePago: '', ocupacion: '' } },
    { id: 'l3', nombre: 'Lucía Demo', cedula: '1700000033', canal: 'WhatsApp', minutosDesdeIngreso: 22, atendido: false,
      ficha: { vehiculo: 'Camioneta doble cabina', presupuesto: '', uso: 'Trabajo', cuando: '', pago: '', partePago: '', ocupacion: '' } },
    { id: 'l4', nombre: 'Andrés Ficticio', cedula: '1700000044', canal: 'Página web', minutosDesdeIngreso: 6, atendido: false,
      ficha: { vehiculo: 'Hatchback', presupuesto: '', uso: '', cuando: '', pago: '', partePago: '', ocupacion: '' } },
    { id: 'l5', nombre: 'Paola Muestra', cedula: '1700000055', canal: 'Referido', atendido: true, seguimientoHoy: '16:00',
      proximaAccion: 'Llamar para confirmar el test drive',
      ficha: { vehiculo: 'SUV compacta 2022', presupuesto: '20.000 – 24.000', uso: 'Familiar', cuando: 'Este mes', pago: 'Crédito', partePago: 'Sí', ocupacion: 'Docente' } },
    { id: 'l6', nombre: 'Carlos Ejemplo', cedula: '1700000066', canal: 'Página web', atendido: true, seguimientoHoy: '11:30',
      proximaAccion: 'Seguimiento a la cotización enviada ayer',
      acciones: { disponibilidad: true, cita: 'Hizo test drive, le gustó' },
      ficha: { vehiculo: 'Sedán 2020', presupuesto: '14.000 – 16.000', uso: 'Personal', cuando: 'En 1 a 3 meses', pago: 'Contado', partePago: 'No', ocupacion: 'Ingeniero' } },
    { id: 'l7', nombre: 'Daniela Prueba', cedula: '1700000077', canal: 'Instagram', atendido: true,
      proximaAccion: 'Cita en la agencia mañana a las 10:00',
      acciones: { disponibilidad: true },
      ficha: { vehiculo: 'Crossover 2023', presupuesto: '25.000 – 28.000', uso: 'Personal', cuando: 'Este mes', pago: 'Crédito', partePago: 'No', ocupacion: 'Abogada' } },
    { id: 'l8', nombre: 'Roberto Demo', cedula: '1700000088', canal: 'Referido', atendido: true,
      proximaAccion: 'Negociación: espera respuesta del crédito',
      acciones: { disponibilidad: true, cita: 'Hizo test drive, le gustó', cotizacion: 'En negociación', seguimiento: true },
      ficha: { vehiculo: 'SUV 7 asientos 2021', presupuesto: '28.000 – 32.000', uso: 'Familiar', cuando: 'Este mes', pago: 'Crédito', partePago: 'Sí', ocupacion: 'Comerciante' } },
    { id: 'l9', nombre: 'Sofía Ficticia', cedula: '1700000099', canal: 'Página web', atendido: true,
      proximaAccion: 'Enviar la cotización con el financiamiento',
      acciones: { disponibilidad: true, cita: 'Asistió a la cita' },
      ficha: { vehiculo: 'Hatchback 2022', presupuesto: '12.000 – 14.000', uso: 'Personal', cuando: 'En 1 a 3 meses', pago: 'Crédito', partePago: 'No', ocupacion: 'Estudiante de posgrado' } }
  ],

  // Objeciones guardadas este mes y si se resolvieron (sirve para recomendar un curso).
  objecionesPrevias: [
    { tipo: 'precio', resuelta: false }, { tipo: 'precio', resuelta: false }, { tipo: 'tramites', resuelta: true }
  ],

  // Guías de respuesta. Los datos de la propuesta de valor salen de la tesis (Entregable 1).
  objeciones: {
    precio: {
      nombre: 'Precio',
      resumen: 'El cliente encontró el auto más barato en otro lado.',
      explicar: [
        'El precio incluye lo que no se ve: la revisión de 150 puntos, el alistamiento y los trámites legales.',
        'Compare auto con auto: mismo año, kilometraje, estado y papeles en regla.',
        'Pregunte cuánto le costaría arreglar por su cuenta lo que nosotros ya revisamos.'
      ],
      beneficios: ['Revisión de 150 puntos', 'Garantía mecánica de 1 año o 20.000 km', 'Garantía de satisfacción de 7 días o 300 km', 'Garantía de procedencia', 'Recibimos su auto en parte de pago'],
      comparacion: {
        titulo: 'Lo que incluye el precio',
        columnas: ['', 'Otro vendedor', '1001Carros'],
        filas: [['Revisión mecánica', 'Por su cuenta', '150 puntos'], ['Garantía mecánica', 'No', '1 año o 20.000 km'], ['Si no le convence', 'Sin devolución', '7 días o 300 km'], ['Trámites legales', 'Por su cuenta', 'Incluidos']]
      }
    },
    tramites: {
      nombre: 'Costo de trámites',
      resumen: 'Le parece caro lo que cuestan los trámites.',
      explicar: [
        'Detalle qué incluye el valor: traspaso, revisión de papeles y gestión ante las entidades.',
        'Muestre el tiempo que se ahorra: filas, citas y vueltas que no tiene que hacer.',
        'Una diferencia pequeña (en la tesis: USD 518 frente a USD 450) se explica con lo que incluye; no deje que se pierda la venta por eso.'
      ],
      beneficios: ['Gestión de trámites legales incluida', 'Garantía de procedencia', 'Papeles revisados antes de la venta'],
      comparacion: {
        titulo: 'Por su cuenta vs. con 1001Carros',
        columnas: ['', 'Por su cuenta', 'Con 1001Carros'],
        filas: [['Traspaso y papeles', 'Usted hace las filas', 'Lo gestionamos'], ['Revisión de procedencia', 'No siempre', 'Garantizada'], ['Tiempo', 'Varios días', 'Lo hacemos por usted'], ['Riesgo de multas o deudas ocultas', 'Lo asume usted', 'Revisado antes']]
      }
    },
    marketplace: {
      nombre: 'Marketplace / particular',
      resumen: 'Lo vio más barato con un particular (en la tesis: hasta USD 900 de diferencia).',
      explicar: [
        'Con un particular no hay revisión, ni garantía, ni a quién reclamar después.',
        'Pregunte si el vendedor le da garantía mecánica o le acepta su auto en parte de pago.',
        'La diferencia de precio es el costo del respaldo: revisión, garantía y una operación segura.'
      ],
      beneficios: ['Revisión de 150 puntos', 'Garantía de 1 año o 20.000 km', 'Garantía de satisfacción de 7 días o 300 km', 'Operación segura y documentada'],
      comparacion: {
        titulo: 'Particular vs. 1001Carros',
        columnas: ['', 'Particular', '1001Carros'],
        filas: [['Revisión', 'No', '150 puntos'], ['Garantía', 'No', '1 año o 20.000 km'], ['Devolución', 'No', '7 días o 300 km'], ['Pago seguro y trámites', 'Por su cuenta', 'Incluido'], ['Financiamiento', 'No', 'Sí']]
      }
    },
    financiamiento: {
      nombre: 'Financiamiento',
      resumen: 'Tiene dudas sobre el crédito o cree que no califica.',
      explicar: [
        'Pregunte desde el inicio cómo piensa pagar y si tiene un auto para dar en parte de pago.',
        'Explique las opciones de crédito y qué papeles necesita según su ocupación.',
        'Ofrezca revisar la preaprobación desde la primera cita, para que no espere.'
      ],
      beneficios: ['Opciones de crédito', 'Su auto como parte de pago', 'Acompañamiento en el trámite del crédito'],
      comparacion: {
        titulo: 'Puntos que el asesor debe explicar',
        columnas: ['', 'Qué preguntar', 'Qué explicar'],
        filas: [['Entrada', '¿Cuánto tiene?', 'Su auto puede servir de entrada'], ['Cuota', '¿Cuánto puede pagar al mes?', 'Plazos disponibles'], ['Papeles', '¿A qué se dedica?', 'Qué documentos pedirá el banco']]
      }
    },
    garantias: {
      nombre: 'Garantías',
      resumen: 'No le queda claro qué respaldo tiene después de comprar.',
      explicar: [
        'Resuma las tres garantías en una frase: mecánica, de satisfacción y de procedencia.',
        'Explique qué cubre la garantía mecánica y cómo se usa.',
        'Recuerde que si en 7 días o 300 km no le convence, tiene la garantía de satisfacción.'
      ],
      beneficios: ['Garantía mecánica de 1 año o 20.000 km', 'Garantía de satisfacción de 7 días o 300 km', 'Garantía de procedencia', 'Revisión de 150 puntos antes de la venta'],
      comparacion: {
        titulo: 'Resumen de garantías',
        columnas: ['', 'Cubre', 'Plazo'],
        filas: [['Mecánica', 'Fallas mecánicas', '1 año o 20.000 km'], ['Satisfacción', 'Si no le convence', '7 días o 300 km'], ['Procedencia', 'Origen y papeles del auto', 'Siempre']]
      }
    }
  },

  // MIS CAPACITACIONES: una por mes, de 8 horas. 'resultado' es cómo le fue al asesor si el mes ya pasó
  // (horas hechas, nota de la evaluación inicial y de la final). El mes en curso arranca con 'sesionesMesActual'.
  capacitaciones: [
    { nombre: 'Inducción comercial 1001Carros',
      contenido: [['La empresa', 'Seminuevos, Autos OK y Changan: qué vende cada línea y a quién.'], ['El proceso', 'Del lead a la facturación: qué hace el asesor en cada paso.'], ['Herramientas', 'Sugar, la app del asesor y el tablero mensual.']],
      preguntas: [['¿Qué línea vende autos nuevos?', ['Autos OK', 'Changan', 'Seminuevos'], 1], ['¿Dónde vive el embudo de clientes?', ['En Sugar', 'En esta app', 'En Excel'], 0], ['¿Con cuántos puntos empieza cada mes el asesor?', ['50', '100', '200'], 1]],
      resultado: { horas: 8, notaInicial: 62, notaFinal: 96 } },
    { nombre: 'Conexión con el cliente',
      contenido: [['Escucha activa', 'Deje hablar al cliente y repita con sus palabras lo que entendió.'], ['Sintonía', 'Adapte el tono y el ritmo a cada persona.'], ['Preguntas que abren', '«¿Para qué va a usar el auto?» dice más que «¿Qué auto busca?».']],
      preguntas: [['¿Qué pregunta descubre mejor la necesidad?', ['¿Qué auto busca?', '¿Para qué va a usar el auto?', '¿Cuánto quiere gastar?'], 1], ['Escuchar activamente es…', ['Esperar el turno para hablar', 'Repetir con sus palabras lo que entendió', 'Tomar notas sin mirar'], 1], ['Adaptar el discurso es…', ['Usar el mismo guion', 'Ajustar tono y ritmo a cada cliente', 'Hablar más rápido'], 1]],
      resultado: { horas: 8, notaInicial: 60, notaFinal: 92 } },
    { nombre: 'Proceso comercial y Sugar',
      contenido: [['El embudo', 'Lead, contacto, cita o test drive, negociación, financiamiento y facturación.'], ['Registrar bien', 'Cada paso en Sugar el mismo día, para no perder al cliente.'], ['Próxima acción', 'Nunca cerrar una llamada sin fecha para el siguiente contacto.']],
      preguntas: [['¿Qué va después de la cita o test drive?', ['Facturación', 'Negociación', 'Lead'], 1], ['¿Cuándo se registra una cita?', ['El mismo día', 'A fin de mes', 'Cuando se vende'], 0], ['Al terminar una llamada, el asesor…', ['Espera que el cliente llame', 'Deja fecha para el siguiente contacto', 'Cierra el lead'], 1]],
      resultado: { horas: 8, notaInicial: 58, notaFinal: 97 } },
    { nombre: 'Gestión de leads y tiempos de respuesta',
      contenido: [['La primera hora', 'Un lead atendido en menos de 1 hora tiene muchas más opciones de convertirse.'], ['Priorizar', 'Urgente, pendiente y al día: atender primero lo que está por vencer.'], ['Información útil', 'Presupuesto, uso, forma de pago y auto en parte de pago desde el primer contacto.']],
      preguntas: [['¿Cuál es el tiempo máximo de respuesta?', ['1 hora', '1 día', '1 semana'], 0], ['¿Qué lead se atiende primero?', ['El más reciente', 'El que está por vencer', 'El más fácil'], 1], ['¿Qué conviene preguntar desde el inicio?', ['La forma de pago', 'El color favorito', 'Nada'], 0]],
      resultado: { horas: 8, notaInicial: 65, notaFinal: 93 } },
    { nombre: 'Propuesta de valor de 1001Carros',
      contenido: [['Revisión de 150 puntos', 'Cada auto pasa una revisión completa antes de salir a la venta.'], ['Garantías', 'Mecánica de 1 año o 20.000 km, de satisfacción de 7 días o 300 km y de procedencia.'], ['Respaldo legal', 'Trámites legales incluidos y auto alistado para entregar.']],
      preguntas: [['¿De cuántos puntos es la revisión?', ['50', '100', '150'], 2], ['La garantía mecánica cubre…', ['6 meses', '1 año o 20.000 km', '2 años'], 1], ['¿Qué incluye el respaldo legal?', ['Trámites y procedencia', 'Seguro del auto', 'Mantenimientos gratis'], 0]],
      resultado: { horas: 8, notaInicial: 61, notaFinal: 98 } },
    { nombre: 'Financiamiento y crédito',
      contenido: [['Preguntar pronto', 'Cómo piensa pagar y si tiene un auto para dar en parte de pago.'], ['Opciones', 'Plazos, entrada y cuota: explicar sin tecnicismos.'], ['Papeles', 'Qué documentos pedirá el banco según la ocupación del cliente.']],
      preguntas: [['¿Cuándo se pregunta la forma de pago?', ['Al final', 'Desde el primer contacto', 'Nunca'], 1], ['Un auto en parte de pago puede servir de…', ['Entrada', 'Garantía', 'Seguro'], 0], ['Los papeles del crédito dependen de…', ['La ocupación del cliente', 'El color del auto', 'La agencia'], 0]],
      resultado: { horas: 8, notaInicial: 59, notaFinal: 90 } },
    { nombre: 'Test drive y presentación del vehículo',
      contenido: [['Antes', 'Confirmar que el auto está disponible y limpio en la agencia.'], ['Durante', 'Mostrar lo que el cliente dijo que necesita, no todo el catálogo.'], ['Después', 'Preguntar qué le pareció y dejar la siguiente acción acordada.']],
      preguntas: [['¿Qué se confirma antes del test drive?', ['Que el auto esté disponible', 'El clima', 'Nada'], 0], ['Durante la prueba se muestra…', ['Todo el catálogo', 'Lo que el cliente necesita', 'Solo el precio'], 1], ['Al terminar, el asesor…', ['Se despide', 'Acuerda la siguiente acción', 'Envía la factura'], 1]],
      resultado: { horas: 8, notaInicial: 64, notaFinal: 95 } },
    { nombre: 'Seguimiento de cotizaciones',
      contenido: [['A tiempo', 'Seguimiento dentro del plazo: si no, se restan 3 puntos.'], ['Con valor', 'Cada llamada aporta algo nuevo: una opción, una respuesta, una fecha.'], ['Registrar', 'El resultado de la cotización queda en la app y en Sugar.']],
      preguntas: [['¿Qué pasa si no se sigue una cotización a tiempo?', ['Nada', 'Se restan 3 puntos', 'Se suma 1 punto'], 1], ['Un buen seguimiento…', ['Repite lo mismo', 'Aporta algo nuevo', 'Presiona'], 1], ['¿Dónde se registra el resultado?', ['En la app y en Sugar', 'En papel', 'En ningún lado'], 0]],
      resultado: { horas: 6, notaInicial: 57, notaFinal: null } },
    { nombre: 'Taller de objeciones',
      contenido: [['Precio', 'No bajar el precio de entrada: mostrar lo que incluye.'], ['Marketplace', 'Un particular no da revisión, garantía ni devolución.'], ['Trámites', 'Detallar qué incluye el valor y el tiempo que se ahorra.']],
      preguntas: [['Lo vio $900 más barato en Marketplace. ¿Qué hace primero?', ['Baja el precio', 'Compara lo que incluye cada opción', 'Le dice que compre allá'], 1], ['¿Qué garantía de satisfacción hay?', ['3 días o 100 km', '7 días o 300 km', '30 días'], 1], ['Le parecen caros los trámites. ¿Qué explica?', ['Qué incluye el valor y el tiempo que ahorra', 'Que no se pueden cambiar', 'Que los haga por su cuenta'], 0]],
      resultado: { horas: 8, notaInicial: 55, notaFinal: 96 } },
    { nombre: 'Negociación y cierre',
      contenido: [['Señales de compra', 'Preguntas por la entrega, el color o la cuota: es momento de proponer el cierre.'], ['Técnicas de cierre', 'Resumir lo acordado y proponer el siguiente paso concreto.'], ['Si no cierra hoy', 'Dejar fecha y hora para el siguiente contacto.']],
      preguntas: [['«¿Para cuándo me lo entregan?» es…', ['Una objeción', 'Una señal de compra', 'Una queja'], 1], ['Si el cliente no cierra hoy…', ['Espera que llame', 'Deja fecha y hora', 'Le baja el precio'], 1], ['Para cerrar conviene…', ['Resumir y proponer el siguiente paso', 'Hablar de otros autos', 'Presionar con descuentos'], 0]],
      resultado: { horas: 8, notaInicial: 63, notaFinal: 92 } },
    { nombre: 'Manejo de objeciones: precio y Marketplace',
      contenido: [['Precio', 'No baje el precio de entrada: muestre lo que incluye (revisión de 150 puntos, garantías y trámites).'], ['Marketplace', 'Un particular no da revisión, ni garantía, ni devolución. Esa diferencia es el respaldo.'], ['Trámites', 'Detalle qué incluye el valor y cuánto tiempo se ahorra el cliente.'], ['Financiamiento', 'Pregunte pronto cómo piensa pagar y si tiene un auto para dar en parte de pago.']],
      preguntas: [['El cliente lo vio $900 más barato en Marketplace. ¿Qué hace primero?', ['Baja el precio', 'Compara lo que incluye cada opción', 'Le dice que compre allá'], 1], ['¿Qué garantía de satisfacción ofrece 1001Carros?', ['3 días o 100 km', '7 días o 300 km', '30 días'], 1], ['Le parecen caros los trámites. ¿Qué explica?', ['Qué incluye el valor y el tiempo que se ahorra', 'Que no se pueden cambiar', 'Que los haga por su cuenta'], 0], ['¿Cuándo conviene preguntar por la forma de pago?', ['Al final, al cerrar', 'Desde el primer contacto', 'Nunca'], 1]],
      resultado: { horas: 8, notaInicial: 55, notaFinal: 94 } },
    { nombre: 'Servicio posventa y referidos',
      contenido: [['Entrega', 'Explicar las garantías y el kit de cierre el día de la entrega.'], ['Satisfacción', 'Pedir la calificación con caritas al terminar.'], ['Referidos', 'Un cliente contento recomienda: pedirlo con naturalidad.']],
      preguntas: [['¿Cuándo se pide la calificación con caritas?', ['Al terminar la atención', 'Un mes después', 'Nunca'], 0], ['El día de la entrega se explican…', ['Las garantías', 'Otros autos', 'Los precios de la competencia'], 0], ['Los referidos se piden…', ['Con presión', 'Con naturalidad', 'No se piden'], 1]],
      resultado: { horas: 8, notaInicial: 60, notaFinal: 93 } }
  ],

  // Lo que el asesor que entra ya hizo este mes en su capacitación (6 de 8 h; la evaluación inicial ya la dio).
  sesionesMesActual: [
    { dia: 3, actividad: 'Sesión de la capacitación', horas: 2 },
    { dia: 5, actividad: 'Taller práctico', horas: 2 },
    { dia: 10, actividad: 'Role play', horas: 2 }
  ],

  coaching: [
    { fecha: '14/10', jefe: 'Jefe de agencia (prueba)', brecha: 'Objeciones de precio sin resolver', accion: 'Practicar la comparación con Marketplace en un role play y revisar en dos semanas.' }
  ]
};
