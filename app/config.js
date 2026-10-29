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
    ventaCerrada:             { puntos: +4, componente: 'resultados', motivo: 'Venta cerrada' }
  },

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
