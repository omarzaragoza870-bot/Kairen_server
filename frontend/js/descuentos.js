/* =============================
   MODULO DESCUENTOS
   ============================= */


function agregarDescuentoTemp(){

    const codigo =
        document.getElementById("codigoDescuento").value.trim();

    const tipo =
        document.getElementById("tipoDescuento").value;

    const valor =
        Number(document.getElementById("valorDescuento").value);

    if(!codigo || !valor){
        mostrarToast("Completa código y valor del descuento", "warning");
        return;
    }

    descuentosTemporales.push({
        codigo,
        tipo,
        valor,
        activo: true
    });

    document.getElementById("codigoDescuento").value = "";
    document.getElementById("valorDescuento").value = "";

    pintarDescuentosTemp();
}


function pintarDescuentosTemp(){

    const contenedor =
        document.getElementById("listaDescuentos");

    if(!contenedor){
        return;
    }

    contenedor.innerHTML = "";

    descuentosTemporales.forEach((descuento, index) => {

        contenedor.innerHTML += `
            <div class="descuento-chip">
                ${escaparTexto(descuento.codigo)} - ${
                    descuento.tipo === "porcentaje"
                    ? `${descuento.valor}%`
                    : `$${descuento.valor}`
                }

                <button
                    type="button"
                    onclick="eliminarDescuentoTemp(${index})">

                    ❌

                </button>
            </div>
        `;
    });
}


function eliminarDescuentoTemp(index){

    descuentosTemporales.splice(index, 1);

    pintarDescuentosTemp();
}


function abrirModalAgregarDescuento(eventoId, funcionId){

    document.getElementById("descuentoEventoId").value =
        eventoId;

    document.getElementById("descuentoFuncionId").value =
        funcionId;

    document.getElementById("nuevoCodigoDescuento").value = "";
    document.getElementById("nuevoTipoDescuento").value = "porcentaje";
    document.getElementById("nuevoValorDescuento").value = "";

    document.body.classList.add("modal-abierto");

    document
        .getElementById("modalAgregarDescuento")
        .classList
        .remove("oculto");
}


function cerrarModalAgregarDescuento(){

    document
        .getElementById("modalAgregarDescuento")
        .classList
        .add("oculto");

    document.body.classList.remove("modal-abierto");
}


async function guardarDescuentoGuardado(boton){

    iniciarCarga(boton, "Guardando...");

    const eventoId =
        document.getElementById("descuentoEventoId").value;

    const funcionId =
        document.getElementById("descuentoFuncionId").value;

    const descuento = {
        codigo:
            document.getElementById("nuevoCodigoDescuento").value.trim(),

        tipo:
            document.getElementById("nuevoTipoDescuento").value,

        valor:
            Number(document.getElementById("nuevoValorDescuento").value)
    };

    if(!descuento.codigo || !descuento.valor){
        mostrarToast("Completa código y valor", "warning");
        terminarCarga(boton);
        return;
    }

    const respuesta = await fetch(
        `${API_URL}/api/eventos/${eventoId}/funciones/${funcionId}/descuentos`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(descuento)
        }
    );

    const resultado =
        await respuesta.json();

    mostrarToast(resultado.mensaje, "success");

    cerrarModalAgregarDescuento();

    cargarEventos();

    terminarCarga(boton);
}



/* ============================================================

   RC-2.3 GESTION DE DESCUENTOS

   RESPONSABILIDAD:
   - Abrir panel lateral de descuentos por función.
   - Listar descuentos existentes.
   - Permitir agregar descuento desde el panel.
   - Permitir eliminar descuentos existentes.

============================================================ */

function abrirGestionDescuentos(eventoId, funcionId){

    const evento =
        eventosActuales.find(item => item.id === eventoId);

    if(!evento){
        mostrarToast("Evento no encontrado", "error");
        return;
    }

    const funcion =
        evento.funciones.find(item => item.id === funcionId);

    if(!funcion){
        mostrarToast("Función no encontrada", "error");
        return;
    }

    document.getElementById("gestionDescuentoEventoId").value =
        eventoId;

    document.getElementById("gestionDescuentoFuncionId").value =
        funcionId;

    const subtitulo =
        document.getElementById("drawerDescuentosSubtitulo");

    if(subtitulo){
        subtitulo.textContent =
            `${evento.nombre} · ${funcion.fecha} ${funcion.hora}`;
    }

    pintarGestionDescuentos(evento, funcion);

    document.body.classList.add("modal-abierto");

    document
        .getElementById("modalGestionDescuentos")
        .classList
        .remove("oculto");
}


function cerrarGestionDescuentos(){

    document
        .getElementById("modalGestionDescuentos")
        .classList
        .add("oculto");

    document.body.classList.remove("modal-abierto");
}


function pintarGestionDescuentos(evento, funcion){

    const contenedor =
        document.getElementById("drawerListaDescuentos");

    if(!contenedor){
        return;
    }

    const descuentos =
        funcion.descuentos || [];

    if(descuentos.length === 0){
        contenedor.innerHTML = `
            <div class="empty-state">
                Esta función todavía no tiene descuentos.
            </div>
        `;
        return;
    }

    contenedor.innerHTML = "";

    descuentos.forEach((descuento, index) => {

        const valorTexto =
            descuento.tipo === "porcentaje"
            ? `${Number(descuento.valor || 0)}%`
            : `$${Number(descuento.valor || 0)}`;

        contenedor.innerHTML += `
            <div class="drawer-descuento-card">

                <div class="drawer-descuento-top">
                    <div>
                        <strong class="drawer-descuento-codigo">
                            ${escaparTexto(descuento.codigo)}
                        </strong>

                        <p class="drawer-descuento-meta">
                            Tipo: ${descuento.tipo === "porcentaje" ? "Porcentaje" : "Monto fijo"}
                        </p>
                    </div>

                    <span class="drawer-descuento-valor">
                        🎁 ${valorTexto}
                    </span>
                </div>

                <div class="drawer-descuento-actions">
                    <button
                        class="btn-danger"
                        onclick="eliminarDescuentoDesdeGestion(${evento.id}, ${funcion.id}, ${index})">
                        🗑️ Eliminar
                    </button>
                </div>

            </div>
        `;
    });
}


function abrirAgregarDescuentoDesdeGestion(){

    const eventoId =
        document.getElementById("gestionDescuentoEventoId").value;

    const funcionId =
        document.getElementById("gestionDescuentoFuncionId").value;

    cerrarGestionDescuentos();

    abrirModalAgregarDescuento(eventoId, funcionId);
}


async function eliminarDescuentoDesdeGestion(
    eventoId,
    funcionId,
    index
){

    abrirConfirmacion(
        "Eliminar descuento",
        "¿Seguro que quieres eliminar este descuento?",
        async function(){

            const respuesta =
                await fetch(
                    `${API_URL}/api/eventos/${eventoId}/funciones/${funcionId}/descuentos/${index}`,
                    {
                        method: "DELETE"
                    }
                );

            const resultado =
                await respuesta.json();

            mostrarToast(resultado.mensaje, "success");

            cerrarGestionDescuentos();

            cargarEventos();
        }
    );
}