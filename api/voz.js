// Guion → voz con Fish Audio. Devuelve el mp3 (base64) y, si Fish los da, los tiempos de cada palabra.
import { entrada, responder } from "./_comun.js";

const FISH = "https://api.fish.audio";
const MAX_CARACTERES = 1800;

/** acepta el id suelto o el enlace completo (https://fish.audio/m/<id>) */
export const idDeVoz = (v) => {
  const m = String(v || "").match(/[0-9a-f]{32}/i);
  return m ? m[0].toLowerCase() : null;
};

/** segmentos de Fish → palabras con tiempo en ms. Si un segmento trae varias palabras, reparte su tiempo por letras. */
export const aCaptions = (segmentos) => {
  const caps = [];
  for (const s of segmentos) {
    const palabras = String(s.text || "").trim().split(/\s+/).filter(Boolean);
    if (!palabras.length || !(s.end > s.start)) continue;
    const total = palabras.reduce((n, p) => n + p.length, 0);
    let t = s.start;
    for (const p of palabras) {
      const dur = ((s.end - s.start) * p.length) / total;
      caps.push({ text: p, startMs: Math.round(t * 1000), endMs: Math.round((t + dur) * 1000) });
      t += dur;
    }
  }
  return caps;
};

/** lee la respuesta SSE de /v1/tts/stream/with-timestamp: audio en trozos + alineación por bloque de texto */
export const leerFlujo = (texto) => {
  const audio = [];
  const bloques = new Map(); // chunk_seq → { offset, segmentos } (cada evento trae la foto MÁS RECIENTE: se reemplaza)
  for (const linea of texto.split(/\r?\n/)) {
    if (!linea.startsWith("data:")) continue;
    const crudo = linea.slice(5).trim();
    if (!crudo || crudo === "[DONE]") continue;
    let ev;
    try { ev = JSON.parse(crudo); } catch { continue; }
    if (ev.audio_base64) audio.push(Buffer.from(ev.audio_base64, "base64"));
    if (ev.alignment?.segments && typeof ev.chunk_seq === "number") {
      bloques.set(ev.chunk_seq, { offset: ev.chunk_audio_offset_sec || 0, segmentos: ev.alignment.segments });
    }
  }
  const segmentos = [...bloques.entries()].sort((a, b) => a[0] - b[0])
    .flatMap(([, b]) => b.segmentos.map((s) => ({ text: s.text, start: s.start + b.offset, end: s.end + b.offset })));
  return { audio: Buffer.concat(audio), captions: aCaptions(segmentos) };
};

export default async function handler(req, res) {
  const cuerpo = await entrada(req, res);
  if (!cuerpo) return;
  const llave = process.env.FISH_API_KEY;
  if (!llave) return responder(res, 500, { error: "Falta FISH_API_KEY en las variables de entorno de Vercel" });

  const texto = String(cuerpo.texto || "").trim();
  const voz = idDeVoz(cuerpo.voz);
  if (!texto) return responder(res, 400, { error: "Falta el guion" });
  if (texto.length > MAX_CARACTERES) return responder(res, 400, { error: `El guion pasa de ${MAX_CARACTERES} caracteres (tiene ${texto.length})` });
  if (!voz) return responder(res, 400, { error: "El id de voz de Fish no es válido" });

  const encabezados = { authorization: `Bearer ${llave}`, "content-type": "application/json", model: process.env.FISH_MODEL || "s2-pro" };
  const pedido = JSON.stringify({ text: texto, reference_id: voz, format: "mp3", mp3_bitrate: 128, latency: "normal" });

  try {
    // 1) con tiempos por palabra
    const r = await fetch(`${FISH}/v1/tts/stream/with-timestamp`, { method: "POST", headers: encabezados, body: pedido });
    if (r.ok) {
      const { audio, captions } = leerFlujo(await r.text());
      if (audio.length > 0) return responder(res, 200, { audio: audio.toString("base64"), mime: "audio/mpeg", captions, tiempos: captions.length ? "fish" : "ninguno" });
    } else if (r.status === 401 || r.status === 402) {
      return responder(res, 502, { error: r.status === 401 ? "Fish rechazó la llave (401)" : "Fish: sin saldo de API (402)" });
    }
    // 2) plan B: solo el audio (la página reparte los tiempos de las palabras)
    const b = await fetch(`${FISH}/v1/tts`, { method: "POST", headers: encabezados, body: pedido });
    if (!b.ok) return responder(res, 502, { error: `Fish respondió ${b.status}`, detalle: (await b.text()).slice(0, 300) });
    const audio = Buffer.from(await b.arrayBuffer());
    return responder(res, 200, { audio: audio.toString("base64"), mime: "audio/mpeg", captions: [], tiempos: "ninguno" });
  } catch (e) {
    return responder(res, 502, { error: "No se pudo hablar con Fish Audio", detalle: String(e?.message || e).slice(0, 300) });
  }
}
