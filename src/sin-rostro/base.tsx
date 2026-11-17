// Videos sin rostro · base común de todos los estilos.
// Un video sin rostro se arma con: la voz (audio), sus palabras con tiempo (captions de Whisper) y un PLAN de escenas
// (`plan.json`) que dice qué se ve en cada tramo. Todo es función del fotograma: vista previa y render dan lo mismo.
import React, { createContext, useContext } from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

// ───────────────────────── tipos del plan ─────────────────────────

export type Caption = { readonly text: string; readonly startMs: number; readonly endMs: number };

export type Pose = "normal" | "senala" | "piensa" | "celebra" | "sorprendido" | "explica" | "cansado";

/** el personaje dibujado (sin cara real): colores y rasgos, o PNG propios por pose (avatar generado con IA) */
export type Personaje = {
  readonly piel?: string;
  readonly pelo?: string;
  readonly ropa?: string;
  readonly peinado?: "corto" | "largo" | "rapado" | "mono" | "gorro";
  readonly lentes?: boolean;
  readonly barba?: boolean;
  /** rasgos de mujer: pestañas, aretes y labios con color */
  readonly mujer?: boolean;
  /** PNG recortados (fondo transparente) por pose, en public/: reemplazan al dibujo */
  readonly poses?: Partial<Record<Pose, string>>;
};

export type Marca = {
  readonly acento?: string;
  readonly nombre?: string;
  readonly usuario?: string;
  readonly personaje?: Personaje;
};

export type Escena = { readonly desde: number; readonly hasta: number; readonly tipo: string } & Record<string, unknown>;

/** id del estilo: "historia-plana", "avatar-interfaz", "lista-recortes" o cualquiera de `estilos/grupo-a.tsx` */
export type EstiloId = string;

export type Plan = {
  readonly estilo: EstiloId;
  readonly formato?: "9:16" | "4:5" | "1:1";
  readonly fps: number;
  /** segundos totales del video (la voz + un respiro para el cierre) */
  readonly duracion: number;
  /** ruta en public/ de la voz */
  readonly voz: string;
  /** música de fondo a −10 dB fijos (regla del estudio) */
  readonly musica?: { readonly src: string; readonly desde?: number; readonly db?: number };
  readonly captions: readonly Caption[];
  /** palabra mal transcrita → palabra correcta («Clot» → «Claude») */
  readonly correcciones?: Readonly<Record<string, string>>;
  /** palabras que se destacan en los subtítulos (en minúscula, sin signos) */
  readonly claves?: readonly string[];
  /** false = sin subtítulos (el estilo los dibuja dentro de sus escenas) */
  readonly subtitulos?: boolean;
  readonly marca?: Marca;
  /** titulares del cintillo del noticiero (salen de lo que se dice en el video) */
  readonly cintillo?: readonly string[];
  readonly escenas: readonly Escena[];
};

export const LIENZO = { "9:16": { ancho: 1080, alto: 1920 }, "4:5": { ancho: 1080, alto: 1350 }, "1:1": { ancho: 1080, alto: 1080 } } as const;

// ───────────────────────── contexto ─────────────────────────

export const PlanCtx = createContext<Plan | null>(null);
export const usePlan = (): Plan => {
  const p = useContext(PlanCtx);
  if (!p) throw new Error("usePlan fuera de <SinRostro>");
  return p;
};

// ───────────────────────── tiempo y movimiento ─────────────────────────

export const entra = Easing.bezier(0.16, 1, 0.3, 1);
export const rebota = Easing.bezier(0.34, 1.56, 0.64, 1);

/** 0→1 entre los fotogramas a y b, con curva de entrada */
export const tramo = (f: number, a: number, b: number, curva = entra) =>
  interpolate(f, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: curva });

/** resorte que empieza en `desde` (fotograma local) */
export const useResorte = (desde = 0, rigidez = 140, amortiguacion = 14) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: f - desde, fps, config: { stiffness: rigidez, damping: amortiguacion } });
};

/** número estable entre 0 y 1 para una semilla (sin Math.random: el render tiene que ser repetible) */
export const azar = (s: number) => {
  const x = Math.sin(s * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** contorno de papel rasgado en porcentajes (para `clip-path`): bordes irregulares estables por `semilla` */
export const rasgadoPct = (semilla = 1, ampX = 1.2, ampY = 7): string => {
  const pts: string[] = [];
  const r = (i: number, k: number) => azar(semilla * 97.13 + k * 31.7 + i * 1.618) * 0.45 + azar(semilla * 13.37 + k * 7.1 + Math.floor(i / 3) * 4.2) * 0.55;
  const n = 40, m = 8;
  for (let i = 0; i <= n; i++) pts.push(`${((i / n) * 100).toFixed(2)}% ${(r(i, 1) * ampY).toFixed(2)}%`);
  for (let i = 1; i <= m; i++) pts.push(`${(100 - r(i, 2) * ampX).toFixed(2)}% ${((i / m) * 100).toFixed(2)}%`);
  for (let i = n - 1; i >= 0; i--) pts.push(`${((i / n) * 100).toFixed(2)}% ${(100 - r(i, 3) * ampY).toFixed(2)}%`);
  for (let i = m - 1; i >= 1; i--) pts.push(`${(r(i, 4) * ampX).toFixed(2)}% ${((i / m) * 100).toFixed(2)}%`);
  return `polygon(${pts.join(", ")})`;
};

// ───────────────────────── palabras y frases ─────────────────────────

/** Whisper marca las palabras ~100–200 ms tarde: se adelantan para que el texto no llegue después de la voz */
export const ADELANTO_MS = 150;

export type Palabra = { readonly texto: string; readonly ini: number; readonly fin: number; readonly limpia: string };
export type Frase = { readonly palabras: readonly Palabra[]; readonly ini: number; readonly fin: number; readonly texto: string };

export const limpiar = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9ñ]/g, "");

/** palabras con tiempos en segundos, corregidas y adelantadas */
export const palabras = (caps: readonly Caption[], correcciones: Readonly<Record<string, string>> = {}): Palabra[] =>
  caps
    .map((c) => {
      const crudo = c.text.trim();
      const base = crudo.replace(/[.,;:!?¡¿]+$/g, "");
      const signo = crudo.slice(base.length);
      const texto = (correcciones[base] ?? base) + signo;
      return { texto, ini: Math.max(0, (c.startMs - ADELANTO_MS) / 1000), fin: (c.endMs - ADELANTO_MS) / 1000, limpia: limpiar(texto) };
    })
    .filter((p) => p.texto.length > 0);

/**
 * Frases para subtítulos: se corta en cada signo de puntuación, en pausas de más de 0,4 s y, si la frase es larga,
 * cada `max` palabras (una frase por línea, regla del estudio). Cada frase se va cuando termina la voz.
 */
export const frases = (ps: readonly Palabra[], max = 6): Frase[] => {
  const out: Frase[] = [];
  let actual: Palabra[] = [];
  const cerrar = () => {
    if (!actual.length) return;
    out.push({ palabras: actual, ini: actual[0].ini, fin: actual[actual.length - 1].fin, texto: actual.map((p) => p.texto).join(" ") });
    actual = [];
  };
  ps.forEach((p, i) => {
    const sig = ps[i + 1];
    actual.push(p);
    const signo = /[.,;:!?]$/.test(p.texto);
    const pausa = sig ? sig.ini - p.fin > 0.4 : true;
    if (signo || pausa || actual.length >= max) cerrar();
  });
  cerrar();
  return out;
};

/** la frase que suena en el segundo t (o null): sale 0,15 s después de su última palabra, nunca encima de la siguiente */
export const fraseEn = (fs: readonly Frase[], t: number): Frase | null => {
  for (let i = 0; i < fs.length; i++) {
    const f = fs[i];
    const sale = Math.min(f.fin + 0.15, fs[i + 1]?.ini ?? Infinity);
    if (t >= f.ini && t < sale) return f;
  }
  return null;
};

/** ¿la palabra está en la lista de claves del plan? */
export const esClave = (p: Palabra, claves: readonly string[] = []) => claves.some((c) => limpiar(c) === p.limpia);

// ───────────────────────── escenas ─────────────────────────

/** escena del plan como fotogramas locales */
export const useEscena = (e: Escena) => {
  const { fps } = useVideoConfig();
  const f = useCurrentFrame();
  return { f, fps, dur: Math.round((e.hasta - e.desde) * fps), s: (seg: number) => Math.round(seg * fps) };
};

/** segundo (absoluto, del plan) → fotograma local de la escena: para que algo entre justo con una palabra */
export const enEscena = (e: Escena, segundo: number, fps: number) => Math.round((segundo - e.desde) * fps);

/** la primera vez que suena una palabra (o parte de una frase) a partir del segundo `desde`: para sincronizar entradas */
export const cuandoDice = (ps: readonly Palabra[], palabra: string, desde = 0): number | null => {
  const objetivo = limpiar(palabra);
  const p = ps.find((x) => x.ini >= desde - 0.05 && x.limpia === objetivo);
  return p ? p.ini : null;
};

/** entrada y salida de cada escena: aparece con un leve acercamiento y desenfoque, y se va igual (sin fundidos largos) */
export const Transicion: React.FC<{ dur: number; children: React.ReactNode; entrada?: number; salida?: number }> = ({ dur, children, entrada = 9, salida = 6 }) => {
  const f = useCurrentFrame();
  const a = tramo(f, 0, entrada);
  const b = tramo(f, dur - salida, dur, Easing.in(Easing.cubic));
  const escala = 0.965 + a * 0.035 + b * 0.03;
  const blur = (1 - a) * 10 + b * 10;
  return (
    <div style={{ position: "absolute", inset: 0, transform: `scale(${escala})`, filter: blur > 0.2 ? `blur(${blur}px)` : undefined, opacity: Math.min(a * 1.4, 1 - b) }}>
      {children}
    </div>
  );
};

// ───────────────────────── micro app ─────────────────────────
import { staticFile as archivoPublico } from "remotion";
/** ruta de un medio: en la micro app la voz llega como blob: y los clips de stock como https:; el resto vive en public/ */
export const ruta = (s: string) => (/^(blob:|data:|https?:)/.test(s) ? s : archivoPublico(s));
