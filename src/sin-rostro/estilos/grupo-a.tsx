// Videos sin rostro · los 17 estilos del grupo A. Cada uno es un tema del motor común (`tema.tsx`) con su fondo,
// letra, material y, si hace falta, escenas propias y una capa fija. Diseño y código propios.
import { loadFont as anton } from "@remotion/google-fonts/Anton";
import { loadFont as archivoBlack } from "@remotion/google-fonts/ArchivoBlack";
import { loadFont as bebas } from "@remotion/google-fonts/BebasNeue";
import { loadFont as fredoka } from "@remotion/google-fonts/Fredoka";
import { loadFont as gochi } from "@remotion/google-fonts/GochiHand";
import { loadFont as inter } from "@remotion/google-fonts/Inter";
import { loadFont as interTight } from "@remotion/google-fonts/InterTight";
import { loadFont as kalam } from "@remotion/google-fonts/Kalam";
import { loadFont as lora } from "@remotion/google-fonts/Lora";
import { loadFont as oswald } from "@remotion/google-fonts/Oswald";
import { loadFont as patrick } from "@remotion/google-fonts/PatrickHand";
import { loadFont as press } from "@remotion/google-fonts/PressStart2P";
import { loadFont as spaceGrotesk } from "@remotion/google-fonts/SpaceGrotesk";
import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Escena, azar, enEscena, rebota, tramo, useEscena, usePlan } from "../base";
import { Icono } from "../interfaz";
import { Caja, IconoTema, Tema, TemaVivo, TextoEntra, escenaEn } from "./tema";

const L = { subsets: ["latin"] as ("latin")[] };
const grano = (op = 0.18, id = "g") => (
  <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: op, mixBlendMode: "multiply", pointerEvents: "none" }}>
    <filter id={`grano-${id}`}><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter>
    <rect width="100%" height="100%" filter={`url(#grano-${id})`} />
  </svg>
);

// ═════════════════════════ ENSEÑAR ═════════════════════════

/** Pizarra: verde mate con marco de madera; la tiza escribe y una pasada de borrador limpia lo falso */
const Corrige: React.FC<{ e: Escena; t: TemaVivo }> = ({ e, t }) => {
  const { f, fps } = useEscena(e);
  const en = (s: unknown, d: number) => (typeof s === "number" ? Math.max(0, enEscena(e, s, fps)) : d);
  const borra = en(e.borraEn, 40);
  const p = tramo(f, borra, borra + 12);
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: 300, height: 830, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 40 }}>
      <div style={{ position: "relative" }}>
        <div style={{ opacity: 1 - p * 0.92 }}><TextoEntra texto={e.falso as string} desde={en(e.en, 2)} t={t} tam={110} /></div>
        {p > 0 && p < 1 ? <div style={{ position: "absolute", top: -20, bottom: -20, left: `${p * 110 - 20}%`, width: "26%", background: "rgba(255,255,255,0.12)", filter: "blur(18px)" }} /> : null}
      </div>
      <TextoEntra texto={e.verdadero as string} desde={en(e.escribeEn, borra + 14)} t={t} tam={104} color={t.acento} />
    </div>
  );
};

const PIZARRA: Tema = {
  id: "pizarra", nombre: "Pizarra", material: "tiza", entrada: "escribir", caja: "ninguna", tinta: "#F4F1E6", acento: "#FFB74D", acento2: "#FFF59D",
  sub: { y: 1160, tam: 60, color: "#F4F1E6", clave: "#FFB74D", peso: 400 },
  fuentes: () => ({ titulo: kalam("normal", { weights: ["700"], ...L }).fontFamily, texto: kalam("normal", { weights: ["400"], ...L }).fontFamily }),
  Fondo: () => (
    <div style={{ position: "absolute", inset: 0, background: "#6B4A33" }}>
      <div style={{ position: "absolute", inset: 34, background: "radial-gradient(120% 90% at 50% 40%, #2F4A3D 0%, #22372D 70%, #1C2E26 100%)", boxShadow: "inset 0 0 80px rgba(0,0,0,0.5)" }}>{grano(0.25, "piz")}</div>
      <div style={{ position: "absolute", left: 34, right: 34, bottom: 34, height: 40, background: "#5A3D2A", boxShadow: "0 -6px 12px rgba(0,0,0,0.3)" }} />
      {[0, 1, 2].map((i) => <div key={i} style={{ position: "absolute", bottom: 52, left: 200 + i * 70, width: 54, height: 14, borderRadius: 7, background: ["#F4F1E6", "#FFB74D", "#FFF59D"][i] }} />)}
    </div>
  ),
  extras: { corrige: Corrige },
};

/** Pizarra blanca: marcadores de colores sobre blanco brillante; el «mapa» une ideas con flechas y la cámara viaja */
const Mapa: React.FC<{ e: Escena; t: TemaVivo }> = ({ e, t }) => {
  const { f, fps } = useEscena(e);
  const nodos = (e.nodos as { texto: string; icono?: string; en: number }[]) ?? [];
  const pos = [[540, 760], [270, 520], [810, 520], [270, 1010], [810, 1010]];
  const actual = nodos.filter((n) => f >= enEscena(e, n.en, fps)).length - 1;
  const [cx, cy] = pos[Math.max(0, actual)] ?? pos[0];
  const zoom = 1.12;
  const tx = interpolate(tramo(f, 0, 30), [0, 1], [0, (540 - cx) * 0.15]);
  const ty = (760 - cy) * 0.15;
  return (
    <div style={{ position: "absolute", inset: 0, transform: `translate(${tx}px, ${ty}px) scale(${zoom})`, transformOrigin: "540px 760px" }}>
      <svg width={1080} height={1400} style={{ position: "absolute", inset: 0 }}>
        {nodos.slice(1).map((n, i) => {
          const d = enEscena(e, n.en, fps);
          const p = tramo(f, d - 4, d + 8);
          const [x, y] = pos[i + 1] ?? pos[0];
          return <line key={i} x1={540} y1={760} x2={540 + (x - 540) * p} y2={760 + (y - 760) * p} stroke={["#1E88E5", "#E53935", "#43A047", "#8E24AA"][i % 4]} strokeWidth={7} strokeLinecap="round" style={{ filter: "url(#m-mano)" }} />;
        })}
      </svg>
      {nodos.map((n, i) => {
        const [x, y] = pos[i] ?? pos[0];
        const d = enEscena(e, n.en, fps);
        return (
          <div key={i} style={{ position: "absolute", left: x - 200, top: y - 130, width: 400, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, background: i === 0 || e.sinCajas ? "transparent" : "rgba(255,255,255,0.85)", borderRadius: 30, padding: "10px 0" }}>
            {n.icono ? <IconoTema nombre={n.icono} desde={d} t={{ ...t, tinta: ["#1E88E5", "#E53935", "#43A047", "#8E24AA", "#F57C00"][i % 5] }} tam={160} /> : null}
            <TextoEntra texto={n.texto} desde={d + 4} t={t} tam={i === 0 ? 84 : 64} color={i === 0 ? t.tinta : ["#1E88E5", "#E53935", "#43A047", "#8E24AA", "#F57C00"][i % 5]} />
          </div>
        );
      })}
    </div>
  );
};

const PIZARRA_BLANCA: Tema = {
  id: "pizarra-blanca", nombre: "Pizarra blanca", material: "marcador", entrada: "escribir", caja: "ninguna", tinta: "#1F2A44", acento: "#E53935", acento2: "#1E88E5",
  sub: { y: 1160, tam: 60, color: "#1F2A44", clave: "#1E88E5", peso: 700 },
  fuentes: () => ({ titulo: patrick("normal", { weights: ["400"], ...L }).fontFamily, texto: patrick("normal", { weights: ["400"], ...L }).fontFamily }),
  Fondo: () => (
    <div style={{ position: "absolute", inset: 0, background: "#B9BFC9" }}>
      <div style={{ position: "absolute", inset: 30, borderRadius: 14, background: "linear-gradient(160deg,#FFFFFF 0%,#F4F6F9 60%,#E9EDF2 100%)", boxShadow: "inset 0 0 0 10px #D7DCE3" }}>
        <div style={{ position: "absolute", left: 140, top: 160, width: 380, height: 120, background: "rgba(150,160,180,0.06)", filter: "blur(10px)", transform: "rotate(-8deg)" }} />
        <div style={{ position: "absolute", right: 0, top: 0, width: 420, height: 900, background: "linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.7) 50%, transparent 60%)" }} />
      </div>
    </div>
  ),
  extras: { mapa: Mapa },
};

/** Una línea: un solo trazo negro fino sobre crema; todo se dibuja sin levantar la pluma */
const UNA_LINEA: Tema = {
  id: "una-linea", nombre: "Una línea", material: "linea", entrada: "escribir", caja: "ninguna", tinta: "#1A1A1A", acento: "#D7263D", acento2: "#1A1A1A",
  sub: { y: 1160, tam: 58, color: "#1A1A1A", clave: "#D7263D", peso: 400 },
  fuentes: () => ({ titulo: lora("italic", { weights: ["500"], ...L }).fontFamily, texto: lora("normal", { weights: ["400"], ...L }).fontFamily }),
  Fondo: () => {
    const f = useCurrentFrame();
    const { width } = useVideoConfig();
    return (
      <div style={{ position: "absolute", inset: 0, background: "#F5EFE3" }}>
        {grano(0.12, "lin")}
        <svg width={width} height={1920} style={{ position: "absolute", inset: 0 }}>
          <path d={`M -20 ${1500 + Math.sin(f / 40) * 10} C 200 1420, 380 1580, 560 1500 S 900 1440, 1100 1520`} stroke="#1A1A1A" strokeWidth={2.5} fill="none" />
        </svg>
      </div>
    );
  },
};

/** Libro de crayones: papel de dibujo, todo pintado con crayón de colores y letra infantil */
const CRAYONES: Tema = {
  id: "crayones", nombre: "Libro de crayones", material: "crayon", entrada: "escribir", caja: "ninguna", tinta: "#2B2B2B", acento: "#F2542D", acento2: "#0E9594",
  sub: { y: 1160, tam: 64, color: "#2B2B2B", clave: "#0E9594", peso: 400 },
  fuentes: () => ({ titulo: gochi("normal", { weights: ["400"], ...L }).fontFamily, texto: gochi("normal", { weights: ["400"], ...L }).fontFamily }),
  Fondo: () => (
    <div style={{ position: "absolute", inset: 0, background: "#FFF9EC" }}>
      {grano(0.2, "cra")}
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, filter: "url(#m-crayon)" }}>
        <circle cx={900} cy={180} r={70} fill="none" stroke="#F5B700" strokeWidth={14} />
        {Array.from({ length: 8 }).map((_, i) => <line key={i} x1={900 + Math.cos(i * 0.785) * 95} y1={180 + Math.sin(i * 0.785) * 95} x2={900 + Math.cos(i * 0.785) * 130} y2={180 + Math.sin(i * 0.785) * 130} stroke="#F5B700" strokeWidth={10} strokeLinecap="round" />)}
        <path d="M 0 1560 Q 270 1480 540 1560 T 1080 1550 L 1080 1920 L 0 1920 Z" fill="#7BC67E" opacity={0.75} />
        <path d="M 120 240 q 40 -40 80 0 q 40 -40 80 0" stroke="#5DA9E9" strokeWidth={10} fill="none" strokeLinecap="round" />
      </svg>
    </div>
  ),
};

/** Acuarela: papel de algodón; los colores florecen detrás de cada dibujo; letra serif cursiva */
const ACUARELA: Tema = {
  id: "acuarela", nombre: "Acuarela", material: "acuarela", entrada: "subir", caja: "ninguna", tinta: "#2E3A46", acento: "#4FA3D1", acento2: "#F2A7B5",
  sub: { y: 1160, tam: 60, color: "#2E3A46", clave: "#C2577A", peso: 500 },
  fuentes: () => ({ titulo: lora("italic", { weights: ["600"], ...L }).fontFamily, texto: lora("normal", { weights: ["500"], ...L }).fontFamily }),
  Fondo: () => {
    const f = useCurrentFrame();
    return (
      <div style={{ position: "absolute", inset: 0, background: "#FBF7F0" }}>
        {[["#BFE0F2", 160, 240, 520], ["#F7D4DC", 820, 1500, 600], ["#FCE8B2", 900, 300, 380]].map(([c, x, y, r], i) => (
          <div key={i} style={{ position: "absolute", left: (x as number) - (r as number) / 2, top: (y as number) - (r as number) / 2, width: r as number, height: r as number, borderRadius: "50%", background: c as string, filter: "url(#m-acuarela) blur(8px)", opacity: 0.6, transform: `scale(${1 + Math.sin(f / 70 + i) * 0.03})` }} />
        ))}
        {grano(0.14, "acu")}
      </div>
    );
  },
};

// ═════════════════════════ DATOS Y PRESENTACIONES ═════════════════════════

/** Presentación oscura: negro profundo, letra grande con degradado, tarjetas de vidrio y luz suave detrás */
const PRESENTACION: Tema = {
  id: "presentacion-oscura", nombre: "Presentación oscura", material: "plano", entrada: "subir", caja: "vidrio", tinta: "#F5F5F7", acento: "#7C83FF", acento2: "#3DDCFF",
  sub: { y: 1160, tam: 58, color: "#F5F5F7", clave: "#9AA0FF", peso: 600 },
  fuentes: () => ({ titulo: interTight("normal", { weights: ["800"], ...L }).fontFamily, texto: interTight("normal", { weights: ["600"], ...L }).fontFamily }),
  Fondo: () => {
    const f = useCurrentFrame();
    return (
      <div style={{ position: "absolute", inset: 0, background: "#050507" }}>
        <div style={{ position: "absolute", left: 140 + Math.sin(f / 60) * 60, top: 520, width: 800, height: 800, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,131,255,0.35), transparent 65%)", filter: "blur(40px)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 500, background: "linear-gradient(transparent, rgba(61,220,255,0.08))" }} />
      </div>
    );
  },
};

/** Gráficos: barras y líneas que se dibujan con la voz, números grandes; fondo claro de informe */
const Barras: React.FC<{ e: Escena; t: TemaVivo }> = ({ e, t }) => {
  const { f, fps } = useEscena(e);
  const datos = (e.datos as { etiqueta: string; valor: number; en?: number }[]) ?? [];
  const max = Math.max(...datos.map((d) => d.valor), 1);
  return (
    <div style={{ position: "absolute", left: 80, right: 80, top: 300, height: 830, display: "flex", flexDirection: "column", justifyContent: "center", gap: 30 }}>
      {e.titulo ? <TextoEntra texto={e.titulo as string} desde={2} t={t} tam={68} /> : null}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 40, height: 560, borderBottom: `4px solid ${t.tinta}` }}>
        {datos.map((d, i) => {
          const desde = typeof d.en === "number" ? enEscena(e, d.en, fps) : 6 + i * 6;
          const p = tramo(f, desde, desde + 20);
          const ultimo = i === datos.length - 1;
          return (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
              <div style={{ fontFamily: t.fTitulo, fontSize: 52, fontWeight: 700, color: ultimo ? t.acento : t.tinta, opacity: p }}>{Math.round(d.valor * p)}</div>
              <div style={{ width: "100%", height: `${(d.valor / max) * 82 * p}%`, background: ultimo ? t.acento : "#C9CED8", borderRadius: "10px 10px 0 0" }} />
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 40 }}>{datos.map((d, i) => <div key={i} style={{ flex: 1, textAlign: "center", fontFamily: t.fTexto, fontSize: 36, color: "#5B6170" }}>{d.etiqueta}</div>)}</div>
    </div>
  );
};

const LineaGrafico: React.FC<{ e: Escena; t: TemaVivo }> = ({ e, t }) => {
  const { f } = useEscena(e);
  const pts = (e.puntos as number[]) ?? [2, 3, 3, 5, 8, 13];
  const max = Math.max(...pts), w = 900, h = 520;
  const p = tramo(f, 6, 46);
  const d = pts.map((v, i) => `${i ? "L" : "M"} ${(i / (pts.length - 1)) * w} ${h - (v / max) * h * 0.9}`).join(" ");
  const fin = pts.length - 1;
  return (
    <div style={{ position: "absolute", left: 90, right: 90, top: 300, height: 830, display: "flex", flexDirection: "column", justifyContent: "center", gap: 40 }}>
      {e.titulo ? <TextoEntra texto={e.titulo as string} desde={2} t={t} tam={68} /> : null}
      <svg width={w} height={h} style={{ overflow: "visible" }}>
        {[0.25, 0.5, 0.75, 1].map((g) => <line key={g} x1={0} x2={w} y1={h - g * h * 0.9} y2={h - g * h * 0.9} stroke="#DADDE4" strokeWidth={2} />)}
        <path d={`${d} L ${w} ${h} L 0 ${h} Z`} fill={`${t.acento}22`} style={{ clipPath: `inset(0 ${(1 - p) * 100}% 0 0)` }} />
        <path d={d} stroke={t.acento} strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
        {p > 0.98 ? <circle cx={w} cy={h - (pts[fin] / max) * h * 0.9} r={18} fill={t.acento} /> : null}
      </svg>
      {e.etiqueta ? <TextoEntra texto={e.etiqueta as string} desde={40} t={t} tam={56} color={t.acento} /> : null}
    </div>
  );
};

const GRAFICOS: Tema = {
  id: "graficos", nombre: "Gráficos que cuentan", material: "plano", entrada: "subir", caja: "blanca", tinta: "#1C2333", acento: "#FF5A36", acento2: "#2F6BFF",
  sub: { y: 1160, tam: 58, color: "#1C2333", clave: "#FF5A36", peso: 600 },
  fuentes: () => ({ titulo: spaceGrotesk("normal", { weights: ["700"], ...L }).fontFamily, texto: spaceGrotesk("normal", { weights: ["500"], ...L }).fontFamily }),
  Fondo: () => (
    <div style={{ position: "absolute", inset: 0, background: "#F3F4F7", backgroundImage: "linear-gradient(#E6E8EE 2px, transparent 2px), linear-gradient(90deg, #E6E8EE 2px, transparent 2px)", backgroundSize: "90px 90px" }} />
  ),
  extras: { barras: Barras, linea: LineaGrafico, barras3d: (p) => <Barras3D {...p} /> },
};

/** Infografía isométrica: una plataforma en perspectiva donde cada paso cae como un bloque con su ícono */
/** proyección isométrica: (x, y, z) del mundo → punto de pantalla */
const iso = (x: number, y: number, z: number, k = 1): [number, number] => [(x - y) * 0.866 * k, (x + y) * 0.5 * k - z * k];
/** bloque isométrico con sus tres caras (arriba clara, izquierda media, derecha oscura) */
const BloqueIso: React.FC<{ x: number; y: number; w: number; d: number; h: number; color: string; k?: number }> = ({ x, y, w, d, h, color, k = 1 }) => {
  const P = (a: [number, number]) => `${a[0]},${a[1]}`;
  const arriba = [iso(x, y, h, k), iso(x + w, y, h, k), iso(x + w, y + d, h, k), iso(x, y + d, h, k)];
  const izq = [iso(x, y + d, h, k), iso(x + w, y + d, h, k), iso(x + w, y + d, 0, k), iso(x, y + d, 0, k)];
  const der = [iso(x + w, y, h, k), iso(x + w, y + d, h, k), iso(x + w, y + d, 0, k), iso(x + w, y, 0, k)];
  return (
    <g>
      <polygon points={izq.map(P).join(" ")} fill={color} style={{ filter: "brightness(0.82)" }} />
      <polygon points={der.map(P).join(" ")} fill={color} style={{ filter: "brightness(0.64)" }} />
      <polygon points={arriba.map(P).join(" ")} fill={color} style={{ filter: "brightness(1.12)" }} />
    </g>
  );
};

/** proceso en isométrico: una plataforma con un bloque por paso que crece del suelo, unidos por un cable que se dibuja */
const Isometrico: React.FC<{ e: Escena; t: TemaVivo }> = ({ e, t }) => {
  const { f, fps } = useEscena(e);
  const pasos = (e.pasos as { texto: string; icono?: string; en: number }[]) ?? [];
  const colores = [t.acento, t.acento2, "#FFC145", "#9B5DE5"];
  const lugares: [number, number][] = [[40, 40], [230, 40], [40, 230], [230, 230]];
  const k = 1.5;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 300, height: 830 }}>
      <svg width={1080} height={830} viewBox="-540 -200 1080 830">
        <BloqueIso x={0} y={0} w={400} d={400} h={18} color="#DCE3EF" k={k} />
        {pasos.slice(0, -1).map((_, i) => {
          const [ax, ay] = lugares[i], [bx, by] = lugares[i + 1] ?? lugares[i];
          const d = enEscena(e, pasos[i + 1].en, fps);
          const p = tramo(f, d - 6, d + 6);
          const a = iso(ax + 65, ay + 65, 22, k), b = iso(bx + 65, by + 65, 22, k);
          return <line key={i} x1={a[0]} y1={a[1]} x2={a[0] + (b[0] - a[0]) * p} y2={a[1] + (b[1] - a[1]) * p} stroke={t.tinta} strokeWidth={5} strokeDasharray="14 10" opacity={0.6} />;
        })}
        {pasos.slice(0, 4).map((p, i) => {
          const d = enEscena(e, p.en, fps);
          const crece = tramo(f, d, d + 14, rebota);
          if (f < d) return null;
          const [x, y] = lugares[i];
          return <BloqueIso key={i} x={x} y={y} w={130} d={130} h={18 + (60 + i * 30) * crece} color={colores[i % 4]} k={k} />;
        })}
      </svg>
      {pasos.slice(0, 4).map((p, i) => {
        const d = enEscena(e, p.en, fps);
        const [x, y] = lugares[i];
        const [sx, sy] = iso(x + 65, y + 65, 18 + (60 + i * 30) + 30, k);
        return (
          <div key={i} style={{ position: "absolute", left: 540 + sx - 170, top: 200 + sy - 120, width: 340, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, opacity: tramo(f, d + 8, d + 14) }}>
            {p.icono ? <div style={{ background: "#fff", borderRadius: 18, padding: 10, boxShadow: "0 8px 20px rgba(0,0,0,0.15)" }}><Icono nombre={p.icono} tam={56} color={colores[i % 4]} grosor={2.4} /></div> : null}
            <div style={{ background: "rgba(255,255,255,0.92)", borderRadius: 14, padding: "6px 14px" }}><TextoEntra texto={p.texto} desde={d + 8} t={{ ...t, mayus: false }} tam={40} color={t.tinta} /></div>
          </div>
        );
      })}
    </div>
  );
};

/** barras en 3D isométrico que crecen con su valor; la última en el color de acento */
const Barras3D: React.FC<{ e: Escena; t: TemaVivo }> = ({ e, t }) => {
  const { f, fps } = useEscena(e);
  const datos = (e.datos as { etiqueta: string; valor: number; en?: number }[]) ?? [];
  const max = Math.max(...datos.map((d) => d.valor), 1);
  const k = 1.5;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 300, height: 830 }}>
      {e.titulo ? <div style={{ position: "absolute", left: 70, right: 70, top: 0, textAlign: "center" }}><TextoEntra texto={e.titulo as string} desde={2} t={t} tam={64} /></div> : null}
      <svg width={1080} height={830} viewBox={`${-540 + datos.length * 30} -560 1080 830`}>
        <BloqueIso x={-40} y={-40} w={datos.length * 120 + 40} d={200} h={10} color="#D9DEE8" k={k} />
        {datos.map((d, i) => {
          const desde = typeof d.en === "number" ? enEscena(e, d.en, fps) : 6 + i * 6;
          const p = tramo(f, desde, desde + 22);
          const h = 10 + (d.valor / max) * 300 * p;
          const ultimo = i === datos.length - 1;
          const [lx, ly] = iso(i * 120 + 40, 60, h + 30, k);
          return (
            <g key={i}>
              <BloqueIso x={i * 120} y={20} w={80} d={80} h={h} color={ultimo ? t.acento : "#9AA6BD"} k={k} />
              <text x={lx} y={ly} textAnchor="middle" fontSize={40} fontWeight={700} fill={ultimo ? t.acento : t.tinta} fontFamily={t.fTitulo} opacity={p}>{Math.round(d.valor * p)}</text>
              {(() => { const [ex, ey] = iso(i * 120 + 40, 150, 0, k); return <text x={ex} y={ey + 46} textAnchor="middle" fontSize={30} fill="#5B6170" fontFamily={t.fTexto}>{d.etiqueta}</text>; })()}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

const ISOMETRICA: Tema = {
  id: "infografia-isometrica", nombre: "Infografía isométrica", material: "plano", entrada: "subir", caja: "blanca", tinta: "#22304A", acento: "#3A86FF", acento2: "#FF6B6B",
  sub: { y: 1160, tam: 60, color: "#22304A", clave: "#3A86FF", peso: 600 },
  fuentes: () => ({ titulo: fredoka("normal", { weights: ["600"], ...L }).fontFamily, texto: fredoka("normal", { weights: ["500"], ...L }).fontFamily }),
  Fondo: () => <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,#F7F9FD,#E7EDF7)" }} />,
  extras: { pasos: Isometrico },
};

/** Pictogramas: figuras humanas que se llenan para mostrar proporciones (3 de cada 10…), letra condensada */
const Proporcion: React.FC<{ e: Escena; t: TemaVivo }> = ({ e, t }) => {
  const { f, fps } = useEscena(e);
  const total = (e.total as number) ?? 10, res = (e.resaltados as number) ?? 3;
  const d = typeof e.en === "number" ? enEscena(e, e.en, fps) : 4;
  const cols = total <= 10 ? 5 : 10;
  const tam = total <= 10 ? 150 : 82;
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 300, height: 830, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 40 }}>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, ${tam}px)`, gap: 14 }}>
        {Array.from({ length: total }).map((_, i) => {
          const aparece = tramo(f, d + i * 1.2, d + i * 1.2 + 6);
          const pinta = i < res && f >= d + total * 1.2 + 8 + i * 3;
          return <div key={i} style={{ opacity: aparece, transform: `scale(${0.6 + aparece * 0.4})` }}><Icono nombre="PersonStanding" tam={tam} color={pinta ? t.acento : "#B8BCC6"} grosor={2.6} /></div>;
        })}
      </div>
      {e.etiqueta ? <TextoEntra texto={e.etiqueta as string} desde={d + total * 1.2 + 10} t={t} tam={78} color={t.tinta} /> : null}
    </div>
  );
};

const PICTOGRAMAS: Tema = {
  id: "pictogramas", nombre: "Pictogramas", material: "plano", entrada: "deslizar", caja: "ninguna", tinta: "#1B1B1B", acento: "#E63946", acento2: "#1D3557", mayus: true,
  sub: { y: 1160, tam: 62, color: "#1B1B1B", clave: "#E63946", peso: 600, mayus: true },
  fuentes: () => ({ titulo: oswald("normal", { weights: ["700"], ...L }).fontFamily, texto: oswald("normal", { weights: ["500"], ...L }).fontFamily }),
  Fondo: () => <div style={{ position: "absolute", inset: 0, background: "#F1EDE4" }}><div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 24, background: "#E63946" }} /></div>,
  extras: { proporcion: Proporcion },
};

/** Tipografía suiza: retícula visible, letra enorme alineada a la izquierda, rojo, negro y blanco */
const SUIZA: Tema = {
  id: "tipografia-suiza", nombre: "Tipografía suiza", material: "plano", entrada: "deslizar", caja: "ninguna", tinta: "#111111", acento: "#E10600", acento2: "#111111", alinear: "izquierda",
  sub: { y: 1160, tam: 60, color: "#111111", clave: "#E10600", peso: 700, alinear: "izquierda" },
  fuentes: () => ({ titulo: interTight("normal", { weights: ["800"], ...L }).fontFamily, texto: interTight("normal", { weights: ["600"], ...L }).fontFamily }),
  Fondo: ({ e }) => {
    const f = useCurrentFrame();
    const n = e ? Math.round(e.desde) : 0;
    return (
      <div style={{ position: "absolute", inset: 0, background: "#F2F0EB" }}>
        {Array.from({ length: 6 }).map((_, i) => <div key={i} style={{ position: "absolute", top: 0, bottom: 0, left: 70 + i * 188, width: 1.5, background: "rgba(0,0,0,0.08)" }} />)}
        <div style={{ position: "absolute", right: -80, top: 1300, width: 620, height: 620, borderRadius: "50%", background: "#E10600", transform: `translateY(${Math.sin(f / 50) * 14}px)` }} />
        <div style={{ position: "absolute", left: 70, top: 180, fontFamily: "Inter Tight, sans-serif", fontSize: 30, fontWeight: 700, letterSpacing: 4 }}>{String(n).padStart(2, "0")} —</div>
      </div>
    );
  },
};

// ═════════════════════════ TUTORIALES Y NOTICIAS ═════════════════════════

/** Pantalla en vivo: un escritorio de computadora donde las ventanas trabajan solas (chat, navegador, carpetas) */
const Ventana: React.FC<{ titulo: string; t: TemaVivo; desde: number; children: React.ReactNode; alto?: number }> = ({ titulo, t, desde, children, alto = 760 }) => (
  <Caja t={t} desde={desde} pad={0} ancho={960} estilo={{ height: alto }}>
    <div style={{ height: 64, background: "#ECEEF2", display: "flex", alignItems: "center", gap: 12, padding: "0 24px", borderBottom: "1px solid #DDE0E6" }}>
      {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <div key={c} style={{ width: 18, height: 18, borderRadius: 9, background: c }} />)}
      <div style={{ marginLeft: 20, fontFamily: t.fTexto, fontSize: 28, color: "#6B7080" }}>{titulo}</div>
    </div>
    <div style={{ padding: 34, height: alto - 64, boxSizing: "border-box", position: "relative" }}>{children}</div>
  </Caja>
);

const Chat: React.FC<{ e: Escena; t: TemaVivo }> = ({ e, t }) => {
  const { f, fps } = useEscena(e);
  const ms = (e.mensajes as { texto: string; en: number; yo?: boolean }[]) ?? [];
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 320, display: "flex", justifyContent: "center" }}>
      <Ventana titulo={(e.titulo as string) ?? "Chat"} t={t} desde={2}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {ms.map((m, i) => {
            const d = enEscena(e, m.en, fps);
            if (f < d) return null;
            const a = tramo(f, d, d + 8, rebota);
            return (
              <div key={i} style={{ alignSelf: m.yo ? "flex-end" : "flex-start", maxWidth: "78%", background: m.yo ? t.acento : "#F1F3F7", color: m.yo ? "#fff" : t.tinta, borderRadius: 26, padding: "20px 28px", fontFamily: t.fTexto, fontSize: 46, transform: `scale(${0.7 + a * 0.3})`, transformOrigin: m.yo ? "100% 100%" : "0% 100%", opacity: Math.min(1, a * 2) }}>
                {m.yo ? m.texto : <TextoEntra texto={m.texto} desde={d} t={{ ...t, entrada: "teclear", mayus: false }} tam={46} fuente={t.fTexto} peso={500} />}
              </div>
            );
          })}
        </div>
      </Ventana>
    </div>
  );
};

const Navegador: React.FC<{ e: Escena; t: TemaVivo }> = ({ e, t }) => {
  const { f, fps } = useEscena(e);
  const filas = (e.filas as { texto: string; en: number; icono?: string }[]) ?? [];
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 320, display: "flex", justifyContent: "center" }}>
      <Ventana titulo={(e.url as string) ?? "tu-sitio.com"} t={t} desde={2}>
        {e.titulo ? <div style={{ fontFamily: t.fTitulo, fontSize: 60, fontWeight: 800, color: t.tinta, marginBottom: 24 }}><TextoEntra texto={e.titulo as string} desde={6} t={{ ...t, mayus: false }} tam={60} /></div> : null}
        {filas.map((r, i) => {
          const d = enEscena(e, r.en, fps);
          const a = tramo(f, d, d + 8);
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 22, padding: "20px 0", borderTop: "1.5px solid #EEF0F4", opacity: a, transform: `translateX(${(1 - a) * 30}px)` }}>
              <div style={{ width: 70, height: 70, borderRadius: 18, background: `${t.acento}1F`, display: "flex", alignItems: "center", justifyContent: "center" }}><Icono nombre={r.icono ?? "Check"} tam={40} color={t.acento} /></div>
              <div style={{ fontFamily: t.fTexto, fontSize: 42, fontWeight: 600, color: t.tinta }}>{r.texto}</div>
            </div>
          );
        })}
      </Ventana>
    </div>
  );
};

const PANTALLA_VIVO: Tema = {
  id: "pantalla-en-vivo", nombre: "Pantalla en vivo", material: "plano", entrada: "teclear", caja: "ventana", titularEnCaja: true, tinta: "#1B1F2A", acento: "#5B5BF7", acento2: "#18C29C",
  sub: { y: 1160, tam: 56, color: "#FFFFFF", clave: "#B9B9FF", peso: 600, caja: "pastilla", fondoCaja: "rgba(12,14,28,0.78)" },
  fuentes: () => ({ titulo: inter("normal", { weights: ["800"], ...L }).fontFamily, texto: inter("normal", { weights: ["500", "600"], ...L }).fontFamily }),
  Fondo: () => (
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(150deg,#5B5BF7 0%,#9D4EDD 45%,#FF7AA2 100%)" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 56, background: "rgba(255,255,255,0.35)", backdropFilter: "blur(10px)" }} />
      <div style={{ position: "absolute", left: 200, right: 200, bottom: 60, height: 120, borderRadius: 36, background: "rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "space-evenly" }}>
        {["Folder", "Globe", "MessageCircle", "Music", "Settings"].map((n, i) => <div key={n} style={{ width: 84, height: 84, borderRadius: 22, background: ["#4D9DFF", "#36C5F0", "#18C29C", "#FF5C8A", "#8E8E9A"][i], display: "flex", alignItems: "center", justifyContent: "center" }}><Icono nombre={n} tam={48} color="#fff" /></div>)}
      </div>
    </div>
  ),
  extras: { chat: Chat, navegador: Navegador },
};

/** Noticiero: estudio azul, zócalo con la frase, cintillo de titulares y «EN VIVO» */
const UltimaHora: React.FC<{ e: Escena; t: TemaVivo }> = ({ e, t }) => {
  const { f, fps } = useEscena(e);
  const d = typeof e.en === "number" ? enEscena(e, e.en, fps) : 2;
  const a = tramo(f, d, d + 10);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 360, display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
      <div style={{ background: t.acento, color: "#fff", fontFamily: t.fTitulo, fontSize: 80, padding: "10px 40px", transform: `scaleX(${a})`, letterSpacing: 2 }}>ÚLTIMA HORA</div>
      <div style={{ width: 900, background: "#fff", padding: "34px 40px", boxSizing: "border-box", opacity: tramo(f, d + 6, d + 14), boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}>
        <TextoEntra texto={e.texto as string} desde={d + 8} t={{ ...t, tinta: "#0B1F44" }} tam={84} />
      </div>
    </div>
  );
};

const CapaNoticiero: React.FC = () => {
  const f = useCurrentFrame();
  const plan = usePlan();
  const titulares = (plan.cintillo?.length ? plan.cintillo : ["ÚLTIMAS NOTICIAS"]).map((x) => x.toUpperCase()).join("  •  ") + "  •  ";
  return (
    <>
      <div style={{ position: "absolute", right: 60, top: 150, display: "flex", alignItems: "center", gap: 12, background: "rgba(0,0,0,0.45)", padding: "8px 18px", fontFamily: "Oswald, sans-serif", fontSize: 30, color: "#fff", letterSpacing: 2 }}>
        <div style={{ width: 16, height: 16, borderRadius: 8, background: "#FF2D2D", opacity: Math.floor(f / 15) % 2 ? 1 : 0.3 }} /> EN VIVO
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1188, height: 60, background: "#FFC72C", overflow: "hidden", display: "flex", alignItems: "center" }}>
        <div style={{ whiteSpace: "nowrap", fontFamily: "Oswald, sans-serif", fontSize: 34, fontWeight: 600, color: "#0B1F44", transform: `translateX(${-((f * 4) % 1400)}px)` }}>{titulares.repeat(4)}</div>
      </div>
    </>
  );
};

const NOTICIERO: Tema = {
  id: "noticiero", nombre: "Noticiero", material: "plano", entrada: "deslizar", caja: "tv", tinta: "#FFFFFF", acento: "#E4002B", acento2: "#FFC72C", mayus: true,
  zona: { top: 300, alto: 760 },
  sub: { y: 1066, tam: 50, color: "#FFFFFF", clave: "#FFC72C", peso: 600, caja: "zocalo", fondoCaja: "#0B2E6B", mayus: true },
  fuentes: () => ({ titulo: oswald("normal", { weights: ["700"], ...L }).fontFamily, texto: oswald("normal", { weights: ["500", "600"], ...L }).fontFamily }),
  Fondo: () => {
    const f = useCurrentFrame();
    return (
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(90% 60% at 50% 30%, #1D5BC4 0%, #0A2A66 55%, #061634 100%)" }}>
        {Array.from({ length: 12 }).map((_, i) => <div key={i} style={{ position: "absolute", left: (i * 97 + f * 0.6) % 1180 - 100, top: 0, bottom: 0, width: 2, background: "rgba(255,255,255,0.05)" }} />)}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 700, background: "linear-gradient(transparent, rgba(0,0,0,0.5))" }} />
      </div>
    );
  },
  Capa: CapaNoticiero,
  extras: { "ultima-hora": UltimaHora },
};

/** Noticia con subtítulos: los subtítulos ENORMES son la noticia; arriba, un panel de color con el ícono o la imagen */
const NOTICIA_SUBTITULOS: Tema = {
  id: "noticia-subtitulos", nombre: "Noticia con subtítulos", material: "plano", entrada: "golpe", caja: "ninguna", tinta: "#FFFFFF", acento: "#FFE600", acento2: "#FF3B30", mayus: true,
  zona: { top: 260, alto: 640 },
  sub: { y: 960, tam: 96, color: "#FFFFFF", clave: "#FFE600", peso: 400, mayus: true, caja: "resalta", contorno: "#000000" },
  fuentes: () => ({ titulo: anton("normal", { weights: ["400"], ...L }).fontFamily, texto: anton("normal", { weights: ["400"], ...L }).fontFamily }),
  Fondo: ({ e }) => {
    const colores = ["#1B1B1F", "#20242E", "#2A1E1E", "#1E2A24"];
    const c = colores[e ? Math.round(e.desde) % 4 : 0];
    return <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${c}, #0B0B0D)` }}>{grano(0.2, "not")}</div>;
  },
};

/** Cuenta regresiva: arriba un reloj gigante que baja hasta 0 al final del video; abajo, el contenido */
const CapaReloj: React.FC<{ escenas: readonly Escena[] }> = ({ escenas }) => {
  const f = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const resta = Math.max(0, (durationInFrames - f) / fps);
  const s = Math.floor(resta), cs = Math.floor((resta - s) * 100);
  const e = escenaEn(escenas, f / fps);
  const urgente = resta < 5;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 620, background: "#0A0A0A", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderBottom: "6px solid #FF3B30" }}>
      <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 300, lineHeight: 1, color: urgente && Math.floor(f / 8) % 2 ? "#FF3B30" : "#FFFFFF", fontVariantNumeric: "tabular-nums", letterSpacing: 6 }}>
        00:{String(s).padStart(2, "0")}<span style={{ fontSize: 160, color: "#FF3B30" }}>.{String(cs).padStart(2, "0")}</span>
      </div>
      {e?.etiqueta ? <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 64, color: "#FF3B30", letterSpacing: 6 }}>{e.etiqueta as string}</div> : null}
    </div>
  );
};

const CUENTA_REGRESIVA: Tema = {
  id: "cuenta-regresiva", nombre: "Cuenta regresiva", material: "plano", entrada: "golpe", caja: "blanca", tinta: "#111111", acento: "#FF3B30", acento2: "#111111", mayus: true,
  zona: { top: 650, alto: 490 },
  sub: { y: 1170, tam: 56, color: "#111111", clave: "#FF3B30", peso: 400, mayus: true },
  fuentes: () => ({ titulo: bebas("normal", { weights: ["400"], ...L }).fontFamily, texto: spaceGrotesk("normal", { weights: ["600"], ...L }).fontFamily }),
  Fondo: () => <div style={{ position: "absolute", inset: 0, background: "#F4F1EA" }} />,
  Capa: CapaReloj,
};

// ═════════════════════════ ENTRETENER ═════════════════════════

/** Pixel RPG: paisaje de 16 bits, un héroe de píxeles que camina, corazones y el texto en un cuadro de diálogo */
const Heroe: React.FC<{ x: number; y: number; px?: number }> = ({ x, y, px = 12 }) => {
  const f = useCurrentFrame();
  const paso = Math.floor(f / 8) % 2;
  const mapa = ["..HHHH..", ".HHHHHH.", ".HSSSSH.", ".SEPSEP.", ".SSSSSS.", "..SSSS..", ".BBBBBB.", "BBBBBBBB", "S.BBBB.S", "..LL.LL.", paso ? ".LL...LL" : "..LL.LL."];
  const C: Record<string, string> = { H: "#5A3A22", S: "#F2C29B", E: "#1B1B3A", P: "#FFFFFF", B: "#3A6EE8", L: "#2B2B4A" };
  return (
    <div style={{ position: "absolute", left: x, top: y + (paso ? -px * 0.5 : 0) }}>
      {mapa.map((fila, r) => fila.split("").map((c, k) => (c === "." ? null : <div key={`${r}-${k}`} style={{ position: "absolute", left: k * px, top: r * px, width: px, height: px, background: C[c] }} />)))}
    </div>
  );
};

const Objeto: React.FC<{ e: Escena; t: TemaVivo }> = ({ e, t }) => {
  const { f, fps } = useEscena(e);
  const d = typeof e.en === "number" ? enEscena(e, e.en, fps) : 3;
  const sube = Math.floor(tramo(f, d, d + 16) * 6) / 6;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 330, display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
      <div style={{ transform: `translateY(${(1 - sube) * 120}px)`, opacity: f >= d ? 1 : 0 }}><IconoTema nombre={(e.icono as string) ?? "Gem"} desde={d} t={t} tam={220} /></div>
      <Caja t={t} desde={d + 10} pad={26}>
        <TextoEntra texto={`¡Conseguiste ${(e.nombre as string) ?? "un objeto"}!`} desde={d + 12} t={{ ...t, mayus: false }} tam={40} fuente={t.fTitulo} peso={400} />
      </Caja>
    </div>
  );
};

const CapaRPG: React.FC<{ escenas: readonly Escena[] }> = ({ escenas }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const i = escenas.findIndex((e) => f / fps >= e.desde && f / fps < e.hasta);
  return (
    <>
      <div style={{ position: "absolute", left: 50, top: 150, display: "flex", gap: 10 }}>
        {[0, 1, 2].map((k) => <div key={k} style={{ width: 48, height: 44, background: "#E83F3F", clipPath: "polygon(0 25%,25% 0,50% 18%,75% 0,100% 25%,100% 55%,50% 100%,0 55%)" }} />)}
      </div>
      <div style={{ position: "absolute", right: 50, top: 150, fontFamily: "'Press Start 2P', monospace", fontSize: 30, color: "#fff", textShadow: "4px 4px 0 #1B1B3A" }}>NIVEL {Math.max(1, i + 1)}</div>
      <Heroe x={120 + ((f * 2.4) % 760)} y={1388} px={12} />
    </>
  );
};

const PIXEL: Tema = {
  id: "pixel-rpg", nombre: "Pixel RPG", material: "pixel", entrada: "teclear", caja: "pixel", escalaTexto: 0.5, titularEnCaja: true, tinta: "#1B1B3A", acento: "#FFC93C", acento2: "#3A6EE8",
  zona: { top: 260, alto: 720 },
  sub: { y: 1000, tam: 34, color: "#FFFFFF", clave: "#FFC93C", peso: 400, caja: "dialogo", fondoCaja: "#1B1B3A" },
  fuentes: () => ({ titulo: press("normal", { weights: ["400"], ...L }).fontFamily, texto: press("normal", { weights: ["400"], ...L }).fontFamily }),
  Fondo: () => {
    const f = useCurrentFrame();
    return (
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(#5EC8F2 0%, #9FE2FF 60%)", imageRendering: "pixelated" }}>
        {[0, 1, 2].map((i) => <div key={i} style={{ position: "absolute", top: 220 + i * 90, left: ((i * 400 - f * (0.6 + i * 0.2)) % 1400) + 1080 - 1400, width: 240, height: 48, background: "#fff", boxShadow: "48px -24px 0 #fff, 96px 0 0 #fff" }} />)}
        <div style={{ position: "absolute", left: 0, right: 0, top: 1280, height: 220, background: "#3FA34D", clipPath: "polygon(0 40%,10% 20%,22% 35%,35% 10%,48% 30%,60% 5%,74% 28%,88% 12%,100% 30%,100% 100%,0 100%)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 1490, bottom: 0, background: "repeating-linear-gradient(90deg,#7A4B2A 0 48px,#8D5A33 48px 96px)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 1490, height: 24, background: "#5BC24B" }} />
      </div>
    );
  },
  Capa: CapaRPG,
  extras: { objeto: Objeto },
};

/** Concurso de TV: escenario con focos que giran, preguntas con opciones y la correcta que se ilumina */
const Pregunta: React.FC<{ e: Escena; t: TemaVivo }> = ({ e, t }) => {
  const { f, fps } = useEscena(e);
  const d = typeof e.en === "number" ? enEscena(e, e.en, fps) : 2;
  const revela = typeof e.revelaEn === "number" ? enEscena(e, e.revelaEn, fps) : d + 50;
  const ops = (e.opciones as string[]) ?? [];
  const ok = (e.correcta as number) ?? 0;
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 300, height: 830, display: "flex", flexDirection: "column", justifyContent: "center", gap: 26 }}>
      <Caja t={t} desde={d} pad={36} estilo={{ textAlign: "center" }}><TextoEntra texto={e.texto as string} desde={d + 4} t={{ ...t, mayus: false }} tam={60} color="#fff" /></Caja>
      {ops.map((o, i) => {
        const a = tramo(f, d + 10 + i * 4, d + 18 + i * 4, rebota);
        const bien = f >= revela && i === ok;
        const mal = f >= revela && i !== ok;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 24, background: bien ? "#21C46B" : "#2A1458", border: `5px solid ${bien ? "#7CFFB2" : t.acento}`, borderRadius: 60, padding: "22px 34px", transform: `scale(${(0.6 + a * 0.4) * (bien ? 1.04 : 1)})`, opacity: mal ? 0.45 : Math.min(1, a * 2), fontFamily: t.fTexto, fontSize: 50, color: "#fff" }}>
            <span style={{ color: t.acento, fontFamily: t.fTitulo }}>{"ABCD"[i]}</span>{o}
          </div>
        );
      })}
    </div>
  );
};

const CONCURSO: Tema = {
  id: "concurso", nombre: "Concurso de TV", material: "neon", entrada: "golpe", caja: "oscura", tinta: "#FFFFFF", acento: "#FFD23F", acento2: "#FF3CAC",
  sub: { y: 1160, tam: 60, color: "#FFFFFF", clave: "#FFD23F", peso: 400, contorno: "#2A1458" },
  fuentes: () => ({ titulo: archivoBlack("normal", { weights: ["400"], ...L }).fontFamily, texto: fredoka("normal", { weights: ["600"], ...L }).fontFamily }),
  Fondo: () => {
    const f = useCurrentFrame();
    return (
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(80% 60% at 50% 45%, #5B21B6 0%, #2A1458 60%, #12082A 100%)", overflow: "hidden" }}>
        {Array.from({ length: 10 }).map((_, i) => <div key={i} style={{ position: "absolute", left: 540, top: 1700, width: 140, height: 2200, transformOrigin: "50% 0%", transform: `rotate(${180 + (i - 4.5) * 14 + Math.sin(f / 30 + i) * 6}deg)`, background: "linear-gradient(rgba(255,255,255,0.12), transparent 70%)" }} />)}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 360, background: "linear-gradient(transparent, #FF3CAC33)" }} />
        {Array.from({ length: 16 }).map((_, i) => <div key={`b${i}`} style={{ position: "absolute", left: 30 + i * 66, bottom: 40, width: 22, height: 22, borderRadius: 11, background: Math.floor(f / 6 + i) % 3 ? "#FFD23F" : "#FFF7D1", boxShadow: "0 0 18px #FFD23F" }} />)}
      </div>
    );
  },
  extras: { pregunta: Pregunta },
};

/** Microjuegos: retos de pocos segundos («¡ESQUIVA!», «¡ELIGE!») con barra de tiempo que se vacía; colores que saltan */
const Reto: React.FC<{ e: Escena; t: TemaVivo }> = ({ e, t }) => {
  const { f, dur } = useEscena(e);
  const a = tramo(f, 0, 8, rebota);
  const salto = Math.abs(Math.sin(f / 5)) * 40;
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 300, height: 830, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 50 }}>
      <div style={{ fontFamily: t.fTitulo, fontSize: 150, color: "#fff", WebkitTextStroke: "14px #111", paintOrder: "stroke fill", transform: `scale(${2 - a}) rotate(${(1 - a) * -8 + Math.sin(f / 7) * 2}deg)`, textAlign: "center", lineHeight: 1 }}>{e.instruccion as string}</div>
      <div style={{ transform: `translateY(${-salto}px) rotate(${Math.sin(f / 6) * 10}deg)` }}><div style={{ width: 300, height: 300, borderRadius: 80, background: "#fff", border: "12px solid #111", display: "flex", alignItems: "center", justifyContent: "center" }}><Icono nombre={(e.icono as string) ?? "Zap"} tam={180} color="#111" grosor={2.6} /></div></div>
      <div style={{ width: 800, height: 46, borderRadius: 23, border: "8px solid #111", background: "#fff", overflow: "hidden" }}><div style={{ height: "100%", width: `${(1 - f / dur) * 100}%`, background: f / dur > 0.7 ? "#FF3B30" : "#111" }} /></div>
    </div>
  );
};

const MICROJUEGOS: Tema = {
  id: "microjuegos", nombre: "Microjuegos", material: "plano", entrada: "golpe", caja: "blanca", tinta: "#111111", acento: "#111111", acento2: "#FFFFFF", mayus: true,
  sub: { y: 1160, tam: 62, color: "#FFFFFF", clave: "#FFF35C", peso: 600, contorno: "#111111", mayus: true },
  fuentes: () => ({ titulo: fredoka("normal", { weights: ["700"], ...L }).fontFamily, texto: fredoka("normal", { weights: ["600"], ...L }).fontFamily }),
  Fondo: ({ e }) => {
    const f = useCurrentFrame();
    const colores = ["#FF5E5B", "#00B4D8", "#FFBE0B", "#8338EC", "#06D6A0", "#FB5607"];
    const c = colores[e ? Math.round(e.desde * 3) % colores.length : 0];
    return (
      <div style={{ position: "absolute", inset: 0, background: c, overflow: "hidden" }}>
        {Array.from({ length: 14 }).map((_, i) => <div key={i} style={{ position: "absolute", left: (azar(i) * 1200 - 60), top: ((azar(i + 3) * 2100 + f * (3 + azar(i) * 4)) % 2100) - 100, width: 60, height: 60, borderRadius: i % 2 ? 30 : 8, border: "8px solid rgba(255,255,255,0.35)", transform: `rotate(${f * 2 + i * 20}deg)` }} />)}
      </div>
    );
  },
  extras: { reto: Reto },
};


export const TEMAS_A: Readonly<Record<string, Tema>> = Object.fromEntries(
  [PIZARRA, PIZARRA_BLANCA, UNA_LINEA, CRAYONES, ACUARELA, PRESENTACION, GRAFICOS, ISOMETRICA, PICTOGRAMAS, SUIZA, PANTALLA_VIVO, NOTICIERO, NOTICIA_SUBTITULOS, CUENTA_REGRESIVA, PIXEL, CONCURSO, MICROJUEGOS].map((t) => [t.id, t]),
);
