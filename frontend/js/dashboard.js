/* ============================================================

   MÓDULO: DASHBOARD EJECUTIVO

   RESPONSABILIDAD:
   - Construir widgets del Dashboard.
   - Mostrar próximos eventos.
   - Calcular disponibilidad por categoría.
   - Mostrar promociones activas.
   - Mostrar actividad reciente automática.

============================================================ */

function actualizarDashboardEjecutivo(eventos){

    pintarProximosEventos(eventos);
    pintarDisponibilidadDashboard(eventos);
    pintarPromocionesDashboard(eventos);
    pintarActividadDashboard(eventos);
}

function pintarProximosEventos(eventos){

    const contenedor =
        document.getElementById("listaProximosEventos");

    if(!contenedor){
        return;
    }

    const funciones =
        obtenerFuncionesOrdenadas(eventos)
            .filter(item => item.funcion.activa !== false)
            .slice(0, 5);

    if(funciones.length === 0){
        contenedor.innerHTML = `
            <div class="empty-state">
                No hay próximas funciones activas.
            </div>
        `;
        return;
    }

    contenedor.innerHTML = "";

    funciones.forEach(item => {

        const boletos =
            calcularBoletosFuncion(item.funcion);

        contenedor.innerHTML += `
            <div class="proximo-evento-card">
                <div>
                    <h3>🎤 ${escaparTexto(item.evento.nombre)}</h3>

                    <p class="proximo-evento-meta">
                        <span>📍 ${escaparTexto(item.evento.lugar)}</span>
                        <span>📅 ${formatearFecha(item.funcion.fecha)}</span>
                        <span>⏰ ${escaparTexto(item.funcion.hora)}</span>
                    </p>
                </div>

                <div class="proximo-evento-boletos">
                    ${boletos}
                    <br>
                    <small>boletos</small>
                </div>
            </div>
        `;
    });
}

function pintarDisponibilidadDashboard(eventos){

    const contenedor =
        document.getElementById("dashboardDisponibilidad");

    if(!contenedor){
        return;
    }

    const disponibilidad = {
        general: 0,
        preferente: 0,
        vip: 0
    };

    eventos.forEach(evento => {

        evento.funciones.forEach(funcion => {

            const categorias =
                obtenerCategorias(funcion);

            disponibilidad.general +=
                Number(categorias.general?.boletos || 0);

            if(categorias.preferente?.activa){
                disponibilidad.preferente +=
                    Number(categorias.preferente?.boletos || 0);
            }

            if(categorias.vip?.activa){
                disponibilidad.vip +=
                    Number(categorias.vip?.boletos || 0);
            }
        });
    });

    const total =
        disponibilidad.general +
        disponibilidad.preferente +
        disponibilidad.vip;

    contenedor.innerHTML = `
        ${crearBarraDisponibilidad("🎫 General", disponibilidad.general, total)}
        ${crearBarraDisponibilidad("🎟️ Preferente", disponibilidad.preferente, total)}
        ${crearBarraDisponibilidad("⭐ VIP", disponibilidad.vip, total)}
    `;
}

function pintarPromocionesDashboard(eventos){

    const contenedor =
        document.getElementById("dashboardPromociones");

    if(!contenedor){
        return;
    }

    let totalDescuentos = 0;
    let funcionesConPromos = 0;

    eventos.forEach(evento => {

        evento.funciones.forEach(funcion => {

            const descuentos =
                funcion.descuentos || [];

            if(descuentos.length > 0){
                funcionesConPromos++;
                totalDescuentos += descuentos.length;
            }
        });
    });

    contenedor.innerHTML = `
        <div class="promo-resumen">
            <span class="promo-numero">${totalDescuentos}</span>
            <span class="promo-label">descuentos configurados</span>
        </div>

        <div class="promo-resumen">
            <span class="promo-numero">${funcionesConPromos}</span>
            <span class="promo-label">funciones con promociones</span>
        </div>
    `;
}

function pintarActividadDashboard(eventos){

    const contenedor =
        document.getElementById("dashboardActividad");

    if(!contenedor){
        return;
    }

    const totalEventos =
        eventos.length;

    const totalFunciones =
        eventos.reduce((total, evento) => {
            return total + evento.funciones.length;
        }, 0);

    const eventosActivos =
        eventos.filter(evento => evento.activo !== false).length;

    contenedor.innerHTML = `
        ${crearActividad("🎟️", "Eventos cargados", `${totalEventos} eventos en cartelera`)}
        ${crearActividad("🕒", "Funciones programadas", `${totalFunciones} funciones registradas`)}
        ${crearActividad("🟢", "Eventos activos", `${eventosActivos} eventos disponibles`)}
    `;
}

function obtenerFuncionesOrdenadas(eventos){

    const funciones = [];

    eventos.forEach(evento => {

        evento.funciones.forEach(funcion => {

            funciones.push({
                evento,
                funcion,
                fechaOrden:
                    new Date(`${funcion.fecha}T${funcion.hora || "00:00"}`)
            });
        });
    });

    return funciones.sort((a, b) => {
        return a.fechaOrden - b.fechaOrden;
    });
}

function crearBarraDisponibilidad(
    titulo,
    valor,
    total
){

    const porcentaje =
        total > 0
        ? Math.round((valor / total) * 100)
        : 0;

    return `
        <div class="disponibilidad-item">
            <div class="disponibilidad-header">
                <span>${titulo}</span>
                <strong>${valor}</strong>
            </div>

            <div class="barra-dashboard">
                <span style="width:${porcentaje}%"></span>
            </div>
        </div>
    `;
}

function crearActividad(
    icono,
    titulo,
    texto
){

    return `
        <div class="actividad-item">
            <div class="actividad-icono">
                ${icono}
            </div>

            <div>
                <strong>${titulo}</strong>
                <span>${texto}</span>
            </div>
        </div>
    `;
}

function formatearFecha(fechaISO){

    if(!fechaISO){
        return "Sin fecha";
    }

    const fecha =
        new Date(`${fechaISO}T00:00:00`);

    return fecha.toLocaleDateString("es-MX", {
        day:"2-digit",
        month:"short",
        year:"numeric"
    });
}
