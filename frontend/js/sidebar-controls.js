function toggleBotDesdeSidebar(estado){

    // Mantener sincronizados los demas switches visualmente.
    const ids = ["botSwitch"];

    ids.forEach(id => {
        const el = document.getElementById(id);
        if(el){ el.checked = estado; }
    });

    // La funcion real del backend es cambiarEstadoBot() (hace toggle).
    // Despues recarga configuracion y re-sincroniza todos los switches.
    if(typeof cambiarEstadoBot === "function"){
        cambiarEstadoBot();
        return;
    }
}

document.addEventListener("DOMContentLoaded", function(){
    const sidebarSwitch = document.getElementById("botSwitchSidebar");
    const mainSwitch = document.getElementById("botSwitch");
    if(sidebarSwitch && mainSwitch){
        sidebarSwitch.checked = mainSwitch.checked;
    }
});