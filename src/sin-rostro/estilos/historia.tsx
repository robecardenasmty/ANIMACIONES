// Estilo «Historia animada»: un personaje dibujado vive el problema en su escritorio (el día se hace noche, el cliente
// escribe) y luego pasa a «otro mundo» (aurora) donde aparece la solución. Dolor → solución → resultado.
import React from "react";
import { interpolate } from "remotion";
import { Escena, Palabra, Pose, tramo, useEscena, usePlan, enEscena } from "../base";
import { Aurora, Burbuja, Carpeta, Confeti, Hora, Monitor, Perilla, Personaje, Planta, Reloj, Taza, Ventana } from "../ilustracion";
import { Icono, useAparece } from "../interfaz";
import { EditorHistoria, GanchoHistoria } from "./historia-editor";

const PARED: Record<Hora, string> = { dia: "#E9E4F7", tarde: "#EBD9D3", noche: "#26244A" };

export const historiaOscura = (e: Escena) =>
  // todas las escenas son oscuras salvo el escritorio de día o de tarde (la pantalla también va sobre fondo oscuro)
  e.tipo === "escritorio" ? (e.hacia ?? e.hora) === "noche" : true;

/** monitorSecuencia: { carpeta, de, a } = PNG numerados con el cuadro del video (0000.png…; p. ej. una toma de Blender
 * renderizada de «de» a «a»); antes de «de» y después de «a» se queda en el primero o el último. Una imagen fija: de = a. */
const imagenMonitor = (e: Escena, f: number, fps: number): string | undefined => {
  const s = e.monitorSecuencia as { carpeta: string; de: number; a: number } | undefined;
  if (!s) return undefined;
  const n = Math.max(s.de, Math.min(s.a, Math.round(e.desde * fps) + f));
  return `${s.carpeta.replace(/\/$/, "")}/${String(n).padStart(4, "0")}.png`;
};

/** el personaje está hablando si suena una palabra en este segundo */
const hablaEn = (ps: readonly Palabra[], t: number) => ps.some((p) => t >= p.ini && t <= p.fin);

const Escritorio: React.FC<{ e: Escena; ps: readonly Palabra[] }> = ({ e, ps }) => {
  const plan = usePlan();
  const { f, fps, dur } = useEscena(e);
  const hora = (e.hora as Hora) ?? "dia";
  const hacia = e.hacia as Hora | undefined;
  const mezcla = hacia ? tramo(f, 0, dur * 0.8) : 0;
  const pared = hacia && mezcla > 0.5 ? PARED[hacia] : PARED[hora];
  const mensajes = (e.mensajes as { texto: string; en: number; quien?: string }[] | undefined) ?? [];
  const pose = (e.pose as Pose) ?? "normal";
  const habla = e.habla === true && hablaEn(ps, e.desde + f / fps);
  return (
    <div style={{ position: "absolute", inset: 0, background: pared }}>
      {/* luz de la ventana sobre la pared */}
      <div style={{ position: "absolute", right: 40, top: 500, width: 640, height: 480, borderRadius: 30, background: "rgba(255,255,255,0.18)", filter: "blur(30px)" }} />
      <div style={{ position: "absolute", right: 60, top: 520 }}>
        <Ventana hora={hora} hacia={hacia} mezcla={mezcla} ancho={600} alto={440} />
      </div>
      <div style={{ position: "absolute", left: 70, top: 540 }}>
        <Reloj r={100} horas={(e.horas as number) ?? (hacia ? 6 : 0.5)} progreso={tramo(f, 0, dur)} />
      </div>
      <div style={{ position: "absolute", left: 100, top: 790 }}><Planta alto={200} /></div>
      {/* mensajes del cliente (o frases que el personaje piensa) */}
      <div style={{ position: "absolute", right: 70, top: 470, display: "flex", flexDirection: "column", gap: 22, alignItems: "flex-end" }}>
        {mensajes.map((m, i) => (
          <Burbuja key={i} texto={m.texto} quien={m.quien} desde={enEscena(e, m.en, fps)} lado="der" ancho={600} />
        ))}
      </div>
      {/* personaje detrás del escritorio */}
      <div style={{ position: "absolute", left: 20, top: 1020 }}>
        <Personaje datos={plan.marca?.personaje} pose={pose} habla={habla} ancho={540} semilla={2} />
      </div>
      {/* escritorio y monitor */}
      <div style={{ position: "absolute", left: 470, top: 1080 }}>
        <Monitor ancho={580} contenido={(e.monitor as "edicion" | "vacio" | "texto") ?? "edicion"} texto={e.textoMonitor as string} acento={plan.marca?.acento} imagen={imagenMonitor(e, f, fps)} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1510, height: 80, background: "#8C6A5C" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1590, bottom: 0, background: "#6E5146" }} />
      <div style={{ position: "absolute", left: 390, top: 1420 }}><Taza alto={96} /></div>
      {pose === "celebra" ? <Confeti desde={8} /> : null}
    </div>
  );
};

/** un monitor gigante: lo que ve el personaje (videos que salen básicos, un logo genérico…) */
const Pantalla: React.FC<{ e: Escena }> = ({ e }) => {
  const { f, fps, dur } = useEscena(e);
  const z = interpolate(f, [0, dur], [1, 1.08]);
  return (
    <div style={{ position: "absolute", inset: 0, background: "#1C1A33", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ transform: `scale(${z})`, marginTop: 160 }}>
        <Monitor ancho={900} contenido="texto" texto={(e.texto as string) ?? "LOGO"} imagen={imagenMonitor(e, f, fps)} />
      </div>
    </div>
  );
};

/** el «otro mundo»: aurora, y la solución (título, carpeta, perillas o tarjetas de resultado) */
const Mundo: React.FC<{ e: Escena }> = ({ e }) => {
  const plan = usePlan();
  const acento = plan.marca?.acento ?? "#7C4DFF";
  const { fps } = useEscena(e);
  const en = (seg?: unknown) => (typeof seg === "number" ? enEscena(e, seg, fps) : 6);
  const titulo = useAparece(en(e.tituloEn), 14);
  const icono = useAparece(4, 14);
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Aurora />
      {e.tipo === "mundo" ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 560, height: 1040, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 40 }}>
          {e.icono ? (
            <div style={{ ...icono.estilo, width: 240, height: 240, borderRadius: 64, background: acento, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 90px ${acento}` }}>
              <Icono nombre={e.icono as string} tam={130} color="#fff" />
            </div>
          ) : null}
          {e.titulo ? <div style={{ ...titulo.estilo, fontSize: 118, fontWeight: 800, color: "#fff", textAlign: "center", padding: "0 70px", lineHeight: 1.05, textShadow: `0 0 40px ${acento}` }}>{e.titulo as string}</div> : null}
        </div>
      ) : null}
      {e.tipo === "carpeta" ? (
        <div style={{ position: "absolute", left: 300, top: 900, transform: "scale(1.6)", transformOrigin: "50% 30%" }}>
          <Carpeta nombre={(e.nombre as string) ?? "mi-skill"} archivos={(e.archivos as string[]) ?? []} desde={en(e.abreEn)} acento="#5B8DEF" ancho={300} />
        </div>
      ) : null}
      {e.tipo === "perillas" ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 560, height: 1040, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 34 }}>
          {((e.perillas as { etiqueta: string; valor: number; en?: number; nota?: string }[]) ?? []).map((p, i) => (
            <PerillaEntrando key={i} p={p} desde={en(p.en)} acento={acento} />
          ))}
        </div>
      ) : null}
      {e.tipo === "resultado" ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 560, height: 1040, display: "flex", flexWrap: "wrap", alignContent: "center", justifyContent: "center", gap: 34, padding: "0 50px" }}>
          {((e.tarjetas as { titulo: string; icono?: string; en?: number }[]) ?? []).map((t, i) => (
            <TarjetaMundo key={i} t={t} desde={en(t.en) + i * 2} acento={acento} />
          ))}
        </div>
      ) : null}
    </div>
  );
};

const PerillaEntrando: React.FC<{ p: { etiqueta: string; valor: number; nota?: string }; desde: number; acento: string }> = ({ p, desde, acento }) => {
  const { estilo, visible } = useAparece(desde);
  if (!visible) return null;
  return <div style={estilo}><Perilla etiqueta={p.etiqueta} valor={p.valor} nota={p.nota} desde={desde + 6} acento={acento} ancho={960} /></div>;
};

const TarjetaMundo: React.FC<{ t: { titulo: string; icono?: string }; desde: number; acento: string }> = ({ t, desde, acento }) => {
  const { estilo, visible } = useAparece(desde);
  if (!visible) return null;
  return (
    <div style={{ ...estilo, width: 455, height: 340, borderRadius: 34, background: "rgba(255,255,255,0.94)", boxShadow: `0 20px 60px rgba(0,0,0,0.35)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18 }}>
      {t.icono ? <Icono nombre={t.icono} tam={110} color={acento} /> : null}
      <div style={{ fontSize: 48, fontWeight: 800, color: "#1D1A24", textAlign: "center", padding: "0 20px", lineHeight: 1.1 }}>{t.titulo}</div>
    </div>
  );
};

export const EscenaHistoria: React.FC<{ e: Escena; ps: readonly Palabra[] }> = ({ e, ps }) => {
  if (e.tipo === "escritorio") return <Escritorio e={e} ps={ps} />;
  if (e.tipo === "pantalla") return <Pantalla e={e} />;
  if (e.tipo === "gancho") return <GanchoHistoria e={e} />;
  if (e.tipo === "editor") return <EditorHistoria e={e} ps={ps} />;
  return <Mundo e={e} />;
};
