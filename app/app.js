/*
  App del Asesor — prototipo con datos de prueba. Nada se conecta a ningún sistema:
  lo que vendría de Sugar está simulado en datos-prueba.js y todo se guarda en el navegador.
  Los puntos, plazos y premios se cambian en config.js.
*/
(function () {
  const C = window.CONFIG, D = window.DATOS;
  const CLAVE = 'app-asesor-1001-v4';
  const SLA = C.leads.minutosMaximoRespuesta;
  const HPM = C.capacitacion.horasPorMes;
  const META_ANIO = HPM * 12;
  const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const MES_CORTO = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  // ---------- Estado guardado ----------
  const copia = o => JSON.parse(JSON.stringify(o));
  function cargar() {
    try { const g = JSON.parse(localStorage.getItem(CLAVE)); if (g && g.porUsuario) return g; } catch (e) { /* sin almacenamiento */ }
    return { usuario: null, porUsuario: {} };
  }
  function guardar() { try { localStorage.setItem(CLAVE, JSON.stringify(s)); } catch (e) { /* nada */ } }
  let s = cargar();

  const hoy = new Date();
  const mesActual = hoy.getMonth();
  const inicioMes = new Date(hoy.getFullYear(), mesActual, 1).getTime();
  const diasDelMes = new Date(hoy.getFullYear(), mesActual + 1, 0).getDate();
  const dos = n => String(n).padStart(2, '0');
  const hoyCorto = () => { const d = new Date(); return `${dos(d.getDate())}/${dos(d.getMonth() + 1)}`; };

  // Fechas repartidas en lo que va del mes para el historial de ejemplo.
  function historialSembrado(claves) {
    const fin = Date.now() - 864e5;
    return claves.map((accion, i) => ({ accion, t: Math.round(inicioMes + (fin - inicioMes) * (i + 1) / (claves.length + 1)), detalle: 'Registro de ejemplo' }));
  }

  function estadoNuevo(id) {
    const a = asesor(id), ahora = Date.now();
    return {
      historial: historialSembrado(a.historial),
      leads: D.leads.map(l => Object.assign(copia(l), {
        ingreso: ahora - (l.minutosDesdeIngreso || 600) * 60000,
        acciones: copia(l.acciones || {}), vencido: false, vendido: false, seguimientoHecho: false
      })),
      semana: copia(D.semana),
      // La capacitación del mes en curso: sesiones registradas y notas de la evaluación.
      cap: {
        sesiones: D.sesionesMesActual.filter(x => x.dia <= hoy.getDate()).map(x => ({ fecha: `${dos(x.dia)}/${dos(mesActual + 1)}`, actividad: x.actividad, horas: x.horas })),
        notaInicial: D.capacitaciones[mesActual].resultado.notaInicial,
        notaFinal: null
      },
      objeciones: copia(D.objecionesPrevias),
      coaching: copia(D.coaching),
      kit: [],
      racha: { dias: D.juego.racha, hoy: null },
      reto: { avance: D.juego.retoAvance, cumplido: false },
      pregunta: { correctas: D.juego.preguntasCorrectas, fecha: null, elegida: null },
      insignias: null
    };
  }

  const asesor = id => D.asesores.find(a => a.id === id);
  const yo = () => s.porUsuario[s.usuario];

  // ---------- Puntos ----------
  const valor = h => (h.puntos != null ? h.puntos : C.acciones[h.accion].puntos);
  const puntosDe = hist => C.puntosInicioMes + hist.reduce((t, h) => t + valor(h), 0);
  const ventasDe = hist => hist.filter(h => h.accion === 'ventaCerrada').length;
  function historialDe(id) { return s.porUsuario[id] ? s.porUsuario[id].historial : historialSembrado(asesor(id).historial); }

  function tabla() {
    return D.asesores.map(a => {
      const hist = historialDe(a.id), puntos = puntosDe(hist);
      return { a, puntos, ventas: ventasDe(hist), mejora: puntos - a.mesAnterior };
    }).sort((x, y) => y.puntos - x.puntos || y.ventas - x.ventas);
  }
  const posicion = id => tabla().findIndex(f => f.a.id === id) + 1;

  // Cada elemento es una clave de CONFIG.acciones o { accion, puntos, detalle }.
  function sumar(items, detalle, texto) {
    items = [].concat(items).map(x => (typeof x === 'string' ? { accion: x } : x));
    const e = yo();
    let total = 0;
    items.forEach(x => { const h = Object.assign({ t: Date.now(), detalle: detalle || '' }, x); e.historial.push(h); total += valor(h); });
    guardar();
    const motivo = items.length === 1 ? C.acciones[items[0].accion].motivo : items.map(x => C.acciones[x.accion].motivo.split(' ')[0]).join(' + ');
    avisar(`${total > 0 ? '+' : '−'}${Math.abs(total)} puntos · ${texto || motivo}`, total > 0 ? 'mas' : 'menos');
  }

  // ---------- Mis capacitaciones ----------
  const horasMes = () => yo().cap.sesiones.reduce((t, x) => t + x.horas, 0);
  const faltanHoras = () => Math.max(0, HPM - horasMes());
  const diasRestantes = () => diasDelMes - hoy.getDate();
  // Cómo está la capacitación de un mes: las pasadas salen de los datos, la del mes de la app.
  function capDe(i) {
    const d = D.capacitaciones[i];
    if (i < mesActual) {
      const r = d.resultado, ok = r.horas >= HPM && r.notaFinal != null;
      return { estado: ok ? 'completada' : 'incompleta', horas: r.horas, notaInicial: r.notaInicial, notaFinal: r.notaFinal };
    }
    if (i === mesActual) {
      const c = yo().cap;
      return { estado: c.notaFinal != null ? 'completada' : 'encurso', horas: horasMes(), notaInicial: c.notaInicial, notaFinal: c.notaFinal };
    }
    return { estado: 'pendiente', horas: 0, notaInicial: null, notaFinal: null };
  }
  function accionNota(nota) {
    const t = C.capacitacion.notas.find(x => nota >= x.desde);
    return t ? t.accion : null;
  }
  function puntosDeMes(i) {
    const c = capDe(i);
    if (c.estado === 'incompleta') return C.acciones.capacitacionIncompleta.puntos;
    if (c.notaFinal == null) return null;
    const a = accionNota(c.notaFinal);
    return a ? C.acciones[a].puntos : 0;
  }
  const horasDe = id => (id === s.usuario && yo() ? D.capacitaciones.reduce((t, _, i) => t + (i <= mesActual ? capDe(i).horas : 0), 0) : asesor(id).horasAnio);
  // Ritmo esperado: lo que tocaría llevar a la fecha (meses cerrados más la parte del mes).
  const horasEsperadas = () => Math.round(HPM * (mesActual + hoy.getDate() / diasDelMes));

  // ---------- Capa de juego ----------
  function sumarRacha() {
    const r = yo().racha, d = hoyCorto();
    if (r.hoy !== d) { r.dias++; r.hoy = d; }
  }
  function preguntaHoy() {
    const n = Math.floor((hoy - new Date(hoy.getFullYear(), 0, 0)) / 864e5);
    return D.preguntasDelDia[n % D.preguntasDelDia.length];
  }
  function medidas() {
    const e = yo();
    return {
      leadsATiempo: e.semana.dentroDelTiempo,
      racha: e.racha.dias,
      caritasExcelentes: e.historial.filter(h => h.accion === 'caritaExcelente').length,
      objecionesResueltas: e.objeciones.filter(o => o.resuelta).length,
      horas: horasDe(s.usuario),
      preguntasCorrectas: e.pregunta.correctas,
      notas95: D.capacitaciones.filter((_, i) => i <= mesActual && (capDe(i).notaFinal || 0) >= 95).length,
      podio: posicion(s.usuario) <= 3 ? 1 : 0
    };
  }
  // Desbloquea las insignias que ya se cumplen. La primera vez es en silencio (lo que ya traía).
  function revisarInsignias() {
    const e = yo(), m = medidas(), primera = !e.insignias;
    if (primera) e.insignias = [];
    C.insignias.forEach(i => {
      if (m[i.medida] >= i.meta && !e.insignias.includes(i.id)) {
        e.insignias.push(i.id);
        if (!primera) avisar(`Insignia desbloqueada: ${i.nombre}`, 'logro');
      }
    });
    guardar();
  }

  // ---------- Leads ----------
  const minutos = l => (Date.now() - l.ingreso) / 60000;
  function estadoLead(l) {
    if (l.vendido) return 'vendido';
    if (!l.atendido) return (l.vencido || SLA - minutos(l) <= C.leads.minutosAvisoAntes) ? 'urgente' : 'pendiente';
    if (l.seguimientoHoy && !l.seguimientoHecho) return 'pendiente';
    return 'aldia';
  }
  const NOMBRE_ESTADO = { urgente: 'Urgente', pendiente: 'Pendiente', aldia: 'Al día', vendido: 'Vendido' };
  function reloj(l) {
    if (l.atendido) return '';
    if (l.vencido) return 'Venció el tiempo';
    const r = SLA - minutos(l);
    const mm = Math.floor(r), ss = Math.floor((r - mm) * 60);
    return `Quedan ${mm}:${dos(ss)}`;
  }
  function haceCuanto(l) {
    const m = Math.floor(minutos(l));
    return m < 60 ? `hace ${m} min` : m < 1440 ? `hace ${Math.floor(m / 60)} h` : `hace ${Math.floor(m / 1440)} d`;
  }
  const ORDEN = { urgente: 0, pendiente: 1, aldia: 2, vendido: 3 };
  const leadsOrdenados = () => yo().leads.slice().sort((a, b) => ORDEN[estadoLead(a)] - ORDEN[estadoLead(b)] || (a.atendido ? 0 : minutos(b) - minutos(a)));
  const lead = id => yo().leads.find(l => l.id === id);
  const pctSemana = () => { const w = yo().semana; return w.total ? Math.round(w.dentroDelTiempo / w.total * 1000) / 10 : 100; };
  const seguimientosHoy = () => yo().leads.filter(l => l.seguimientoHoy && !l.seguimientoHecho && !l.vendido).sort((x, y) => x.seguimientoHoy.localeCompare(y.seguimientoHoy));

  function atenderLead(l) {
    const w = yo().semana;
    l.atendido = true;
    l.proximaAccion = 'Programar el siguiente seguimiento';
    if (!l.vencido) { w.dentroDelTiempo++; w.total++; sumarRacha(); }
    guardar();
    if (!w.bonoEntregado && w.dentroDelTiempo / w.total * 100 >= C.leads.porcentajeSemanal) {
      w.bonoEntregado = true; guardar();
      sumar('slaSemanal', `${pctSemana()} % de leads a tiempo esta semana`);
    } else {
      avisar(l.vencido ? 'Contacto registrado (fuera de tiempo)' : 'Contacto registrado a tiempo');
    }
  }

  // Revisa cada segundo los tiempos de los leads: actualiza relojes y resta si alguno vence.
  function revisarTiempos() {
    if (!s.usuario || !yo()) return;
    let cambio = false;
    yo().leads.forEach(l => {
      if (!l.atendido && !l.vencido && minutos(l) >= SLA) {
        l.vencido = true; yo().semana.total++; cambio = true;
        yo().racha.dias = 0; yo().racha.hoy = hoyCorto();
        sumar('leadVencido', l.nombre);
      }
      document.querySelectorAll(`[data-reloj="${l.id}"]`).forEach(x => { x.textContent = reloj(l); });
      const est = estadoLead(l);
      if (l._ultimo && l._ultimo !== est) cambio = true;
      l._ultimo = est;
    });
    if (cambio && ['inicio', 'leads'].includes(ruta()[0])) render();
  }

  // Refuerzo: si hay objeciones sin resolver, se sugiere volver a la capacitación que las trata.
  function refuerzo() {
    const sin = {};
    yo().objeciones.filter(o => !o.resuelta).forEach(o => { sin[o.tipo] = (sin[o.tipo] || 0) + 1; });
    const [tipo, n] = Object.entries(sin).sort((a, b) => b[1] - a[1])[0] || [];
    if (!n || n < 2) return null;
    const i = D.capacitaciones.findIndex((c, k) => k < mesActual && /objeciones/i.test(c.nombre));
    return i < 0 ? null : { i, motivo: `Tienes ${n} objeciones de ${D.objeciones[tipo].nombre.toLowerCase()} sin resolver este mes.` };
  }

  // ---------- Utilidades de dibujo ----------
  const $ = sel => document.querySelector(sel);
  const esc = t => String(t == null ? '' : t).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
  const iniciales = n => n.split(' ').map(p => p[0]).slice(0, 2).join('');
  const fecha = t => new Date(t).toLocaleDateString('es-EC', { day: 'numeric', month: 'short' });
  const signo = p => (p > 0 ? '+' : p < 0 ? '−' : '') + Math.abs(p);
  const h = n => String(n).replace('.', ',') + ' h';
  const num = (n, u) => (n == null ? '—' : n.toLocaleString('es-EC', { maximumFractionDigits: 1, minimumFractionDigits: u === '%' ? 1 : 0 }) + (u ? ' ' + u : ''));
  const I = (d, extra) => `<svg viewBox="0 0 24 24" ${extra || ''}><path d="${d}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const ICONO = {
    check: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    reloj: I('M12 3.5a8.5 8.5 0 100 17 8.5 8.5 0 000-17zM12 7.5V12l3 2'),
    llamada: I('M6 3.5h3l1.5 4-2 1.3a10 10 0 005 5l1.3-2 4 1.5v3a2 2 0 01-2 2A15 15 0 014 5.5a2 2 0 012-2z'),
    curso: I('M3 8l9-4 9 4-9 4zM7 10v5c1.5 1.5 3 2 5 2s3.5-.5 5-2v-5'),
    leads: I('M9 11a3.2 3.2 0 100-6.4A3.2 3.2 0 009 11zM3.5 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5M16 6.5h5M16 10.5h5M17.5 14.5H21'),
    proceso: I('M4 6h16M4 12h10M4 18h6'),
    premio: I('M8 21h8M12 17v4M7 4h10v4a5 5 0 01-10 0zM7 6H4a3 3 0 003 4M17 6h3a3 3 0 01-3 4'),
    lista: I('M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01'),
    chat: I('M4 5h16v10H9l-5 4z'),
    regalo: I('M4 10h16v10H4zM3 7h18v3H3zM12 7v13M12 7c-2-3-5-3-5-1s3 1 5 1zm0 0c2-3 5-3 5-1s-3 1-5 1z'),
    candado: I('M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 017 0v3'),
    volver: I('M15 5l-7 7 7 7', 'width="22" height="22"'),
    mas: I('M12 5v14M5 12h14')
  };
  function carita(tipo) {
    const boca = { excelente: 'M7 13h10c-.6 3.2-2.8 4.6-5 4.6S7.6 16.2 7 13z', buena: 'M8 14c1.3 1.6 6.7 1.6 8 0', aceptable: 'M8 15h8' }[tipo];
    return `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#FBCA01"/><circle cx="8.6" cy="9.5" r="1.3" fill="#240079"/><circle cx="15.4" cy="9.5" r="1.3" fill="#240079"/><path d="${boca}" fill="${tipo === 'excelente' ? '#240079' : 'none'}" stroke="#240079" stroke-width="1.8" stroke-linecap="round"/></svg>`;
  }
  const MEDALLA = '<svg viewBox="0 0 24 24"><path d="M8 14.5L6 22l6-3 6 3-2-7.5" fill="currentColor" opacity=".5"/><circle cx="12" cy="9.5" r="7" fill="currentColor"/><path d="M12 5.8l1.2 2.5 2.7.4-2 1.9.5 2.7L12 12l-2.4 1.3.5-2.7-2-1.9 2.7-.4z" fill="#fff"/></svg>';
  const barra = (v, max, cls) => `<div class="progreso ${cls || ''}"><span style="width:${Math.max(0, Math.min(100, v / max * 100))}%"></span></div>`;
  const chipEstado = est => `<span class="chip ${est === 'vendido' ? 'morado' : est}">${NOMBRE_ESTADO[est]}</span>`;

  // ---------- El carro de progreso ----------
  let ultimoPct = null; // posición donde se vio el carro por última vez, para animar el cambio
  function pct(p) { const k = C.carro; return Math.max(0, Math.min(100, (p - k.puntosMinimo) / (k.puntosMeta - k.puntosMinimo) * 100)); }
  const lugar = v => `calc(46px + (100% - 92px) * ${v / 100})`;
  function pistaHTML(puntos) {
    const k = C.carro, desde = ultimoPct == null ? pct(puntos) : ultimoPct;
    return `<div class="pista" data-pct="${pct(puntos)}">
      <img class="pista-carro" src="img/carro.png" alt="Carro de progreso" style="left:${lugar(desde)}">
      <div class="pista-camino"><div class="pista-avance" style="width:${lugar(desde)}"></div></div>
      <div class="pista-marcas"><span style="left:${lugar(pct(k.puntosInicio))}">${k.puntosInicio} · inicio</span><span class="meta" style="left:${lugar(100)}">${k.puntosMeta} · meta</span></div>
    </div>`;
  }
  function moverCarro() {
    const pista = $('.pista');
    if (!pista) return;
    const v = Number(pista.dataset.pct);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      pista.querySelector('.pista-carro').style.left = lugar(v);
      pista.querySelector('.pista-avance').style.width = lugar(v);
    }));
    ultimoPct = v;
  }

  // ---------- Pantallas ----------
  const ruta = () => (location.hash.slice(1) || 'inicio').split('/');
  const seccion = (titulo, enlace) => `<h2 class="seccion">${titulo}${enlace || ''}</h2>`;

  function pLogin() {
    return {
      sinBarra: true, sinPestanas: true,
      html: `<div class="login">
        <div class="login-marca">1001Carros</div>
        <div class="login-sub">${esc(C.nombreApp)}</div>
        <img src="img/carro.png" alt="">
        <form class="login-form" id="form-login">
          <label class="campo"><span>Usuario</span><input id="usuario" autocomplete="off" placeholder="Escribe o elige un usuario de prueba" value="${esc(D.asesores[0].nombre)}"></label>
          <div class="usuarios">${D.asesores.map((a, i) => `<button type="button" data-usuario="${a.id}" class="${i === 0 ? 'activo' : ''}">${esc(a.nombre.split(' ')[0])}</button>`).join('')}</div>
          <button class="boton" type="submit">Entrar</button>
          <p class="nota">Prototipo con datos de prueba: entra con cualquier usuario y no pide clave.</p>
        </form>
        <button class="boton-texto claro" data-accion="reiniciar">Reiniciar la demo</button>
      </div>`
    };
  }

  function pInicio() {
    const e = yo(), a = asesor(s.usuario), p = puntosDe(e.historial), pos = posicion(s.usuario), ventas = ventasDe(e.historial);
    const urgentes = e.leads.filter(l => estadoLead(l) === 'urgente');
    let tareas = '';
    urgentes.forEach(l => {
      tareas += `<a class="fila" href="#lead/${l.id}"><span class="icono rojo">${ICONO.reloj}</span><span class="fila-cuerpo"><strong>${l.vencido ? 'Lead sin gestión' : 'Lead por vencer'}</strong><span class="sub">${esc(l.nombre)} · <span data-reloj="${l.id}">${reloj(l)}</span></span></span><span class="flecha">›</span></a>`;
    });
    seguimientosHoy().forEach(l => {
      tareas += `<a class="fila" href="#acciones/${l.id}"><span class="icono naranja">${ICONO.llamada}</span><span class="fila-cuerpo"><strong>Seguimiento a las ${esc(l.seguimientoHoy)}</strong><span class="sub">${esc(l.nombre)}</span></span><span class="flecha">›</span></a>`;
    });
    const cap = capDe(mesActual);
    if (cap.estado === 'encurso') {
      const falta = faltanHoras();
      tareas += `<a class="fila" href="#capacitacion/${mesActual}"><span class="icono morado">${ICONO.curso}</span><span class="fila-cuerpo"><strong>${falta > 0 ? `Te faltan ${h(falta)} de capacitación` : 'Ya puedes dar la evaluación final'}</strong><span class="sub">${esc(D.capacitaciones[mesActual].nombre)} · quedan ${diasRestantes()} días</span></span><span class="flecha">›</span></a>`;
    }
    return {
      barra: { marca: true },
      pestana: 'inicio',
      html: `<section class="hero">
          <p class="saludo">Hola, ${esc(a.nombre.split(' ')[0])}</p>
          <p class="hero-label">Tus puntos de ${MESES[mesActual]}</p>
          <p class="hero-cifra">${p}</p>
          <p class="hero-sub"><a href="#ranking">${pos}.º en el ranking</a> · empezaste con ${C.puntosInicioMes}</p>
          ${pistaHTML(p)}
          <div class="kpis">
            <a href="#progreso"><strong>${ventas}<small>/${C.metaVentasMes}</small></strong><span>Ventas</span></a>
            <a href="#capacitaciones"><strong>${num(horasMes())}<small>/${HPM} h</small></strong><span>Capacitación</span></a>
            <a href="#leads"><strong>${num(pctSemana())}<small> %</small></strong><span>Leads a tiempo</span></a>
          </div>
        </section>
        ${seccion('Para hoy')}
        <div class="tarjeta lista">${tareas || '<p class="vacio">Todo al día.</p>'}</div>
        ${juegoHTML()}
        ${seccion('Módulos')}
        <div class="tarjeta lista">
          <a class="fila" href="#leads"><span class="icono">${ICONO.leads}</span><span class="fila-cuerpo"><strong>Gestión de leads</strong><span class="sub">${urgentes.length} urgente${urgentes.length === 1 ? '' : 's'} · ${seguimientosHoy().length} seguimientos hoy</span></span><span class="flecha">›</span></a>
          <a class="fila" href="#leads"><span class="icono">${ICONO.proceso}</span><span class="fila-cuerpo"><strong>Proceso comercial</strong><span class="sub">Acciones, objeciones y cierre desde cada cliente</span></span><span class="flecha">›</span></a>
          <a class="fila" href="#capacitaciones"><span class="icono">${ICONO.curso}</span><span class="fila-cuerpo"><strong>Mis capacitaciones</strong><span class="sub">${h(horasMes())} de ${HPM} este mes · ${horasDe(s.usuario)} h en el año</span></span><span class="flecha">›</span></a>
          <a class="fila" href="#ranking"><span class="icono">${ICONO.premio}</span><span class="fila-cuerpo"><strong>Incentivos</strong><span class="sub">Puesto ${pos} · premios del mes</span></span><span class="flecha">›</span></a>
        </div>`,
      despues: moverCarro
    };
  }

  function juegoHTML() {
    const e = yo(), r = e.reto, q = preguntaHoy(), respondida = e.pregunta.fecha === hoyCorto();
    const puntos = Array.from({ length: 7 }, (_, i) => `<span class="${i < Math.min(e.racha.dias, 7) ? 'on' : ''}"></span>`).join('');
    const opciones = respondida
      ? `${q.opciones.map((o, i) => `<div class="opcion-dia ${i === q.correcta ? 'correcta' : i === e.pregunta.elegida ? 'incorrecta' : ''}">${esc(o)}</div>`).join('')}
         <p class="sub" style="margin-top:10px">${e.pregunta.elegida === q.correcta ? `Correcto, +${C.acciones.preguntaDelDia.puntos} punto.` : 'Esta vez no.'} ${esc(q.explicacion)}</p>`
      : q.opciones.map((o, i) => `<button class="opcion-dia" data-accion="pregunta" data-op="${i}">${esc(o)}</button>`).join('');
    return `${seccion('Esta semana', '<a href="#logros">Logros</a>')}
      <div class="juego">
        <div class="tarjeta"><span class="etiqueta">Racha</span><span class="juego-cifra">${e.racha.dias} <small>día${e.racha.dias === 1 ? '' : 's'}</small></span><div class="racha">${puntos}</div></div>
        <a class="tarjeta" href="#logros"><span class="etiqueta">Insignias</span><span class="juego-cifra">${e.insignias.length} <small>de ${C.insignias.length}</small></span><div class="medallas">${C.insignias.slice(0, 6).map(i => `<span class="${e.insignias.includes(i.id) ? 'on' : ''}">${MEDALLA}</span>`).join('')}</div></a>
      </div>
      <div class="tarjeta">
        <div class="fila-tope"><span class="etiqueta">Reto de la semana</span><span class="chip ${r.cumplido ? 'aldia' : 'premio'}">${r.cumplido ? 'Cumplido' : `+${C.acciones.retoSemanal.puntos} pts`}</span></div>
        <p class="texto-fuerte">${esc(C.reto.texto)}</p>
        ${barra(r.avance, C.reto.meta, 'amarilla')}<p class="sub" style="margin-top:6px">${Math.min(r.avance, C.reto.meta)} de ${C.reto.meta}</p>
      </div>
      <div class="tarjeta">
        <div class="fila-tope"><span class="etiqueta">Pregunta del día</span><span class="sub">+${C.acciones.preguntaDelDia.puntos} punto</span></div>
        <p class="texto-fuerte">${esc(q.texto)}</p><div class="opciones-dia">${opciones}</div>
      </div>`;
  }

  function pLogros() {
    const e = yo(), m = medidas();
    return {
      barra: { titulo: 'Logros', sub: `${e.insignias.length} de ${C.insignias.length} insignias`, volver: '#inicio' },
      pestana: 'progreso',
      html: `<div class="insignias">${C.insignias.map(i => {
          const ok = e.insignias.includes(i.id), avance = Math.min(m[i.medida], i.meta);
          return `<div class="insignia ${ok ? 'on' : ''}"><div class="insignia-icono">${MEDALLA}</div><strong>${esc(i.nombre)}</strong><span class="sub">${esc(i.descripcion)}</span>
            ${ok ? '<span class="chip aldia">Desbloqueada</span>' : `${barra(avance, i.meta)}<span class="sub">${avance} de ${i.meta}</span>`}</div>`;
        }).join('')}</div>
        <p class="nota">Las insignias se desbloquean solas con lo que registras. Son reconocimiento: no dan puntos.</p>`
    };
  }

  let filtro = 'todos';
  function pLeads() {
    const e = yo(), lista = leadsOrdenados().filter(l => filtro === 'todos' || estadoLead(l) === filtro);
    const cuenta = k => e.leads.filter(l => estadoLead(l) === k).length;
    const w = e.semana, segs = seguimientosHoy();
    return {
      barra: { titulo: 'Mis leads', sub: 'Asignados desde Sugar (simulado)' },
      pestana: 'leads',
      html: `<div class="tarjeta destacado">
          <span class="etiqueta">A tiempo esta semana</span>
          <p class="cifra-grande">${num(pctSemana())} <small>%</small></p>
          ${barra(pctSemana(), 100)}
          <p class="sub" style="margin-top:8px">${w.dentroDelTiempo} de ${w.total} dentro de ${SLA} min · meta ${C.leads.porcentajeSemanal} % (+${C.acciones.slaSemanal.puntos} pts)${w.bonoEntregado ? ' · bono ya ganado' : ''}</p>
        </div>
        <div class="filtros">${['todos', 'urgente', 'pendiente', 'aldia', 'vendido'].map(k => `<button data-filtro="${k}" class="${filtro === k ? 'activo' : ''}">${k === 'todos' ? 'Todos' : NOMBRE_ESTADO[k]} <span>${k === 'todos' ? e.leads.length : cuenta(k)}</span></button>`).join('')}</div>
        <div class="tarjeta lista">${lista.map(l => {
          const est = estadoLead(l);
          return `<a class="fila" href="#lead/${l.id}"><span class="fila-cuerpo"><strong>${esc(l.nombre)}</strong><span class="sub">${esc(l.ficha.vehiculo)} · ${esc(l.canal)} · ${haceCuanto(l)}</span><span class="sub">${esc(l.atendido ? (l.vendido ? 'Venta registrada' : l.proximaAccion) : 'Hacer el primer contacto')}</span></span>
            <span class="fila-lado">${chipEstado(est)}${l.atendido ? '' : `<span class="reloj ${est}" data-reloj="${l.id}">${reloj(l)}</span>`}</span></a>`;
        }).join('') || '<p class="vacio">No hay leads en este estado.</p>'}</div>
        ${seccion('Seguimientos de hoy')}
        <div class="tarjeta lista">${segs.map(l => `<a class="fila" href="#acciones/${l.id}"><span class="fila-cuerpo"><strong>${esc(l.seguimientoHoy)} · ${esc(l.nombre)}</strong><span class="sub">${esc(l.proximaAccion)}</span></span><span class="chip premio">+${C.acciones.seguimientoATiempo.puntos}</span></a>`).join('') || '<p class="vacio">No quedan seguimientos para hoy.</p>'}</div>
        <p class="nota">Si un lead pasa ${SLA} minutos sin gestión, se restan ${Math.abs(C.acciones.leadVencido.puntos)} puntos automáticamente.</p>`
    };
  }

  const OPCIONES = {
    uso: ['Personal', 'Familiar', 'Trabajo', 'Otro'],
    cuando: ['Esta semana', 'Este mes', 'En 1 a 3 meses', 'Más adelante'],
    pago: ['Contado', 'Crédito', 'Tarjeta', 'Por definir'],
    partePago: ['Sí', 'No']
  };
  function select(nombre, valor) {
    return `<select name="${nombre}"><option value="">Elegir…</option>${OPCIONES[nombre].map(o => `<option ${o === valor ? 'selected' : ''}>${o}</option>`).join('')}</select>`;
  }

  function pLead(id) {
    const l = lead(id); if (!l) return pNoExiste();
    const est = estadoLead(l), f = l.ficha;
    return {
      barra: { titulo: l.nombre, sub: `Cédula ${l.cedula} (ficticia) · ${l.canal}`, volver: '#leads' },
      pestana: 'leads',
      html: `<div class="tarjeta">
          <div class="fila-tope">${chipEstado(est)}<span class="chip sugar">Nombre y cédula: Sugar</span></div>
          ${l.atendido
            ? `<span class="etiqueta" style="margin-top:14px">Próxima acción</span><p class="texto-fuerte">${esc(l.vendido ? 'Venta registrada. Seguimiento posventa.' : l.proximaAccion)}</p>`
            : `<span class="etiqueta" style="margin-top:14px">Primer contacto</span><p class="cifra-grande rojo" data-reloj="${l.id}">${reloj(l)}</p><p class="sub">de ${SLA} minutos · ingresó ${haceCuanto(l)}</p>
               <button class="boton" style="margin-top:14px" data-accion="atender" data-id="${l.id}">Registrar primer contacto</button>`}
        </div>
        ${l.atendido && !l.vendido ? `<div class="accesos">
          <a href="#acciones/${l.id}">${ICONO.lista}<span>Acciones</span></a>
          <a href="#objecion/${l.id}">${ICONO.chat}<span>Objeción</span></a>
          <a href="#cierre/${l.id}">${ICONO.regalo}<span>Cierre</span></a>
        </div>` : ''}
        ${seccion('Información comercial')}
        <form class="tarjeta formulario" id="form-ficha" data-id="${l.id}">
          <label class="campo"><span>Vehículo de interés</span><input name="vehiculo" value="${esc(f.vehiculo)}"></label>
          <label class="campo"><span>Presupuesto aproximado (USD)</span><input name="presupuesto" value="${esc(f.presupuesto)}" placeholder="Ej.: 15.000 – 18.000"></label>
          <div class="dos-columnas">
            <label class="campo"><span>Uso previsto</span>${select('uso', f.uso)}</label>
            <label class="campo"><span>Para cuándo</span>${select('cuando', f.cuando)}</label>
            <label class="campo"><span>Forma de pago</span>${select('pago', f.pago)}</label>
            <label class="campo"><span>Auto en parte de pago</span>${select('partePago', f.partePago)}</label>
          </div>
          <label class="campo"><span>Ocupación (para el financiamiento)</span><input name="ocupacion" value="${esc(f.ocupacion)}"></label>
          <button class="boton suave" type="submit">Guardar información</button>
        </form>`
    };
  }

  function pAcciones(id) {
    const l = lead(id); if (!l) return pNoExiste();
    const a = l.acciones;
    const item = (hecho, texto, detalle, control) => `<div class="check ${hecho ? 'hecho' : ''}"><span class="check-caja">${hecho ? ICONO.check : ''}</span><div class="check-cuerpo"><strong>${texto}</strong>${detalle ? `<span class="sub">${detalle}</span>` : ''}${control || ''}</div></div>`;
    const opts = (nombre, lista, v) => `<select data-campo="${nombre}" data-id="${l.id}"><option value="">Registrar resultado…</option>${lista.map(o => `<option ${o === v ? 'selected' : ''}>${o}</option>`).join('')}</select>`;
    const ultimaObj = yo().objeciones.filter(o => o.lead === l.id).pop();
    return {
      barra: { titulo: 'Acciones de venta', sub: l.nombre, volver: `#lead/${l.id}` },
      pestana: 'leads',
      html: `${l.seguimientoHoy && !l.seguimientoHecho ? `<div class="tarjeta destacado">
            <span class="etiqueta">Seguimiento de hoy · ${esc(l.seguimientoHoy)}</span><p class="texto-fuerte">${esc(l.proximaAccion)}</p>
            <button class="boton" style="margin-top:12px" data-accion="seguimiento" data-id="${l.id}">Marcar como hecho · +${C.acciones.seguimientoATiempo.puntos}</button>
          </div>` : ''}
        ${seccion('Checklist del cliente')}
        <div class="tarjeta lista">
          ${item(a.disponibilidad, 'Confirmar disponibilidad del vehículo', 'Antes de la cita, que el auto siga en esta agencia.', a.disponibilidad ? '' : `<button class="boton suave chico" data-accion="disponibilidad" data-id="${l.id}">Confirmar que está disponible</button>`)}
          ${item(a.cita, 'Resultado de la cita o test drive', '', opts('cita', ['Asistió a la cita', 'Hizo test drive, le gustó', 'Hizo test drive, no le convenció', 'No asistió', 'Reagendó'], a.cita))}
          ${item(a.proximo, 'Programar el siguiente seguimiento', '', `<input type="datetime-local" data-campo="proximo" data-id="${l.id}" value="${esc(a.proximo || '')}">`)}
          ${item(a.cotizacion, 'Resultado de la cotización', a.cotizacion ? '' : `Sin seguimiento a tiempo: ${C.acciones.cotizacionSinSeguimiento.puntos} pts.`, opts('cotizacion', ['Enviada, en espera', 'En negociación', 'Aceptada', 'Rechazada'], a.cotizacion))}
          ${item(ultimaObj, 'Objeción principal', ultimaObj ? `${esc(D.objeciones[ultimaObj.tipo].nombre)} · ${ultimaObj.resuelta ? 'resuelta' : 'sin resolver'}` : '', `<a class="boton suave chico" href="#objecion/${l.id}">${ultimaObj ? 'Registrar otra' : 'Elegir objeción'}</a>`)}
        </div>
        <a class="boton" style="margin-top:20px" href="#cierre/${l.id}">Cerrar venta</a>
        <p class="nota">El embudo completo sigue en Sugar; aquí solo van las acciones críticas.</p>`
    };
  }

  function pObjecion(id) {
    const l = lead(id); if (!l) return pNoExiste();
    return {
      barra: { titulo: 'Objeción principal', sub: l.nombre, volver: `#acciones/${l.id}` },
      pestana: 'leads',
      html: `<div class="tarjeta lista">${Object.entries(D.objeciones).map(([k, o]) => `<a class="fila" href="#guia/${l.id}/${k}"><span class="fila-cuerpo"><strong>${esc(o.nombre)}</strong><span class="sub">${esc(o.resumen)}</span></span><span class="flecha">›</span></a>`).join('')}</div>
        <p class="nota">Al elegirla, la app muestra la guía de respuesta para esa objeción.</p>`
    };
  }

  function pGuia(id, tipo) {
    const l = lead(id), o = D.objeciones[tipo]; if (!l || !o) return pNoExiste();
    const t = o.comparacion;
    return {
      barra: { titulo: o.nombre, sub: `Guía de respuesta · ${l.nombre}`, volver: `#objecion/${l.id}` },
      pestana: 'leads',
      html: `${seccion('Qué explicar')}<div class="tarjeta"><ol class="pasos">${o.explicar.map(x => `<li>${esc(x)}</li>`).join('')}</ol></div>
        ${seccion('Beneficios para destacar')}<div class="beneficios">${o.beneficios.map(x => `<span>${esc(x)}</span>`).join('')}</div>
        ${seccion(esc(t.titulo))}<div class="tarjeta"><table class="tabla"><thead><tr>${t.columnas.map(c => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${t.filas.map(f => `<tr>${f.map(c => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
        ${seccion('¿Se resolvió?')}
        <div class="botones-2"><button class="boton" data-accion="objecion" data-id="${l.id}" data-tipo="${tipo}" data-resuelta="1">Sí</button><button class="boton suave" data-accion="objecion" data-id="${l.id}" data-tipo="${tipo}" data-resuelta="0">Todavía no</button></div>
        <p class="nota">Las objeciones sin resolver hacen que la app te sugiera un refuerzo en Mis capacitaciones.</p>`
    };
  }

  let cierre = { kit: null, carita: null };
  function pCierre(id) {
    const l = lead(id); if (!l) return pNoExiste();
    if (l.vendido) return { barra: { titulo: 'Cierre', volver: `#lead/${l.id}` }, pestana: 'leads', html: `<div class="tarjeta"><p>La venta a ${esc(l.nombre)} ya está registrada.</p></div>` };
    const caras = [['excelente', 'Excelente', 'caritaExcelente'], ['buena', 'Buena', 'caritaBuena'], ['aceptable', 'Aceptable', 'caritaAceptable']];
    return {
      barra: { titulo: 'Cerrar venta', sub: l.nombre, volver: `#acciones/${l.id}` },
      pestana: 'leads',
      html: `${seccion('Obsequio entregado')}
        <div class="kit">${C.kitCierre.map(k => `<button data-kit="${esc(k)}" class="${cierre.kit === k ? 'activo' : ''}">${esc(k)}</button>`).join('')}</div>
        <p class="nota">Lo pone la empresa, no el asesor. El registro sirve para controlar consumo y costo.</p>
        ${seccion('¿Cómo calificó el cliente la atención?')}
        <div class="caritas">${caras.map(([k, n, acc]) => `<button data-carita="${acc}" class="${cierre.carita === acc ? 'activo' : ''}">${carita(k)}<strong>${n}</strong><small>+${C.acciones[acc].puntos} pts</small></button>`).join('')}</div>
        <p class="nota">El cliente elige la carita en el celular del asesor al terminar.</p>
        <button class="boton" style="margin-top:20px" data-accion="cerrar" data-id="${l.id}" ${cierre.kit && cierre.carita ? '' : 'disabled'}>Registrar venta</button>`
    };
  }

  // ---------- Mis capacitaciones ----------
  function dona(v, meta, etiqueta) {
    const p = Math.min(100, v / meta * 100);
    return `<svg viewBox="0 0 36 36" class="dona" role="img" aria-label="${Math.round(p)} %"><circle cx="18" cy="18" r="15.9155" fill="none" stroke="var(--pista)" stroke-width="3"/><circle cx="18" cy="18" r="15.9155" fill="none" stroke="var(--morado)" stroke-width="3" stroke-dasharray="${p} ${100 - p}" stroke-dashoffset="25" stroke-linecap="round"/><text x="18" y="18.6" text-anchor="middle" class="dona-cifra">${Math.round(p)}%</text><text x="18" y="23.4" text-anchor="middle" class="dona-label">${etiqueta}</text></svg>`;
  }
  // Horas por mes: barras con la línea de la meta mensual.
  function barrasMes() {
    const W = 320, H = 120, izq = 6, der = 6, arr = 10, aba = 18, maxH = HPM + 2;
    const ancho = (W - izq - der) / 12, y = v => arr + (H - arr - aba) * (1 - v / maxH);
    return `<svg viewBox="0 0 ${W} ${H}" class="grafico" role="img" aria-label="Horas de capacitación por mes">
      <line x1="${izq}" x2="${W - der}" y1="${y(HPM)}" y2="${y(HPM)}" class="g-meta"/><text x="${W - der}" y="${y(HPM) - 4}" text-anchor="end" class="g-texto">${HPM} h</text>
      ${D.capacitaciones.map((_, i) => {
        const c = capDe(i), x = izq + ancho * i + ancho * 0.22, w = ancho * 0.56, v = c.horas;
        const cls = c.estado === 'incompleta' ? 'g-barra mal' : i === mesActual ? 'g-barra actual' : 'g-barra';
        return `${v ? `<rect x="${x}" y="${y(v)}" width="${w}" height="${y(0) - y(v)}" rx="3" class="${cls}"/>` : `<rect x="${x}" y="${y(0) - 2}" width="${w}" height="2" rx="1" class="g-barra vacia"/>`}<text x="${x + w / 2}" y="${H - 4}" text-anchor="middle" class="g-texto ${i === mesActual ? 'fuerte' : ''}">${MES_CORTO[i][0]}</text>`;
      }).join('')}
    </svg>`;
  }

  // Antes y después de cada capacitación, con los números mensuales del asesor.
  let indicador = 'conversion';
  const prom = a => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : null);
  function antesDespues(ind, mes) {
    const v = D.impacto.indicadores[ind].valores;
    return [prom(v.slice(Math.max(0, mes - 2), mes)), prom(v.slice(mes + 1, mes + 3))];
  }
  function grafico() {
    const Im = D.impacto, ind = Im.indicadores[indicador], v = ind.valores;
    const W = 320, H = 140, izq = 30, der = 10, arr = 20, aba = 20;
    const min = Math.min(...v), max = Math.max(...v), r = (max - min) || 1, lo = min - r * 0.2, hi = max + r * 0.2;
    const x = i => izq + (W - izq - der) * i / (v.length - 1), y = n => arr + (H - arr - aba) * (1 - (n - lo) / (hi - lo));
    const marcas = Im.marcas.map((m, k) => `<line x1="${x(m)}" x2="${x(m)}" y1="${arr - 6}" y2="${H - aba}" class="g-marca"/><circle cx="${x(m)}" cy="${arr - 10}" r="7" class="g-marca-punto"/><text x="${x(m)}" y="${arr - 7}" text-anchor="middle" class="g-marca-num">${k + 1}</text>`).join('');
    const linea = v.map((n, i) => `${i ? 'L' : 'M'}${x(i)},${y(n)}`).join(' ');
    return `<svg viewBox="0 0 ${W} ${H}" class="grafico" role="img" aria-label="${esc(ind.nombre)} por mes">
      <text x="${izq - 6}" y="${y(max) + 3}" text-anchor="end" class="g-texto">${num(max)}</text><text x="${izq - 6}" y="${y(min) + 3}" text-anchor="end" class="g-texto">${num(min)}</text>
      ${marcas}<path d="${linea}" class="g-linea"/>${v.map((n, i) => `<circle cx="${x(i)}" cy="${y(n)}" r="2.5" class="g-punto"/>`).join('')}
      ${Im.meses.map((m, i) => `<text x="${x(i)}" y="${H - 4}" text-anchor="middle" class="g-texto">${m[0]}</text>`).join('')}
    </svg>`;
  }
  function impactoHTML() {
    const Im = D.impacto;
    return `${seccion('Antes y después')}
      <div class="tarjeta">
        <div class="segmentos">${Object.entries(Im.indicadores).map(([k, ind]) => `<button data-indicador="${k}" class="${k === indicador ? 'activo' : ''}">${esc(ind.nombre)}</button>`).join('')}</div>
        ${grafico()}
        <p class="sub">Cada número marca el mes de una capacitación. Antes: promedio de los 2 meses previos; después: de los 2 siguientes.</p>
      </div>
      ${Im.marcas.map((m, k) => {
        const c = capDe(m);
        return `<a class="tarjeta impacto" href="#capacitacion/${m}"><div class="fila-tope"><span class="texto-fuerte"><span class="g-num">${k + 1}</span>${esc(D.capacitaciones[m].nombre)}</span><span class="sub">${MES_CORTO[m]}</span></div>
          <table class="tabla"><thead><tr><th></th><th>Antes</th><th>Después</th></tr></thead><tbody>
          <tr><td>Nota de la evaluación</td><td>${c.notaInicial}</td><td>${c.notaFinal} <span class="sube">▲ ${c.notaFinal - c.notaInicial}</span></td></tr>
          ${Object.entries(Im.indicadores).map(([kk, ind]) => {
            const [a, d] = antesDespues(kk, m), dif = d - a;
            return `<tr><td>${esc(ind.nombre)}</td><td>${num(a, ind.unidad)}</td><td>${num(d, ind.unidad)} <span class="${dif >= 0 ? 'sube' : 'baja'}">${dif >= 0 ? '▲' : '▼'} ${num(Math.abs(dif))}</span></td></tr>`;
          }).join('')}</tbody></table></a>`;
      }).join('')}`;
  }

  const ETIQUETA_CAP = { completada: ['Completada', 'aldia'], incompleta: ['Incompleta', 'urgente'], encurso: ['En curso', 'pendiente'], pendiente: ['Pendiente', 'gris'] };
  function filaCapacitacion(i) {
    const c = capDe(i), pts = puntosDeMes(i);
    const lado = c.estado === 'completada' ? `<span class="nota-cap">${c.notaFinal}</span><span class="sub">${pts ? signo(pts) + ' pts' : 'sin puntos'}</span>`
      : c.estado === 'incompleta' ? `<span class="chip urgente">${h(c.horas)} de ${HPM}</span><span class="sub rojo">${signo(pts)} pts</span>`
      : c.estado === 'encurso' ? `<span class="chip pendiente">${h(c.horas)} de ${HPM}</span>`
      : '<span class="sub">—</span>';
    return `<a class="fila ${i === mesActual ? 'actual' : ''}" href="#capacitacion/${i}"><span class="mes ${c.estado}">${MES_CORTO[i]}</span><span class="fila-cuerpo"><strong>${esc(D.capacitaciones[i].nombre)}</strong><span class="sub">${ETIQUETA_CAP[c.estado][0]}</span></span><span class="fila-lado">${lado}</span></a>`;
  }

  function pCapacitaciones() {
    const e = yo(), d = D.capacitaciones[mesActual], hm = horasMes(), falta = faltanHoras(), anio = horasDe(s.usuario), ref = refuerzo();
    const cap = capDe(mesActual), esperado = horasEsperadas(), dif = anio - esperado;
    const reglas = C.capacitacion.notas.map((t, k) => `${t.desde}${k === 0 ? ' a 100' : ` a ${C.capacitacion.notas[k - 1].desde - 1}`}: ${signo(C.acciones[t.accion].puntos)}`).join(' · ');
    return {
      barra: { titulo: 'Mis capacitaciones', sub: `Una al mes · ${HPM} h cada una` },
      pestana: 'capacitaciones',
      html: `<div class="tarjeta destacado">
          <span class="etiqueta">Capacitación de ${MESES[mesActual]}</span>
          <p class="texto-fuerte">${esc(d.nombre)}</p>
          <p class="cifra-grande">${num(hm)} <small>de ${HPM} h</small></p>
          ${barra(hm, HPM)}
          <p class="sub" style="margin-top:8px">${cap.estado === 'completada' ? `Completada con ${cap.notaFinal}.` : falta > 0 ? `<strong class="texto-morado">Te faltan ${h(falta)} para tu meta del mes</strong> · quedan ${diasRestantes()} días` : '<strong class="texto-morado">Meta de horas cumplida.</strong> Ya puedes dar la evaluación final.'}</p>
          <div class="botones-2" style="margin-top:16px">
            ${cap.estado === 'encurso' && falta === 0
              ? `<a class="boton" href="#capacitacion/${mesActual}/evaluacion">Evaluación final</a><a class="boton suave" href="#registrar-horas">Registrar horas</a>`
              : `<a class="boton" href="${cap.estado === 'completada' ? `#capacitacion/${mesActual}` : '#registrar-horas'}">${cap.estado === 'completada' ? 'Ver resultado' : 'Registrar horas'}</a><a class="boton suave" href="#capacitacion/${mesActual}">Abrir</a>`}
          </div>
        </div>
        ${seccion('Tu año')}
        <div class="tarjeta anio">${dona(anio, META_ANIO, 'del año')}
          <div class="anio-cuerpo"><p class="cifra-grande">${anio} <small>de ${META_ANIO} h</small></p>
            <p class="sub">Ritmo esperado a hoy: ${esperado} h · <strong class="${dif < 0 ? 'rojo' : 'verde'}">${dif < 0 ? `${Math.abs(dif)} h atrás` : 'al día'}</strong></p>
            <p class="sub">KPI de la tesis: ${C.capacitacion.kpiHorasAnio} h al año.</p></div>
        </div>
        <div class="tarjeta">${barrasMes()}<p class="sub">Horas por mes. La línea marca la meta de ${HPM} h; en rojo, un mes sin completar.</p></div>
        ${seccion('Plan del año')}
        <div class="tarjeta lista">${D.capacitaciones.map((_, i) => filaCapacitacion(i)).join('')}</div>
        <p class="nota">Nota de ${reglas} · sin completar las ${HPM} h del mes: ${signo(C.acciones.capacitacionIncompleta.puntos)}.</p>
        ${ref ? `<a class="tarjeta refuerzo" href="#capacitacion/${ref.i}"><span class="etiqueta">Refuerzo sugerido</span><p class="texto-fuerte">Repasa «${esc(D.capacitaciones[ref.i].nombre)}»</p><p class="sub">${esc(ref.motivo)}</p></a>` : ''}
        ${impactoHTML()}
        ${seccion('Registro de horas de ' + MESES[mesActual], '<a href="#registrar-horas">Registrar</a>')}
        <div class="tarjeta lista">${e.cap.sesiones.slice().reverse().map(x => `<div class="fila"><span class="fila-cuerpo"><strong>${esc(x.actividad)}</strong><span class="sub">${esc(x.fecha)}</span></span><span class="texto-fuerte">${h(x.horas)}</span></div>`).join('') || '<p class="vacio">Todavía no registras horas este mes.</p>'}</div>
        ${seccion('Coaching con el jefe de agencia')}
        <div class="tarjeta lista">${e.coaching.map(c => `<div class="fila"><span class="fila-cuerpo"><strong>${esc(c.brecha)}</strong><span class="sub">${esc(c.fecha)} · ${esc(c.jefe)}</span><span class="sub texto">Acción acordada: ${esc(c.accion)}</span></span></div>`).join('')}</div>
        <form class="tarjeta formulario" id="form-coaching">
          <p class="texto-fuerte">Registrar sesión de coaching</p>
          <label class="campo"><span>Brecha detectada</span><select name="brecha" required><option value="">Elegir…</option>${['Tiempo de respuesta a leads', 'Seguimiento de cotizaciones', 'Objeciones de precio', 'Objeciones de Marketplace', 'Financiamiento', 'Cierre de la venta'].map(b => `<option>${b}</option>`).join('')}</select></label>
          <label class="campo"><span>Acción de mejora acordada</span><textarea name="accion" required placeholder="Ej.: practicar la guía de precio en un role play"></textarea></label>
          <button class="boton suave" type="submit">Guardar sesión</button>
        </form>`
    };
  }

  function pRegistrarHoras() {
    const hm = horasMes(), falta = faltanHoras(), hoyISO = `${hoy.getFullYear()}-${dos(mesActual + 1)}-${dos(hoy.getDate())}`;
    return {
      barra: { titulo: 'Registrar horas', sub: D.capacitaciones[mesActual].nombre, volver: '#capacitaciones' },
      pestana: 'capacitaciones',
      html: `<div class="tarjeta destacado"><span class="etiqueta">Este mes</span><p class="cifra-grande">${num(hm)} <small>de ${HPM} h</small></p>${barra(hm, HPM)}
          <p class="sub" style="margin-top:8px">${falta > 0 ? `Te faltan ${h(falta)}.` : 'Ya completaste las horas del mes.'}</p></div>
        <form class="tarjeta formulario" id="form-horas">
          <label class="campo"><span>¿Qué hiciste?</span><select name="actividad">${C.capacitacion.actividades.map(a => `<option>${a}</option>`).join('')}</select></label>
          <div class="dos-columnas">
            <label class="campo"><span>Horas</span><select name="horas">${[0.5, 1, 1.5, 2, 3, 4].map(x => `<option value="${x}" ${x === Math.min(2, falta || 2) ? 'selected' : ''}>${h(x)}</option>`).join('')}</select></label>
            <label class="campo"><span>Fecha</span><input type="date" name="fecha" value="${hoyISO}" min="${hoy.getFullYear()}-${dos(mesActual + 1)}-01" max="${hoyISO}"></label>
          </div>
          <button class="boton" type="submit">Guardar horas</button>
        </form>
        <p class="nota">Si al ${diasDelMes} de ${MESES[mesActual]} no llegas a ${HPM} h, se restan ${Math.abs(C.acciones.capacitacionIncompleta.puntos)} puntos.</p>`
    };
  }

  function preguntasHTML(d, revisar) {
    return d.preguntas.map(([texto, ops, ok], i) => `<div class="pregunta"><p class="texto-fuerte">${i + 1}. ${esc(texto)}</p>${ops.map((o, j) => {
      const marca = revisar ? (j === ok ? 'correcta' : revisar[i] === j ? 'incorrecta' : '') : '';
      return `<label class="${marca}"><input type="radio" name="p${i}" value="${j}" ${revisar ? 'disabled' : ''} ${revisar && revisar[i] === j ? 'checked' : ''} required>${esc(o)}</label>`;
    }).join('')}</div>`).join('');
  }

  let ultimoResultado = null;
  function pCapacitacion(idx, paso) {
    const i = Number(idx), d = D.capacitaciones[i]; if (!d) return pNoExiste();
    const c = capDe(i), actual = i === mesActual, pts = puntosDeMes(i);
    const base = { barra: { titulo: d.nombre, sub: `${MESES[i][0].toUpperCase() + MESES[i].slice(1)} · ${HPM} h`, volver: '#capacitaciones' }, pestana: 'capacitaciones' };
    if (actual && (paso === 'inicial' || paso === 'evaluacion')) {
      const inicial = paso === 'inicial';
      return Object.assign(base, {
        html: `<div class="tarjeta"><p class="texto-fuerte">${inicial ? 'Evaluación inicial' : 'Evaluación final'}</p><p class="sub">${inicial ? 'Antes de empezar, para medir tu avance. No da puntos.' : `Nota de 95 a 100: +4 · de 91 a 94: +2.`}</p></div>
          <form class="tarjeta formulario" id="form-evaluacion" data-i="${i}" data-tipo="${paso}">${preguntasHTML(d)}<button class="boton" type="submit">${inicial ? 'Guardar' : 'Enviar evaluación'}</button></form>`
      });
    }
    if (actual && paso === 'resultado' && ultimoResultado && ultimoResultado.i === i) {
      const r = ultimoResultado;
      return Object.assign(base, {
        html: `<div class="tarjeta resultado"><span class="etiqueta">Tu nota</span><p class="resultado-nota">${r.nota}</p>
            ${r.accion ? `<span class="chip aldia">${signo(C.acciones[r.accion].puntos)} puntos</span>` : '<span class="chip gris">Sin puntos: se suman desde 91</span>'}
            <div class="antes-despues"><div><span class="sub">Antes</span><strong>${c.notaInicial}</strong></div><div><span class="sub">Después</span><strong>${r.nota}</strong></div><div><span class="sub">Mejora</span><strong class="verde">${signo(r.nota - c.notaInicial)}</strong></div></div>
          </div>
          ${seccion('Tus respuestas')}<div class="tarjeta formulario">${preguntasHTML(d, r.respuestas)}</div>
          <a class="boton" style="margin-top:20px" href="#capacitaciones">Volver a Mis capacitaciones</a>`
      });
    }
    let estado;
    if (c.estado === 'pendiente') {
      estado = `<div class="tarjeta"><span class="chip gris">Pendiente</span><p class="sub" style="margin-top:10px">Se habilita el 1 de ${MESES[i]}. Son ${HPM} horas y una evaluación al final.</p></div>`;
    } else if (!actual) {
      estado = `<div class="tarjeta"><div class="fila-tope"><span class="chip ${ETIQUETA_CAP[c.estado][1]}">${ETIQUETA_CAP[c.estado][0]}</span><span class="sub">${h(c.horas)} de ${HPM}</span></div>
          ${c.estado === 'completada'
            ? `<div class="antes-despues"><div><span class="sub">Antes</span><strong>${c.notaInicial}</strong></div><div><span class="sub">Después</span><strong>${c.notaFinal}</strong></div><div><span class="sub">Puntos</span><strong class="${pts ? 'verde' : ''}">${pts ? signo(pts) : '0'}</strong></div></div>`
            : `<p class="sub" style="margin-top:10px">No completó las ${HPM} horas del mes: <strong class="rojo">${signo(pts)} puntos</strong> ese mes.</p>`}</div>`;
    } else {
      const falta = faltanHoras();
      let accion;
      if (!c.notaInicial) accion = `<a class="boton" href="#capacitacion/${i}/inicial">Dar evaluación inicial</a>`;
      else if (c.estado === 'completada') accion = `<div class="antes-despues"><div><span class="sub">Antes</span><strong>${c.notaInicial}</strong></div><div><span class="sub">Después</span><strong>${c.notaFinal}</strong></div><div><span class="sub">Puntos</span><strong class="${pts ? 'verde' : ''}">${pts ? signo(pts) : '0'}</strong></div></div>`;
      else if (falta > 0) accion = `<a class="boton" href="#registrar-horas">Registrar horas</a><button class="boton suave" disabled>Evaluación final · faltan ${h(falta)}</button>`;
      else accion = `<a class="boton" href="#capacitacion/${i}/evaluacion">Dar evaluación final</a>`;
      estado = `<div class="tarjeta destacado"><span class="etiqueta">Horas de este mes</span><p class="cifra-grande">${num(c.horas)} <small>de ${HPM} h</small></p>${barra(c.horas, HPM)}
          <p class="sub" style="margin:8px 0 16px">Evaluación inicial: ${c.notaInicial || '—'} · la final se habilita al completar las ${HPM} h.</p>${accion}</div>`;
    }
    return Object.assign(base, {
      html: `${estado}
        ${seccion('Contenido')}
        <div class="tarjeta lista">${d.contenido.map(([t, x], k) => `<div class="fila arriba"><span class="leccion-num">${k + 1}</span><span class="fila-cuerpo"><strong>${esc(t)}</strong><span class="sub texto">${esc(x)}</span></span></div>`).join('')}</div>`
    });
  }

  function componentes(hist) {
    const r = {}; Object.keys(C.componentes).forEach(k => { r[k] = 0; });
    hist.forEach(x => { r[C.acciones[x.accion].componente] += valor(x); });
    return r;
  }

  function pProgreso() {
    const e = yo(), p = puntosDe(e.historial), ventas = ventasDe(e.historial), comp = componentes(e.historial);
    const faltan = C.carro.puntosMeta - p;
    return {
      barra: { titulo: 'Mi progreso', sub: `${MESES[mesActual]} de ${hoy.getFullYear()}` },
      pestana: 'progreso',
      html: `<section class="hero compacto">
          <p class="hero-label">Puntos del mes</p>
          <p class="hero-cifra">${p}</p>
          <p class="hero-sub">${faltan > 0 ? `Te faltan ${faltan} para la meta del carro` : 'Llegaste a la meta del carro'} · ${posicion(s.usuario)}.º en el ranking</p>
          ${pistaHTML(p)}
          <div class="kpis">
            <div><strong>${ventas}<small>/${C.metaVentasMes}</small></strong><span>Ventas</span></div>
            <div><strong>${horasDe(s.usuario)}<small> h</small></strong><span>Capacitación del año</span></div>
            <a href="#logros"><strong>${e.insignias.length}<small>/${C.insignias.length}</small></strong><span>Insignias</span></a>
          </div>
        </section>
        ${seccion('De dónde vienen tus puntos')}
        <div class="componentes">${Object.entries(C.componentes).map(([k, n]) => `<div class="tarjeta"><strong class="${comp[k] < 0 ? 'rojo' : ''}">${comp[k] ? signo(comp[k]) : '0'}</strong><span class="sub">${n}</span></div>`).join('')}</div>
        ${seccion('Historial de puntos')}
        <div class="tarjeta lista">${e.historial.slice().reverse().map(x => {
          const a = C.acciones[x.accion], v = valor(x);
          return `<div class="fila"><span class="fila-cuerpo"><strong class="normal">${esc(a.motivo)}</strong><span class="sub">${fecha(x.t)}${x.detalle ? ' · ' + esc(x.detalle) : ''}</span></span><span class="puntos-mov ${v > 0 ? 'verde' : 'rojo'}">${signo(v)}</span></div>`;
        }).join('')}
        <div class="fila"><span class="fila-cuerpo"><strong class="normal">Inicio del mes</strong><span class="sub">${fecha(inicioMes)}</span></span><span class="puntos-mov">${C.puntosInicioMes}</span></div></div>
        <button class="boton-texto" data-accion="salir">Cerrar sesión</button>`,
      despues: moverCarro
    };
  }

  function pRanking() {
    const t = tabla(), pos = posicion(s.usuario), mio = t[pos - 1];
    const podio = [t[1], t[0], t[2]];
    const mejor = t.slice().sort((a, b) => b.mejora - a.mejora)[0];
    const estadoPremio = i => {
      if (i < 3) return pos === i + 1 ? '<span class="chip aldia">Hoy te corresponde</span>' : `<span class="sub">${esc(t[i].a.nombre)}</span>`;
      if (i === 3) return mejor.a.id === s.usuario ? '<span class="chip aldia">Hoy te corresponde</span>' : `<span class="sub">${esc(mejor.a.nombre)}</span>`;
      return '<span class="sub">Fin de año</span>';
    };
    const horas = D.asesores.map(a => ({ a, h: horasDe(a.id) })).sort((x, y) => y.h - x.h);
    return {
      barra: { titulo: 'Ranking', sub: `${MESES[mesActual]} · se reinicia cada mes` },
      pestana: 'ranking',
      html: `<div class="podio">${podio.map((f, k) => {
          const lugar = [2, 1, 3][k];
          return `<div class="podio-col p${lugar} ${f.a.id === s.usuario ? 'yo' : ''}"><div class="avatar">${iniciales(f.a.nombre)}</div><div class="podio-nombre">${esc(f.a.nombre.split(' ')[0])}</div><div class="sub">${f.puntos} pts</div><div class="podio-base">${lugar}</div></div>`;
        }).join('')}</div>
        <div class="tarjeta destacado"><span class="etiqueta">Tu posición</span><p class="cifra-grande">${pos}.º <small>con ${mio.puntos} puntos</small></p><p class="sub">${pos > 3 ? `Te faltan ${t[2].puntos - mio.puntos + 1} puntos para el 3.er lugar.` : pos > 1 ? `Te faltan ${t[pos - 2].puntos - mio.puntos + 1} puntos para subir un puesto.` : 'Vas primero. Mantén el ritmo.'} Mejora frente a tu mes anterior: ${signo(mio.mejora)}.</p></div>
        ${seccion('Todos')}
        <div class="tarjeta lista">${t.map((f, i) => `<div class="fila ${f.a.id === s.usuario ? 'yo' : ''}"><span class="posicion">${i + 1}</span><span class="fila-cuerpo"><strong>${esc(f.a.nombre)}${f.a.id === s.usuario ? ' <span class="chip morado">Tú</span>' : ''}</strong><span class="sub">${esc(f.a.agencia)} · ${f.ventas} ventas</span></span><span class="puntos-fila">${f.puntos}</span></div>`).join('')}</div>
        <p class="nota">El ranking suma resultados, gestión, servicio y desarrollo; no solo ventas.</p>
        ${seccion('Mayor mejora del mes')}
        <div class="tarjeta lista"><div class="fila"><span class="avatar chico">${iniciales(mejor.a.nombre)}</span><span class="fila-cuerpo"><strong>${esc(mejor.a.nombre)}</strong><span class="sub">${signo(mejor.mejora)} puntos frente a su mes anterior</span></span><span class="chip premio">$50</span></div></div>
        ${seccion('Horas de capacitación del año')}
        <div class="tarjeta lista">${horas.map((f, i) => `<div class="fila ${f.a.id === s.usuario ? 'yo' : ''}"><span class="posicion">${i + 1}</span><span class="fila-cuerpo"><strong>${esc(f.a.nombre)}</strong>${barra(f.h, META_ANIO)}</span><span class="puntos-fila">${f.h}<small> h</small></span></div>`).join('')}</div>
        <p class="nota">Meta: ${HPM} h al mes, ${META_ANIO} h al año.</p>
        ${seccion('Premios')}
        <div class="tarjeta lista">${C.premios.map((p, i) => `<div class="fila"><span class="fila-cuerpo"><strong>${esc(p.puesto)}</strong><span class="sub texto">${esc(p.premio)}</span><span class="sub">${esc(p.frecuencia)}</span></span><span class="fila-lado">${estadoPremio(i)}</span></div>`).join('')}</div>
        <p class="nota">Montos provisionales: se definen después del análisis financiero.</p>`
    };
  }

  function pNoExiste() { return { barra: { titulo: 'No encontrado', volver: '#inicio' }, html: '<div class="tarjeta"><p>Esta pantalla no existe.</p></div>' }; }

  // ---------- Dibujar ----------
  function render() {
    const [r, a, b] = ruta();
    if (!s.usuario || !yo()) { if (r !== 'login') { location.replace('#login'); return; } }
    else if (r === 'login') { location.replace('#inicio'); return; }
    if (s.usuario && yo()) revisarInsignias();
    const p = ({
      login: pLogin, inicio: pInicio, leads: pLeads, lead: () => pLead(a), acciones: () => pAcciones(a),
      objecion: () => pObjecion(a), guia: () => pGuia(a, b), cierre: () => pCierre(a),
      capacitaciones: pCapacitaciones, desarrollo: pCapacitaciones, capacitacion: () => pCapacitacion(a, b), 'registrar-horas': pRegistrarHoras,
      progreso: pProgreso, ranking: pRanking, logros: pLogros
    }[r] || pNoExiste)();
    const cab = $('#barra');
    cab.hidden = !!p.sinBarra;
    if (!p.sinBarra) {
      const bb = p.barra || {};
      cab.innerHTML = bb.marca
        ? `<div class="barra-titulo"><strong class="marca">1001Carros</strong></div><span class="demo">Datos de prueba</span>`
        : `${bb.volver ? `<a class="barra-volver" href="${bb.volver}" aria-label="Volver">${ICONO.volver}</a>` : ''}<div class="barra-titulo"><strong>${esc(bb.titulo)}</strong>${bb.sub ? `<span>${esc(bb.sub)}</span>` : ''}</div><span class="demo">Demo</span>`;
    }
    $('#pantalla').innerHTML = p.html;
    $('#pantalla').style.padding = p.sinBarra ? '0' : '';
    $('#pestanas').hidden = !!p.sinPestanas;
    $('#app').classList.toggle('sin-pestanas', !!p.sinPestanas);
    document.querySelectorAll('#pestanas a').forEach(x => x.classList.toggle('activa', x.dataset.pestana === p.pestana));
    if (p.despues) p.despues();
  }

  window.addEventListener('hashchange', () => {
    window.scrollTo(0, 0);
    if (!location.hash.startsWith('#cierre')) cierre = { kit: null, carita: null };
    render();
  });

  // Los avisos salen uno detrás de otro, para que un logro no tape a los puntos.
  const cola = [];
  let mostrando = false;
  function avisar(texto, tipo) { cola.push([texto, tipo || '']); if (!mostrando) siguienteAviso(); }
  function siguienteAviso() {
    const a = $('#aviso'), sig = cola.shift();
    if (!sig) { mostrando = false; return; }
    mostrando = true;
    a.textContent = sig[0];
    a.className = 'aviso ver ' + sig[1];
    setTimeout(() => { a.className = 'aviso ' + sig[1]; setTimeout(siguienteAviso, 300); }, 2600);
  }

  // ---------- Eventos ----------
  function entrar(id) {
    s.usuario = id;
    if (!s.porUsuario[id]) s.porUsuario[id] = estadoNuevo(id);
    ultimoPct = null;
    guardar();
    location.hash = '#inicio';
  }

  document.addEventListener('click', e => {
    const u = e.target.closest('[data-usuario]');
    if (u) {
      document.querySelectorAll('[data-usuario]').forEach(x => x.classList.toggle('activo', x === u));
      $('#usuario').value = asesor(u.dataset.usuario).nombre;
      return;
    }
    const f = e.target.closest('[data-filtro]');
    if (f) { filtro = f.dataset.filtro; render(); return; }
    const k = e.target.closest('[data-kit]');
    if (k) { cierre.kit = k.dataset.kit; render(); return; }
    const c = e.target.closest('[data-carita]');
    if (c) { cierre.carita = c.dataset.carita; render(); return; }
    const ind = e.target.closest('[data-indicador]');
    if (ind) { indicador = ind.dataset.indicador; render(); return; }

    const b = e.target.closest('[data-accion]');
    if (!b) return;
    const l = b.dataset.id ? lead(b.dataset.id) : null;
    switch (b.dataset.accion) {
      case 'atender':
        atenderLead(l); render(); break;
      case 'seguimiento': {
        l.seguimientoHecho = true;
        l.proximaAccion = 'Programar el siguiente seguimiento';
        guardar();
        sumar('seguimientoATiempo', l.nombre);
        const reto = yo().reto;
        reto.avance++;
        if (!reto.cumplido && reto.avance >= C.reto.meta) { reto.cumplido = true; guardar(); sumar('retoSemanal', C.reto.texto); }
        guardar(); render(); break;
      }
      case 'pregunta': {
        const e2 = yo(), q = preguntaHoy(), op = Number(b.dataset.op);
        e2.pregunta.fecha = hoyCorto(); e2.pregunta.elegida = op;
        if (op === q.correcta) { e2.pregunta.correctas++; guardar(); sumar('preguntaDelDia', 'Pregunta del día', 'Pregunta del día: respuesta correcta'); }
        else { guardar(); avisar('Esta vez no. Mañana hay otra pregunta.'); }
        render(); break;
      }
      case 'disponibilidad':
        l.acciones.disponibilidad = true; guardar(); avisar('Disponibilidad confirmada'); render(); break;
      case 'objecion':
        yo().objeciones.push({ tipo: b.dataset.tipo, resuelta: b.dataset.resuelta === '1', lead: l.id });
        guardar();
        avisar(b.dataset.resuelta === '1' ? 'Objeción registrada como resuelta' : 'Objeción registrada: queda pendiente');
        location.hash = `#acciones/${l.id}`; break;
      case 'cerrar':
        l.vendido = true; l.proximaAccion = 'Seguimiento posventa';
        yo().kit.push({ lead: l.id, articulo: cierre.kit, t: Date.now() });
        guardar();
        sumar(['ventaCerrada', cierre.carita], `${l.nombre} · obsequio: ${cierre.kit}`, 'Venta y satisfacción registradas');
        cierre = { kit: null, carita: null };
        location.hash = '#inicio'; break;
      case 'salir':
        s.usuario = null; guardar(); location.hash = '#login'; break;
      case 'reiniciar':
        if (!confirm('¿Reiniciar la demo? Se borra lo registrado en este navegador.')) return;
        s = { usuario: null, porUsuario: {} }; guardar(); ultimoPct = null; avisar('Demo reiniciada'); render(); break;
    }
  });

  document.addEventListener('change', e => {
    const x = e.target.closest('[data-campo]');
    if (!x) return;
    const l = lead(x.dataset.id);
    l.acciones[x.dataset.campo] = x.value;
    if (x.dataset.campo === 'proximo' && x.value) l.proximaAccion = 'Seguimiento el ' + x.value.replace('T', ' a las ');
    guardar(); avisar('Guardado'); render();
  });

  document.addEventListener('submit', e => {
    e.preventDefault();
    const form = e.target, d = new FormData(form);
    if (form.id === 'form-login') {
      const texto = $('#usuario').value.trim().toLowerCase();
      const a = D.asesores.find(x => x.nombre.toLowerCase() === texto || x.nombre.toLowerCase().split(' ')[0] === texto || x.id === texto);
      if (!a) { avisar('Usa uno de los usuarios de prueba', 'menos'); return; }
      entrar(a.id);
    } else if (form.id === 'form-ficha') {
      const l = lead(form.dataset.id);
      d.forEach((v, k) => { l.ficha[k] = v; });
      guardar(); avisar('Información del cliente guardada');
    } else if (form.id === 'form-coaching') {
      yo().coaching.push({ fecha: hoyCorto(), jefe: 'Jefe de agencia (prueba)', brecha: d.get('brecha'), accion: d.get('accion') });
      guardar(); avisar('Sesión de coaching guardada'); render();
    } else if (form.id === 'form-horas') {
      const horas = Number(d.get('horas')), antes = faltanHoras();
      const [, mm, dd] = (d.get('fecha') || '').split('-');
      yo().cap.sesiones.push({ fecha: dd ? `${dd}/${mm}` : hoyCorto(), actividad: d.get('actividad'), horas });
      guardar();
      const falta = faltanHoras();
      avisar(antes > 0 && falta === 0 ? 'Meta de horas del mes cumplida. Ya puedes dar la evaluación final.' : falta > 0 ? `${h(horas)} registradas · te faltan ${h(falta)}` : `${h(horas)} registradas`, falta === 0 && antes > 0 ? 'logro' : '');
      location.hash = '#capacitaciones';
    } else if (form.id === 'form-evaluacion') {
      const i = Number(form.dataset.i), dd = D.capacitaciones[i], c = yo().cap;
      const respuestas = dd.preguntas.map((_, k) => Number(d.get('p' + k)));
      const nota = Math.round(respuestas.filter((r, k) => r === dd.preguntas[k][2]).length / dd.preguntas.length * 100);
      if (form.dataset.tipo === 'inicial') {
        c.notaInicial = nota; guardar();
        avisar(`Evaluación inicial: ${nota}`);
        location.hash = `#capacitacion/${i}`;
        return;
      }
      c.notaFinal = nota; guardar();
      const accion = accionNota(nota);
      ultimoResultado = { i, nota, accion, respuestas };
      if (accion) sumar(accion, dd.nombre, `Capacitación completada con ${nota}`);
      else avisar(`Capacitación completada con ${nota}. Los puntos empiezan en 91.`);
      location.hash = `#capacitacion/${i}/resultado`;
    }
  });

  setInterval(revisarTiempos, 1000);
  render();
})();
