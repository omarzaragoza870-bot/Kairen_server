/* =============================
   ARRANQUE PRINCIPAL
   ============================= */

async function iniciarApp(){
    await cargarConfiguracion();
    await cargarCatalogoTipos();
    await cargarEventos();
    mostrarSeccion("hoy");
}

iniciarApp();