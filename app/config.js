/*
  CONFIGURACIÓN — el único archivo que hay que tocar para cambiar puntos, plazos,
  metas y premios.

  ⚠️ TODO ES PROVISIONAL. Los valores salen del «Brief App Asesor 1001Carros» (29/10),
  que dice que los puntos y premios se ajustan después de la validación y del
  análisis financiero. Lo marcado «propuesta» no está en el brief.
*/
window.CONFIG = {
  nombreApp: 'App del Asesor',       // nombre definitivo: pendiente

  puntosInicioMes: 100,              // todos arrancan el mes con esto; se reinicia cada mes

  // Cada acción que suma o resta. 'componente' es el tipo de desempeño en el ranking.
  acciones: {
    slaSemanal:               { puntos: +4, componente: 'gestion',    motivo: 'Semana con 90 % o más de leads atendidos dentro del tiempo' },
    seguimientoATiempo:       { puntos: +3, componente: 'gestion',    motivo: 'Seguimiento hecho dentro del plazo' },
    leadVencido:              { puntos: -2, componente: 'gestion',    motivo: 'Lead que pasó el tiempo máximo sin gestión' },
    cotizacionSinSeguimiento: { puntos: -3, componente: 'gestion',    motivo: 'Cotización sin seguimiento dentro del plazo' },
    caritaExcelente:          { puntos: +5, componente: 'servicio',   motivo: 'Cliente calificó la atención como excelente' },
    caritaBuena:              { puntos: +3, componente: 'servicio',   motivo: 'Cliente calificó la atención como buena' },
    caritaAceptable:          { puntos: +1, componente: 'servicio',   motivo: 'Cliente calificó la atención como aceptable' },
    // Capacitación del mes (regla del 12/11, reemplaza la del brief): la nota de la evaluación final
    // da puntos y no completar las horas del mes resta. 95 cuenta como «95 a 100».
    capacitacionNota95:       { puntos: +4, componente: 'desarrollo', motivo: 'Capacitación del mes con nota de 95 a 100' },
    capacitacionNota91:       { puntos: +2, componente: 'desarrollo', motivo: 'Capacitación del mes con nota de 91 a 94' },
    capacitacionIncompleta:   { puntos: -2, componente: 'desarrollo', motivo: 'Capacitación del mes sin completar las 8 horas' },
    // Propuesta (no está en el brief): para que el ranking también mida resultados comerciales.
    ventaCerrada:             { puntos: +4, componente: 'resultados', motivo: 'Venta cerrada' },
    // Capa de juego (propuesta nuestra, 9/11).
    retoSemanal:              { puntos: +5, componente: 'gestion',    motivo: 'Reto de la semana cumplido' },
    preguntaDelDia:           { puntos: +1, componente: 'desarrollo', motivo: 'Pregunta del día respondida bien' }
  },

  // Mis capacitaciones: 1 capacitación al mes, de 8 horas (12 al año = 96 h).
  // El KPI del Balanced Scorecard de la tesis habla de 100 h al año: se muestra como referencia.
  capacitacion: {
    horasPorMes: 8,
    kpiHorasAnio: 100,
    // De la nota más alta a la más baja: la primera que se cumpla da sus puntos. Debajo de 91 no hay puntos.
    notas: [
      { desde: 95, accion: 'capacitacionNota95' },
      { desde: 91, accion: 'capacitacionNota91' }
    ],
    actividades: ['Sesión de la capacitación', 'Taller práctico', 'Role play', 'Material de lectura']
  },

  // Reto de la semana: uno a la vez, con su barra de progreso.
  reto: { texto: 'Haz 5 seguimientos a tiempo esta semana', meta: 5 },

  // Insignias que se desbloquean solas. 'medida' es lo que cuenta la app; 'meta' cuánto hace falta.
  insignias: [
    { id: 'lead-rapido', nombre: 'Respuesta rápida', descripcion: 'Atender un lead en menos de 1 hora', medida: 'leadsATiempo', meta: 1 },
    { id: 'racha-5', nombre: 'Racha de 5 días', descripcion: '5 días seguidos con todos los leads a tiempo', medida: 'racha', meta: 5 },
    { id: 'clientes-felices', nombre: 'Clientes felices', descripcion: '3 clientes con carita excelente en el mes', medida: 'caritasExcelentes', meta: 3 },
    { id: 'objeciones-3', nombre: 'Buen argumento', descripcion: 'Resolver 3 objeciones', medida: 'objecionesResueltas', meta: 3 },
    { id: 'horas-40', nombre: '40 horas', descripcion: 'Acumular 40 horas de capacitación en el año', medida: 'horas', meta: 40 },
    { id: 'horas-80', nombre: '80 horas', descripcion: 'Acumular 80 horas de capacitación en el año', medida: 'horas', meta: 80 },
    { id: 'horas-96', nombre: 'Año completo', descripcion: 'Completar las 96 horas del año (12 × 8)', medida: 'horas', meta: 96 },
    { id: 'trivia-5', nombre: 'Experto en producto', descripcion: 'Responder bien 5 preguntas del día', medida: 'preguntasCorrectas', meta: 5 },
    { id: 'excelencia', nombre: 'Excelencia', descripcion: '6 capacitaciones con nota de 95 o más', medida: 'notas95', meta: 6 },
    { id: 'podio', nombre: 'En el podio', descripcion: 'Estar entre los 3 primeros del mes', medida: 'podio', meta: 1 }
  ],

  componentes: {
    resultados: 'Resultados',
    gestion: 'Gestión',
    servicio: 'Servicio',
    desarrollo: 'Desarrollo'
  },

  leads: {
    minutosMaximoRespuesta: 60,      // tiempo máximo de respuesta (el oficial está pendiente)
    minutosAvisoAntes: 15,           // la alerta «por vencer» sale cuando quedan estos minutos
    porcentajeSemanal: 90            // meta semanal para el +4
  },

  metaVentasMes: 7,                  // autos al mes por asesor (objetivo de la tesis para 2027)

  // El carro: dónde está el inicio del mes y dónde la meta, en puntos.
  carro: { puntosMinimo: 80, puntosInicio: 100, puntosMeta: 160 },

  premios: [
    { puesto: '1.er lugar', premio: '1 día libre + tarjeta de consumo de $80', frecuencia: 'Mensual' },
    { puesto: '2.º lugar', premio: 'Medio día libre + tarjeta de consumo de $60', frecuencia: 'Mensual' },
    { puesto: '3.er lugar', premio: 'Tarjeta de consumo de $40 + reconocimiento interno', frecuencia: 'Mensual' },
    { puesto: 'Mayor mejora', premio: 'Tarjeta de consumo o combustible de $50', frecuencia: 'Mensual' },
    { puesto: 'Ganador del año', premio: 'Bono de experiencia nacional (presupuesto por definir)', frecuencia: 'Anual' }
  ],

  kitCierre: ['Termo', 'Botella de vino', 'Libreta', 'Taza', 'Chocolates', 'Llavero']
};
