// Videos sin rostro · piezas de interfaz (pantallas, tarjetas, contadores) que cuentan lo que dice la voz.
// Ninguna es un botón falso ni lleva cursor que toca: se pueden usar en anuncios de Meta.
import * as Lucide from "lucide-react";
import React from "react";
import { Video } from "@remotion/media";
import { Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { rebota, ruta, tramo } from "./base";

const SOMBRA = "0 18px 50px rgba(30,25,40,0.18), 0 2px 6px rgba(30,25,40,0.08)";

/** ícono de Lucide por nombre («Folder», «Clock»…); si el nombre no existe, un círculo */
export const Icono: React.FC<{ nombre: string; tam?: number; color?: string; grosor?: number }> = ({ nombre, tam = 64, color = "currentColor", grosor = 2.2 }) => {
  const C = (Lucide as unknown as Record<string, React.FC<{ size?: number; color?: string; strokeWidth?: number }>>)[nombre] ?? Lucide.Circle;
  return <C size={tam} color={color} strokeWidth={grosor} />;
};

/** aparición estándar de una pieza: sube y crece con rebote */
export const useAparece = (desde: number, dur = 12) => {
  const f = useCurrentFrame();
  const a = tramo(f, desde, desde + dur, rebota);
  return { a, estilo: { opacity: Math.min(1, tramo(f, desde, desde + 5) * 1.2), transform: `translateY(${(1 - a) * 40}px) scale(${0.85 + a * 0.15})` } as React.CSSProperties, visible: f >= desde };
};

/** terminal oscura donde se escribe una orden letra por letra; `lineas` siguientes aparecen ya escritas */
export const Terminal: React.FC<{ orden: string; lineas?: readonly string[]; desde?: number; ancho?: number; titulo?: string; acento?: string; cps?: number }> = ({
  orden, lineas = [], desde = 0, ancho = 860, titulo = "claude", acento = "#D97757", cps = 26,
}) => {
  const f = useCurrentFrame();
  const { estilo } = useAparece(desde);
  const escritas = Math.floor(Math.max(0, f - desde - 8) * (cps / 30));
  const visible = orden.slice(0, escritas);
  const fin = desde + 8 + (orden.length / cps) * 30;
  return (
    <div style={{ width: ancho, borderRadius: 26, background: "#1E1D24", boxShadow: SOMBRA, overflow: "hidden", ...estilo }}>
      <div style={{ height: 54, display: "flex", alignItems: "center", gap: 10, padding: "0 22px", background: "#2A2932" }}>
        {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <div key={c} style={{ width: 15, height: 15, borderRadius: 8, background: c }} />)}
        <div style={{ marginLeft: 14, fontSize: 22, color: "#9A97A8", fontFamily: "monospace" }}>{titulo}</div>
      </div>
      <div style={{ padding: "26px 30px 34px", fontFamily: "'JetBrains Mono', monospace", fontSize: 30, color: "#EDEAF5", lineHeight: 1.5 }}>
        <div>
          <span style={{ color: acento }}>›</span> {visible}
          <span style={{ opacity: Math.floor(f / 8) % 2 ? 1 : 0, color: acento }}>▍</span>
        </div>
        {lineas.map((l, i) => {
          const t = tramo(f, fin + 6 + i * 8, fin + 12 + i * 8);
          return <div key={i} style={{ opacity: t, color: "#9A97A8", fontSize: 25, transform: `translateX(${(1 - t) * -12}px)` }}>{l}</div>;
        })}
      </div>
    </div>
  );
};

/** lista que se va marcando ✓ (pasos, requisitos, entregables) */
export const Checklist: React.FC<{ items: readonly { texto: string; en: number }[]; desde?: number; ancho?: number; acento?: string; titulo?: string }> = ({
  items, desde = 0, ancho = 780, acento = "#E53935", titulo,
}) => {
  const f = useCurrentFrame();
  const { estilo } = useAparece(desde);
  return (
    <div style={{ width: ancho, borderRadius: 28, background: "#fff", boxShadow: SOMBRA, padding: "30px 36px", boxSizing: "border-box", ...estilo }}>
      {titulo ? <div style={{ fontSize: 24, fontWeight: 700, color: "#9B96A5", letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>{titulo}</div> : null}
      {items.map((it, i) => {
        const marca = tramo(f, it.en, it.en + 8, rebota);
        const aparece = tramo(f, desde + 4 + i * 3, desde + 12 + i * 3);
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 22, padding: "14px 0", borderTop: i ? "1.5px solid #F0EDF3" : undefined, opacity: aparece }}>
            <div style={{ width: 46, height: 46, borderRadius: 23, border: `3px solid ${marca > 0.5 ? acento : "#D9D5DF"}`, background: marca > 0.5 ? acento : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${0.8 + marca * 0.2})` }}>
              {marca > 0.3 ? <Icono nombre="Check" tam={28} color="#fff" grosor={3.5} /> : null}
            </div>
            <div style={{ fontSize: 36, fontWeight: 600, color: marca > 0.5 ? "#1D1A24" : "#8D889A" }}>{it.texto}</div>
          </div>
        );
      })}
    </div>
  );
};

/** celular con una pantalla: un título grande, un número o una lista corta */
export const Celular: React.FC<{ desde?: number; alto?: number; titulo?: string; subtitulo?: string; icono?: string; acento?: string; fondo?: string }> = ({
  desde = 0, alto = 820, titulo, subtitulo, icono, acento = "#E53935", fondo = "#FFF8F2",
}) => {
  const { estilo } = useAparece(desde);
  const ancho = alto * 0.49;
  return (
    <div style={{ width: ancho, height: alto, borderRadius: ancho * 0.16, background: "#16151C", padding: 14, boxSizing: "border-box", boxShadow: SOMBRA, ...estilo }}>
      <div style={{ width: "100%", height: "100%", borderRadius: ancho * 0.13, background: fondo, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 30, boxSizing: "border-box", textAlign: "center" }}>
        <div style={{ position: "absolute", top: 14, width: ancho * 0.3, height: 26, borderRadius: 13, background: "#16151C" }} />
        {icono ? <div style={{ width: 120, height: 120, borderRadius: 34, background: acento, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 26 }}><Icono nombre={icono} tam={66} color="#fff" /></div> : null}
        {titulo ? <div style={{ fontSize: 50, fontWeight: 800, color: "#1D1A24", lineHeight: 1.05 }}>{titulo}</div> : null}
        {subtitulo ? <div style={{ fontSize: 28, color: "#6E687D", marginTop: 14 }}>{subtitulo}</div> : null}
      </div>
    </div>
  );
};

/** contador que sube (seguidores, ventas, horas…): el número rueda de `de` a `a` */
export const Contador: React.FC<{ de?: number; a: number; desde?: number; dura?: number; etiqueta?: string; prefijo?: string; sufijo?: string; acento?: string; ancho?: number }> = ({
  de = 0, a, desde = 0, dura = 30, etiqueta, prefijo = "", sufijo = "", acento = "#E53935", ancho = 640,
}) => {
  const f = useCurrentFrame();
  const { estilo } = useAparece(desde);
  const v = interpolate(tramo(f, desde + 6, desde + 6 + dura), [0, 1], [de, a]);
  const golpe = tramo(f, desde + 6 + dura, desde + 12 + dura, rebota);
  const fmt = (n: number) => (a >= 1000 ? Math.round(n).toLocaleString("es-ES") : n % 1 ? n.toFixed(1) : Math.round(n).toString());
  return (
    <div style={{ width: ancho, borderRadius: 30, background: "#fff", boxShadow: SOMBRA, padding: "34px 40px", boxSizing: "border-box", textAlign: "center", ...estilo }}>
      <div style={{ fontSize: 150, fontWeight: 800, color: acento, lineHeight: 1, transform: `scale(${1 + golpe * 0.06 - (golpe > 0.99 ? 0.06 : 0)})`, fontVariantNumeric: "tabular-nums" }}>
        {prefijo}{fmt(v)}{sufijo}
      </div>
      {etiqueta ? <div style={{ fontSize: 34, fontWeight: 600, color: "#6E687D", marginTop: 10 }}>{etiqueta}</div> : null}
    </div>
  );
};

/** tarjeta de puntaje (revisión): número sobre 10, barra y una etiqueta (DÉBIL / BIEN / LISTO) */
export const Puntaje: React.FC<{ valor: number; desde?: number; etiqueta?: string; acento?: string }> = ({ valor, desde = 0, etiqueta, acento = "#E53935" }) => {
  const f = useCurrentFrame();
  const { estilo } = useAparece(desde);
  const v = interpolate(tramo(f, desde + 6, desde + 30), [0, 1], [0, valor]);
  const color = valor >= 8 ? "#2E7D32" : valor >= 6 ? "#F9A825" : acento;
  return (
    <div style={{ width: 560, borderRadius: 30, background: "#fff", boxShadow: SOMBRA, padding: "30px 38px", boxSizing: "border-box", ...estilo }}>
      <div style={{ fontSize: 24, fontWeight: 700, color: "#9B96A5", letterSpacing: 2 }}>PUNTAJE</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        <div style={{ fontSize: 130, fontWeight: 800, color, lineHeight: 1.05 }}>{v.toFixed(1)}</div>
        <div style={{ fontSize: 44, fontWeight: 700, color: "#B5B0BE" }}>/10</div>
      </div>
      <div style={{ height: 14, borderRadius: 7, background: "#EEEAF2", overflow: "hidden" }}><div style={{ width: `${v * 10}%`, height: "100%", background: color }} /></div>
      {etiqueta ? <div style={{ display: "inline-block", marginTop: 18, padding: "8px 18px", borderRadius: 10, background: color, color: "#fff", fontSize: 26, fontWeight: 800 }}>{etiqueta}</div> : null}
    </div>
  );
};

/** calendario de un mes que se va tachando hasta el día `hasta` */
export const Calendario: React.FC<{ hasta: number; desde?: number; dura?: number; titulo?: string; acento?: string }> = ({ hasta, desde = 0, dura = 30, titulo, acento = "#E53935" }) => {
  const f = useCurrentFrame();
  const { estilo } = useAparece(desde);
  const n = Math.floor(interpolate(tramo(f, desde + 6, desde + 6 + dura), [0, 1], [0, hasta]));
  return (
    <div style={{ width: 620, borderRadius: 28, background: "#fff", boxShadow: SOMBRA, padding: 30, boxSizing: "border-box", ...estilo }}>
      {titulo ? <div style={{ fontSize: 30, fontWeight: 800, color: acento, marginBottom: 16 }}>{titulo}</div> : null}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} style={{ height: 62, borderRadius: 10, background: i < n ? acento : "#F1EEF4", color: i < n ? "#fff" : "#9B96A5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 700 }}>{i + 1}</div>
        ))}
      </div>
    </div>
  );
};

/** caja de comentario donde se escribe la palabra clave (cierre «comenta PALABRA»): sin botón «Publicar» */
export const Comentario: React.FC<{ palabra: string; desde?: number; acento?: string; invitacion?: string }> = ({ palabra, desde = 0, acento = "#E53935", invitacion = "Añade un comentario…" }) => {
  const f = useCurrentFrame();
  const { estilo } = useAparece(desde);
  const n = Math.floor(Math.max(0, f - desde - 10) / 3);
  const txt = palabra.slice(0, n);
  return (
    <div style={{ width: 820, borderRadius: 60, background: "#fff", boxShadow: SOMBRA, padding: "24px 34px", boxSizing: "border-box", display: "flex", alignItems: "center", gap: 22, ...estilo }}>
      <div style={{ width: 70, height: 70, borderRadius: 35, background: "#E6E2EB", flexShrink: 0 }} />
      <div style={{ fontSize: txt ? 62 : 34, fontWeight: 800, color: txt ? acento : "#A9A4B3", letterSpacing: txt ? 2 : 0 }}>
        {txt || invitacion}
        {txt && n <= palabra.length ? <span style={{ opacity: Math.floor(f / 8) % 2 ? 1 : 0 }}>|</span> : null}
      </div>
    </div>
  );
};

/** tarjeta con ícono, título y texto corto (problema, solución, beneficio) */
export const Tarjeta: React.FC<{ icono?: string; titulo: string; texto?: string; desde?: number; ancho?: number; acento?: string; tachar?: number }> = ({
  icono, titulo, texto, desde = 0, ancho = 760, acento = "#E53935", tachar,
}) => {
  const f = useCurrentFrame();
  const { estilo } = useAparece(desde);
  const t = tachar !== undefined ? tramo(f, tachar, tachar + 8) : 0;
  return (
    <div style={{ width: ancho, borderRadius: 28, background: "#fff", boxShadow: SOMBRA, padding: "28px 34px", boxSizing: "border-box", display: "flex", alignItems: "center", gap: 26, position: "relative", ...estilo }}>
      {icono ? <div style={{ width: 92, height: 92, borderRadius: 24, background: `${acento}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icono nombre={icono} tam={50} color={acento} /></div> : null}
      <div>
        <div style={{ fontSize: 40, fontWeight: 800, color: "#1D1A24", lineHeight: 1.1 }}>{titulo}</div>
        {texto ? <div style={{ fontSize: 28, color: "#6E687D", marginTop: 6 }}>{texto}</div> : null}
      </div>
      {t > 0 ? <div style={{ position: "absolute", left: 24, top: "50%", height: 8, borderRadius: 4, background: acento, width: `${t * 92}%` }} /> : null}
    </div>
  );
};

/**
 * Imagen o VIDEO del usuario dentro de una escena (su grabación, una captura, un clip hecho con otra IA). El video va
 * mudo (manda la voz del plan), recortado para llenar el marco y, si es más corto que la escena, vuelve a empezar.
 * `desde` = segundo del clip donde empieza. Rutas dentro de public/.
 */
export const Medio: React.FC<{ imagen?: string; video?: string; desde?: number; ajuste?: "cover" | "contain"; estilo?: React.CSSProperties }> = ({ imagen, video, desde = 0, ajuste = "cover", estilo }) => {
  const { fps } = useVideoConfig();
  const css: React.CSSProperties = { width: "100%", height: "100%", objectFit: ajuste, display: "block", ...estilo };
  if (video) {
    return <Video src={ruta(video)} muted loop trimBefore={Math.round(desde * fps)} objectFit={ajuste} style={css} />;
  }
  if (imagen) return <Img src={ruta(imagen)} style={css} />;
  return null;
};

/** insignia de paso (1, 2, 3…) que golpea al cambiar */
export const Paso: React.FC<{ n: number; desde?: number; acento?: string }> = ({ n, desde = 0, acento = "#1D1A24" }) => {
  const f = useCurrentFrame();
  const a = tramo(f, desde, desde + 10, rebota);
  return (
    <div style={{ width: 84, height: 84, borderRadius: 18, background: acento, color: "#fff", fontSize: 52, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${0.4 + a * 0.6}) rotate(${(1 - a) * -20}deg)`, boxShadow: SOMBRA }}>{n}</div>
  );
};
