// Videos sin rostro · ilustraciones planas hechas en código (SVG): el personaje, la habitación y los objetos.
// Diseño propio: formas simples, colores planos, una sombra suave. Nada copiado de otros videos.
import React from "react";
import { Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { azar, Personaje as DatosPersonaje, Pose, ruta, tramo } from "./base";

// ───────────────────────── el personaje ─────────────────────────

const PIEL = "#F2C3A0";
const PELO = "#2B2238";
const ROPA = "#3D5AFE";

/**
 * Personaje de busto (cintura hacia arriba), 400×520 en su propio sistema. `habla` abre y cierra la boca;
 * `pose` cambia brazos, cejas y boca. Respira, parpadea y se balancea apenas: nunca está congelado.
 * Si el plan trae un PNG para la pose (avatar propio generado con IA), se usa ese en lugar del dibujo.
 */
export const Personaje: React.FC<{ datos?: DatosPersonaje; pose?: Pose; habla?: boolean; ancho?: number; semilla?: number; desdePose?: number }> = ({
  datos = {}, pose = "normal", habla = false, ancho = 400, semilla = 1, desdePose = 0,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  // con avatar propio: la pose pedida o, si falta, la pose normal
  const png = datos.poses?.[pose] ?? datos.poses?.normal;
  const resp = Math.sin((f / fps) * Math.PI * 0.9 + semilla) * 4;
  const gesto = tramo(f, desdePose, desdePose + 8);
  if (png) {
    return (
      <div style={{ width: ancho, transform: `translateY(${resp}px) scale(${0.96 + gesto * 0.04})`, transformOrigin: "50% 100%" }}>
        <Img src={ruta(png)} style={{ width: "100%", display: "block" }} />
      </div>
    );
  }
  const piel = datos.piel ?? PIEL;
  const pelo = datos.pelo ?? PELO;
  const ropa = datos.ropa ?? ROPA;
  // parpadeo: 4 fotogramas cada ~3,3 s (desfasado por semilla)
  const ciclo = (f + Math.round(semilla * 37)) % Math.round(fps * 3.3);
  const ojo = ciclo < 4 ? 0.12 : pose === "cansado" ? 0.45 : 1;
  // boca al hablar: abre y cierra a ~6 golpes por segundo, con algo de azar
  const abre = habla ? 0.35 + 0.65 * Math.abs(Math.sin((f / fps) * Math.PI * 6 + azar(Math.floor(f / 3)) * 1.4)) : 0;
  const ladeo = pose === "piensa" ? -4 : pose === "cansado" ? 5 : pose === "sorprendido" ? -2 : Math.sin((f / fps) * 1.3 + semilla) * 1.2;
  const cejas = pose === "sorprendido" ? -10 : pose === "piensa" ? -4 : pose === "cansado" ? 4 : pose === "celebra" ? -6 : 0;

  const brazo = (lado: 1 | -1) => {
    // ángulos (grados) del brazo y antebrazo por pose; lado 1 = derecha del personaje (izquierda en pantalla)
    const t: Record<Pose, [number, number]> = {
      normal: [8, 0], cansado: [4, 0], explica: [30, -60], senala: lado === -1 ? [145, 15] : [10, 0],
      celebra: [150, 25], piensa: lado === 1 ? [-20, -140] : [10, 0], sorprendido: [-30, -135],
    };
    const [hombro, codo] = t[pose];
    const h = hombro * gesto + 8 * (1 - gesto);
    const c = codo * gesto;
    const x = 200 + lado * 92;
    return (
      <g transform={`translate(${x} 318) scale(${lado} 1) rotate(${-h})`}>
        <rect x={-21} y={-6} width={42} height={98} rx={21} fill={ropa} />
        <g transform={`translate(0 86) rotate(${-c})`}>
          <rect x={-18} y={-8} width={36} height={86} rx={18} fill={ropa} />
          <circle cx={0} cy={86} r={22} fill={piel} />
          {pose === "senala" && lado === -1 ? <rect x={-6} y={96} width={12} height={34} rx={6} fill={piel} /> : null}
        </g>
      </g>
    );
  };

  const peinado = datos.peinado ?? "corto";
  return (
    <svg viewBox="0 0 400 520" width={ancho} style={{ display: "block", overflow: "visible", transform: `translateY(${resp}px)` }}>
      {/* sombra suave en el suelo */}
      <ellipse cx={200} cy={512} rx={150} ry={12} fill="rgba(0,0,0,0.12)" />
      {/* brazos de atrás */}
      {pose === "celebra" || pose === "sorprendido" || pose === "explica" ? null : brazo(1)}
      {/* torso */}
      <path d="M 92 330 Q 92 290 140 282 L 260 282 Q 308 290 308 330 L 318 520 L 82 520 Z" fill={ropa} />
      <path d="M 170 282 L 200 318 L 230 282 Z" fill="rgba(255,255,255,0.85)" />
      {/* cuello */}
      <rect x={180} y={250} width={40} height={40} rx={12} fill={piel} />
      <g transform={`rotate(${ladeo} 200 250)`}>
        {/* pelo de atrás (largo / moño) */}
        {peinado === "largo" ? <path d="M 112 150 Q 104 300 150 310 L 164 310 Q 160 250 200 250 Q 240 250 236 310 L 250 310 Q 296 300 288 150 Z" fill={pelo} /> : null}
        {peinado === "mono" ? <circle cx={200} cy={52} r={34} fill={pelo} /> : null}
        {/* orejas y cabeza */}
        <ellipse cx={122} cy={168} rx={16} ry={22} fill={piel} />
        <ellipse cx={278} cy={168} rx={16} ry={22} fill={piel} />
        <ellipse cx={200} cy={160} rx={82} ry={98} fill={piel} />
        {/* aretes */}
        {datos.mujer ? (
          <g>
            <circle cx={122} cy={196} r={9} fill="#F4B63F" />
            <circle cx={278} cy={196} r={9} fill="#F4B63F" />
          </g>
        ) : null}
        {/* barba */}
        {datos.barba ? <path d="M 122 170 Q 124 262 200 262 Q 276 262 278 170 Q 262 232 200 232 Q 138 232 122 170 Z" fill={pelo} /> : null}
        {/* pelo de arriba */}
        {peinado === "gorro" ? (
          <g>
            <path d="M 112 132 Q 112 52 200 50 Q 288 52 288 132 Z" fill="#2E2E3A" />
            <rect x={108} y={118} width={184} height={30} rx={14} fill="#3A3A48" />
          </g>
        ) : peinado === "rapado" ? (
          <path d="M 120 130 Q 124 66 200 62 Q 276 66 280 130 Q 250 100 200 98 Q 150 100 120 130 Z" fill={pelo} opacity={0.85} />
        ) : (
          <path d="M 114 150 Q 106 62 200 56 Q 296 62 286 150 Q 270 104 226 100 Q 196 118 150 108 Q 126 118 114 150 Z" fill={pelo} />
        )}
        {/* cejas */}
        <rect x={146} y={124 + cejas} width={36} height={8} rx={4} fill={pelo} transform={`rotate(${pose === "cansado" ? 8 : -4} 164 128)`} />
        <rect x={218} y={124 + cejas} width={36} height={8} rx={4} fill={pelo} transform={`rotate(${pose === "cansado" ? -8 : 4} 236 128)`} />
        {/* ojos */}
        <ellipse cx={164} cy={156} rx={10} ry={13 * ojo} fill="#1D1A24" />
        <ellipse cx={236} cy={156} rx={10} ry={13 * ojo} fill="#1D1A24" />
        <circle cx={167} cy={151} r={3} fill="#fff" opacity={ojo > 0.5 ? 1 : 0} />
        <circle cx={239} cy={151} r={3} fill="#fff" opacity={ojo > 0.5 ? 1 : 0} />
        {/* pestañas */}
        {datos.mujer && ojo > 0.5 ? (
          <g stroke="#1D1A24" strokeWidth={5} strokeLinecap="round" fill="none">
            <path d="M 153 149 Q 146 147 141 141" />
            <path d="M 247 149 Q 254 147 259 141" />
          </g>
        ) : null}
        {/* lentes */}
        {datos.lentes ? (
          <g fill="none" stroke="#1D1A24" strokeWidth={6}>
            <circle cx={164} cy={156} r={28} />
            <circle cx={236} cy={156} r={28} />
            <path d="M 192 154 Q 200 146 208 154" />
          </g>
        ) : null}
        {/* mejillas */}
        <ellipse cx={142} cy={192} rx={14} ry={8} fill="#E8907A" opacity={0.35} />
        <ellipse cx={258} cy={192} rx={14} ry={8} fill="#E8907A" opacity={0.35} />
        {/* boca */}
        {pose === "sorprendido" ? (
          <ellipse cx={200} cy={214} rx={14} ry={18} fill={datos.mujer ? "#B8324F" : "#5A2230"} />
        ) : habla ? (
          <ellipse cx={200} cy={210} rx={22} ry={4 + abre * 14} fill={datos.mujer ? "#B8324F" : "#5A2230"} />
        ) : pose === "cansado" ? (
          <path d="M 180 214 Q 200 206 220 214" stroke={datos.mujer ? "#B8324F" : "#5A2230"} strokeWidth={6} fill="none" strokeLinecap="round" />
        ) : (
          <path d="M 174 204 Q 200 230 226 204" stroke={datos.mujer ? "#B8324F" : "#5A2230"} strokeWidth={7} fill="none" strokeLinecap="round" />
        )}
      </g>
      {/* brazos de adelante */}
      {brazo(-1)}
      {pose === "celebra" || pose === "sorprendido" || pose === "explica" ? brazo(1) : null}
    </svg>
  );
};

// ───────────────────────── la habitación ─────────────────────────

export type Hora = "dia" | "tarde" | "noche";

const CIELO: Record<Hora, [string, string]> = { dia: ["#8FC9FF", "#D9EEFF"], tarde: ["#F3A36B", "#FFD9A8"], noche: ["#12163A", "#2B2F66"] };

/** ventana con cielo, sol o luna y la ciudad; `mezcla` 0→1 pasa de una hora a otra (el día que se va) */
export const Ventana: React.FC<{ hora: Hora; hacia?: Hora; mezcla?: number; ancho?: number; alto?: number }> = ({ hora, hacia, mezcla = 0, ancho = 520, alto = 380 }) => {
  const f = useCurrentFrame();
  const a = CIELO[hora], b = CIELO[hacia ?? hora];
  const mix = (c1: string, c2: string) => interpolate(mezcla, [0, 1], [0, 1]) < 0.5 ? c1 : c2;
  const noche = (hacia ?? hora) === "noche" ? mezcla : hora === "noche" ? 1 : 0;
  return (
    <svg viewBox={`0 0 ${ancho} ${alto}`} width={ancho} height={alto} style={{ display: "block" }}>
      <defs>
        <linearGradient id="cieloA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={a[0]} /><stop offset="1" stopColor={a[1]} /></linearGradient>
        <linearGradient id="cieloB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={b[0]} /><stop offset="1" stopColor={b[1]} /></linearGradient>
      </defs>
      <rect width={ancho} height={alto} rx={18} fill="#EDE7F6" />
      <rect x={16} y={16} width={ancho - 32} height={alto - 32} rx={10} fill="url(#cieloA)" />
      <rect x={16} y={16} width={ancho - 32} height={alto - 32} rx={10} fill="url(#cieloB)" opacity={mezcla} />
      {/* sol que baja / luna que sube */}
      <circle cx={ancho * 0.72} cy={90 + mezcla * (hacia === "noche" ? 220 : 0)} r={34} fill="#FFD54F" opacity={1 - noche} />
      <circle cx={ancho * 0.28} cy={300 - noche * 210} r={26} fill="#F4F1E8" opacity={noche} />
      {Array.from({ length: 14 }).map((_, i) => (
        <circle key={i} cx={30 + azar(i) * (ancho - 60)} cy={30 + azar(i + 40) * 140} r={1.6 + azar(i + 9) * 1.6} fill="#fff" opacity={noche * (0.5 + 0.5 * Math.sin(f / 9 + i))} />
      ))}
      {/* ciudad */}
      {Array.from({ length: 9 }).map((_, i) => {
        const w = 44 + azar(i + 3) * 30, h = 70 + azar(i + 7) * 120, x = 16 + i * ((ancho - 32) / 9);
        return (
          <g key={i}>
            <rect x={x} y={alto - 16 - h} width={w} height={h} fill={mix("#7F8FB8", "#1F2350")} opacity={0.9} />
            {Array.from({ length: 6 }).map((__, j) => (
              <rect key={j} x={x + 8 + (j % 2) * 18} y={alto - h + 4 + Math.floor(j / 2) * 22} width={9} height={11} fill={noche > 0.5 && azar(i * 7 + j) > 0.4 ? "#FFE082" : "rgba(255,255,255,0.35)"} />
            ))}
          </g>
        );
      })}
      {/* marco en cruz */}
      <rect x={ancho / 2 - 6} y={16} width={12} height={alto - 32} fill="#EDE7F6" />
      <rect x={16} y={alto / 2 - 6} width={ancho - 32} height={12} fill="#EDE7F6" />
    </svg>
  );
};

/** reloj de pared; `vueltas` = cuántas horas avanza la aguja durante la escena (el tiempo que pasa) */
export const Reloj: React.FC<{ r?: number; horas?: number; progreso?: number }> = ({ r = 70, horas = 6, progreso = 0 }) => {
  const ang = progreso * horas * 30;
  return (
    <svg viewBox="-80 -80 160 160" width={r * 2} height={r * 2}>
      <circle r={74} fill="#fff" stroke="#2B2238" strokeWidth={8} />
      {Array.from({ length: 12 }).map((_, i) => (
        <rect key={i} x={-3} y={-64} width={6} height={12} rx={3} fill="#2B2238" transform={`rotate(${i * 30})`} />
      ))}
      <rect x={-4} y={-36} width={8} height={40} rx={4} fill="#2B2238" transform={`rotate(${90 + ang})`} />
      <rect x={-3} y={-54} width={6} height={58} rx={3} fill="#E53935" transform={`rotate(${ang * 12})`} />
      <circle r={7} fill="#2B2238" />
    </svg>
  );
};

/** monitor con un programa de edición (pistas de colores), un logo o un texto */
/** imagen: un PNG de public/ (un cuadro de una secuencia de Blender, una captura) que llena la pantalla del monitor */
export const Monitor: React.FC<{ ancho?: number; contenido?: "edicion" | "vacio" | "texto"; texto?: string; acento?: string; brillo?: number; imagen?: string }> = ({
  ancho = 520, contenido = "edicion", texto, acento = "#7C4DFF", brillo = 0, imagen,
}) => {
  const f = useCurrentFrame();
  const alto = ancho * 0.62;
  return (
    <div style={{ width: ancho, position: "relative" }}>
      <div style={{ width: ancho, height: alto, borderRadius: 22, background: "#1C1B29", padding: 16, boxSizing: "border-box", boxShadow: `0 20px 50px rgba(0,0,0,0.25), 0 0 ${brillo * 80}px ${acento}` }}>
        <div style={{ width: "100%", height: "100%", borderRadius: 10, background: imagen ? "linear-gradient(160deg,#FBF9FF,#E4DDF6)" : contenido === "texto" ? "#F7F5FF" : "#26243A", overflow: "hidden", position: "relative" }}>
          {imagen ? (
            <Img src={ruta(imagen)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          ) : contenido === "edicion" ? (
            <>
              <div style={{ position: "absolute", left: "26%", top: 14, width: "48%", height: "44%", borderRadius: 8, background: "linear-gradient(135deg,#3F3A66,#5B4BA8)" }} />
              {[0, 1, 2, 3].map((p) => (
                <div key={p} style={{ position: "absolute", left: 14, right: 14, top: `${62 + p * 9}%`, height: "6%" }}>
                  {Array.from({ length: 5 }).map((_, i) => {
                    const ini = azar(p * 9 + i) * 0.15 + i * 0.2;
                    return <div key={i} style={{ position: "absolute", left: `${ini * 100}%`, width: `${8 + azar(p + i * 3) * 10}%`, height: "100%", borderRadius: 4, background: ["#FF7043", "#66BB6A", "#42A5F5", "#FFCA28"][(p + i) % 4], opacity: 0.9 }} />;
                  })}
                </div>
              ))}
              <div style={{ position: "absolute", top: "60%", bottom: 10, width: 3, background: "#fff", left: `${10 + ((f * 0.6) % 80)}%` }} />
            </>
          ) : contenido === "texto" ? (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: ancho * 0.07, fontWeight: 800, color: "#B0AACC", letterSpacing: 2 }}>{texto}</div>
          ) : null}
        </div>
      </div>
      <div style={{ width: ancho * 0.16, height: ancho * 0.1, background: "#2E2C40", margin: "0 auto" }} />
      <div style={{ width: ancho * 0.36, height: 14, borderRadius: 7, background: "#2E2C40", margin: "0 auto" }} />
    </div>
  );
};

export const Planta: React.FC<{ alto?: number }> = ({ alto = 120 }) => (
  <svg viewBox="0 0 100 120" height={alto}>
    <path d="M 50 70 Q 20 50 22 18 Q 46 30 50 70 Z" fill="#43A047" />
    <path d="M 50 70 Q 80 46 82 14 Q 56 28 50 70 Z" fill="#66BB6A" />
    <path d="M 50 72 Q 48 40 54 8 Q 62 40 50 72 Z" fill="#2E7D32" />
    <path d="M 30 70 L 70 70 L 64 118 L 36 118 Z" fill="#D9825B" />
  </svg>
);

export const Taza: React.FC<{ alto?: number; vapor?: boolean }> = ({ alto = 70, vapor = true }) => {
  const f = useCurrentFrame();
  return (
    <svg viewBox="0 0 80 90" height={alto} style={{ overflow: "visible" }}>
      {vapor ? <path d={`M 30 ${18 - (f % 30) * 0.4} q 6 -8 0 -16 q -6 -8 0 -16`} stroke="rgba(255,255,255,0.7)" strokeWidth={4} fill="none" opacity={1 - (f % 30) / 30} /> : null}
      <rect x={8} y={28} width={48} height={56} rx={10} fill="#fff" />
      <path d="M 56 40 q 18 0 18 14 q 0 14 -18 14" stroke="#fff" strokeWidth={8} fill="none" />
    </svg>
  );
};

/** burbuja de mensaje (cliente, notificación); entra con un pequeño rebote */
export const Burbuja: React.FC<{ texto: string; quien?: string; desde?: number; lado?: "izq" | "der"; ancho?: number; acento?: string }> = ({
  texto, quien, desde = 0, lado = "izq", ancho = 380, acento,
}) => {
  const f = useCurrentFrame();
  const a = tramo(f, desde, desde + 10);
  if (f < desde) return null;
  return (
    <div style={{ width: ancho, transform: `scale(${0.6 + a * 0.4}) translateY(${(1 - a) * 20}px)`, transformOrigin: lado === "izq" ? "0% 100%" : "100% 100%", opacity: a }}>
      <div style={{ background: acento ?? "#fff", color: acento ? "#fff" : "#1D1A24", borderRadius: 26, borderBottomLeftRadius: lado === "izq" ? 6 : 26, borderBottomRightRadius: lado === "der" ? 6 : 26, padding: "22px 32px", fontSize: 42, fontWeight: 700, boxShadow: "0 12px 30px rgba(0,0,0,0.18)" }}>
        {texto}
        {quien ? <div style={{ fontSize: 24, fontWeight: 600, opacity: 0.55, marginTop: 6 }}>{quien}</div> : null}
      </div>
    </div>
  );
};

/** carpeta que se abre y suelta archivos con nombre */
export const Carpeta: React.FC<{ nombre?: string; archivos?: readonly string[]; desde?: number; ancho?: number; acento?: string }> = ({
  nombre = "mi-skill", archivos = [], desde = 0, ancho = 300, acento = "#5B8DEF",
}) => {
  const f = useCurrentFrame();
  const abre = tramo(f, desde + 6, desde + 18);
  return (
    <div style={{ position: "relative", width: ancho, height: ancho * 0.8 }}>
      {archivos.map((a, i) => {
        const t = tramo(f, desde + 14 + i * 4, desde + 30 + i * 4);
        const ang = -150 + (i / Math.max(1, archivos.length - 1)) * 120;
        const r = ancho * 0.9 * t;
        const x = Math.cos((ang * Math.PI) / 180) * r, y = Math.sin((ang * Math.PI) / 180) * r * 0.75;
        return (
          <div key={i} style={{ position: "absolute", left: ancho / 2 - 46 + x, top: ancho * 0.25 + y, width: 92, height: 112, borderRadius: 10, background: "#fff", boxShadow: "0 8px 20px rgba(0,0,0,0.2)", transform: `rotate(${(azar(i) - 0.5) * 24 * t}deg)`, opacity: t, display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 10, boxSizing: "border-box", fontSize: 15, fontWeight: 700, color: "#555" }}>
            <div style={{ position: "absolute", top: 14, left: 14, right: 14, height: 6, borderRadius: 3, background: "#DDD" }} />
            <div style={{ position: "absolute", top: 28, left: 14, right: 30, height: 6, borderRadius: 3, background: "#E7E7E7" }} />
            {a}
          </div>
        );
      })}
      <svg viewBox="0 0 300 240" width={ancho} style={{ position: "absolute", left: 0, top: 0 }}>
        <path d="M 20 40 Q 20 24 36 24 L 110 24 L 130 46 L 264 46 Q 280 46 280 62 L 280 210 Q 280 226 264 226 L 36 226 Q 20 226 20 210 Z" fill={acento} />
        <path d={`M 20 ${90 - abre * 10} L 280 ${90 - abre * 10} L 280 210 Q 280 226 264 226 L 36 226 Q 20 226 20 210 Z`} fill={acento} style={{ filter: "brightness(1.15)" }} transform={`skewX(${-abre * 8})`} />
      </svg>
      <div style={{ position: "absolute", top: ancho * 0.8 + 8, width: "100%", textAlign: "center", fontSize: 26, fontWeight: 700, color: "#fff" }}>{nombre}</div>
    </div>
  );
};

/** aurora boreal: bandas de color que ondulan (el «otro mundo» donde aparece la solución) */
export const Aurora: React.FC<{ colores?: readonly string[] }> = ({ colores = ["#3DF5B0", "#7C4DFF", "#FF6FB5"] }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(#090B24, #1A1446 60%, #2A1B4D)", overflow: "hidden" }}>
      {colores.map((c, i) => (
        <div key={i} style={{ position: "absolute", left: "-20%", right: "-20%", top: `${18 + i * 9}%`, height: "22%", background: `linear-gradient(90deg, transparent, ${c}, transparent)`, filter: "blur(40px)", opacity: 0.55, transform: `translateX(${Math.sin(f / 40 + i * 2) * 120}px) skewY(${Math.sin(f / 55 + i) * 6}deg)` }} />
      ))}
      {Array.from({ length: 40 }).map((_, i) => (
        <div key={`e${i}`} style={{ position: "absolute", left: `${azar(i) * 100}%`, top: `${azar(i + 70) * 45}%`, width: 3, height: 3, borderRadius: 2, background: "#fff", opacity: 0.3 + 0.5 * Math.abs(Math.sin(f / 15 + i)) }} />
      ))}
      <svg viewBox="0 0 1080 400" style={{ position: "absolute", bottom: 0, width: "100%" }} preserveAspectRatio="none">
        <path d="M 0 260 Q 180 180 360 240 T 720 220 T 1080 250 L 1080 400 L 0 400 Z" fill="#141233" />
        <path d="M 0 320 Q 260 260 540 310 T 1080 300 L 1080 400 L 0 400 Z" fill="#0C0B22" />
      </svg>
    </div>
  );
};

/** confeti que cae (celebración) */
export const Confeti: React.FC<{ desde?: number; n?: number; colores?: readonly string[] }> = ({ desde = 0, n = 60, colores = ["#FF5252", "#FFCA28", "#42A5F5", "#66BB6A", "#AB47BC"] }) => {
  const f = useCurrentFrame() - desde;
  const { width, height } = useVideoConfig();
  if (f < 0) return null;
  return (
    <>
      {Array.from({ length: n }).map((_, i) => {
        const x = azar(i) * width + Math.sin(f / 10 + i) * 30;
        const y = -40 + (f * (8 + azar(i + 5) * 10)) - azar(i + 9) * 300;
        if (y > height) return null;
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: 14, height: 22, background: colores[i % colores.length], transform: `rotate(${f * 8 + i * 40}deg)` }} />;
      })}
    </>
  );
};

/** perilla deslizante (Estilo, Cámara, Ritmo…): el punto se mueve hasta `valor` */
export const Perilla: React.FC<{ etiqueta: string; valor: number; desde?: number; ancho?: number; acento?: string; nota?: string }> = ({
  etiqueta, valor, desde = 0, ancho = 700, acento = "#7C4DFF", nota,
}) => {
  const f = useCurrentFrame();
  const v = interpolate(tramo(f, desde, desde + 18), [0, 1], [0.15, valor]);
  return (
    <div style={{ width: ancho, display: "flex", alignItems: "center", gap: 26, background: "rgba(20,18,45,0.72)", border: "1.5px solid rgba(255,255,255,0.12)", borderRadius: 26, padding: "34px 36px", boxSizing: "border-box" }}>
      <div style={{ width: 190, fontSize: 42, fontWeight: 700, color: "#fff" }}>{etiqueta}</div>
      <div style={{ flex: 1, height: 14, borderRadius: 7, background: "rgba(255,255,255,0.15)", position: "relative" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${v * 100}%`, borderRadius: 5, background: acento }} />
        <div style={{ position: "absolute", left: `calc(${v * 100}% - 22px)`, top: -15, width: 44, height: 44, borderRadius: 22, background: "#fff", boxShadow: `0 0 18px ${acento}` }} />
      </div>
      {nota ? <div style={{ width: 170, fontSize: 32, color: "rgba(255,255,255,0.75)", textAlign: "right" }}>{nota}</div> : null}
    </div>
  );
};
