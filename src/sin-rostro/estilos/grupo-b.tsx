// Videos sin rostro · grupo B: 15 estilos más sobre el mismo motor de temas (`tema.tsx`). Usan las escenas comunes
// (titular, dibujo, lista, cifra, comparación, pasos, cierre, medio): el mismo plan sirve para todos.
import { loadFont as bebas } from "@remotion/google-fonts/BebasNeue";
import { loadFont as chewy } from "@remotion/google-fonts/Chewy";
import { loadFont as fredoka } from "@remotion/google-fonts/Fredoka";
import { loadFont as ibmMono } from "@remotion/google-fonts/IBMPlexMono";
import { loadFont as interTight } from "@remotion/google-fonts/InterTight";
import { loadFont as kalam } from "@remotion/google-fonts/Kalam";
import { loadFont as limelight } from "@remotion/google-fonts/Limelight";
import { loadFont as orbitron } from "@remotion/google-fonts/Orbitron";
import { loadFont as playfair } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as poiret } from "@remotion/google-fonts/PoiretOne";
import { loadFont as righteous } from "@remotion/google-fonts/Righteous";
import { loadFont as shrikhand } from "@remotion/google-fonts/Shrikhand";
import { loadFont as specialElite } from "@remotion/google-fonts/SpecialElite";
import { loadFont as spaceGrotesk } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as vt323 } from "@remotion/google-fonts/VT323";
import React from "react";
import { useCurrentFrame } from "remotion";
import { azar } from "../base";
import { Tema } from "./tema";

const L = { subsets: ["latin"] as ("latin")[] };
const Grano: React.FC<{ op?: number; id: string; modo?: React.CSSProperties["mixBlendMode"]; vivo?: boolean }> = ({ op = 0.18, id, modo = "multiply", vivo }) => {
  const f = useCurrentFrame();
  return (
    <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: op, mixBlendMode: modo, pointerEvents: "none" }}>
      <filter id={`gb-${id}`}><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={vivo ? f % 30 : 3} stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter>
      <rect width="100%" height="100%" filter={`url(#gb-${id})`} />
    </svg>
  );
};
const Trama: React.FC<{ color: string; tam?: number; op?: number }> = ({ color, tam = 18, op = 0.25 }) => (
  <div style={{ position: "absolute", inset: 0, opacity: op, backgroundImage: `radial-gradient(${color} ${tam * 0.22}px, transparent ${tam * 0.24}px)`, backgroundSize: `${tam}px ${tam}px` }} />
);

// 1 · Risografía: papel crema, dos tintas (rosa flúor y azul) con un leve fuera de registro
const RISO: Tema = {
  id: "risografia", nombre: "Risografía", material: "plano", entrada: "golpe", caja: "papel", tinta: "#1F4AA8", acento: "#FF4F8B", acento2: "#1F4AA8", mayus: true,
  sub: { y: 1160, tam: 58, color: "#1F4AA8", clave: "#FF4F8B", peso: 400, mayus: true },
  fuentes: () => ({ titulo: bebas("normal", { weights: ["400"], ...L }).fontFamily, texto: spaceGrotesk("normal", { weights: ["600"], ...L }).fontFamily }),
  Fondo: () => (
    <div style={{ position: "absolute", inset: 0, background: "#F6F0E1" }}>
      <div style={{ position: "absolute", right: -120, top: 120, width: 560, height: 560, borderRadius: "50%", background: "#FF4F8B", mixBlendMode: "multiply", opacity: 0.85 }} />
      <div style={{ position: "absolute", right: -60, top: 170, width: 560, height: 560, borderRadius: "50%", background: "#1F4AA8", mixBlendMode: "multiply", opacity: 0.35 }} />
      <Trama color="#1F4AA8" op={0.12} />
      <Grano op={0.22} id="riso" />
    </div>
  ),
};

// 2 · Expediente: carpeta de archivo amarillenta, máquina de escribir, sello rojo
const EXPEDIENTE: Tema = {
  id: "expediente", nombre: "Expediente", material: "plano", entrada: "teclear", caja: "papel", tinta: "#2B2620", acento: "#B3261E", acento2: "#2B2620",
  sub: { y: 1160, tam: 54, color: "#2B2620", clave: "#B3261E", peso: 400 },
  fuentes: () => ({ titulo: specialElite("normal", { weights: ["400"], ...L }).fontFamily, texto: specialElite("normal", { weights: ["400"], ...L }).fontFamily }),
  Fondo: () => (
    <div style={{ position: "absolute", inset: 0, background: "#3E3326" }}>
      <div style={{ position: "absolute", left: 40, right: 40, top: 120, bottom: 300, background: "#E9D9B0", borderRadius: 10, boxShadow: "0 30px 60px rgba(0,0,0,0.5)", transform: "rotate(-1deg)" }}>
        <div style={{ position: "absolute", left: 40, top: 30, fontFamily: "Special Elite, monospace", fontSize: 30, color: "#5A4A33", letterSpacing: 4 }}>EXPEDIENTE N.º 042</div>
        <div style={{ position: "absolute", right: 50, top: 18, border: "6px solid #B3261E", color: "#B3261E", fontFamily: "Special Elite, monospace", fontSize: 40, padding: "6px 18px", transform: "rotate(8deg)", opacity: 0.8 }}>CONFIDENCIAL</div>
        <Trama color="#5A4A33" tam={10} op={0.08} />
      </div>
      <Grano op={0.25} id="exp" />
    </div>
  ),
};

// 3 · Plano técnico: azul de plano con cuadrícula, todo dibujado con línea blanca
const PLANO_TECNICO: Tema = {
  id: "plano-tecnico", nombre: "Plano técnico", material: "linea", entrada: "escribir", caja: "ninguna", tinta: "#EAF3FF", acento: "#FFD166", acento2: "#EAF3FF", mayus: true,
  sub: { y: 1160, tam: 50, color: "#EAF3FF", clave: "#FFD166", peso: 500, mayus: true },
  fuentes: () => ({ titulo: ibmMono("normal", { weights: ["600"], ...L }).fontFamily, texto: ibmMono("normal", { weights: ["500"], ...L }).fontFamily }),
  Fondo: () => (
    <div style={{ position: "absolute", inset: 0, background: "#0F4C9C", backgroundImage: "linear-gradient(rgba(255,255,255,0.16) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.16) 2px, transparent 2px), linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)", backgroundSize: "120px 120px, 120px 120px, 24px 24px, 24px 24px" }}>
      <div style={{ position: "absolute", right: 40, bottom: 330, border: "3px solid #EAF3FF", padding: "10px 20px", fontFamily: "IBM Plex Mono, monospace", fontSize: 24, color: "#EAF3FF" }}>ESC 1:1 · HOJA 01</div>
    </div>
  ),
};

// 4 · Terminal antigua: monitor de fósforo verde, letra de píxeles, líneas de barrido
const TERMINAL: Tema = {
  id: "terminal-antigua", nombre: "Terminal antigua", material: "neon", entrada: "teclear", caja: "ninguna", tinta: "#39FF7A", acento: "#B6FFCE", acento2: "#39FF7A",
  sub: { y: 1160, tam: 64, color: "#39FF7A", clave: "#B6FFCE", peso: 400 },
  fuentes: () => ({ titulo: vt323("normal", { weights: ["400"], ...L }).fontFamily, texto: vt323("normal", { weights: ["400"], ...L }).fontFamily }),
  Fondo: () => {
    const f = useCurrentFrame();
    return (
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(90% 70% at 50% 45%, #0B2A14, #020A04)" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(rgba(0,0,0,0.35) 0 2px, transparent 2px 5px)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: (f * 9) % 1920, height: 120, background: "linear-gradient(transparent, rgba(57,255,122,0.07), transparent)" }} />
        <div style={{ position: "absolute", left: 60, top: 160, fontFamily: "VT323, monospace", fontSize: 40, color: "#39FF7A", opacity: 0.7 }}>C:\&gt; _</div>
      </div>
    );
  },
};

// 5 · Holograma: interfaz de ciencia ficción, anillos que giran, cian brillante
const HOLOGRAMA: Tema = {
  id: "holograma", nombre: "Holograma", material: "neon", entrada: "deslizar", caja: "vidrio", tinta: "#D6FBFF", acento: "#22E4FF", acento2: "#7A5CFF", mayus: true,
  sub: { y: 1160, tam: 48, color: "#D6FBFF", clave: "#22E4FF", peso: 600, mayus: true },
  fuentes: () => ({ titulo: orbitron("normal", { weights: ["700"], ...L }).fontFamily, texto: spaceGrotesk("normal", { weights: ["600"], ...L }).fontFamily }),
  Fondo: () => {
    const f = useCurrentFrame();
    return (
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(80% 60% at 50% 40%, #06283A, #01070D)", overflow: "hidden" }}>
        {[620, 820, 1020].map((d, i) => <div key={d} style={{ position: "absolute", left: 540 - d / 2, top: 720 - d / 2, width: d, height: d, borderRadius: "50%", border: `2px ${i === 1 ? "dashed" : "solid"} rgba(34,228,255,${0.35 - i * 0.08})`, transform: `rotate(${f * (i % 2 ? -0.6 : 0.4)}deg)` }} />)}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(34,228,255,0.06) 1px, transparent 1px)", backgroundSize: "100% 6px" }} />
      </div>
    );
  },
};

// 6 · Placa de circuito: verde de placa, pistas de cobre y pulsos de luz que viajan
const CIRCUITO: Tema = {
  id: "circuito", nombre: "Placa de circuito", material: "neon", entrada: "deslizar", caja: "oscura", tinta: "#F2F7EE", acento: "#FFC857", acento2: "#4FE3A0",
  sub: { y: 1160, tam: 54, color: "#F2F7EE", clave: "#FFC857", peso: 600 },
  fuentes: () => ({ titulo: spaceGrotesk("normal", { weights: ["700"], ...L }).fontFamily, texto: ibmMono("normal", { weights: ["500"], ...L }).fontFamily }),
  Fondo: () => {
    const f = useCurrentFrame();
    return (
      <div style={{ position: "absolute", inset: 0, background: "#0B3B2C" }}>
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          {Array.from({ length: 14 }).map((_, i) => {
            const x = 60 + azar(i) * 960, y = 120 + azar(i + 9) * 1600, l = 200 + azar(i + 3) * 300;
            const d = `M ${x} ${y} h ${l * 0.5} l 60 60 v ${l * 0.4}`;
            return (
              <g key={i}>
                <path d={d} stroke="#C9963B" strokeWidth={6} fill="none" opacity={0.45} />
                <circle cx={x} cy={y} r={10} fill="#C9963B" opacity={0.6} />
                <path d={d} stroke="#FFE08A" strokeWidth={6} fill="none" pathLength={1} strokeDasharray="0.08 0.92" strokeDashoffset={-((f / 60 + azar(i)) % 1)} />
              </g>
            );
          })}
        </svg>
      </div>
    );
  },
};

// 7 · Mapa de metro: fondo blanco, líneas de colores con estaciones (el recorrido de la idea)
const METRO: Tema = {
  id: "mapa-metro", nombre: "Mapa de metro", material: "plano", entrada: "deslizar", caja: "blanca", tinta: "#1B1B1B", acento: "#E4002B", acento2: "#0072CE",
  sub: { y: 1160, tam: 56, color: "#1B1B1B", clave: "#E4002B", peso: 700 },
  fuentes: () => ({ titulo: interTight("normal", { weights: ["800"], ...L }).fontFamily, texto: interTight("normal", { weights: ["600"], ...L }).fontFamily }),
  Fondo: () => {
    const f = useCurrentFrame();
    const lineas: [string, string][] = [["#E4002B", "M -20 300 H 300 L 500 500 V 1500 L 700 1700 H 1100"], ["#0072CE", "M 1100 420 H 800 L 600 620 V 1300 H -20"], ["#00A651", "M 200 -20 V 900 L 400 1100 H 1100"], ["#FDB913", "M -20 1450 H 380 L 560 1270 V 120"]];
    return (
      <div style={{ position: "absolute", inset: 0, background: "#FAFAF7" }}>
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: 0.35 }}>
          {lineas.map(([c, d], i) => <path key={c} d={d} stroke={c} strokeWidth={22} fill="none" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={Math.max(0, 1 - (f - i * 6) / 45)} />)}
        </svg>
      </div>
    );
  },
};

// 8 · Art déco: negro y dorado, abanicos y rayos geométricos, letra de los años 20
const ART_DECO: Tema = {
  id: "art-deco", nombre: "Art déco", material: "plano", entrada: "subir", caja: "oscura", tinta: "#F3E6C4", acento: "#D4AF37", acento2: "#F3E6C4", mayus: true,
  sub: { y: 1160, tam: 50, color: "#F3E6C4", clave: "#D4AF37", peso: 400, mayus: true },
  fuentes: () => ({ titulo: limelight("normal", { weights: ["400"], ...L }).fontFamily, texto: poiret("normal", { weights: ["400"], ...L }).fontFamily }),
  Fondo: () => (
    <div style={{ position: "absolute", inset: 0, background: "#0D0D0F" }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 13 }).map((_, i) => <line key={i} x1={540} y1={1920} x2={540 + (i - 6) * 170} y2={0} stroke="#D4AF37" strokeWidth={2} opacity={0.25} />)}
        {[200, 300, 400].map((rr) => <path key={rr} d={`M ${540 - rr} 1920 A ${rr} ${rr} 0 0 1 ${540 + rr} 1920`} stroke="#D4AF37" strokeWidth={3} fill="none" opacity={0.5} />)}
        <rect x={40} y={40} width={1000} height={1840} stroke="#D4AF37" strokeWidth={4} fill="none" />
        <rect x={60} y={60} width={960} height={1800} stroke="#D4AF37" strokeWidth={1.5} fill="none" opacity={0.6} />
      </svg>
    </div>
  ),
};

// 9 · Títulos de espías: bloques de color planos de los 60, siluetas y letra condensada que entra deslizándose
const ESPIAS: Tema = {
  id: "titulos-espias", nombre: "Títulos de espías", material: "plano", entrada: "deslizar", caja: "ninguna", tinta: "#FFFFFF", acento: "#FFB000", acento2: "#E63946", mayus: true,
  sub: { y: 1160, tam: 58, color: "#FFFFFF", clave: "#FFB000", peso: 400, mayus: true },
  fuentes: () => ({ titulo: bebas("normal", { weights: ["400"], ...L }).fontFamily, texto: bebas("normal", { weights: ["400"], ...L }).fontFamily }),
  Fondo: ({ e }) => {
    const f = useCurrentFrame();
    const fondos = ["#E63946", "#1D3557", "#2A9D8F", "#F4A261"];
    const c = fondos[e ? Math.round(e.desde) % 4 : 0];
    return (
      <div style={{ position: "absolute", inset: 0, background: c, overflow: "hidden" }}>
        {Array.from({ length: 6 }).map((_, i) => <div key={i} style={{ position: "absolute", left: -200 + ((f * (3 + i) + i * 260) % 1500), top: 200 + i * 280, width: 260, height: 26, background: "#0D0D0D", opacity: 0.85 }} />)}
        <div style={{ position: "absolute", right: 80, bottom: 260, width: 180, height: 420, background: "#0D0D0D", clipPath: "polygon(40% 0,60% 0,62% 10%,75% 14%,80% 45%,70% 46%,68% 100%,32% 100%,30% 46%,20% 45%,25% 14%,38% 10%)" }} />
      </div>
    );
  },
};

// 10 · Cine mudo: blanco y negro con grano vivo y parpadeo, carteles con marco ornamental
const CINE_MUDO: Tema = {
  id: "cine-mudo", nombre: "Cine mudo", material: "plano", entrada: "subir", caja: "oscura", tinta: "#F4F1EA", acento: "#F4F1EA", acento2: "#BDB8AC",
  sub: { y: 1160, tam: 54, color: "#F4F1EA", clave: "#FFFFFF", peso: 500 },
  fuentes: () => ({ titulo: playfair("italic", { weights: ["700"], ...L }).fontFamily, texto: playfair("normal", { weights: ["500"], ...L }).fontFamily }),
  Fondo: () => {
    const f = useCurrentFrame();
    const brillo = 0.92 + azar(Math.floor(f / 2)) * 0.12;
    return (
      <div style={{ position: "absolute", inset: 0, background: "#141414", filter: `brightness(${brillo})` }}>
        <div style={{ position: "absolute", left: 60, right: 60, top: 220, bottom: 400, border: "4px solid #BDB8AC", boxShadow: "inset 0 0 0 12px #141414, inset 0 0 0 14px #BDB8AC" }} />
        <div style={{ position: "absolute", left: `${azar(Math.floor(f / 3)) * 100}%`, top: 0, bottom: 0, width: 2, background: "rgba(255,255,255,0.25)" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(70% 60% at 50% 45%, transparent 55%, rgba(0,0,0,0.75))" }} />
        <Grano op={0.32} id="mudo" modo="screen" vivo />
      </div>
    );
  },
};

// 11 · Dibujo animado de los 30: tinta negra gruesa sobre sepia, todo rebota
const ANIMADO_30: Tema = {
  id: "animado-30", nombre: "Dibujo animado de los 30", material: "marcador", entrada: "golpe", caja: "ninguna", tinta: "#1A1714", acento: "#1A1714", acento2: "#7A6A55",
  sub: { y: 1160, tam: 60, color: "#1A1714", clave: "#7A2E1F", peso: 400 },
  fuentes: () => ({ titulo: chewy("normal", { weights: ["400"], ...L }).fontFamily, texto: chewy("normal", { weights: ["400"], ...L }).fontFamily }),
  Fondo: () => (
    <div style={{ position: "absolute", inset: 0, background: "#E8DCC2" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(75% 60% at 50% 45%, transparent 50%, rgba(60,40,20,0.55))" }} />
      <Grano op={0.3} id="a30" vivo />
    </div>
  ),
};

// 12 · Dibujo animado de los 50: plano, pastel, estrellitas y bumeranes de la época
const ANIMADO_50: Tema = {
  id: "animado-50", nombre: "Dibujo animado de los 50", material: "plano", entrada: "golpe", caja: "blanca", tinta: "#2D2A32", acento: "#E76F51", acento2: "#2A9D8F",
  sub: { y: 1160, tam: 60, color: "#2D2A32", clave: "#E76F51", peso: 600 },
  fuentes: () => ({ titulo: shrikhand("normal", { weights: ["400"], ...L }).fontFamily, texto: fredoka("normal", { weights: ["600"], ...L }).fontFamily }),
  Fondo: () => {
    const f = useCurrentFrame();
    return (
      <div style={{ position: "absolute", inset: 0, background: "#A8DADC", overflow: "hidden" }}>
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} style={{ position: "absolute", left: azar(i) * 1000, top: azar(i + 4) * 1700, width: 70, height: 70, background: ["#F4A261", "#E76F51", "#FFFFFF"][i % 3], clipPath: "polygon(50% 0,60% 40%,100% 50%,60% 60%,50% 100%,40% 60%,0 50%,40% 40%)", transform: `rotate(${f * 2 + i * 30}deg)` }} />
        ))}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 520, background: "#F1E3C8", borderTopLeftRadius: "60% 120px", borderTopRightRadius: "40% 80px" }} />
      </div>
    );
  },
};

// 13 · Boceto con pluma y acuarela: línea de tinta y manchas de color suave, como un cuaderno de viaje
const BOCETO: Tema = {
  id: "boceto", nombre: "Boceto pluma y acuarela", material: "acuarela", entrada: "escribir", caja: "ninguna", tinta: "#22252B", acento: "#E07A5F", acento2: "#81B29A",
  sub: { y: 1160, tam: 58, color: "#22252B", clave: "#E07A5F", peso: 400 },
  fuentes: () => ({ titulo: kalam("normal", { weights: ["700"], ...L }).fontFamily, texto: kalam("normal", { weights: ["400"], ...L }).fontFamily }),
  Fondo: () => (
    <div style={{ position: "absolute", inset: 0, background: "#FBF8F1", backgroundImage: "linear-gradient(rgba(34,37,43,0.06) 1px, transparent 1px)", backgroundSize: "100% 46px" }}>
      <div style={{ position: "absolute", left: 120, top: 1350, width: 420, height: 200, borderRadius: "50%", background: "#81B29A", opacity: 0.35, filter: "url(#m-acuarela) blur(6px)" }} />
      <Grano op={0.12} id="bos" />
    </div>
  ),
};

// 14 · Óleo: fondo de pinceladas gruesas, letra serif clásica
const OLEO: Tema = {
  id: "oleo", nombre: "Pintura al óleo", material: "plano", entrada: "subir", caja: "papel", titularEnCaja: true, tinta: "#2B2118", acento: "#B5562F", acento2: "#3D6B7A",
  sub: { y: 1160, tam: 58, color: "#FFF6E5", clave: "#FFC27A", peso: 600, contorno: "#2B2118" },
  fuentes: () => ({ titulo: playfair("normal", { weights: ["700"], ...L }).fontFamily, texto: playfair("normal", { weights: ["500"], ...L }).fontFamily }),
  Fondo: () => (
    <div style={{ position: "absolute", inset: 0, background: "#3D6B7A", overflow: "hidden" }}>
      {Array.from({ length: 40 }).map((_, i) => (
        <div key={i} style={{ position: "absolute", left: azar(i) * 1180 - 100, top: azar(i + 40) * 2000 - 100, width: 260 + azar(i + 2) * 260, height: 60 + azar(i + 5) * 50, borderRadius: 40, background: ["#4F8A8B", "#E3B26A", "#B5562F", "#2F4F5F", "#F2D7A6"][i % 5], opacity: 0.55, transform: `rotate(${(azar(i + 8) - 0.5) * 60}deg)`, filter: "url(#m-crayon) blur(1px)" }} />
      ))}
      <Grano op={0.2} id="oleo" />
    </div>
  ),
};

// 15 · Anime de los 80: atardecer de ciudad, rosa y violeta, letra redonda retro
const ANIME_80: Tema = {
  id: "anime-80", nombre: "Anime de los 80", material: "neon", entrada: "golpe", caja: "vidrio", tinta: "#FFF5FB", acento: "#FF5DA2", acento2: "#7B5CFF",
  sub: { y: 1160, tam: 56, color: "#FFF5FB", clave: "#FFD1E8", peso: 400 },
  fuentes: () => ({ titulo: righteous("normal", { weights: ["400"], ...L }).fontFamily, texto: righteous("normal", { weights: ["400"], ...L }).fontFamily }),
  Fondo: () => (
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(#2B1055 0%, #7B2C8F 45%, #FF6F91 70%, #FFC371 100%)", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 340, top: 1330, width: 400, height: 400, borderRadius: "50%", background: "linear-gradient(#FFE29A, #FF6F91)", maskImage: "repeating-linear-gradient(#000 0 34px, transparent 34px 46px)", WebkitMaskImage: "repeating-linear-gradient(#000 0 34px, transparent 34px 46px)" }} />
      {Array.from({ length: 12 }).map((_, i) => <div key={i} style={{ position: "absolute", left: i * 92, bottom: 0, width: 80, height: 180 + azar(i) * 260, background: "#1A0B33" }} />)}
      <Grano op={0.12} id="a80" />
    </div>
  ),
};


export const TEMAS_B: Readonly<Record<string, Tema>> = Object.fromEntries(
  [RISO, EXPEDIENTE, PLANO_TECNICO, TERMINAL, HOLOGRAMA, CIRCUITO, METRO, ART_DECO, ESPIAS, CINE_MUDO, ANIMADO_30, ANIMADO_50, BOCETO, OLEO, ANIME_80].map((t) => [t.id, t]),
);
