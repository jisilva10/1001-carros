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
    cursoNota90:              { puntos: +7, componente: 'desarrollo', motivo: 'Capacitación a tiempo con nota de 90 a 100 %' },
    cursoNota80:              { puntos: +5, componente: 'desarrollo', motivo: 'Capacitación con nota de 80 a 89 %' },
    cursoNota70:              { puntos: +3, componente: 'desarrollo', motivo: 'Capacitación con nota de 70 a 79 %' },
    cursoVencido:             { puntos: -2, componente: 'desarrollo', motivo: 'Capacitación vencida sin completar' },
    // Propuesta (no está en el brief): para que el ranking también mida resultados comerciales.
    ventaCerrada:             { puntos: +4, componente: 'resultados', motivo: 'Venta cerrada' },
    // Pedido de la profesora (6/11): las horas de capacitación también dan puntos. Es POR HORA.
    horasCapacitacion:        { puntos: +1, componente: 'desarrollo', motivo: 'Horas de capacitación registradas' },
    // Capa de juego (propuesta nuestra, 9/11).
    retoSemanal:              { puntos: +5, componente: 'gestion',    motivo: 'Reto de la semana cumplido' },
    preguntaDelDia:           { puntos: +1, componente: 'desarrollo', motivo: 'Pregunta del día respondida bien' }
  },

  // Horas de capacitación comercial: meta del KPI del Balanced Scorecard de la tesis.
  capacitacion: { metaHorasAnio: 100 },

  // Reto de la semana: uno a la vez, con su barra de progreso.
  reto: { texto: 'Haz 5 seguimientos a tiempo esta semana', meta: 5 },

  // Insignias que se desbloquean solas. 'medida' es lo que cuenta la app; 'meta' cuánto hace falta.
  insignias: [
    { id: 'lead-rapido', nombre: 'Respuesta rápida', descripcion: 'Atender un lead en menos de 1 hora', medida: 'leadsATiempo', meta: 1 },
    { id: 'racha-5', nombre: 'Racha de 5 días', descripcion: '5 días seguidos con todos los leads a tiempo', medida: 'racha', meta: 5 },
    { id: 'clientes-felices', nombre: 'Clientes felices', descripcion: '3 clientes con carita excelente en el mes', medida: 'caritasExcelentes', meta: 3 },
    { id: 'objeciones-3', nombre: 'Buen argumento', descripcion: 'Resolver 3 objeciones', medida: 'objecionesResueltas', meta: 3 },
    { id: 'horas-20', nombre: '20 horas de capacitación', descripcion: 'Acumular 20 horas en el año', medida: 'horas', meta: 20 },
    { id: 'horas-50', nombre: '50 horas de capacitación', descripcion: 'Acumular 50 horas en el año', medida: 'horas', meta: 50 },
    { id: 'horas-100', nombre: 'Meta anual de capacitación', descripcion: 'Llegar a las 100 horas del año', medida: 'horas', meta: 100 },
    { id: 'trivia-5', nombre: 'Experto en producto', descripcion: 'Responder bien 5 preguntas del día', medida: 'preguntasCorrectas', meta: 5 },
    { id: 'ruta-completa', nombre: 'Ruta completa', descripcion: 'Aprobar los 4 cursos', medida: 'cursos', meta: 4 },
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
