/* ============================================================

   MÓDULO: CONFIGURACIÓN

   RESPONSABILIDAD:
   - Cargar configuración general.
   - Sincronizar nombre del sistema.
   - Sincronizar estado del bot en todas las pantallas.

============================================================ */

async function cargarConfiguracion(){

    const respuesta =
        await fetch(`${API_URL}/api/configuracion`);

    const configuracion =
        await respuesta.json();

    sincronizarConfiguracionUI(configuracion);
}

function sincronizarConfiguracionUI(configuracion){

    const botActivo =
        Boolean(configuracion.botActivo);

    const nombreSistema =
        configuracion.nombreSistema || "Kairen";

    sincronizarNombreSistema(nombreSistema);
    sincronizarEstadoBot(botActivo);
}

function sincronizarNombreSistema(nombreSistema){

    const nombreSidebar =
        document.getElementById("nombreSistemaSidebar");

    const nombreTitulo =
        document.getElementById("nombreSistemaTitulo");

    if(nombreSidebar){
        nombreSidebar.textContent =
            nombreSistema;
    }

    if(nombreTitulo){
        nombreTitulo.textContent =
            nombreSistema;
    }
}

function sincronizarEstadoBot(botActivo){

    const textoBot =
        botActivo
        ? "🟢 Bot Encendido"
        : "🔴 Bot Apagado";

    const textoCard =
        botActivo
        ? "ON"
        : "OFF";

    actualizarTexto("estadoBot", textoBot);
    actualizarTexto("estadoCardBot", textoCard);

    // Switches del bot (mismo estado en todos lados).
    actualizarSwitch("botSwitch", botActivo);
    actualizarSwitch("botSwitchSidebar", botActivo);
}

function actualizarTexto(id, texto){

    const elemento =
        document.getElementById(id);

    if(elemento){
        elemento.textContent = texto;
    }
}

function actualizarSwitch(id, activo){

    const switchBot =
        document.getElementById(id);

    if(!switchBot){
        return;
    }

    switchBot.checked = activo;
}

async function cambiarEstadoBot(){

    const respuesta =
        await fetch(
            `${API_URL}/api/configuracion/bot/toggle`,
            {
                method: "PATCH"
            }
        );

    const resultado =
        await respuesta.json();

    mostrarToast(resultado.mensaje, "success");

    cargarConfiguracion();
}

function abrirEditarNombreSistema(){

    const nombreActual =
        document.getElementById("nombreSistemaTitulo").textContent;

    document.getElementById("inputNombreSistema").value =
        nombreActual;

    document
        .getElementById("modalEditarNombreSistema")
        .classList
        .remove("oculto");
}

function cerrarEditarNombreSistema(){

    document
        .getElementById("modalEditarNombreSistema")
        .classList
        .add("oculto");
}

async function guardarNombreSistema(boton){

    iniciarCarga(boton, "Guardando...");

    const nombreSistema =
        document.getElementById("inputNombreSistema").value;

    const respuesta =
        await fetch(
            `${API_URL}/api/configuracion/nombre`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ nombreSistema })
            }
        );

    const resultado =
        await respuesta.json();

    mostrarToast(resultado.mensaje, "success");

    cerrarEditarNombreSistema();

    cargarConfiguracion();

    terminarCarga(boton);
}