/* =============================
   MODULO FUNCIONES
   ============================= */


function obtenerCategorias(funcion){

    if(funcion.categorias){
        return funcion.categorias;
    }

    return {
        general: {
            preventa: Number(funcion.precio || 0),
            precio: Number(funcion.precio || 0),
            boletos: Number(funcion.boletosDisponibles || 0)
        },

        preferente: {
            activa: false,
            preventa: 0,
            precio: 0,
            boletos: 0
        },

        vip: {
            activa: false,
            preventa: 0,
            precio: 0,
            boletos: 0
        }
    };
}


function calcularBoletosFuncion(funcion){

    const categorias = obtenerCategorias(funcion);

    let total =
        Number(categorias.general?.boletos || 0);

    if(categorias.preferente?.activa){
        total +=
            Number(categorias.preferente?.boletos || 0);
    }

    if(categorias.vip?.activa){
        total +=
            Number(categorias.vip?.boletos || 0);
    }

    return total;
}


function crearHTMLCategoria(
    titulo,
    icono,
    categoria
){

    return `
        <div class="categoria-card">

            <h4>${icono} ${titulo}</h4>

            <p>
                Preventa:
                $${Number(categoria?.preventa || 0)}
            </p>

            <p>
                Regular:
                $${Number(categoria?.precio || 0)}
            </p>

            <p>
                Boletos:
                ${Number(categoria?.boletos || 0)}
            </p>

        </div>
    `;
}


function abrirModalFuncion(eventoId){

    document.getElementById("eventoIdFuncion").value = eventoId;

    document.getElementById("fechaFuncion").value = "";
    document.getElementById("horaFuncion").value = "";

    document.getElementById("generalPreventaFuncion").value = "";
    document.getElementById("generalPrecioFuncion").value = "";
    document.getElementById("generalBoletosFuncion").value = "";

    document.getElementById("activarPreferenteFuncion").checked = false;
    document.getElementById("preferentePreventaFuncion").value = "";
    document.getElementById("preferentePrecioFuncion").value = "";
    document.getElementById("preferenteBoletosFuncion").value = "";

    document.getElementById("activarVipFuncion").checked = false;
    document.getElementById("vipPreventaFuncion").value = "";
    document.getElementById("vipPrecioFuncion").value = "";
    document.getElementById("vipBoletosFuncion").value = "";

    document.body.classList.add("modal-abierto");

    document
        .getElementById("modalFuncion")
        .classList
        .remove("oculto");
}


function cerrarModalFuncion(){

    document
        .getElementById("modalFuncion")
        .classList
        .add("oculto");

    document.body.classList.remove("modal-abierto");
}


async function guardarFuncion(boton){

    iniciarCarga(boton, "Guardando...");

    const eventoId =
        document.getElementById("eventoIdFuncion").value;

    const categorias = {
        general: {
            preventa: Number(
                document.getElementById("generalPreventaFuncion").value
            ),
            precio: Number(
                document.getElementById("generalPrecioFuncion").value
            ),
            boletos: Number(
                document.getElementById("generalBoletosFuncion").value
            )
        },

        preferente: {
            activa:
                document.getElementById("activarPreferenteFuncion").checked,
            preventa: Number(
                document.getElementById("preferentePreventaFuncion").value
            ),
            precio: Number(
                document.getElementById("preferentePrecioFuncion").value
            ),
            boletos: Number(
                document.getElementById("preferenteBoletosFuncion").value
            )
        },

        vip: {
            activa:
                document.getElementById("activarVipFuncion").checked,
            preventa: Number(
                document.getElementById("vipPreventaFuncion").value
            ),
            precio: Number(
                document.getElementById("vipPrecioFuncion").value
            ),
            boletos: Number(
                document.getElementById("vipBoletosFuncion").value
            )
        }
    };

    const boletosTotales =
        categorias.general.boletos +
        (
            categorias.preferente.activa
            ? categorias.preferente.boletos
            : 0
        ) +
        (
            categorias.vip.activa
            ? categorias.vip.boletos
            : 0
        );

    const nuevaFuncion = {
        fecha: document.getElementById("fechaFuncion").value,
        hora: document.getElementById("horaFuncion").value,

        categorias,

        descuentos: [],

        precio: categorias.general.precio,
        boletosDisponibles: boletosTotales
    };

    const respuesta = await fetch(
        `${API_URL}/api/eventos/${eventoId}/funciones`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(nuevaFuncion)
        }
    );

    const resultado = await respuesta.json();

    mostrarToast(resultado.mensaje, "success");

    cerrarModalFuncion();

    cargarEventos();

    terminarCarga(boton);
}


async function toggleFuncion(eventoId, funcionId){

    const respuesta = await fetch(
        `${API_URL}/api/eventos/${eventoId}/funciones/${funcionId}/toggle`,
        {
            method:"PATCH"
        }
    );

    const resultado = await respuesta.json();

    mostrarToast(resultado.mensaje, "success");

    // Si el drawer de Agenda está abierto, lo refrescamos para que se
    // vea el cambio (el botón pasa de Pausar a Activar y el estado).
    const modal =
        document.getElementById("modalAgendaDia");

    const drawerAbierto =
        modal && !modal.classList.contains("oculto");

    if(drawerAbierto && typeof refrescarDrawerChecklist === "function"){
        await refrescarDrawerChecklist(eventoId, funcionId);
    }else{
        await cargarEventos();
    }
}


async function eliminarFuncion(eventoId, funcionId){

    abrirConfirmacion(
        "Eliminar función",
        "¿Seguro que quieres eliminar esta función?",
        async function(){

            // Guardamos la fecha ANTES de borrar (después ya no existe).
            const eventoAntes =
                eventosActuales.find(item => Number(item.id) === Number(eventoId));

            const funcionAntes =
                eventoAntes?.funciones?.find(item => Number(item.id) === Number(funcionId));

            const fecha =
                funcionAntes?.fecha;

            const respuesta = await fetch(
                `${API_URL}/api/eventos/${eventoId}/funciones/${funcionId}`,
                {
                    method: "DELETE"
                }
            );

            const resultado = await respuesta.json();

            mostrarToast(resultado.mensaje, "success");

            await cargarEventos();

            // Si el drawer de Agenda está abierto, lo actualizamos: si
            // quedan registros ese día lo repintamos, si no, lo cerramos.
            const modal =
                document.getElementById("modalAgendaDia");

            const drawerAbierto =
                modal && !modal.classList.contains("oculto");

            if(drawerAbierto && fecha && typeof agruparFuncionesPorFecha === "function"){

                const quedan =
                    agruparFuncionesPorFecha(eventosActuales)[fecha] || [];

                if(quedan.length > 0 && typeof abrirAgendaDia === "function"){
                    abrirAgendaDia(fecha);
                }else if(typeof cerrarAgendaDia === "function"){
                    cerrarAgendaDia();
                }
            }
        }
    );
}


function abrirEditarFuncion(eventoId, funcionId){

    const evento = eventosActuales.find(
        item => item.id === eventoId
    );

    if(!evento){
        mostrarToast("Evento no encontrado", "error");
        return;
    }

    const funcion = evento.funciones.find(
        item => item.id === funcionId
    );

    if(!funcion){
        mostrarToast("Función no encontrada", "error");
        return;
    }

    const categorias = obtenerCategorias(funcion);

    document.getElementById("editarEventoId").value =
        eventoId;

    document.getElementById("editarFuncionId").value =
        funcionId;

    // Alpha v1.17: editor unificado -> precargar datos del evento.
    document.getElementById("editarFuncNombre").value = evento.nombre || "";
    document.getElementById("editarFuncLugar").value = evento.lugar || "";
    document.getElementById("editarFuncImagen").value = evento.imagen || "";

    const previewFunc = document.getElementById("editarFuncImagenPreview");
    if(previewFunc){
        if(evento.imagen){ previewFunc.src = evento.imagen; previewFunc.style.display = "block"; }
        else { previewFunc.removeAttribute("src"); previewFunc.style.display = "none"; }
    }

    document.getElementById("editarFecha").value =
        funcion.fecha;

    document.getElementById("editarHora").value =
        funcion.hora;

    document.getElementById("editarGeneralPreventa").value =
        categorias.general?.preventa || 0;

    document.getElementById("editarGeneralPrecio").value =
        categorias.general?.precio || 0;

    document.getElementById("editarGeneralBoletos").value =
        categorias.general?.boletos || 0;

    document.getElementById("editarPreferenteActiva").checked =
        Boolean(categorias.preferente?.activa);

    document.getElementById("editarPreferentePreventa").value =
        categorias.preferente?.preventa || 0;

    document.getElementById("editarPreferentePrecio").value =
        categorias.preferente?.precio || 0;

    document.getElementById("editarPreferenteBoletos").value =
        categorias.preferente?.boletos || 0;

    document.getElementById("editarVipActiva").checked =
        Boolean(categorias.vip?.activa);

    document.getElementById("editarVipPreventa").value =
        categorias.vip?.preventa || 0;

    document.getElementById("editarVipPrecio").value =
        categorias.vip?.precio || 0;

    document.getElementById("editarVipBoletos").value =
        categorias.vip?.boletos || 0;

    document.body.classList.add("modal-abierto");

    document
        .getElementById("modalEditarFuncion")
        .classList
        .remove("oculto");
}


function cerrarEditarFuncion(){

    document
        .getElementById("modalEditarFuncion")
        .classList
        .add("oculto");

    document.body.classList.remove("modal-abierto");
}


async function guardarEdicionFuncion(boton){

    iniciarCarga(boton, "Guardando...");

    const eventoId =
        document.getElementById("editarEventoId").value;

    const funcionId =
        document.getElementById("editarFuncionId").value;

    const categorias = {
        general: {
            preventa: Number(document.getElementById("editarGeneralPreventa").value),
            precio: Number(document.getElementById("editarGeneralPrecio").value),
            boletos: Number(document.getElementById("editarGeneralBoletos").value)
        },

        preferente: {
            activa: document.getElementById("editarPreferenteActiva").checked,
            preventa: Number(document.getElementById("editarPreferentePreventa").value),
            precio: Number(document.getElementById("editarPreferentePrecio").value),
            boletos: Number(document.getElementById("editarPreferenteBoletos").value)
        },

        vip: {
            activa: document.getElementById("editarVipActiva").checked,
            preventa: Number(document.getElementById("editarVipPreventa").value),
            precio: Number(document.getElementById("editarVipPrecio").value),
            boletos: Number(document.getElementById("editarVipBoletos").value)
        }
    };

    const boletosTotales =
        categorias.general.boletos +
        (categorias.preferente.activa ? categorias.preferente.boletos : 0) +
        (categorias.vip.activa ? categorias.vip.boletos : 0);

    const datos = {
        nombre: document.getElementById("editarFuncNombre").value.trim(),
        lugar: document.getElementById("editarFuncLugar").value.trim(),
        imagen: document.getElementById("editarFuncImagen").value.trim(),
        fecha: document.getElementById("editarFecha").value,
        hora: document.getElementById("editarHora").value,
        categorias,
        precio: categorias.general.precio,
        boletosDisponibles: boletosTotales
    };

    const respuesta = await fetch(
        `${API_URL}/api/eventos/${eventoId}/funciones/${funcionId}`,
        {
            method: "PUT",
            headers: {
                "Content-Type":"application/json"
            },
            body: JSON.stringify(datos)
        }
    );

    const resultado =
        await respuesta.json();

    mostrarToast(resultado.mensaje, "success");

    cerrarEditarFuncion();

    cargarEventos();

    terminarCarga(boton);
}