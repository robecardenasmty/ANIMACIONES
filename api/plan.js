// Guion + palabras con tiempo → plan de escenas del motor (lo decide Claude). La llave de Anthropic vive solo aquí.
import { entrada, responder } from "./_comun.js";

const COMUNES = `ESCENAS COMUNES (sirven en todos los estilos):
- titular: 1 a 3 líneas enormes. Campos: lineas:[{texto, en, clave?}] (1-3 palabras por línea). Lleva sinSubtitulos:true.
- dibujo: un ícono grande y un título. Campos: icono, en, titulo?, tituloEn?
- lista: título y hasta 4 ítems que entran uno por uno. Campos: titulo?, items:[{texto, en, icono?}]
- cifra: número que sube hasta su valor. Campos: valor (número), prefijo?, sufijo?, etiqueta?, en
- comparacion: dos tarjetas lado a lado. Campos: izq:{titulo, icono?}, der:{titulo, icono?}, en, derEn?, tachar?("izq"|"der"), tacharEn?
- pasos: 3-4 pasos numerados unidos por una línea. Campos: pasos:[{texto, en}]
- cierre: frase final grande. Campos: titulo, en`;

const PROPIAS = {
  pizarra: `- corrige: escribe una idea falsa, la borra y escribe la cierta. Campos: falso, verdadero, en, borraEn, escribeEn`,
  "pizarra-blanca": `- mapa: una idea al centro y hasta 4 alrededor unidas con flechas. Campos: nodos:[{texto, icono?, en}] (el primero es el centro)`,
  graficos: `- barras: barras que crecen. Campos: titulo?, datos:[{etiqueta, valor, en?}]
- linea: línea que se dibuja. Campos: titulo?, puntos:[números], etiqueta?
- barras3d: barras isométricas. Campos: titulo?, datos:[{etiqueta, valor, en?}]`,
  "explicador-3d": `- objeto3d: objeto 3D que gira bajo un foco. Campos: forma ("panel"|"cubo"|"esfera"|"chip"|"celular"|"moneda"), titulo?, tituloEn?, nota?, en`,
  diagrama: `- ecuacion: cajas que entran (palabras, números, + − ×) y un resultado. Campos: titulo?, cajas:[{texto, en}], resultado?, resultadoEn?`,
  "cartoon-explicador": `- torta: gráfico de torta que se llena. Campos: titulo?, porcentaje, etiqueta?, en`,
  domino: `- domino: fichas que caen en cadena y revelan una frase. Campos: texto?, en`,
  atomo: `- atomo: núcleo con electrones en órbita. Campos: nucleo?, etiqueta?, orbitas?(1-4), en`,
  pictogramas: `- proporcion: figuras humanas, se pintan "resaltados" de "total" («3 de cada 10»). Campos: total, resaltados, etiqueta?, en`,
  "pantalla-en-vivo": `- chat: ventana de chat. Campos: titulo?, mensajes:[{texto, en, yo?}]
- navegador: ventana de navegador con filas. Campos: url, titulo?, filas:[{texto, en, icono?}]`,
  noticiero: `- ultima-hora: placa roja ÚLTIMA HORA con un titular. Campos: texto, en
(En este estilo agrega además "cintillo": 3 a 5 frases cortas que SÍ se dicen.)`,
  "pixel-rpg": `- objeto: «¡Conseguiste X!». Campos: nombre, icono, en`,
  concurso: `- pregunta: pregunta con opciones A/B/C; la correcta se ilumina. Campos: texto, opciones:[...], correcta (índice), en, revelaEn`,
  microjuegos: `- reto: orden gigante con barra de tiempo. Campos: instruccion, icono`,
};

const TIPOS_COMUNES = ["titular", "dibujo", "lista", "cifra", "comparacion", "pasos", "cierre"];
const tiposDe = (estilo) => [...TIPOS_COMUNES, ...(PROPIAS[estilo]?.match(/^- ([a-z0-9-]+):/gm) || []).map((s) => s.slice(2, -1))];

const instrucciones = (estilo) => `Eres el director de animación de una fábrica de reels verticales (9:16) en español de México.
Recibes un guion ya grabado en voz, con el segundo exacto en que suena cada palabra, y devuelves el PLAN DE ESCENAS que un motor de animación va a dibujar en el estilo "${estilo}".

${COMUNES}
${PROPIAS[estilo] ? `\nESCENAS PROPIAS DEL ESTILO "${estilo}" (úsalas donde la voz lo pida, son lo que lo hace especial):\n${PROPIAS[estilo]}` : ""}

REGLAS
1. Una escena por idea, de 2 a 7 segundos. Van seguidas y sin huecos: la primera empieza en 0 y la última termina en la duración total.
2. Todo campo "en" (y derEn, tituloEn, borraEn, etc.) es un segundo ABSOLUTO del audio: el segundo en que se dice la palabra que hace entrar ese elemento. Debe caer dentro de su escena.
3. Nada que la voz no diga: textos, cifras y títulos salen del guion. Textos cortos (1 a 4 palabras).
4. Gancho en los primeros 3 segundos con una escena "titular".
5. Varía: no repitas el mismo tipo de escena dos veces seguidas y usa al menos 4 tipos distintos si el guion lo permite.
6. "icono" es un nombre de ícono de Lucide en PascalCase (ej.: Sparkles, Globe, Clock, Heart, Brain, Rocket, Lightbulb, Coins, BookOpen, Apple, Church, Users, MapPin, TrendingUp, ShieldCheck, Flame, Star, Leaf, Camera, Music).
7. Cada escena puede llevar "etiqueta": 1 a 3 palabras en MAYÚSCULAS.
8. "claves": 6 a 10 palabras del guion (una sola palabra cada una, en minúsculas) que se resaltan en los subtítulos.

Responde SOLO con JSON válido, sin texto antes ni después y sin \`\`\`, con esta forma:
{"claves":["..."],"escenas":[{"desde":0,"hasta":3.2,"tipo":"titular","sinSubtitulos":true,"lineas":[{"texto":"...","en":0.1}]}]}`;

const frasesConTiempo = (captions) => {
  // una línea por frase: «[12.34] palabra(12.34) palabra(12.61) …» para que Claude ubique cada entrada
  const lineas = [];
  let actual = [];
  const cerrar = () => { if (actual.length) lineas.push(actual.map((c) => `${c.text}(${(c.startMs / 1000).toFixed(2)})`).join(" ")); actual = []; };
  captions.forEach((c, i) => {
    actual.push(c);
    const sig = captions[i + 1];
    if (/[.!?]$/.test(c.text) || !sig || sig.startMs - c.endMs > 500 || actual.length >= 14) cerrar();
  });
  cerrar();
  return lineas.join("\n");
};

/** deja el plan utilizable aunque Claude se salga un poco: tipos válidos, escenas seguidas, de 0 a la duración */
export const sanear = (crudo, estilo, duracion) => {
  const validos = new Set(tiposDe(estilo));
  const num = (v, d) => (typeof v === "number" && Number.isFinite(v) ? v : d);
  let escenas = (Array.isArray(crudo?.escenas) ? crudo.escenas : [])
    .filter((e) => e && typeof e === "object" && validos.has(e.tipo))
    .map((e) => ({ ...e, desde: num(e.desde, 0), hasta: num(e.hasta, 0) }))
    .sort((a, b) => a.desde - b.desde);
  if (!escenas.length) throw new Error("Claude no devolvió escenas utilizables");
  escenas[0].desde = 0;
  for (let i = 0; i < escenas.length; i++) {
    const sig = escenas[i + 1];
    escenas[i].hasta = sig ? sig.desde : duracion;
    escenas[i].desde = Math.round(escenas[i].desde * 100) / 100;
    escenas[i].hasta = Math.round(escenas[i].hasta * 100) / 100;
  }
  escenas = escenas.filter((e) => e.hasta - e.desde >= 0.3);
  escenas[0].desde = 0;
  for (let i = 0; i < escenas.length - 1; i++) escenas[i].hasta = escenas[i + 1].desde;
  escenas[escenas.length - 1].hasta = duracion;
  const claves = (Array.isArray(crudo?.claves) ? crudo.claves : []).filter((c) => typeof c === "string").slice(0, 12);
  const cintillo = Array.isArray(crudo?.cintillo) ? crudo.cintillo.filter((c) => typeof c === "string").slice(0, 5) : undefined;
  return { claves, escenas, ...(cintillo?.length ? { cintillo } : {}) };
};

export const extraerJson = (texto) => {
  const limpio = texto.replace(/```(?:json)?/g, "").trim();
  const a = limpio.indexOf("{"), b = limpio.lastIndexOf("}");
  if (a < 0 || b <= a) throw new Error("Claude no devolvió JSON");
  return JSON.parse(limpio.slice(a, b + 1));
};

export default async function handler(req, res) {
  const cuerpo = await entrada(req, res);
  if (!cuerpo) return;
  const llave = process.env.ANTHROPIC_API_KEY;
  if (!llave) return responder(res, 500, { error: "Falta ANTHROPIC_API_KEY en las variables de entorno de Vercel" });

  const estilo = String(cuerpo.estilo || "");
  const duracion = Number(cuerpo.duracion);
  const captions = Array.isArray(cuerpo.captions) ? cuerpo.captions.filter((c) => c && typeof c.text === "string" && Number.isFinite(c.startMs) && Number.isFinite(c.endMs)).slice(0, 600) : [];
  if (!/^[a-z0-9-]{3,40}$/.test(estilo)) return responder(res, 400, { error: "Estilo no válido" });
  if (!(duracion > 2 && duracion < 240)) return responder(res, 400, { error: "Duración no válida" });
  if (captions.length < 3) return responder(res, 400, { error: "Faltan las palabras con tiempo" });

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": llave, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({
        model: process.env.CLAUDE_MODEL || "claude-sonnet-5-5",
        max_tokens: 4000,
        system: instrucciones(estilo),
        messages: [{ role: "user", content: `Duración total: ${duracion.toFixed(2)} s\n\nGuion con el segundo de cada palabra:\n${frasesConTiempo(captions)}` }],
      }),
    });
    if (!r.ok) return responder(res, 502, { error: `Claude respondió ${r.status}`, detalle: (await r.text()).slice(0, 300) });
    const datos = await r.json();
    const texto = (datos.content || []).filter((c) => c.type === "text").map((c) => c.text).join("");
    const plan = sanear(extraerJson(texto), estilo, duracion);
    return responder(res, 200, { ...plan, uso: datos.usage || null });
  } catch (e) {
    return responder(res, 502, { error: "No se pudo armar el plan", detalle: String(e?.message || e).slice(0, 300) });
  }
}
