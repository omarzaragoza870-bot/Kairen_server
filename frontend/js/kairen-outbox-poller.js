/* ============================================================
   KAIREN — OUTBOX POLLER (para tu bot de Baileys)
   ------------------------------------------------------------
   Qué hace:
   - Cada X segundos revisa la cola de mensajes pendientes en Kairen.
   - Envía cada uno por WhatsApp (Baileys) con un LAPSO de 5s entre
     mensaje y mensaje (anti-spam).
   - Marca cada mensaje como "enviado" o "error" en Kairen.

   Cómo usarlo:
   1) Copia este archivo dentro de tu proyecto del bot.
   2) Configura las variables de entorno en el bot:
        KAIREN_URL   = https://TU-APP.up.railway.app   (URL de Kairen)
        OUTBOX_TOKEN = un-secreto-largo                 (el MISMO que pongas en Kairen)
   3) En tu bot, cuando la conexión ya esté lista, llama:
        const { iniciarOutboxKairen } = require("./kairen-outbox-poller");
        iniciarOutboxKairen(sock);   // sock = tu socket de makeWASocket

   Nota: requiere Node 18+ (por fetch global). Si usas Node < 18,
   instala node-fetch y descomenta la línea de abajo.
============================================================ */

// const fetch = (...a) => import("node-fetch").then(({default: f}) => f(...a));

const KAIREN_URL   = process.env.KAIREN_URL   || "https://TU-APP.up.railway.app";
const OUTBOX_TOKEN = process.env.OUTBOX_TOKEN || "";
const INTERVALO_MS = 15000; // cada cuánto revisa la cola (15s)
const LAPSO_MS     = 5000;  // espera entre mensaje y mensaje (5s anti-spam)

function normalizarJid(tel){
  let n = String(tel).replace(/\D/g, "");
  if(n.length === 10){ n = "52" + n; } // México: agrega 52 si son 10 dígitos
  return n + "@s.whatsapp.net";
}

function esperar(ms){
  return new Promise(res => setTimeout(res, ms));
}

async function marcar(id, estado, error){
  try{
    await fetch(`${KAIREN_URL}/api/outbox/${id}/marcar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-outbox-token": OUTBOX_TOKEN
      },
      body: JSON.stringify({ estado, error: error || "" })
    });
  }catch(e){
    console.error("Kairen outbox: no se pudo marcar", id, e.message);
  }
}

async function procesarCola(sock){
  let pendientes = [];
  try{
    const r = await fetch(`${KAIREN_URL}/api/outbox/pendientes`, {
      headers: { "x-outbox-token": OUTBOX_TOKEN }
    });
    if(!r.ok){ return; }
    pendientes = await r.json();
  }catch(e){
    // Sin conexión a Kairen: se reintenta en el próximo ciclo.
    return;
  }

  if(!Array.isArray(pendientes) || !pendientes.length){ return; }

  for(const msg of pendientes){
    try{
      await sock.sendMessage(normalizarJid(msg.telefono), { text: msg.texto });
      await marcar(msg.id, "enviado");
      console.log("📨 Enviado a", msg.telefono);
    }catch(e){
      await marcar(msg.id, "error", String(e.message || e).slice(0, 200));
      console.error("📨 Error enviando a", msg.telefono, e.message);
    }
    await esperar(LAPSO_MS); // 5 segundos entre cada mensaje
  }
}

function iniciarOutboxKairen(sock){
  setInterval(() => procesarCola(sock), INTERVALO_MS);
  console.log(
    `📨 Outbox Kairen activo — revisa cada ${INTERVALO_MS/1000}s, ` +
    `lapso de ${LAPSO_MS/1000}s entre mensajes.`
  );
}

module.exports = { iniciarOutboxKairen };
