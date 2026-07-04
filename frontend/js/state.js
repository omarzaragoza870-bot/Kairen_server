/* ============================================================

   MÓDULO: ESTADO GLOBAL

   RESPONSABILIDAD:
   - Variables compartidas por módulos.
   - URL base del backend.
   - Datos en memoria.

============================================================ */

const API_URL = "";

let descuentosTemporales = [];
let eventosActuales = [];

// Vista actual del módulo Eventos Pro: "tarjetas" o "tabla".
let vistaEventosActual = "tarjetas";
