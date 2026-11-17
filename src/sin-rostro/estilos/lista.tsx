// Estilo «Lista con recortes» (Top N): una tira de papel con cinta dice en qué punto vas, círculos que se marcan ✓,
// una foto tipo polaroid de cada punto y los subtítulos en recortes de papel. Para «5 herramientas», «3 errores»…
import React from "react";
import { useCurrentFrame } from "remotion";
import { Escena, azar, enEscena, rasgadoPct, rebota, tramo, useEscena, usePlan } from "../base";
import { Comentario, Icono, Medio, useAparece } from "../interfaz";

export const FondoLista: React.FC = () => (
  <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 80% at 50% 40%, #2A2420 0%, #15110F 70%)" }}>
    <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.22, mixBlendMode: "overlay" }}>
      <filter id="granoLista"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" /></filter>
      <rect width="100%" height="100%" filter="url(#granoLista)" />
    </svg>
  </div>
);

/** tira de papel crema con dos trozos de cinta: «HERRAMIENTA 3 · NOMBRE» */
const Cinta: React.FC<{ texto: string; desde?: number; semilla?: number }> = ({ texto, desde = 0, semilla = 1 }) => {
  const f = useCurrentFrame();
  const a = tramo(f, desde, desde + 10, rebota);
  return (
    <div style={{ position: "relative", display: "inline-block", transform: `rotate(${-1.5 + azar(semilla) * 1.5}deg) translateY(${(1 - a) * -60}px)`, opacity: Math.min(1, a * 2) }}>
      <div style={{ background: "#F6EFE2", color: "#1B1B1B", fontFamily: "'Inter Tight', sans-serif", fontWeight: 800, fontSize: 38, letterSpacing: 1, padding: "18px 40px", clipPath: rasgadoPct(semilla, 0.8, 5), textTransform: "uppercase" }}>{texto}</div>
      {[-1, 1].map((l) => (
        <div key={l} style={{ position: "absolute", top: -14, [l < 0 ? "left" : "right"]: -26, width: 110, height: 44, background: "rgba(235,228,200,0.75)", transform: `rotate(${l * 28}deg)`, clipPath: rasgadoPct(semilla + l * 5, 3, 10) }} />
      ))}
    </div>
  );
};

/** círculos 1…N: los ya vistos con ✓, el actual grande y amarillo */
const Progreso: React.FC<{ n: number; total: number }> = ({ n, total }) => {
  const f = useCurrentFrame();
  const g = tramo(f, 4, 14, rebota);
  return (
    <div style={{ display: "flex", gap: 14, alignItems: "center", justifyContent: "center" }}>
      {Array.from({ length: total }).map((_, i) => {
        const k = i + 1;
        const actual = k === n;
        const tam = actual ? 50 + g * 14 : 50;
        return (
          <div key={i} style={{ width: tam, height: tam, borderRadius: tam / 2, background: k < n ? "#FF7A1A" : actual ? "#FFD23F" : "rgba(255,255,255,0.18)", color: "#1B1B1B", fontFamily: "'Inter Tight', sans-serif", fontWeight: 800, fontSize: 26, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {k < n ? <Icono nombre="Check" tam={28} color="#1B1B1B" grosor={3.5} /> : k}
          </div>
        );
      })}
    </div>
  );
};

/** foto tipo polaroid: una imagen del usuario o un ícono grande sobre color */
const Polaroid: React.FC<{ imagen?: string; video?: string; icono?: string; color?: string; pie?: string; desde?: number; semilla?: number; ancho?: number }> = ({ imagen, video, icono, color = "#FF7A1A", pie, desde = 0, semilla = 1, ancho = 760 }) => {
  const { estilo } = useAparece(desde, 14);
  const f = useCurrentFrame();
  const giro = (azar(semilla) - 0.5) * 6;
  const vaiven = Math.sin(f / 30 + semilla) * 0.6;
  return (
    <div style={{ ...estilo, transform: `${estilo.transform} rotate(${giro + vaiven}deg)`, width: ancho, background: "#FBF8F1", padding: "26px 26px 90px", boxSizing: "border-box", boxShadow: "0 30px 60px rgba(0,0,0,0.5)", position: "relative" }}>
      <div style={{ width: "100%", aspectRatio: "4 / 3", background: imagen || video ? "#000" : color, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        {imagen || video ? <Medio imagen={imagen} video={video} /> : icono ? <Icono nombre={icono} tam={ancho * 0.32} color="#1B1B1B" grosor={1.8} /> : null}
      </div>
      {pie ? <div style={{ position: "absolute", left: 0, right: 0, bottom: 22, textAlign: "center", fontFamily: "'Caveat', cursive", fontSize: 54, color: "#2A2420" }}>{pie}</div> : null}
    </div>
  );
};

const COLORES = ["#FF7A1A", "#FFD23F", "#5BC0EB", "#9BC53D", "#E55934", "#C792EA"];

export const EscenaLista: React.FC<{ e: Escena }> = ({ e }) => {
  const plan = usePlan();
  const { f, fps } = useEscena(e);
  const total = (e.total as number) ?? 5;
  if (e.tipo === "portada") {
    const lineas = (e.lineas as { texto: string; en: number; color?: string }[]) ?? [];
    const fotos = (e.fotos as { icono?: string; imagen?: string }[]) ?? [];
    return (
      <>
        <div style={{ position: "absolute", top: 250, width: "100%", textAlign: "center" }}><Cinta texto={(e.etiqueta as string) ?? `${total} cosas`} /></div>
        <div style={{ position: "absolute", top: 420, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          {lineas.map((l, i) => {
            const d = enEscena(e, l.en, fps);
            if (f < d) return null;
            const a = tramo(f, d, d + 7, rebota);
            return (
              <div key={i} style={{ fontFamily: "'DM Serif Display', serif", fontSize: 170, lineHeight: 1, color: l.color ?? "#F6EFE2", transform: `scale(${1.8 - a * 0.8}) rotate(${(azar(i + 2) - 0.5) * 4}deg)`, opacity: Math.min(1, a * 2), textShadow: "0 8px 0 rgba(0,0,0,0.35)" }}>{l.texto}</div>
            );
          })}
        </div>
        <div style={{ position: "absolute", top: 1000, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 18 }}>
          {fotos.map((p, i) => (
            <Polaroid key={i} icono={p.icono} imagen={p.imagen} color={COLORES[i % COLORES.length]} desde={10 + i * 4} semilla={i + 4} ancho={225} />
          ))}
        </div>
        {e.nota ? (
          <div style={{ position: "absolute", top: 1290, width: "100%", textAlign: "center" }}>
            <span style={{ display: "inline-block", background: "#E5383B", color: "#fff", fontFamily: "'DM Serif Display', serif", fontSize: 54, padding: "8px 26px", clipPath: rasgadoPct(9, 1, 8), transform: "rotate(-2deg)", opacity: tramo(f, enEscena(e, (e.notaEn as number) ?? e.desde + 1, fps), enEscena(e, (e.notaEn as number) ?? e.desde + 1, fps) + 6) }}>{e.nota as string}</span>
          </div>
        ) : null}
      </>
    );
  }
  if (e.tipo === "item") {
    const n = (e.n as number) ?? 1;
    return (
      <>
        <div style={{ position: "absolute", top: 250, width: "100%", textAlign: "center" }}><Cinta texto={`${(e.rotulo as string) ?? "Punto"} ${n} · ${e.nombre as string}`} semilla={n} /></div>
        <div style={{ position: "absolute", top: 400, width: "100%" }}><Progreso n={n} total={total} /></div>
        <div style={{ position: "absolute", top: 530, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <Polaroid imagen={e.imagen as string} video={e.video as string} icono={e.icono as string} color={COLORES[(n - 1) % COLORES.length]} pie={e.pie as string} desde={6} semilla={n * 3} ancho={820} />
        </div>
      </>
    );
  }
  if (e.tipo === "cierre") {
    return (
      <>
        <div style={{ position: "absolute", top: 230, width: "100%", textAlign: "center" }}><Cinta texto={(e.etiqueta as string) ?? "Guárdalo"} semilla={8} /></div>
        <div style={{ position: "absolute", top: 520, left: 0, right: 0, textAlign: "center", fontFamily: "'DM Serif Display', serif", fontSize: 120, color: "#F6EFE2", lineHeight: 1.05, padding: "0 60px", opacity: tramo(f, 4, 12) }}>{e.titulo as string}</div>
        {e.palabra ? (
          <div style={{ position: "absolute", top: 860, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
            <Comentario palabra={e.palabra as string} desde={enEscena(e, (e.palabraEn as number) ?? e.desde + 0.5, fps)} acento={plan.marca?.acento ?? "#E5383B"} />
          </div>
        ) : null}
      </>
    );
  }
  return null;
};
