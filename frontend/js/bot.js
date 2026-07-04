/* ============================================================
   PANEL DEL BOT (sección "🤖 Bot")
   - Muestra estado de conexión + QR (reportado por el bot).
   - Edita precios y mensajes (los lee el bot desde Kairen).
============================================================ */

let BOT_CONFIG_KEYS = [];
let BOT_FUNCIONES = [];

const BOT_MSG_LABELS = {
    menu: "Menú / saludo inicial",
    confirmacion_venta: "Confirmación de venta (WhatsApp)"
};

async function renderPanelBot(){
    await Promise.all([cargarEstadoBot(), cargarConfigBot()]);
}

async function cargarEstadoBot(){
    const cont = document.getElementById("botEstado");
    if(!cont){ return; }

    let est = { estado: "desconocido", qr: null, ts: null };
    try{
        const r = await fetch(`${API_URL}/api/bot/estado`);
        est = await r.json();
    }catch(e){ /* deja default */ }

    const mapa = {
        conectado:    { icono: "🟢", texto: "Conectado", clase: "ok" },
        esperando_qr: { icono: "🟡", texto: "Esperando QR", clase: "warn" },
        desconectado: { icono: "🔴", texto: "Desconectado", clase: "err" },
        desconocido:  { icono: "⚪", texto: "Sin datos (¿bot apagado?)", clase: "off" }
    };
    const info = mapa[est.estado] || mapa.desconocido;
    const cuando = est.ts ? new Date(est.ts).toLocaleString("es-MX") : "—";

    cont.innerHTML = `
        <div class="bot-estado-fila bot-estado-${info.clase}">
            <span class="bot-estado-icono">${info.icono}</span>
            <div>
                <strong>${info.texto}</strong>
                <div class="bot-estado-sub">Último reporte: ${cuando}</div>
            </div>
        </div>
        <div id="botQR" class="bot-qr"></div>
    `;

    const qrCont = document.getElementById("botQR");
    if(est.estado === "esperando_qr" && est.qr && qrCont){
        qrCont.innerHTML = `<p class="bot-ayuda">Escanea este QR con WhatsApp:</p><div id="botQRImg" class="bot-qr-img"></div>`;
        const div = document.getElementById("botQRImg");
        if(typeof QRCode !== "undefined" && div){
            new QRCode(div, { text: est.qr, width: 220, height: 220, correctLevel: QRCode.CorrectLevel.M });
        }
    }
}

async function cargarConfigBot(){
    let cfg = { precios: {}, mensajes: {} };
    try{
        const r = await fetch(`${API_URL}/api/bot/config`);
        cfg = await r.json();
    }catch(e){
        mostrarToast("No se pudo cargar la config del bot", "error");
        return;
    }

    const pn = document.getElementById("botPrecioNormal");
    const pp = document.getElementById("botPrecioPreventa");
    if(pn){ pn.value = cfg.precios?.normal ?? ""; }
    if(pp){ pp.value = cfg.precios?.preventa ?? ""; }

    BOT_FUNCIONES = Array.isArray(cfg.funciones) ? cfg.funciones.map(f => ({ ...f })) : [];
    renderFuncionesBot();

    const cont = document.getElementById("botMensajes");
    if(!cont){ return; }

    BOT_CONFIG_KEYS = Object.keys(cfg.mensajes || {});
    if(!BOT_CONFIG_KEYS.length){
        cont.innerHTML = `<p class="caja-vacio">Aún no hay mensajes configurados.</p>`;
        return;
    }

    cont.innerHTML = BOT_CONFIG_KEYS.map(k => {
        const label = BOT_MSG_LABELS[k] || k;
        const val = escaparTexto(cfg.mensajes[k] || "");
        const filas = Math.min(10, Math.max(3, (cfg.mensajes[k] || "").split("\n").length + 1));
        return `
            <div class="bot-campo">
                <label class="bot-campo-label">${escaparTexto(label)} <span class="bot-campo-key">(${escaparTexto(k)})</span></label>
                <textarea id="botMsg_${escaparTexto(k)}" rows="${filas}">${val}</textarea>
            </div>
        `;
    }).join("");
}

async function guardarConfigBot(){
    const mensajes = {};
    BOT_CONFIG_KEYS.forEach(k => {
        const ta = document.getElementById(`botMsg_${k}`);
        if(ta){ mensajes[k] = ta.value; }
    });

    const precios = {
        normal: Number(document.getElementById("botPrecioNormal")?.value || 0),
        preventa: Number(document.getElementById("botPrecioPreventa")?.value || 0)
    };

    leerFuncionesDOM();

    try{
        const r = await fetch(`${API_URL}/api/bot/config`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ precios, mensajes, funciones: BOT_FUNCIONES })
        });
        if(!r.ok){ throw new Error("PUT falló"); }
        mostrarToast("Configuración del bot guardada ✅", "success");
    }catch(e){
        mostrarToast("No se pudo guardar", "error");
    }
}

/* ---- Funciones editables ---- */

function renderFuncionesBot(){
    const cont = document.getElementById("botFunciones");
    if(!cont){ return; }

    if(!BOT_FUNCIONES.length){
        cont.innerHTML = `<p class="caja-vacio">Sin funciones. Agrega una con el botón de abajo.</p>`;
        return;
    }

    cont.innerHTML = BOT_FUNCIONES.map((f, i) => `
        <div class="bot-func-fila">
            <div class="bot-func-grid">
                <input data-i="${i}" data-campo="nombre" placeholder="Nombre (ej. Domingo 28 de Junio)" value="${escaparTexto(f.nombre || "")}">
                <input data-i="${i}" data-campo="horario" placeholder="Horario (ej. 19:00 hrs)" value="${escaparTexto(f.horario || "")}">
                <input data-i="${i}" data-campo="capacidad" type="number" min="0" placeholder="Cupo" value="${f.capacidad ?? ""}">
                <input data-i="${i}" data-campo="hoja" placeholder="Hoja (opcional)" value="${escaparTexto(f.hoja || "")}">
            </div>
            <label class="bot-func-activa">
                <input type="checkbox" data-i="${i}" data-campo="activa" ${f.activa !== false ? "checked" : ""}> Activa
            </label>
            <button class="bot-func-del" onclick="eliminarFuncionBot(${i})" title="Quitar">🗑️</button>
        </div>
    `).join("");
}

function leerFuncionesDOM(){
    const cont = document.getElementById("botFunciones");
    if(!cont){ return; }
    cont.querySelectorAll("input[data-campo]").forEach(inp => {
        const i = Number(inp.dataset.i);
        const campo = inp.dataset.campo;
        if(!BOT_FUNCIONES[i]){ return; }
        if(campo === "activa"){ BOT_FUNCIONES[i].activa = inp.checked; }
        else if(campo === "capacidad"){ BOT_FUNCIONES[i].capacidad = Number(inp.value) || 0; }
        else { BOT_FUNCIONES[i][campo] = inp.value; }
    });
}

function agregarFuncionBot(){
    leerFuncionesDOM();
    BOT_FUNCIONES.push({ nombre: "", horario: "19:00 hrs", capacidad: 300, hoja: "", activa: true });
    renderFuncionesBot();
}

function eliminarFuncionBot(i){
    leerFuncionesDOM();
    BOT_FUNCIONES.splice(i, 1);
    renderFuncionesBot();
}