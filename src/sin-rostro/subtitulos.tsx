// Videos sin rostro · subtítulos. Reglas del estudio: una frase por línea, un lugar fijo por frase, las palabras
// aparecen cuando se dicen y la frase se va cuando termina la voz (sin parpadeos entre palabras de la misma frase).
import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { azar, esClave, Frase, fraseEn, rasgadoPct, rebota, tramo } from "./base";

type Props = { fs: readonly Frase[]; claves?: readonly string[]; y: number; fuente: string; fuenteClave?: string; color?: string; acento?: string; tam?: number; ancho?: number };

/** palabra por palabra en una línea: la que suena entra con un pequeño golpe; las claves en cursiva serif del acento */
export const SubtituloCursiva: React.FC<Props> = ({ fs, claves, y, fuente, fuenteClave, color = "#1D1A24", acento = "#E53935", tam = 64, ancho = 940 }) => {
  const f = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const t = f / fps;
  const fr = fraseEn(fs, t);
  if (!fr) return null;
  return (
    <div style={{ position: "absolute", left: (width - ancho) / 2, width: ancho, top: y, textAlign: "center", fontFamily: fuente, fontSize: tam, fontWeight: 600, color, lineHeight: 1.15, letterSpacing: -0.5 }}>
      {fr.palabras.map((p, i) => {
        if (t < p.ini) return null;
        const a = tramo(f, p.ini * fps, p.ini * fps + 6, rebota);
        const clave = esClave(p, claves);
        return (
          <span key={i} style={{ display: "inline-block", marginRight: "0.26em", transform: `translateY(${(1 - a) * 18}px) scale(${0.9 + a * 0.1})`, opacity: Math.min(1, a * 1.5), fontFamily: clave && fuenteClave ? fuenteClave : fuente, fontStyle: clave ? "italic" : "normal", fontWeight: clave ? 400 : 600, color: clave ? acento : color, fontSize: clave ? tam * 1.12 : tam }}>
            {p.texto}
          </span>
        );
      })}
    </div>
  );
};

/** frase que se arma arriba, en dos tonos: lo ya dicho más tenue, la palabra que suena entera (historia plana) */
export const SubtituloSuave: React.FC<Props & { oscuro: boolean }> = ({ fs, claves, y, fuente, acento = "#7C4DFF", tam = 60, ancho = 920, oscuro }) => {
  const f = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const t = f / fps;
  const fr = fraseEn(fs, t);
  if (!fr) return null;
  const base = oscuro ? "#FFFFFF" : "#1D1A24";
  return (
    <div style={{ position: "absolute", left: (width - ancho) / 2, width: ancho, top: y, textAlign: "center", fontFamily: fuente, fontSize: tam, fontWeight: 700, lineHeight: 1.18, letterSpacing: -0.5, textShadow: oscuro ? "0 4px 24px rgba(0,0,0,0.45)" : "0 2px 18px rgba(255,255,255,0.6)" }}>
      {fr.palabras.map((p, i) => {
        if (t < p.ini) return null;
        const a = tramo(f, p.ini * fps, p.ini * fps + 5);
        const clave = esClave(p, claves);
        return (
          <span key={i} style={{ display: "inline-block", marginRight: "0.25em", opacity: a, transform: `translateY(${(1 - a) * 12}px)`, color: clave ? acento : base }}>
            {p.texto}
          </span>
        );
      })}
    </div>
  );
};

const PAPELES = [
  { fondo: "#FFFFFF", texto: "#1B1B1B" },
  { fondo: "#FF7A1A", texto: "#1B1B1B" },
  { fondo: "#FFD23F", texto: "#1B1B1B" },
  { fondo: "#F4EBDD", texto: "#1B1B1B" },
];

/** cada palabra es un recorte de papel que se pega cuando se dice (lista con recortes) */
export const SubtituloRecortes: React.FC<Props> = ({ fs, claves, y, fuente, tam = 66, ancho = 960 }) => {
  const f = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const t = f / fps;
  const fr = fraseEn(fs, t);
  if (!fr) return null;
  return (
    <div style={{ position: "absolute", left: (width - ancho) / 2, width: ancho, top: y, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "10px 12px" }}>
      {fr.palabras.map((p, i) => {
        if (t < p.ini) return null;
        const semilla = Math.round(fr.ini * 100) + i * 7;
        const a = tramo(f, p.ini * fps, p.ini * fps + 5, rebota);
        const clave = esClave(p, claves);
        const papel = clave ? PAPELES[1] : PAPELES[Math.floor(azar(semilla) * 4) === 1 ? 0 : Math.floor(azar(semilla) * 4)];
        const giro = (azar(semilla + 3) - 0.5) * 6;
        return (
          <span key={i} style={{ display: "inline-block", background: papel.fondo, color: papel.texto, fontFamily: fuente, fontSize: tam, fontWeight: 400, lineHeight: 1, padding: "10px 16px 14px", clipPath: rasgadoPct(semilla, 1.4, 6), transform: `rotate(${giro}deg) scale(${0.5 + a * 0.5})`, opacity: Math.min(1, a * 2), boxShadow: "0 6px 0 rgba(0,0,0,0.25)" }}>
            {p.texto.replace(/[.,;:]+$/, "")}
          </span>
        );
      })}
    </div>
  );
};
