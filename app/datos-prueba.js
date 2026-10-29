/*
  DATOS DE PRUEBA — todo inventado. Nada de esto es de 1001Carros ni de clientes reales.
  Lo que en la app real vendría de Sugar (leads con nombre y cédula) aquí se simula.
*/
window.DATOS = {
  // Asesores ficticios. 'historial' son las acciones del mes (claves de CONFIG.acciones),
  // 'mesAnterior' son los puntos con que cerró el mes pasado (para la mayor mejora).
  asesores: [
    { id: 'ana', nombre: 'Ana Ejemplo', agencia: 'Agencia Norte (prueba)', mesAnterior: 104,
      historial: ['slaSemanal', 'seguimientoATiempo', 'seguimientoATiempo', 'ventaCerrada', 'caritaExcelente', 'cursoNota90', 'leadVencido', 'ventaCerrada', 'caritaBuena', 'cotizacionSinSeguimiento', 'ventaCerrada', 'caritaAceptable', 'ventaCerrada', 'leadVencido'] },
    { id: 'bruno', nombre: 'Bruno Ejemplo', agencia: 'Agencia Sur (prueba)', mesAnterior: 128,
      historial: ['slaSemanal', 'slaSemanal', 'slaSemanal', 'seguimientoATiempo', 'seguimientoATiempo', 'seguimientoATiempo', 'ventaCerrada', 'ventaCerrada', 'ventaCerrada', 'caritaExcelente', 'caritaExcelente', 'cursoNota80', 'leadVencido', 'ventaCerrada'] },
    { id: 'carla', nombre: 'Carla Ejemplo', agencia: 'Agencia Centro (prueba)', mesAnterior: 125,
      historial: ['slaSemanal', 'slaSemanal', 'seguimientoATiempo', 'seguimientoATiempo', 'ventaCerrada', 'ventaCerrada', 'caritaExcelente', 'caritaExcelente', 'caritaBuena', 'cursoNota90', 'cursoNota80', 'ventaCerrada'] },
    { id: 'diego', nombre: 'Diego Ejemplo', agencia: 'Agencia Norte (prueba)', mesAnterior: 112,
      historial: ['seguimientoATiempo', 'ventaCerrada', 'caritaBuena', 'leadVencido', 'leadVencido', 'cotizacionSinSeguimiento', 'cursoVencido', 'ventaCerrada'] },
    { id: 'elena', nombre: 'Elena Ejemplo', agencia: 'Agencia Valle (prueba)', mesAnterior: 115,
      historial: ['slaSemanal', 'seguimientoATiempo', 'seguimientoATiempo', 'ventaCerrada', 'ventaCerrada', 'caritaExcelente', 'cursoNota70', 'leadVencido', 'ventaCerrada'] },
    { id: 'fernando', nombre: 'Fernando Ejemplo', agencia: 'Agencia Sur (prueba)', mesAnterior: 97,
      historial: ['seguimientoATiempo', 'ventaCerrada', 'caritaAceptable', 'leadVencido', 'cotizacionSinSeguimiento', 'leadVencido'] },
    { id: 'gabriela', nombre: 'Gabriela Ejemplo', agencia: 'Agencia Centro (prueba)', mesAnterior: 120,
      historial: ['slaSemanal', 'slaSemanal', 'seguimientoATiempo', 'ventaCerrada', 'ventaCerrada', 'caritaBuena', 'caritaExcelente', 'cursoNota80', 'ventaCerrada'] },
    { id: 'hugo', nombre: 'Hugo Ejemplo', agencia: 'Agencia Valle (prueba)', mesAnterior: 99,
      historial: ['ventaCerrada', 'leadVencido', 'leadVencido', 'cotizacionSinSeguimiento', 'cursoVencido'] }
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

  // Ruta de capacitación: 4 cursos con contenido breve y evaluación corta.
  cursos: [
    {
      id: 'c1', nombre: 'Conexión con el cliente', duracion: '15 min', vence: 'Completado', estado: 'completado', notaInicial: 60, notaFinal: 92,
      contenido: [
        ['Escucha activa', 'Deje hablar al cliente sin interrumpir y repita con sus palabras lo que entendió.'],
        ['Sintonía', 'Adapte el ritmo y el tono a la persona: no se le habla igual a una familia que a un comprador de flota.'],
        ['Preguntas que abren', '«¿Para qué va a usar el auto?» dice más que «¿Qué auto busca?».']
      ],
      preguntas: [
        ['¿Qué pregunta descubre mejor la necesidad del cliente?', ['¿Qué auto busca?', '¿Para qué va a usar el auto?', '¿Cuánto quiere gastar?'], 1],
        ['Escuchar activamente es…', ['Esperar el turno para hablar', 'Repetir con sus palabras lo que entendió', 'Tomar notas sin mirar al cliente'], 1],
        ['Adaptar el discurso significa…', ['Usar siempre el mismo guion', 'Ajustar el tono y el ritmo a cada cliente', 'Hablar más rápido'], 1]
      ]
    },
    {
      id: 'c2', nombre: 'Manejo de objeciones', duracion: '20 min', vence: 'Vence en 3 días', estado: 'en curso', notaInicial: 55,
      contenido: [
        ['Precio', 'No baje el precio de entrada: muestre lo que incluye (revisión de 150 puntos, garantías y trámites).'],
        ['Marketplace', 'Un particular no da revisión, ni garantía, ni devolución. Esa diferencia es el respaldo.'],
        ['Trámites', 'Detalle qué incluye el valor y cuánto tiempo se ahorra el cliente.'],
        ['Financiamiento', 'Pregunte pronto cómo piensa pagar y si tiene un auto para dar en parte de pago.']
      ],
      preguntas: [
        ['El cliente lo vio $900 más barato en Marketplace. ¿Qué hace primero?', ['Baja el precio', 'Compara lo que incluye cada opción', 'Le dice que compre allá'], 1],
        ['¿Qué garantía de satisfacción ofrece 1001Carros?', ['3 días o 100 km', '7 días o 300 km', '30 días'], 1],
        ['Le parecen caros los trámites. ¿Qué explica?', ['Qué incluye el valor y el tiempo que se ahorra', 'Que no se pueden cambiar', 'Que los haga por su cuenta'], 0],
        ['¿Cuándo conviene preguntar por la forma de pago?', ['Al final, al cerrar', 'Desde el primer contacto', 'Nunca'], 1]
      ]
    },
    {
      id: 'c3', nombre: 'Propuesta de valor de 1001Carros', duracion: '15 min', vence: 'Vence el 15/11', estado: 'pendiente',
      contenido: [
        ['Revisión de 150 puntos', 'Cada auto pasa una revisión completa antes de salir a la venta.'],
        ['Garantías', 'Mecánica de 1 año o 20.000 km, de satisfacción de 7 días o 300 km y de procedencia.'],
        ['Respaldo legal y alistamiento', 'Trámites legales incluidos y el auto alistado para entregar.']
      ],
      preguntas: [
        ['¿De cuántos puntos es la revisión?', ['50', '100', '150'], 2],
        ['La garantía mecánica cubre…', ['6 meses', '1 año o 20.000 km', '2 años'], 1],
        ['¿Qué incluye el respaldo legal?', ['Gestión de trámites y procedencia', 'Seguro del auto', 'Mantenimientos gratis'], 0]
      ]
    },
    {
      id: 'c4', nombre: 'Negociación y cierre', duracion: '20 min', vence: 'Vence el 30/11', estado: 'pendiente',
      contenido: [
        ['Señales de compra', 'Preguntas por la entrega, el color o la cuota: es momento de proponer el cierre.'],
        ['Técnicas de cierre', 'Resuma lo acordado y proponga el siguiente paso concreto.'],
        ['Seguimiento', 'Si no cierra hoy, deje fecha y hora para el siguiente contacto.']
      ],
      preguntas: [
        ['«¿Para cuándo me lo entregan?» es…', ['Una objeción', 'Una señal de compra', 'Una pregunta sin importancia'], 1],
        ['Si el cliente no cierra hoy, usted…', ['Espera a que llame', 'Deja fecha y hora para el siguiente contacto', 'Le baja el precio'], 1],
        ['Para cerrar conviene…', ['Resumir lo acordado y proponer el siguiente paso', 'Hablar de otros autos', 'Presionar con descuentos'], 0]
      ]
    }
  ],

  coaching: [
    { fecha: '14/10', jefe: 'Jefe de agencia (prueba)', brecha: 'Objeciones de precio sin resolver', accion: 'Practicar la comparación con Marketplace en un role play y revisar en dos semanas.' }
  ]
};
