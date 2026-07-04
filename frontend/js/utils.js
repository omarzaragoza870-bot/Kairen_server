/* =============================
   UTILIDADES
   ============================= */


function escaparTexto(texto){
    return String(texto || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function iniciarCarga(boton, texto = "Guardando..."){

    boton.disabled = true;
    boton.dataset.textoOriginal = boton.textContent;
    boton.textContent = texto;
}


function terminarCarga(boton){

    boton.disabled = false;
    boton.textContent = boton.dataset.textoOriginal;
}