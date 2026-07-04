/* ============================================================
   MENÚ MÓVIL (DRAWER)

   Funciones:
   1. Abrir / cerrar el drawer.
   2. Bloqueo de scroll del fondo a prueba de iOS y Android.
   3. Ocultar la ☰ al hacer scroll hacia abajo (mostrarla al subir).
   4. Abrir el menú con swipe de izquierda a derecha desde el borde.
   5. Bloqueo de fondo para modales (mismo truco anti-iOS).
============================================================ */

let scrollGuardadoMenu = 0;
let ultimoScroll = 0;
let tickScroll = false;

/* ¿Estamos en vista compacta? (misma regla que el CSS) */
function esVistaCompacta(){
    return window.matchMedia(
        "(max-width: 768px), (max-width: 1024px) and (orientation: portrait)"
    ).matches;
}


/* ============================================================
   ABRIR / CERRAR DRAWER + BLOQUEO DE SCROLL
============================================================ */

function abrirMenuMovil(){

    scrollGuardadoMenu =
        window.scrollY || document.documentElement.scrollTop || 0;

    document.body.classList.add("menu-movil-abierto");

    // Congelar el fondo en su posición (clave para iOS).
    document.body.style.top = `-${scrollGuardadoMenu}px`;
}

function cerrarMenuMovil(){

    if(!document.body.classList.contains("menu-movil-abierto")){
        return;
    }

    document.body.classList.remove("menu-movil-abierto");

    // Liberar el body y restaurar el scroll exacto.
    document.body.style.top = "";
    window.scrollTo(0, scrollGuardadoMenu);

    // Mostrar la ☰ de nuevo al cerrar.
    const boton = document.getElementById("btnMenuMovil");
    if(boton){ boton.classList.remove("btn-menu-oculto"); }

    ultimoScroll = scrollGuardadoMenu;
}


/* ============================================================
   OCULTAR ☰ AL HACER SCROLL
============================================================ */

function manejarScrollBoton(){

    const boton = document.getElementById("btnMenuMovil");
    if(!boton){ return; }

    if(document.body.classList.contains("menu-movil-abierto")){ return; }

    const y = window.scrollY || 0;

    if(y < 10){
        boton.classList.remove("btn-menu-oculto");
    }else if(y > ultimoScroll + 6){
        boton.classList.add("btn-menu-oculto");
    }else if(y < ultimoScroll - 6){
        boton.classList.remove("btn-menu-oculto");
    }

    ultimoScroll = y;
}

window.addEventListener("scroll", function(){
    if(!tickScroll){
        window.requestAnimationFrame(function(){
            manejarScrollBoton();
            tickScroll = false;
        });
        tickScroll = true;
    }
}, { passive: true });


/* ============================================================
   SWIPE DESDE EL BORDE IZQUIERDO -> ABRIR MENÚ
============================================================ */

let xInicioSwipe = 0;
let yInicioSwipe = 0;
let swipeValido = false;

document.addEventListener("touchstart", function(e){
    const t = e.touches[0];
    xInicioSwipe = t.clientX;
    yInicioSwipe = t.clientY;

    swipeValido =
        xInicioSwipe <= 30 &&
        !document.body.classList.contains("menu-movil-abierto") &&
        !document.body.classList.contains("modal-abierto");
}, { passive: true });

document.addEventListener("touchend", function(e){

    if(!swipeValido){ return; }
    swipeValido = false;

    if(!esVistaCompacta()){ return; }

    const t = e.changedTouches[0];
    const dx = t.clientX - xInicioSwipe;
    const dy = t.clientY - yInicioSwipe;

    if(dx > 60 && Math.abs(dy) < 50){
        abrirMenuMovil();
    }
}, { passive: true });


/* ============================================================
   CIERRES DEL DRAWER: tocar un ítem o tecla Escape
============================================================ */

document.addEventListener("click", function(event){
    const itemMenu = event.target.closest(".menu-item");
    if(itemMenu && document.body.classList.contains("menu-movil-abierto")){
        cerrarMenuMovil();
    }
});

document.addEventListener("keydown", function(event){
    if(event.key === "Escape"){
        cerrarMenuMovil();
    }
});


/* ============================================================
   BLOQUEO DE FONDO PARA MODALES (a prueba de iOS)

   Todos los modales agregan/quitan la clase "modal-abierto" en el
   body. Aquí se reacciona a ese cambio para congelar y restaurar el
   scroll, sin tener que tocar cada archivo que abre modales.
============================================================ */

let scrollGuardadoModal = 0;
let modalCongelado = false;

const observadorModal = new MutationObserver(function(){

    const hayModal = document.body.classList.contains("modal-abierto");

    if(hayModal && !modalCongelado){
        scrollGuardadoModal =
            window.scrollY || document.documentElement.scrollTop || 0;
        modalCongelado = true;
        document.body.style.top = `-${scrollGuardadoModal}px`;
    }
    else if(!hayModal && modalCongelado){
        modalCongelado = false;
        document.body.style.top = "";
        window.scrollTo(0, scrollGuardadoModal);
    }
});

observadorModal.observe(document.body, {
    attributes: true,
    attributeFilter: ["class"]
});