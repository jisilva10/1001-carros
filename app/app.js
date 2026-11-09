/*
  App del Asesor — prototipo con datos de prueba. Nada se conecta a ningún sistema:
  lo que vendría de Sugar está simulado en datos-prueba.js y todo se guarda en el navegador.
  Los puntos, plazos y premios se cambian en config.js.
*/
(function () {
  const C = window.CONFIG, D = window.DATOS;
  const CLAVE = 'app-asesor-1001-v3';
  const SLA = C.leads.minutosMaximoRespuesta;

  // ---------- Estado guardado ----------
  const copia = o => JSON.parse(JSON.stringify(o));
  function cargar() {
    try { const g = JSON.parse(localStorage.getItem(CLAVE)); if (g && g.porUsuario) return g; } catch (e) { /* sin almacenamiento */ }
    return { usuario: null, porUsuario: {} };
  }
  function guardar() { try { localStorage.setItem(CLAVE, JSON.stringify(s)); } catch (e) { /* nada */ } }
  let s = cargar();

  const inicioMes = (() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1).getTime(); })();

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
      cursos: D.cursos.map(c => ({ id: c.id, estado: c.estado, notaInicial: c.notaInicial || null, notaFinal: c.notaFinal || null })),
      objeciones: copia(D.objecionesPrevias),
      coaching: copia(D.coaching),
      kit: [],
      horas: copia(D.horasPrevias),
      racha: { dias: D.juego.racha, hoy: null },
      reto: { avance: D.juego.retoAvance, cumplido: false },
      pregunta: { correctas: D.juego.preguntasCorrectas, fecha: null, elegida: null },
      insignias: null
    };
  }

  const asesor = id => D.asesores.find(a => a.id === id);
  const yo = () => s.porUsuario[s.usuario];

  // ---------- Puntos ----------
  // Una entrada puede traer sus propios puntos (las horas de capacitación suman por hora).
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

  // Registra una o varias acciones con puntos y avisa cuánto sumó o restó.
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

  // ---------- Horas de capacitación ----------
  const dos = n => String(n).padStart(2, '0');
  const hoyCorto = () => { const d = new Date(); return `${dos(d.getDate())}/${dos(d.getMonth() + 1)}`; };
  const horasDe = id => (s.porUsuario[id] ? s.porUsuario[id].horas.reduce((t, h) => t + h.horas, 0) : asesor(id).horasAnio);
  const mesCorto = () => dos(new Date().getMonth() + 1);
  const horasDelMes = () => yo().horas.filter(h => h.fecha.slice(3) === mesCorto()).reduce((t, h) => t + h.horas, 0);
  // Ritmo esperado: la parte de la meta anual que correspondería a la fecha de hoy.
  function horasEsperadas() {
    const d = new Date(), inicio = new Date(d.getFullYear(), 0, 1);
    return Math.round(C.capacitacion.metaHorasAnio * (d - inicio) / (365 * 864e5));
  }
  // Anota las horas y devuelve la entrada de puntos que les corresponde.
  function horasItem(horas, actividad, tipo) {
    yo().horas.push({ fecha: hoyCorto(), actividad, horas, tipo });
    return { accion: 'horasCapacitacion', puntos: horas * C.acciones.horasCapacitacion.puntos, detalle: `${actividad} · ${horas} h` };
  }

  // ---------- Capa de juego ----------
  function sumarRacha() {
    const r = yo().racha, hoy = hoyCorto();
    if (r.hoy !== hoy) { r.dias++; r.hoy = hoy; }
  }
  function preguntaHoy() {
    const d = new Date(), n = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 864e5);
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
      cursos: e.cursos.filter(c => c.estado === 'completado').length,
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
    return `Quedan ${mm}:${String(ss).padStart(2, '0')}`;
  }
  function haceCuanto(l) {
    const m = Math.floor(minutos(l));
    return m < 60 ? `hace ${m} min` : m < 1440 ? `hace ${Math.floor(m / 60)} h` : `hace ${Math.floor(m / 1440)} d`;
  }
  const ORDEN = { urgente: 0, pendiente: 1, aldia: 2, vendido: 3 };
  const leadsOrdenados = () => yo().leads.slice().sort((a, b) => ORDEN[estadoLead(a)] - ORDEN[estadoLead(b)] || (a.atendido ? 0 : minutos(b) - minutos(a)));
  const lead = id => yo().leads.find(l => l.id === id);
  const pctSemana = () => { const w = yo().semana; return w.total ? Math.round(w.dentroDelTiempo / w.total * 1000) / 10 : 100; };

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
    if (!s.usuario) return;
    let cambio = false;
    yo().leads.forEach(l => {
      if (!l.atendido && !l.vencido && minutos(l) >= SLA) {
        l.vencido = true; yo().semana.total++; cambio = true;
        yo().racha.dias = 0; yo().racha.hoy = hoyCorto();
        sumar('leadVencido', l.nombre);
      }
      const el = document.querySelectorAll(`[data-reloj="${l.id}"]`);
      el.forEach(x => { x.textContent = reloj(l); });
      const est = estadoLead(l);
      if (l._ultimo && l._ultimo !== est) cambio = true;
      l._ultimo = est;
    });
    if (cambio && ['inicio', 'leads'].includes(ruta()[0])) render();
  }

  // ---------- Cursos ----------
  const curso = id => D.cursos.find(c => c.id === id);
  const estadoCurso = id => yo().cursos.find(c => c.id === id);
  function recomendacion() {
    const sin = {};
    yo().objeciones.filter(o => !o.resuelta).forEach(o => { sin[o.tipo] = (sin[o.tipo] || 0) + 1; });
    const [tipo, n] = Object.entries(sin).sort((a, b) => b[1] - a[1])[0] || [];
    const c2 = estadoCurso('c2');
    if (n >= 2 && c2.estado !== 'completado') {
      return { curso: curso('c2'), motivo: `Tienes ${n} objeciones de ${D.objeciones[tipo].nombre.toLowerCase()} sin resolver este mes.` };
    }
    const sig = yo().cursos.find(c => c.estado !== 'completado');
    return sig ? { curso: curso(sig.id), motivo: 'Es el siguiente curso de tu ruta.' } : null;
  }
  function puntosCurso(nota) {
    return nota >= 90 ? 'cursoNota90' : nota >= 80 ? 'cursoNota80' : nota >= 70 ? 'cursoNota70' : null;
  }

  // ---------- Utilidades de dibujo ----------
  const $ = sel => document.querySelector(sel);
  const esc = t => String(t == null ? '' : t).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
  const iniciales = n => n.split(' ').map(p => p[0]).slice(0, 2).join('');
  const nombreMes = () => new Date().toLocaleDateString('es-EC', { month: 'long', year: 'numeric' });
  const fecha = t => new Date(t).toLocaleDateString('es-EC', { day: 'numeric', month: 'short' });
  const signo = p => (p > 0 ? '+' : '−') + Math.abs(p);
  const ICONO = {
    check: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#FBCA01" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    reloj: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 7.5V12l3 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    llamada: '<svg viewBox="0 0 24 24"><path d="M6 3.5h3l1.5 4-2 1.3a10 10 0 005 5l1.3-2 4 1.5v3a2 2 0 01-2 2A15 15 0 014 5.5a2 2 0 012-2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
    curso: '<svg viewBox="0 0 24 24"><path d="M3 8l9-4 9 4-9 4zM7 10v5c1.5 1.5 3 2 5 2s3.5-.5 5-2v-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
    lista: '<svg viewBox="0 0 24 24"><path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
    chat: '<svg viewBox="0 0 24 24"><path d="M4 5h16v10H9l-5 4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
    regalo: '<svg viewBox="0 0 24 24"><path d="M4 10h16v10H4zM3 7h18v3H3zM12 7v13M12 7c-2-3-5-3-5-1s3 1 5 1zm0 0c2-3 5-3 5-1s-3 1-5 1z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    volver: '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };
  function carita(tipo) {
    const boca = { excelente: 'M7 13h10c-.6 3.2-2.8 4.6-5 4.6S7.6 16.2 7 13z', buena: 'M8 14c1.3 1.6 6.7 1.6 8 0', aceptable: 'M8 15h8' }[tipo];
    return `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#FBCA01"/><circle cx="8.6" cy="9.5" r="1.3" fill="#240079"/><circle cx="15.4" cy="9.5" r="1.3" fill="#240079"/><path d="${boca}" fill="${tipo === 'excelente' ? '#240079' : 'none'}" stroke="#240079" stroke-width="1.8" stroke-linecap="round"/></svg>`;
  }

  // ---------- El carro de progreso ----------
  let ultimoPct = null; // posición donde se vio el carro por última vez, para animar el cambio
  function pct(p) { const k = C.carro; return Math.max(0, Math.min(100, (p - k.puntosMinimo) / (k.puntosMeta - k.puntosMinimo) * 100)); }
  function pistaHTML(puntos, grande) {
    const k = C.carro, desde = ultimoPct == null ? pct(puntos) : ultimoPct;
    const lugar = v => `calc(48px + (100% - 96px) * ${v / 100})`;
    return `<div class="pista ${grande ? 'grande' : ''}" data-pct="${pct(puntos)}">
      <div class="pista-camino"><div class="pista-avance" style="width:${lugar(desde)}"></div><div class="pista-linea"></div></div>
      <span class="pista-marca" style="left:${lugar(pct(k.puntosInicio))}">Inicio del mes · ${k.puntosInicio}</span>
      <span class="pista-marca meta" style="left:${lugar(100)}">Meta · ${k.puntosMeta}</span>
      <img class="pista-carro" src="img/carro.png" alt="Carro de progreso" style="left:${lugar(desde)}">
    </div>`;
  }
  function moverCarro() {
    const pista = $('.pista');
    if (!pista) return;
    const v = Number(pista.dataset.pct), lugar = `calc(48px + (100% - 96px) * ${v / 100})`;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      pista.querySelector('.pista-carro').style.left = lugar;
      pista.querySelector('.pista-avance').style.width = lugar;
    }));
    ultimoPct = v;
  }

  // ---------- Pantallas ----------
  const ruta = () => (location.hash.slice(1) || 'inicio').split('/');

  function pLogin() {
    return {
      sinBarra: true, sinPestanas: true,
      html: `<div class="login">
        <div class="login-marca">1001Carros</div>
        <div class="login-sub">${esc(C.nombreApp)} · prototipo con datos de prueba</div>
        <img src="img/carro.png" alt="">
        <form class="tarjeta" id="form-login">
          <label class="campo"><span>Usuario</span><input id="usuario" autocomplete="off" placeholder="Escribe o elige un usuario de prueba" value="${esc(asesor(D.asesores[0].id).nombre)}"></label>
          <div class="usuarios">${D.asesores.map((a, i) => `<button type="button" data-usuario="${a.id}" class="${i === 0 ? 'activo' : ''}">${esc(a.nombre)}</button>`).join('')}</div>
          <button class="boton" type="submit">Entrar</button>
          <p class="nota">Es un prototipo: entra con cualquier usuario de prueba y no pide clave. En la versión real se ingresaría con el usuario de la empresa.</p>
        </form>
        <button class="boton-texto" style="color:#fff" data-accion="reiniciar">Reiniciar la demo</button>
      </div>`
    };
  }

  function pInicio() {
    const e = yo(), a = asesor(s.usuario), p = puntosDe(e.historial), pos = posicion(s.usuario), ventas = ventasDe(e.historial);
    const urgentes = e.leads.filter(l => estadoLead(l) === 'urgente');
    const segs = e.leads.filter(l => l.seguimientoHoy && !l.seguimientoHecho && !l.vendido).sort((x, y) => x.seguimientoHoy.localeCompare(y.seguimientoHoy));
    const c2 = estadoCurso('c2'), rec = recomendacion();
    let alertas = '';
    urgentes.forEach(l => {
      alertas += `<a class="alerta" href="#lead/${l.id}"><div class="alerta-icono urgente">${ICONO.reloj}</div><div class="alerta-cuerpo"><strong>${l.vencido ? 'Lead sin gestión' : 'Lead por vencer'}: ${esc(l.nombre)}</strong><span data-reloj="${l.id}">${reloj(l)}</span></div><span class="flecha">›</span></a>`;
    });
    segs.forEach(l => {
      alertas += `<a class="alerta" href="#acciones/${l.id}"><div class="alerta-icono pendiente">${ICONO.llamada}</div><div class="alerta-cuerpo"><strong>Seguimiento hoy ${esc(l.seguimientoHoy)}</strong><span>${esc(l.nombre)} · ${esc(l.proximaAccion)}</span></div><span class="flecha">›</span></a>`;
    });
    if (c2.estado !== 'completado') {
      alertas += `<a class="alerta" href="#curso/c2"><div class="alerta-icono morado">${ICONO.curso}</div><div class="alerta-cuerpo"><strong>Curso por vencer: ${esc(curso('c2').nombre)}</strong><span>${esc(curso('c2').vence)}</span></div><span class="flecha">›</span></a>`;
    }
    const cursosHechos = e.cursos.filter(c => c.estado === 'completado').length;
    return {
      barra: { titulo: `Hola, ${a.nombre.split(' ')[0]}`, sub: `${nombreMes()} · los puntos se reinician el 1.º de cada mes`, alta: true },
      pestana: 'inicio',
      html: `<div class="tarjeta subir">
          <div class="perfil"><div class="avatar">${iniciales(a.nombre)}</div><div><div class="perfil-nombre">${esc(a.nombre)}</div><div class="muted pequeno">${esc(a.agencia)}</div></div></div>
          <div class="cifras">
            <div><span class="cifra">${p}</span><span class="cifra-label">Puntos</span></div>
            <div><a href="#ranking"><span class="cifra">${pos}.º</span><span class="cifra-label">en el ranking</span></a></div>
            <div><span class="cifra">${ventas}/${C.metaVentasMes}</span><span class="cifra-label">Ventas del mes</span></div>
          </div>
          ${pistaHTML(p)}
          <div class="meta-ventas"><div class="meta-ventas-fila"><span>Meta mensual de ventas</span><strong>${ventas} de ${C.metaVentasMes}</strong></div><div class="barra-progreso amarilla"><span style="width:${Math.min(100, ventas / C.metaVentasMes * 100)}%"></span></div></div>
        </div>
        <h2 class="titulo-seccion">Lo que requiere atención hoy</h2>
        <div class="tarjeta">${alertas || '<p class="muted">Todo al día. Buen trabajo.</p>'}</div>
        ${juegoHTML()}
        <h2 class="titulo-seccion">Módulos</h2>
        <div class="modulos">
          <a class="modulo" href="#leads"><span class="modulo-num">Módulo 1</span><span class="modulo-nombre">Gestión de leads</span><span class="modulo-dato">${urgentes.length} urgente${urgentes.length === 1 ? '' : 's'} · ${pctSemana()} % a tiempo</span></a>
          <a class="modulo" href="#leads"><span class="modulo-num">Módulo 2</span><span class="modulo-nombre">Proceso comercial</span><span class="modulo-dato">Acciones, objeciones y cierre por cliente</span></a>
          <a class="modulo" href="#desarrollo"><span class="modulo-num">Módulo 3</span><span class="modulo-nombre">Desarrollo y desempeño</span><span class="modulo-dato">${cursosHechos} de ${D.cursos.length} cursos${rec ? ' · 1 recomendado' : ''}</span></a>
          <a class="modulo" href="#ranking"><span class="modulo-num">Módulo 4</span><span class="modulo-nombre">Incentivos y motivación</span><span class="modulo-dato">Puesto ${pos} · ver premios</span></a>
        </div>`,
      despues: moverCarro
    };
  }

  const MEDALLA = '<svg viewBox="0 0 24 24"><path d="M8 14.5L6 22l6-3 6 3-2-7.5" fill="currentColor" opacity=".55"/><circle cx="12" cy="9.5" r="7" fill="currentColor"/><path d="M12 5.8l1.2 2.5 2.7.4-2 1.9.5 2.7L12 12l-2.4 1.3.5-2.7-2-1.9 2.7-.4z" fill="#fff"/></svg>';
  function juegoHTML() {
    const e = yo(), r = e.reto, q = preguntaHoy(), respondida = e.pregunta.fecha === hoyCorto();
    const puntos = Array.from({ length: 7 }, (_, i) => `<span class="${i < Math.min(e.racha.dias, 7) ? 'on' : ''}"></span>`).join('');
    const pregunta = respondida
      ? `${q.opciones.map((o, i) => `<div class="opcion-dia ${i === q.correcta ? 'correcta' : i === e.pregunta.elegida ? 'incorrecta' : ''}">${esc(o)}</div>`).join('')}
         <p class="muted pequeno" style="margin-top:8px">${e.pregunta.elegida === q.correcta ? `Correcto, +${C.acciones.preguntaDelDia.puntos} punto.` : 'Esta vez no.'} ${esc(q.explicacion)} Mañana hay otra.</p>`
      : q.opciones.map((o, i) => `<button class="opcion-dia" data-accion="pregunta" data-op="${i}">${esc(o)}</button>`).join('');
    return `<h2 class="titulo-seccion">Tu juego de la semana <a href="#logros">Ver logros</a></h2>
      <div class="juego">
        <div class="tarjeta"><span class="juego-label">Racha</span><span class="juego-cifra">${e.racha.dias} día${e.racha.dias === 1 ? '' : 's'}</span><span class="muted pequeno">seguidos con todo a tiempo</span><div class="racha">${puntos}</div></div>
        <a class="tarjeta" href="#logros"><span class="juego-label">Insignias</span><span class="juego-cifra">${e.insignias.length} de ${C.insignias.length}</span><span class="muted pequeno">desbloqueadas</span><div class="medallas">${C.insignias.slice(0, 5).map(i => `<span class="${e.insignias.includes(i.id) ? 'on' : ''}">${MEDALLA}</span>`).join('')}</div></a>
      </div>
      <div class="tarjeta reto"><div class="meta-ventas-fila"><span><span class="juego-label">Reto de la semana</span><br><strong>${esc(C.reto.texto)}</strong></span><span class="chip ${r.cumplido ? 'aldia' : 'morado'}">${r.cumplido ? 'Cumplido' : `+${C.acciones.retoSemanal.puntos} pts`}</span></div>
        <div class="barra-progreso amarilla"><span style="width:${Math.min(100, r.avance / C.reto.meta * 100)}%"></span></div><div class="muted pequeno" style="margin-top:4px">${Math.min(r.avance, C.reto.meta)} de ${C.reto.meta}</div></div>
      <div class="tarjeta pregunta-dia"><div class="meta-ventas-fila"><span class="juego-label">Pregunta del día</span><span class="muted pequeno">+${C.acciones.preguntaDelDia.puntos} punto · 10 segundos</span></div>
        <strong>${esc(q.texto)}</strong><div class="opciones-dia">${pregunta}</div></div>`;
  }

  function pLogros() {
    const e = yo(), m = medidas();
    return {
      barra: { titulo: 'Mis logros', sub: `${e.insignias.length} de ${C.insignias.length} insignias`, volver: '#progreso' },
      pestana: 'progreso',
      html: `<div class="insignias">${C.insignias.map(i => {
          const ok = e.insignias.includes(i.id), avance = Math.min(m[i.medida], i.meta);
          return `<div class="insignia ${ok ? 'on' : ''}"><div class="insignia-icono">${MEDALLA}</div><strong>${esc(i.nombre)}</strong><span class="muted pequeno">${esc(i.descripcion)}</span>
            ${ok ? '<span class="chip aldia">Desbloqueada</span>' : `<div class="barra-progreso" style="width:100%"><span style="width:${avance / i.meta * 100}%"></span></div><span class="muted pequeno">${avance} de ${i.meta}</span>`}</div>`;
        }).join('')}</div>
        <p class="nota">Las insignias se desbloquean solas con lo que registras. No dan puntos: son reconocimiento.</p>`
    };
  }

  let filtro = 'todos';
  function pLeads() {
    const e = yo(), lista = leadsOrdenados().filter(l => filtro === 'todos' || estadoLead(l) === filtro);
    const cuenta = k => e.leads.filter(l => estadoLead(l) === k).length;
    const segs = e.leads.filter(l => l.seguimientoHoy && !l.seguimientoHecho && !l.vendido).sort((x, y) => x.seguimientoHoy.localeCompare(y.seguimientoHoy));
    const w = e.semana;
    return {
      barra: { titulo: 'Mis leads', sub: 'Asignados desde Sugar (simulado)' },
      pestana: 'leads',
      html: `<div class="tarjeta" style="margin-top:14px">
          <div class="sla"><span class="sla-cifra">${pctSemana()} %</span><div class="sla-cuerpo"><strong>Atendidos a tiempo esta semana</strong><div class="muted">${w.dentroDelTiempo} de ${w.total} dentro de ${SLA} min · meta ${C.leads.porcentajeSemanal} % (+${C.acciones.slaSemanal.puntos} pts)${w.bonoEntregado ? ' · bono de esta semana ya ganado' : ''}</div></div></div>
          <div class="barra-progreso" style="margin-top:10px"><span style="width:${Math.min(100, pctSemana())}%"></span></div>
        </div>
        <div class="filtros">${['todos', 'urgente', 'pendiente', 'aldia', 'vendido'].map(k => `<button data-filtro="${k}" class="${filtro === k ? 'activo' : ''}">${k === 'todos' ? 'Todos' : NOMBRE_ESTADO[k]} (${k === 'todos' ? e.leads.length : cuenta(k)})</button>`).join('')}</div>
        <div class="tarjeta" style="margin-top:10px">${lista.map(l => {
          const est = estadoLead(l);
          return `<a class="fila" href="#lead/${l.id}"><div class="fila-cuerpo"><div class="fila-nombre">${esc(l.nombre)}</div><div class="fila-sub">${esc(l.ficha.vehiculo)} · ${esc(l.canal)} · ${haceCuanto(l)}</div><div class="fila-sub">${esc(l.atendido ? (l.vendido ? 'Venta registrada' : l.proximaAccion) : 'Hacer el primer contacto')}</div></div>
            <div class="fila-lado"><span class="chip ${est === 'vendido' ? 'morado' : est}">${NOMBRE_ESTADO[est]}</span>${l.atendido ? '' : `<span class="reloj ${est}" data-reloj="${l.id}">${reloj(l)}</span>`}</div></a>`;
        }).join('') || '<p class="muted">No hay leads en este estado.</p>'}</div>
        <h2 class="titulo-seccion">Seguimientos de hoy</h2>
        <div class="tarjeta">${segs.map(l => `<a class="fila" href="#acciones/${l.id}"><div class="fila-cuerpo"><div class="fila-nombre">${esc(l.seguimientoHoy)} · ${esc(l.nombre)}</div><div class="fila-sub">${esc(l.proximaAccion)}</div></div><span class="chip pendiente">+${C.acciones.seguimientoATiempo.puntos} a tiempo</span></a>`).join('') || '<p class="muted">No quedan seguimientos para hoy.</p>'}</div>
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
      barra: { titulo: 'Ficha del lead', sub: esc(l.canal), volver: '#leads' },
      pestana: 'leads',
      html: `<div class="tarjeta" style="margin-top:14px">
          <div class="ficha-cabecera"><div><div class="ficha-nombre">${esc(l.nombre)}</div><div class="muted pequeno">Cédula ${esc(l.cedula)} (ficticia) · ingresó ${haceCuanto(l)}</div></div><span class="chip ${est === 'vendido' ? 'morado' : est}">${NOMBRE_ESTADO[est]}</span></div>
          <div style="margin-top:8px"><span class="chip sugar">Nombre y cédula vienen de Sugar</span></div>
          ${l.atendido ? `<div class="proxima"><small>Próxima acción</small>${esc(l.vendido ? 'Venta registrada. Seguimiento posventa.' : l.proximaAccion)}</div>`
            : `<div class="proxima" style="background:var(--rojo-suave)"><small style="color:var(--rojo)">Primer contacto pendiente</small><span data-reloj="${l.id}">${reloj(l)}</span> de ${SLA} min</div>
               <button class="boton" style="margin-top:10px" data-accion="atender" data-id="${l.id}">Registrar primer contacto</button>`}
        </div>
        ${l.atendido && !l.vendido ? `<div class="accesos" style="margin-top:10px">
          <a class="acceso" href="#acciones/${l.id}">${ICONO.lista}Acciones de venta</a>
          <a class="acceso" href="#objecion/${l.id}">${ICONO.chat}Registrar objeción</a>
          <a class="acceso" href="#cierre/${l.id}">${ICONO.regalo}Cierre y satisfacción</a>
        </div>` : ''}
        <h2 class="titulo-seccion">Información comercial</h2>
        <form class="tarjeta" id="form-ficha" data-id="${l.id}">
          <div class="grid-campos">
            <label class="campo ancho"><span>Vehículo de interés</span><input name="vehiculo" value="${esc(f.vehiculo)}"></label>
            <label class="campo ancho"><span>Presupuesto aproximado (USD)</span><input name="presupuesto" value="${esc(f.presupuesto)}" placeholder="Ej.: 15.000 – 18.000"></label>
            <label class="campo"><span>Uso previsto</span>${select('uso', f.uso)}</label>
            <label class="campo"><span>Para cuándo</span>${select('cuando', f.cuando)}</label>
            <label class="campo"><span>Forma de pago</span>${select('pago', f.pago)}</label>
            <label class="campo"><span>Auto en parte de pago</span>${select('partePago', f.partePago)}</label>
            <label class="campo ancho"><span>Ocupación (para el financiamiento)</span><input name="ocupacion" value="${esc(f.ocupacion)}"></label>
          </div>
          <button class="boton secundario" type="submit">Guardar información</button>
        </form>`
    };
  }

  function pAcciones(id) {
    const l = lead(id); if (!l) return pNoExiste();
    const a = l.acciones;
    const item = (hecho, texto, detalle, control) => `<div class="check ${hecho ? 'hecho' : ''}"><div class="check-caja">${hecho ? ICONO.check : ''}</div><div class="check-cuerpo"><div class="check-texto">${texto}</div>${detalle ? `<div class="check-detalle">${detalle}</div>` : ''}${control || ''}</div></div>`;
    const opts = (nombre, lista, valor) => `<select data-campo="${nombre}" data-id="${l.id}"><option value="">Registrar resultado…</option>${lista.map(o => `<option ${o === valor ? 'selected' : ''}>${o}</option>`).join('')}</select>`;
    const ultimaObj = yo().objeciones.filter(o => o.lead === l.id).pop();
    return {
      barra: { titulo: 'Acciones de venta', sub: esc(l.nombre), volver: `#lead/${l.id}` },
      pestana: 'leads',
      html: `${l.seguimientoHoy && !l.seguimientoHecho ? `<div class="tarjeta" style="margin-top:14px;border-left:4px solid var(--amarillo)">
            <strong>Seguimiento de hoy, ${esc(l.seguimientoHoy)}</strong><div class="muted pequeno">${esc(l.proximaAccion)}</div>
            <button class="boton" style="margin-top:10px" data-accion="seguimiento" data-id="${l.id}">Marcar seguimiento hecho (+${C.acciones.seguimientoATiempo.puntos})</button>
          </div>` : ''}
        <h2 class="titulo-seccion">Checklist del cliente</h2>
        <div class="tarjeta">
          ${item(a.disponibilidad, 'Confirmar disponibilidad del vehículo', 'Antes de la cita, que el auto siga en esta agencia.', a.disponibilidad ? '' : `<button class="boton secundario" data-accion="disponibilidad" data-id="${l.id}">Confirmar que está disponible</button>`)}
          ${item(a.cita, 'Resultado de la cita o test drive', a.cita ? esc(a.cita) : '', opts('cita', ['Asistió a la cita', 'Hizo test drive, le gustó', 'Hizo test drive, no le convenció', 'No asistió', 'Reagendó'], a.cita))}
          ${item(a.proximo, 'Programar el siguiente seguimiento', a.proximo ? 'Programado: ' + esc(a.proximo.replace('T', ' a las ')) : '', `<input type="datetime-local" data-campo="proximo" data-id="${l.id}" value="${esc(a.proximo || '')}">`)}
          ${item(a.cotizacion, 'Resultado de la cotización', a.cotizacion ? esc(a.cotizacion) : `Si no se hace el seguimiento a tiempo: ${C.acciones.cotizacionSinSeguimiento.puntos} pts.`, opts('cotizacion', ['Enviada, en espera', 'En negociación', 'Aceptada', 'Rechazada'], a.cotizacion))}
          ${item(ultimaObj, 'Registrar la objeción principal', ultimaObj ? `${esc(D.objeciones[ultimaObj.tipo].nombre)} · ${ultimaObj.resuelta ? 'resuelta' : 'sin resolver'}` : '', `<a class="boton secundario" href="#objecion/${l.id}">${ultimaObj ? 'Registrar otra objeción' : 'Elegir objeción'}</a>`)}
        </div>
        <div style="margin-top:14px"><a class="boton amarillo" href="#cierre/${l.id}">Cerrar venta: kit y satisfacción</a></div>
        <p class="nota">El embudo completo sigue en Sugar; aquí solo van las acciones críticas.</p>`
    };
  }

  function pObjecion(id) {
    const l = lead(id); if (!l) return pNoExiste();
    return {
      barra: { titulo: 'Registrar objeción', sub: esc(l.nombre), volver: `#acciones/${l.id}` },
      pestana: 'leads',
      html: `<h2 class="titulo-seccion">¿Cuál es la objeción principal?</h2>
        ${Object.entries(D.objeciones).map(([k, o]) => `<a class="opcion" href="#guia/${l.id}/${k}"><span><strong>${esc(o.nombre)}</strong><small>${esc(o.resumen)}</small></span><span class="flecha">›</span></a>`).join('')}
        <p class="nota">Al elegirla, la app muestra la guía de respuesta para esa objeción.</p>`
    };
  }

  function pGuia(id, tipo) {
    const l = lead(id), o = D.objeciones[tipo]; if (!l || !o) return pNoExiste();
    const t = o.comparacion;
    return {
      barra: { titulo: `Guía: ${o.nombre}`, sub: esc(l.nombre), volver: `#objecion/${l.id}` },
      pestana: 'leads',
      html: `<div class="tarjeta" style="margin-top:14px"><strong>Qué explicar</strong><ol class="lista">${o.explicar.map(x => `<li>${esc(x)}</li>`).join('')}</ol></div>
        <div class="tarjeta"><strong>Beneficios para destacar</strong><div class="beneficios">${o.beneficios.map(x => `<span>${esc(x)}</span>`).join('')}</div></div>
        <div class="tarjeta"><strong>${esc(t.titulo)}</strong><table class="tabla"><thead><tr>${t.columnas.map(c => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${t.filas.map(f => `<tr>${f.map(c => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
        <h2 class="titulo-seccion">¿Se resolvió la objeción?</h2>
        <div class="botones-2"><button class="boton" data-accion="objecion" data-id="${l.id}" data-tipo="${tipo}" data-resuelta="1">Sí, se resolvió</button><button class="boton secundario" data-accion="objecion" data-id="${l.id}" data-tipo="${tipo}" data-resuelta="0">Todavía no</button></div>
        <p class="nota">Las objeciones sin resolver sirven para recomendarte un curso en Desarrollo.</p>`
    };
  }

  let cierre = { kit: null, carita: null };
  function pCierre(id) {
    const l = lead(id); if (!l) return pNoExiste();
    if (l.vendido) return { barra: { titulo: 'Cierre', volver: `#lead/${l.id}` }, pestana: 'leads', html: `<div class="tarjeta" style="margin-top:14px">La venta a ${esc(l.nombre)} ya está registrada.</div>` };
    const caras = [['excelente', 'Excelente', 'caritaExcelente'], ['buena', 'Buena', 'caritaBuena'], ['aceptable', 'Aceptable', 'caritaAceptable']];
    return {
      barra: { titulo: 'Kit de cierre y satisfacción', sub: esc(l.nombre), volver: `#acciones/${l.id}` },
      pestana: 'leads',
      html: `<h2 class="titulo-seccion">Artículo entregado al cliente</h2>
        <div class="tarjeta"><div class="kit">${C.kitCierre.map(k => `<button data-kit="${esc(k)}" class="${cierre.kit === k ? 'activo' : ''}">${esc(k)}</button>`).join('')}</div>
        <p class="nota" style="margin-bottom:0">Lo pone la empresa, no el asesor. El registro sirve para controlar consumo y costo.</p></div>
        <h2 class="titulo-seccion">¿Cómo calificó el cliente la atención?</h2>
        <div class="tarjeta"><div class="caritas">${caras.map(([k, n, acc]) => `<button data-carita="${acc}" class="${cierre.carita === acc ? 'activo' : ''}">${carita(k)}${n}<small>+${C.acciones[acc].puntos} pts</small></button>`).join('')}</div>
        <p class="nota" style="margin-bottom:0">El cliente elige la carita en el celular del asesor al terminar.</p></div>
        <div style="margin-top:14px"><button class="boton" data-accion="cerrar" data-id="${l.id}" ${cierre.kit && cierre.carita ? '' : 'disabled'}>Registrar venta y satisfacción</button></div>`
    };
  }

  function pDesarrollo() {
    const e = yo(), rec = recomendacion(), hechos = e.cursos.filter(c => c.estado === 'completado').length;
    return {
      barra: { titulo: 'Mi desarrollo', sub: 'Ruta de capacitación y coaching' },
      pestana: 'desarrollo',
      html: `${horasHTML()}
        <div class="tarjeta"><div class="meta-ventas-fila"><span>Progreso de aprendizaje</span><strong>${hechos} de ${D.cursos.length} cursos</strong></div><div class="barra-progreso"><span style="width:${hechos / D.cursos.length * 100}%"></span></div></div>
        ${rec ? `<a class="tarjeta recomendado" href="#curso/${rec.curso.id}" style="display:block"><small>Recomendado para ti</small><strong>${esc(rec.curso.nombre)}</strong><div class="muted pequeno">${esc(rec.motivo)}</div></a>` : ''}
        <h2 class="titulo-seccion">Ruta de capacitación</h2>
        <div class="tarjeta">${D.cursos.map((c, i) => {
          const ec = estadoCurso(c.id), cls = ec.estado === 'completado' ? 'completado' : ec.estado === 'en curso' ? 'encurso' : '';
          const sub = ec.estado === 'completado' ? `Nota ${ec.notaFinal} %${ec.notaInicial ? ` (antes ${ec.notaInicial} %)` : ''} · ${c.horas} h` : `${c.horas} h · ${c.vence}`;
          return `<a class="curso" href="#curso/${c.id}"><div class="curso-num ${cls}">${ec.estado === 'completado' ? '✓' : i + 1}</div><div class="fila-cuerpo"><div class="fila-nombre">${esc(c.nombre)}</div><div class="fila-sub">${sub}</div></div><span class="chip ${ec.estado === 'completado' ? 'morado' : ec.estado === 'en curso' ? 'pendiente' : 'gris'}">${ec.estado === 'completado' ? 'Completado' : ec.estado === 'en curso' ? 'En curso' : 'Pendiente'}</span></a>`;
        }).join('')}</div>
        <p class="nota">Nota de 90 a 100 %: +7 · de 80 a 89 %: +5 · de 70 a 79 %: +3 · vencido sin completar: −2. Además, +${C.acciones.horasCapacitacion.puntos} por cada hora.</p>
        ${impactoHTML()}
        <h2 class="titulo-seccion">Coaching con el jefe de agencia</h2>
        <div class="tarjeta">${e.coaching.map(c => `<div class="mov"><div><strong>${esc(c.brecha)}</strong><small>${esc(c.fecha)} · ${esc(c.jefe)}</small><small style="color:var(--texto)">Acción acordada: ${esc(c.accion)}</small></div></div>`).join('')}</div>
        <form class="tarjeta" id="form-coaching">
          <strong>Registrar sesión de coaching</strong>
          <label class="campo" style="margin-top:10px"><span>Brecha detectada</span><select name="brecha" required><option value="">Elegir…</option>${['Tiempo de respuesta a leads', 'Seguimiento de cotizaciones', 'Objeciones de precio', 'Objeciones de Marketplace', 'Financiamiento', 'Cierre de la venta'].map(b => `<option>${b}</option>`).join('')}</select></label>
          <label class="campo"><span>Acción de mejora acordada</span><textarea name="accion" required placeholder="Ej.: practicar la guía de precio en un role play"></textarea></label>
          <label class="campo"><span>Duración</span><select name="horas">${[0.5, 1, 1.5, 2].map(h => `<option value="${h}" ${h === 1 ? 'selected' : ''}>${String(h).replace('.', ',')} h</option>`).join('')}</select></label>
          <button class="boton secundario" type="submit">Guardar sesión</button>
        </form>
        <h2 class="titulo-seccion">Registro de horas de ${new Date().getFullYear()}</h2>
        <div class="tarjeta">${e.horas.slice().reverse().map(h => `<div class="mov"><div>${esc(h.actividad)}<small>${esc(h.fecha)} · ${esc(h.tipo)}</small></div><span class="mov-puntos">${String(h.horas).replace('.', ',')} h</span></div>`).join('')}</div>`
    };
  }

  function dona(valor, meta) {
    const pct = Math.min(100, valor / meta * 100);
    return `<svg viewBox="0 0 36 36" class="dona" role="img" aria-label="${Math.round(pct)} % de la meta"><circle cx="18" cy="18" r="15.9155" fill="none" stroke="var(--morado-suave)" stroke-width="3.4"/><circle cx="18" cy="18" r="15.9155" fill="none" stroke="var(--morado)" stroke-width="3.4" stroke-dasharray="${pct} ${100 - pct}" stroke-dashoffset="25" stroke-linecap="round"/><text x="18" y="18.2" text-anchor="middle" class="dona-cifra">${Math.round(pct)}%</text><text x="18" y="23.2" text-anchor="middle" class="dona-label">de la meta</text></svg>`;
  }
  function horasHTML() {
    const h = horasDe(s.usuario), meta = C.capacitacion.metaHorasAnio, esperado = horasEsperadas();
    const diferencia = h - esperado;
    return `<div class="tarjeta horas" style="margin-top:14px">${dona(h, meta)}
      <div class="horas-cuerpo"><span class="juego-label">Horas de capacitación ${new Date().getFullYear()}</span>
        <span class="horas-cifra">${String(h).replace('.', ',')} <small>de ${meta} h</small></span>
        <span class="pequeno">Ritmo esperado a hoy: ${esperado} h · <strong style="color:${diferencia < 0 ? 'var(--rojo)' : 'var(--verde)'}">${diferencia < 0 ? `vas ${Math.abs(diferencia)} h atrás` : 'vas al día'}</strong></span>
        <span class="muted pequeno">Este mes: ${String(horasDelMes()).replace('.', ',')} h · +${C.acciones.horasCapacitacion.puntos} punto por hora</span></div></div>`;
  }

  // Antes y después de cada capacitación, con los números mensuales del asesor.
  let indicador = 'conversion';
  const prom = a => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : null);
  const num = (n, u) => n == null ? '—' : n.toLocaleString('es-EC', { maximumFractionDigits: 1 }) + (u ? ' ' + u : '');
  function antesDespues(ind, mes) {
    const v = D.impacto.indicadores[ind].valores;
    return [prom(v.slice(Math.max(0, mes - 2), mes)), prom(v.slice(mes + 1, mes + 3))];
  }
  function grafico() {
    const I = D.impacto, ind = I.indicadores[indicador], v = ind.valores;
    const W = 320, H = 150, izq = 30, der = 10, arr = 18, aba = 22;
    const min = Math.min(...v), max = Math.max(...v), r = (max - min) || 1, lo = min - r * 0.2, hi = max + r * 0.2;
    const x = i => izq + (W - izq - der) * i / (v.length - 1), y = n => arr + (H - arr - aba) * (1 - (n - lo) / (hi - lo));
    const marcas = I.capacitaciones.map((c, k) => `<line x1="${x(c.mes)}" x2="${x(c.mes)}" y1="${arr - 4}" y2="${H - aba}" class="g-marca"/><circle cx="${x(c.mes)}" cy="${arr - 8}" r="7" class="g-marca-punto"/><text x="${x(c.mes)}" y="${arr - 5}" text-anchor="middle" class="g-marca-num">${k + 1}</text>`).join('');
    const linea = v.map((n, i) => `${i ? 'L' : 'M'}${x(i)},${y(n)}`).join(' ');
    return `<svg viewBox="0 0 ${W} ${H}" class="grafico" role="img" aria-label="${esc(ind.nombre)} por mes">
      <line x1="${izq}" x2="${W - der}" y1="${H - aba}" y2="${H - aba}" class="g-eje"/>
      <text x="${izq - 6}" y="${y(max) + 3}" text-anchor="end" class="g-texto">${num(max)}</text><text x="${izq - 6}" y="${y(min) + 3}" text-anchor="end" class="g-texto">${num(min)}</text>
      ${marcas}<path d="${linea}" class="g-linea"/>${v.map((n, i) => `<circle cx="${x(i)}" cy="${y(n)}" r="2.6" class="g-punto"/>`).join('')}
      ${I.meses.map((m, i) => `<text x="${x(i)}" y="${H - 6}" text-anchor="middle" class="g-texto">${m}</text>`).join('')}
    </svg>`;
  }
  function impactoHTML() {
    const I = D.impacto;
    return `<h2 class="titulo-seccion">Antes y después de capacitarte</h2>
      <div class="tarjeta">
        <div class="segmentos">${Object.entries(I.indicadores).map(([k, ind]) => `<button data-indicador="${k}" class="${k === indicador ? 'activo' : ''}">${esc(ind.nombre)}</button>`).join('')}</div>
        ${grafico()}
        <p class="muted pequeno">Cada número marca el mes de una capacitación. Antes: promedio de los 2 meses previos. Después: de los 2 siguientes.</p>
      </div>
      ${I.capacitaciones.map((c, k) => `<div class="tarjeta impacto"><div class="meta-ventas-fila"><span><span class="g-num">${k + 1}</span><strong>${esc(c.nombre)}</strong></span><span class="muted pequeno">${I.meses[c.mes]} · ${c.horas} h</span></div>
        <table class="tabla"><thead><tr><th></th><th>Antes</th><th>Después</th></tr></thead><tbody>${Object.entries(I.indicadores).map(([kk, ind]) => {
          const [a, d] = antesDespues(kk, c.mes), dif = d - a;
          return `<tr><td>${esc(ind.nombre)}</td><td>${num(a, ind.unidad)}</td><td>${num(d, ind.unidad)} <span class="${dif >= 0 ? 'sube' : 'baja'}">${dif >= 0 ? '▲' : '▼'} ${num(Math.abs(dif))}</span></td></tr>`;
        }).join('')}</tbody></table></div>`).join('')}`;
  }

  function preguntasHTML(c, revisar) {
    return c.preguntas.map(([texto, ops, ok], i) => `<div class="pregunta"><p>${i + 1}. ${esc(texto)}</p>${ops.map((o, j) => {
      const marca = revisar ? (j === ok ? 'correcta' : revisar[i] === j ? 'incorrecta' : '') : '';
      return `<label class="${marca}"><input type="radio" name="p${i}" value="${j}" ${revisar ? 'disabled' : ''} ${revisar && revisar[i] === j ? 'checked' : ''} required>${esc(o)}</label>`;
    }).join('')}</div>`).join('');
  }

  let ultimoResultado = null;
  function pCurso(id, paso) {
    const c = curso(id); if (!c) return pNoExiste();
    const ec = estadoCurso(id), base = { barra: { titulo: c.nombre, sub: `Curso · ${c.horas} h de capacitación`, volver: '#desarrollo' }, pestana: 'desarrollo' };
    if (paso === 'inicial' || paso === 'evaluacion') {
      const inicial = paso === 'inicial';
      return Object.assign(base, {
        html: `<div class="tarjeta" style="margin-top:14px"><strong>${inicial ? 'Evaluación inicial' : 'Evaluación final'}</strong><div class="muted pequeno">${inicial ? 'Antes de empezar, para medir el avance. No da puntos.' : `${c.preguntas.length} preguntas. Con 70 % o más el curso queda aprobado.`}</div></div>
          <form class="tarjeta" id="form-evaluacion" data-id="${id}" data-tipo="${paso}">${preguntasHTML(c)}<button class="boton" type="submit">${inicial ? 'Guardar y ver el curso' : 'Enviar evaluación'}</button></form>`
      });
    }
    if (paso === 'resultado' && ultimoResultado && ultimoResultado.id === id) {
      const r = ultimoResultado, rec = recomendacion();
      return Object.assign(base, {
        html: `<div class="tarjeta resultado" style="margin-top:14px">
            <div class="muted pequeno">Tu nota</div><div class="resultado-nota">${r.nota} %</div>
            <div style="margin-top:4px">${r.accion ? `<span class="chip aldia">${signo(C.acciones[r.accion].puntos)} puntos · ${esc(C.acciones[r.accion].motivo)}</span><br><span class="chip morado" style="margin-top:6px">${c.horas} h de capacitación · ${signo(c.horas * C.acciones.horasCapacitacion.puntos)} puntos</span>` : '<span class="chip urgente">No aprobado: puedes repetirla</span>'}</div>
            <div class="antes-despues"><div><span class="muted pequeno">Antes</span><strong>${ec.notaInicial} %</strong></div><div><span class="muted pequeno">Después</span><strong>${r.nota} %</strong></div></div>
          </div>
          <h2 class="titulo-seccion">Tus respuestas</h2>
          <div class="tarjeta">${preguntasHTML(c, r.respuestas)}</div>
          ${rec ? `<a class="tarjeta recomendado" href="#curso/${rec.curso.id}" style="display:block"><small>Siguiente capacitación recomendada</small><strong>${esc(rec.curso.nombre)}</strong><div class="muted pequeno">${esc(rec.motivo)}</div></a>` : ''}
          <div style="margin-top:14px">${r.accion ? '<a class="boton" href="#desarrollo">Volver a mi desarrollo</a>' : `<a class="boton" href="#curso/${id}/evaluacion">Repetir evaluación</a>`}</div>`
      });
    }
    const completado = ec.estado === 'completado';
    return Object.assign(base, {
      html: `<div class="tarjeta" style="margin-top:14px"><div class="ficha-cabecera"><div><strong>${completado ? 'Curso completado' : esc(c.vence)}</strong><div class="muted pequeno">${ec.notaInicial ? `Evaluación inicial: ${ec.notaInicial} %` : 'Sin evaluación inicial todavía'}${completado ? ` · final: ${ec.notaFinal} %` : ''}</div></div><span class="chip ${completado ? 'morado' : 'pendiente'}">${completado ? 'Completado' : 'En curso'}</span></div></div>
        ${!ec.notaInicial && !completado ? `<div class="tarjeta recomendado"><small>Antes de empezar</small><strong>Haz la evaluación inicial</strong><div class="muted pequeno">Así se ve cuánto mejoraste al final. No da puntos.</div><a class="boton" style="margin-top:10px" href="#curso/${id}/inicial">Empezar evaluación inicial</a></div>` : `
        <h2 class="titulo-seccion">Contenido</h2>
        <div class="tarjeta">${c.contenido.map(([t, x], i) => `<div class="leccion"><div class="leccion-num">${i + 1}</div><div><strong>${esc(t)}</strong><div class="muted pequeno">${esc(x)}</div></div></div>`).join('')}</div>
        ${completado ? '' : `<div style="margin-top:14px"><a class="boton" href="#curso/${id}/evaluacion">Ir a la evaluación final</a></div>`}`}`
    });
  }

  function componentes(hist) {
    const r = {}; Object.keys(C.componentes).forEach(k => { r[k] = 0; });
    hist.forEach(h => { r[C.acciones[h.accion].componente] += valor(h); });
    return r;
  }

  function pProgreso() {
    const e = yo(), p = puntosDe(e.historial), ventas = ventasDe(e.historial), comp = componentes(e.historial);
    const faltan = C.carro.puntosMeta - p;
    return {
      barra: { titulo: 'Mi progreso', sub: nombreMes() },
      pestana: 'progreso',
      html: `<div class="tarjeta" style="margin-top:14px">
          <div class="cifras" style="margin-top:0;padding-top:0;border-top:0">
            <div><span class="cifra">${p}</span><span class="cifra-label">Puntos</span></div>
            <div><span class="cifra">${posicion(s.usuario)}.º</span><span class="cifra-label">Ranking</span></div>
            <div><span class="cifra">${ventas}/${C.metaVentasMes}</span><span class="cifra-label">Ventas</span></div>
          </div>
          ${pistaHTML(p, true)}
          <p class="muted pequeno" style="text-align:center">${faltan > 0 ? `Te faltan ${faltan} puntos para la meta del carro.` : 'Llegaste a la meta del carro este mes.'} Empezaste el mes con ${C.puntosInicioMes}.</p>
        </div>
        <a class="tarjeta fila-enlace" href="#logros"><span><strong>Mis logros</strong><span class="muted pequeno"> · ${yo().insignias.length} de ${C.insignias.length} insignias · racha de ${yo().racha.dias} días</span></span><span class="flecha">›</span></a>
        <h2 class="titulo-seccion">De dónde vienen tus puntos</h2>
        <div class="componentes">${Object.entries(C.componentes).map(([k, n]) => `<div class="componente"><strong style="color:${comp[k] < 0 ? 'var(--rojo)' : 'var(--morado)'}">${signo(comp[k]).replace('−0', '0').replace('+0', '0')}</strong><span>${n}</span></div>`).join('')}</div>
        <h2 class="titulo-seccion">Mis puntos: historial</h2>
        <div class="tarjeta">${e.historial.slice().reverse().map(h => {
          const a = C.acciones[h.accion], v = valor(h);
          return `<div class="mov"><div>${esc(a.motivo)}<small>${fecha(h.t)}${h.detalle ? ' · ' + esc(h.detalle) : ''}</small></div><span class="mov-puntos ${v > 0 ? 'mas' : 'menos'}">${signo(v)}</span></div>`;
        }).join('')}
        <div class="mov"><div>Inicio del mes<small>${fecha(inicioMes)}</small></div><span class="mov-puntos">${C.puntosInicioMes}</span></div></div>
        <button class="boton-texto" data-accion="salir">Cerrar sesión</button>`,
      despues: moverCarro
    };
  }

  function pRanking() {
    const t = tabla(), pos = posicion(s.usuario), mio = t[pos - 1];
    const podio = [t[1], t[0], t[2]];
    const mejor = t.slice().sort((a, b) => b.mejora - a.mejora)[0];
    const estadoPremio = i => {
      if (i < 3) return pos === i + 1 ? '<span class="chip aldia">Hoy te corresponde</span>' : `<span class="chip gris">${esc(t[i].a.nombre)}</span>`;
      if (i === 3) return mejor.a.id === s.usuario ? '<span class="chip aldia">Hoy te corresponde</span>' : `<span class="chip gris">${esc(mejor.a.nombre)}</span>`;
      return '<span class="chip gris">Se define con los 12 meses</span>';
    };
    return {
      barra: { titulo: 'Ranking y premios', sub: `${nombreMes()} · se reinicia cada mes` },
      pestana: 'ranking',
      html: `<div class="tarjeta" style="margin-top:14px"><div class="podio">${podio.map((f, k) => {
          const lugar = [2, 1, 3][k];
          return `<div class="podio-col p${lugar} ${f.a.id === s.usuario ? 'yo' : ''}"><div class="avatar">${iniciales(f.a.nombre)}</div><div class="podio-nombre">${esc(f.a.nombre)}</div><div class="podio-puntos">${f.puntos} pts</div><div class="podio-base">${lugar}</div></div>`;
        }).join('')}</div></div>
        <div class="tarjeta"><strong>Tu posición: ${pos}.º con ${mio.puntos} puntos</strong><div class="muted pequeno">${pos > 3 ? `Te faltan ${t[2].puntos - mio.puntos + 1} puntos para el 3.er lugar.` : pos > 1 ? `Te faltan ${t[pos - 2].puntos - mio.puntos + 1} puntos para subir un puesto.` : 'Vas primero. Mantén el ritmo.'}</div></div>
        <h2 class="titulo-seccion">Mayor mejora del mes</h2>
        <div class="tarjeta mejora"><div class="avatar">${iniciales(mejor.a.nombre)}</div><div class="fila-cuerpo"><strong>${esc(mejor.a.nombre)}</strong><div class="muted pequeno">${signo(mejor.mejora)} puntos frente a su mes anterior</div></div><span class="chip morado">$50</span></div>
        <p class="nota">Tu mejora: ${signo(mio.mejora)} puntos frente a tu mes anterior (${mio.a.mesAnterior}).</p>
        <h2 class="titulo-seccion">Ranking completo</h2>
        <div class="tarjeta">${t.map((f, i) => `<div class="fila ${f.a.id === s.usuario ? 'yo' : ''}"><div class="posicion">${i + 1}</div><div class="fila-cuerpo"><div class="fila-nombre">${esc(f.a.nombre)}${f.a.id === s.usuario ? ' <span class="chip morado">Tú</span>' : ''}</div><div class="fila-sub">${esc(f.a.agencia)} · ${f.ventas} ventas</div></div><span class="puntos-fila">${f.puntos}</span></div>`).join('')}</div>
        <p class="nota">El ranking suma resultados, gestión, servicio y desarrollo; no solo ventas.</p>
        <h2 class="titulo-seccion">Horas de capacitación del año</h2>
        <div class="tarjeta">${D.asesores.map(a => ({ a, h: horasDe(a.id) })).sort((x, y) => y.h - x.h).map((f, i) => `<div class="fila ${f.a.id === s.usuario ? 'yo' : ''}"><div class="posicion">${i + 1}</div><div class="fila-cuerpo"><div class="fila-nombre">${esc(f.a.nombre)}</div><div class="barra-progreso" style="margin-top:5px"><span style="width:${Math.min(100, f.h / C.capacitacion.metaHorasAnio * 100)}%"></span></div></div><span class="puntos-fila">${String(f.h).replace('.', ',')}<small class="muted pequeno"> h</small></span></div>`).join('')}</div>
        <p class="nota">Meta: ${C.capacitacion.metaHorasAnio} horas de capacitación comercial por asesor al año (Balanced Scorecard).</p>
        <h2 class="titulo-seccion">Premios</h2>
        <div class="tarjeta">${C.premios.map((p, i) => `<div class="premio"><div class="fila-cuerpo"><div class="premio-puesto">${esc(p.puesto)}</div><div>${esc(p.premio)}</div><div class="fila-sub">${esc(p.frecuencia)}</div></div>${estadoPremio(i)}</div>`).join('')}</div>
        <p class="nota">Montos provisionales: se definen después del análisis financiero.</p>`
    };
  }

  function pNoExiste() { return { barra: { titulo: 'No encontrado', volver: '#inicio' }, html: '<div class="tarjeta" style="margin-top:14px">Esta pantalla no existe.</div>' }; }

  // ---------- Dibujar ----------
  function render() {
    const [r, a, b] = ruta();
    if (!s.usuario || !yo()) { if (r !== 'login') { location.replace('#login'); return; } }
    else if (r === 'login') { location.replace('#inicio'); return; }
    if (s.usuario && yo()) revisarInsignias();
    const p = ({
      login: pLogin, inicio: pInicio, leads: pLeads, lead: () => pLead(a), acciones: () => pAcciones(a),
      objecion: () => pObjecion(a), guia: () => pGuia(a, b), cierre: () => pCierre(a), desarrollo: pDesarrollo,
      curso: () => pCurso(a, b), progreso: pProgreso, ranking: pRanking, logros: pLogros
    }[r] || pNoExiste)();
    const barra = $('#barra');
    barra.hidden = !!p.sinBarra;
    if (!p.sinBarra) {
      const bb = p.barra || {};
      barra.className = 'barra' + (bb.alta ? ' alta' : '');
      barra.innerHTML = `${bb.volver ? `<a class="barra-volver" href="${bb.volver}" aria-label="Volver">${ICONO.volver}</a>` : ''}<div class="barra-titulo"><strong>${esc(bb.titulo)}</strong>${bb.sub ? `<span>${bb.sub}</span>` : ''}</div><span class="etiqueta-prueba">Datos de prueba</span>`;
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
      case 'seguimiento':
        l.seguimientoHecho = true;
        l.proximaAccion = 'Programar el siguiente seguimiento';
        guardar();
        sumar('seguimientoATiempo', l.nombre);
        const reto = yo().reto;
        reto.avance++;
        if (!reto.cumplido && reto.avance >= C.reto.meta) { reto.cumplido = true; guardar(); sumar('retoSemanal', C.reto.texto); }
        guardar(); render(); break;
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
        sumar(['ventaCerrada', cierre.carita], `${l.nombre} · obsequio: ${cierre.kit}`, 'Venta cerrada y satisfacción registrada');
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
    const form = e.target;
    if (form.id === 'form-login') {
      const texto = $('#usuario').value.trim().toLowerCase();
      const a = D.asesores.find(x => x.nombre.toLowerCase() === texto || x.nombre.toLowerCase().split(' ')[0] === texto || x.id === texto);
      if (!a) { avisar('Usa uno de los usuarios de prueba', 'menos'); return; }
      entrar(a.id);
    } else if (form.id === 'form-ficha') {
      const l = lead(form.dataset.id);
      new FormData(form).forEach((v, k) => { l.ficha[k] = v; });
      guardar(); avisar('Información del cliente guardada');
    } else if (form.id === 'form-coaching') {
      const d = new FormData(form);
      const horas = Number(d.get('horas'));
      yo().coaching.push({ fecha: hoyCorto(), jefe: 'Jefe de agencia (prueba)', brecha: d.get('brecha'), accion: d.get('accion') });
      sumar(horasItem(horas, 'Coaching con el jefe de agencia', 'Coaching'), '', `Coaching guardado: ${String(horas).replace('.', ',')} h de capacitación`);
      render();
    } else if (form.id === 'form-evaluacion') {
      const c = curso(form.dataset.id), ec = estadoCurso(c.id), d = new FormData(form);
      const respuestas = c.preguntas.map((_, i) => Number(d.get('p' + i)));
      const nota = Math.round(respuestas.filter((r, i) => r === c.preguntas[i][2]).length / c.preguntas.length * 100);
      if (form.dataset.tipo === 'inicial') {
        ec.notaInicial = nota; ec.estado = 'en curso'; guardar();
        avisar(`Evaluación inicial: ${nota} %`);
        location.hash = `#curso/${c.id}`;
        return;
      }
      const accion = puntosCurso(nota);
      ec.notaFinal = nota;
      if (accion) ec.estado = 'completado';
      guardar();
      ultimoResultado = { id: c.id, nota, accion, respuestas };
      if (accion) sumar([accion, horasItem(c.horas, 'Curso: ' + c.nombre, 'Curso')], c.nombre, `Curso aprobado y ${c.horas} h de capacitación`);
      else avisar(`Nota ${nota} %: no se aprobó`, 'menos');
      location.hash = `#curso/${c.id}/resultado`;
    }
  });

  setInterval(revisarTiempos, 1000);
  render();
})();
