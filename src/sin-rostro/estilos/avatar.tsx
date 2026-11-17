// Estilo «Avatar + interfaz»: tu personaje dibujado (o tu avatar de IA en PNG) fijo abajo, hablando, y arriba las
// pantallas que explican lo que dices, paso a paso. Fondo claro de papel con trama de puntos.
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { Escena, Palabra, Pose, enEscena, rebota, tramo, useEscena, usePlan } from "../base";
import { Carpeta, Personaje } from "../ilustracion";
import { Calendario, Celular, Checklist, Comentario, Contador, Medio, Paso, Puntaje, Tarjeta, Terminal } from "../interfaz";

const hablaEn = (ps: readonly Palabra[], t: number) => ps.some((p) => t >= p.ini && t <= p.fin);

/** fondo fijo de todo el video (no cambia entre escenas: el personaje no salta) */
export const FondoAvatar: React.FC = () => (
  <div style={{ position: "absolute", inset: 0, background: "#F4F1EA", backgroundImage: "radial-gradient(rgba(40,30,20,0.08) 2px, transparent 2px)", backgroundSize: "34px 34px" }} />
);

/** el personaje vive fuera de las escenas: siempre en su lugar, cambia de pose según la escena que suena */
export const PersonajeFijo: React.FC<{ escenas: readonly Escena[]; ps: readonly Palabra[]; fps: number }> = ({ escenas, ps, fps }) => {
  const plan = usePlan();
  const f = useCurrentFrame();
  const t = f / fps;
  const e = escenas.find((x) => t >= x.desde && t < x.hasta);
  const pose = (e?.pose as Pose) ?? "explica";
  const desdePose = e ? Math.round(e.desde * fps) : 0;
  return (
    <div style={{ position: "absolute", left: "50%", top: 1290, transform: "translateX(-50%)" }}>
      <Personaje datos={plan.marca?.personaje} pose={pose} habla={hablaEn(ps, t)} ancho={560} desdePose={desdePose} semilla={3} />
    </div>
  );
};

/** gancho: palabras gigantes que golpean una por una con acercamiento (los primeros segundos rompen el scroll) */
const Gancho: React.FC<{ e: Escena }> = ({ e }) => {
  const plan = usePlan();
  const acento = plan.marca?.acento ?? "#E53935";
  const { f, fps } = useEscena(e);
  const lineas = (e.lineas as { texto: string; en: number; clave?: boolean }[]) ?? [];
  const ultima = lineas.filter((l) => f >= enEscena(e, l.en, fps)).length - 1;
  const golpe = ultima >= 0 ? tramo(f, enEscena(e, lineas[ultima].en, fps), enEscena(e, lineas[ultima].en, fps) + 8) : 1;
  const zoom = 1 + (1 - golpe) * 0.08;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 260, height: 900, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transform: `scale(${zoom})` }}>
      {lineas.map((l, i) => {
        const d = enEscena(e, l.en, fps);
        if (f < d) return null;
        const a = tramo(f, d, d + 7, rebota);
        return (
          <div key={i} style={{ fontFamily: l.clave ? "'Instrument Serif', serif" : "'Inter Tight', sans-serif", fontStyle: l.clave ? "italic" : "normal", fontWeight: l.clave ? 400 : 800, fontSize: l.clave ? 190 : 150, lineHeight: 0.95, letterSpacing: l.clave ? -2 : -5, color: l.clave ? acento : "#1D1A24", transform: `scale(${2.2 - a * 1.2})`, opacity: Math.min(1, a * 2), filter: `blur(${(1 - a) * 6}px)` }}>
            {l.texto}
          </div>
        );
      })}
    </div>
  );
};

/** zona de las pantallas: entre el subtítulo y la cabeza del personaje */
const ZONA = { top: 500, alto: 760 };

const Pieza: React.FC<{ e: Escena }> = ({ e }) => {
  const plan = usePlan();
  const acento = plan.marca?.acento ?? "#E53935";
  const { fps } = useEscena(e);
  const en = (s: unknown, def = 4) => (typeof s === "number" ? enEscena(e, s, fps) : def);
  switch (e.tipo) {
    case "terminal":
      return <Terminal orden={e.orden as string} lineas={(e.lineas as string[]) ?? []} desde={en(e.en)} />;
    case "checklist":
      return <Checklist titulo={e.titulo as string} acento={acento} desde={en(e.en)} items={((e.items as { texto: string; en: number }[]) ?? []).map((x) => ({ texto: x.texto, en: en(x.en) }))} />;
    case "celular":
      return <Celular titulo={e.titulo as string} subtitulo={e.subtitulo as string} icono={e.icono as string} acento={acento} desde={en(e.en)} alto={720} />;
    case "contador":
      return <Contador a={e.a as number} de={e.de as number} etiqueta={e.etiqueta as string} prefijo={e.prefijo as string} sufijo={e.sufijo as string} acento={acento} desde={en(e.en)} />;
    case "puntaje":
      return <Puntaje valor={e.valor as number} etiqueta={e.etiqueta as string} acento={acento} desde={en(e.en)} />;
    case "calendario":
      return <Calendario hasta={e.hasta as number} titulo={e.titulo as string} acento={acento} desde={en(e.en)} />;
    case "carpeta":
      return <div style={{ transform: "scale(1.5)" }}><Carpeta nombre={e.nombre as string} archivos={(e.archivos as string[]) ?? []} desde={en(e.en)} acento="#5B8DEF" /></div>;
    case "medio":
      return (
        <div style={{ width: 400, height: 760, borderRadius: 64, background: "#16151C", padding: 14, boxSizing: "border-box", boxShadow: "0 18px 50px rgba(30,25,40,0.25)" }}>
          <div style={{ width: "100%", height: "100%", borderRadius: 52, overflow: "hidden" }}><Medio imagen={e.imagen as string} video={e.video as string} desde={e.desdeClip as number} /></div>
        </div>
      );
    case "comentario":
      return <Comentario palabra={e.palabra as string} acento={acento} desde={en(e.en)} />;
    case "tarjetas":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {((e.items as { icono?: string; titulo: string; texto?: string; en?: number; tachar?: number }[]) ?? []).map((x, i) => (
            <Tarjeta key={i} icono={x.icono} titulo={x.titulo} texto={x.texto} acento={acento} desde={en(x.en, 4 + i * 6)} tachar={x.tachar !== undefined ? en(x.tachar) : undefined} />
          ))}
        </div>
      );
    default:
      return null;
  }
};

export const EscenaAvatar: React.FC<{ e: Escena }> = ({ e }) => {
  const { f, fps } = useEscena(e);
  if (e.tipo === "gancho") return <Gancho e={e} />;
  const flota = interpolate(Math.sin(f / fps * 1.4), [-1, 1], [-6, 6]);
  return (
    <>
      <div style={{ position: "absolute", left: 0, right: 0, top: ZONA.top, height: ZONA.alto, display: "flex", alignItems: "center", justifyContent: "center", transform: `translateY(${flota}px) scale(1.18)` }}>
        <Pieza e={e} />
      </div>
      {typeof e.paso === "number" ? (
        <div style={{ position: "absolute", right: 70, top: ZONA.top - 30 }}><Paso n={e.paso as number} desde={4} /></div>
      ) : null}
    </>
  );
};
