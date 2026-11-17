// Demo sin voz y sin gastar créditos: un guion fijo con tiempos inventados, para ver el motor y los estilos.
import type { Caption, Plan } from "./sin-rostro/base";

export const GUION_DEMO =
  "¿Sabías que tu cerebro decide antes que tú? Los científicos lo midieron. Primero se activa la neurona, después llega la intención y al final el movimiento. La diferencia es de 300 milisegundos. Casi nadie lo sabe. No es magia, es biología. Sígueme para más curiosidades.";

/** reparte las palabras del guion a ritmo de locución (para la demo y como plan B si Fish no da tiempos) */
export const repartir = (guion: string, duracion: number): Caption[] => {
  const palabras = guion.trim().split(/\s+/).filter(Boolean);
  // cada palabra pesa por sus letras; los signos suman una pausa
  const peso = (p: string) => p.replace(/[^\p{L}\p{N}]/gu, "").length + 2 + (/[.!?]$/.test(p) ? 5 : /[,;:]$/.test(p) ? 2 : 0);
  const total = palabras.reduce((n, p) => n + peso(p), 0);
  const util = Math.max(0.5, duracion - 0.3);
  let t = 0.1;
  return palabras.map((p) => {
    const dur = (util * peso(p)) / total;
    const habla = dur * (/[.!?,;:]$/.test(p) ? 0.6 : 0.92);
    const c = { text: p, startMs: Math.round(t * 1000), endMs: Math.round((t + habla) * 1000) };
    t += dur;
    return c;
  });
};

const DURACION = 21;
const caps = repartir(GUION_DEMO, DURACION);
/** segundo en que empieza la primera palabra que contiene `trozo` */
const en = (trozo: string) => (caps.find((c) => c.text.toLowerCase().includes(trozo))?.startMs ?? 0) / 1000;

export const planDemo = (estilo: string, acento?: string): Plan => ({
  estilo,
  fps: 30,
  duracion: DURACION,
  voz: "",
  captions: caps,
  claves: ["cerebro", "neurona", "intención", "movimiento", "300", "biología", "curiosidades"],
  marca: acento ? { acento } : undefined,
  cintillo: ["Tu cerebro decide antes que tú", "300 milisegundos de diferencia", "No es magia, es biología"],
  escenas: [
    { desde: 0, hasta: en("científicos"), tipo: "titular", sinSubtitulos: true, etiqueta: "¿SABÍAS QUE?", lineas: [{ texto: "Tu cerebro", en: en("cerebro") - 0.3 }, { texto: "decide", en: en("decide"), clave: true }, { texto: "antes que tú", en: en("antes") }] },
    { desde: en("científicos"), hasta: en("primero"), tipo: "dibujo", icono: "Microscope", en: en("científicos"), titulo: "Lo midieron", tituloEn: en("midieron"), etiqueta: "LA CIENCIA" },
    { desde: en("primero"), hasta: en("diferencia") - 0.4, tipo: "pasos", etiqueta: "EL ORDEN", pasos: [{ texto: "Neurona", en: en("neurona") }, { texto: "Intención", en: en("intención") }, { texto: "Movimiento", en: en("movimiento") }] },
    { desde: en("diferencia") - 0.4, hasta: en("casi"), tipo: "cifra", valor: 300, sufijo: " ms", etiqueta: "de diferencia", en: en("300") },
    { desde: en("casi"), hasta: en("sígueme"), tipo: "comparacion", etiqueta: "LA VERDAD", izq: { titulo: "Magia", icono: "Wand" }, der: { titulo: "Biología", icono: "Brain" }, en: en("magia"), derEn: en("biología"), tachar: "izq", tacharEn: en("biología") },
    { desde: en("sígueme"), hasta: DURACION, tipo: "cierre", titulo: "Sígueme", en: en("sígueme"), etiqueta: "MÁS CURIOSIDADES" },
  ],
});
