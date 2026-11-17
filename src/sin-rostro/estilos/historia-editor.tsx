// Historia animada · escenas extra:
//  - `gancho`: palabras gigantes que golpean sobre la aurora (máx. 2 renglones a la vez; cada par reemplaza al anterior).
//  - `editor`: una ventana de Editor Studio con el video del usuario dentro, que va cambiando de estado paso a paso
//    (1 subir sin editar → 2 subtítulos en tu computadora → 3 estilo + pedido a la IA + contador → 4 prueba y descarga).
//    El personaje mira desde abajo y habla con la voz. Sin botones, sin cursores, sin ▶ (sirve para anuncios de Meta).
import React, { useMemo } from "react";
import { interpolate } from "remotion";
import { Caption, Escena, Frase, Palabra, Pose, enEscena, frases, fraseEn, palabras, rebota, tramo, useEscena, usePlan } from "../base";
import { Aurora, Personaje } from "../ilustracion";
import { Icono, Medio, useAparece } from "../interfaz";

const hablaEn = (ps: readonly Palabra[], t: number) => ps.some((p) => t >= p.ini && t <= p.fin);

// ───────────────────────── gancho ─────────────────────────

export const GanchoHistoria: React.FC<{ e: Escena }> = ({ e }) => {
  const plan = usePlan();
  const acento = plan.marca?.acento ?? "#7C4DFF";
  const { f, fps } = useEscena(e);
  const lineas = (e.lineas as { texto: string; en: number; clave?: boolean }[]) ?? [];
  const ultima = lineas.filter((l) => f >= enEscena(e, l.en, fps)).length - 1;
  const par = Math.max(0, Math.floor(ultima / 2));
  const visibles = lineas.map((l, i) => ({ l, i })).filter(({ i }) => Math.floor(i / 2) === par);
  const golpe = ultima >= 0 ? tramo(f, enEscena(e, lineas[ultima].en, fps), enEscena(e, lineas[ultima].en, fps) + 8) : 1;
  const zoom = 1 + (1 - golpe) * 0.1;
  const sacude = (1 - golpe) * Math.sin(f * 2.4) * 10;
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Aurora />
      <div style={{ position: "absolute", left: 0, right: 0, top: 300, height: 950, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, transform: `scale(${zoom}) translateX(${sacude}px)` }}>
        {visibles.map(({ l, i }) => {
          const d = enEscena(e, l.en, fps);
          if (f < d) return null;
          const a = tramo(f, d, d + 7, rebota);
          return (
            <div key={i} style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: l.clave ? 168 : 128, lineHeight: 1, letterSpacing: -4, textAlign: "center", padding: "0 60px",
              color: l.clave ? "#fff" : "#fff", background: l.clave ? acento : "transparent", borderRadius: 28, paddingTop: l.clave ? 8 : 0, paddingBottom: l.clave ? 18 : 0,
              boxShadow: l.clave ? `0 0 70px ${acento}` : undefined, textShadow: l.clave ? undefined : "0 6px 30px rgba(0,0,0,0.45)",
              transform: `scale(${2.3 - a * 1.3}) rotate(${(1 - a) * (i % 2 ? 6 : -6)}deg)`, opacity: Math.min(1, a * 2), filter: `blur(${(1 - a) * 8}px)` }}>
              {l.texto}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ───────────────────────── editor ─────────────────────────

type PasoEditor = { en: number; pose?: Pose };

/** tarjeta blanca de la columna derecha */
const Tarjeta: React.FC<{ desde: number; children: React.ReactNode; alto?: number }> = ({ desde, children, alto }) => {
  const { estilo, visible } = useAparece(desde, 12);
  if (!visible) return null;
  return (
    <div style={{ ...estilo, width: 440, minHeight: alto, borderRadius: 26, background: "rgba(255,255,255,0.96)", boxShadow: "0 16px 44px rgba(0,0,0,0.3)", padding: "22px 24px", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 14 }}>
      {children}
    </div>
  );
};

const Fila: React.FC<{ icono: string; texto: string; acento: string; check?: number }> = ({ icono, texto, acento, check = 0 }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
    <div style={{ width: 70, height: 70, borderRadius: 20, background: acento, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Icono nombre={icono} tam={40} color="#fff" />
    </div>
    <div style={{ fontSize: 38, fontWeight: 800, color: "#1D1A24", lineHeight: 1.05, flex: 1 }}>{texto}</div>
    {check > 0 ? (
      <div style={{ width: 50, height: 50, borderRadius: 25, background: "#22C55E", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${check})` }}>
        <Icono nombre="Check" tam={32} color="#fff" grosor={3.4} />
      </div>
    ) : null}
  </div>
);

const Barra: React.FC<{ p: number; acento: string; etiqueta?: string }> = ({ p, acento, etiqueta }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
    <div style={{ flex: 1, height: 18, borderRadius: 9, background: "#ECE8F5", overflow: "hidden" }}>
      <div style={{ width: `${p * 100}%`, height: "100%", borderRadius: 9, background: acento }} />
    </div>
    {etiqueta ? <div style={{ fontSize: 30, fontWeight: 700, color: "#6E687D", fontVariantNumeric: "tabular-nums", minWidth: 80, textAlign: "right" }}>{etiqueta}</div> : null}
  </div>
);

export const EditorHistoria: React.FC<{ e: Escena; ps: readonly Palabra[] }> = ({ e, ps }) => {
  const plan = usePlan();
  const acento = plan.marca?.acento ?? "#7C4DFF";
  const { f, fps } = useEscena(e);
  const en = (s: unknown) => (typeof s === "number" ? enEscena(e, s, fps) : 99999);
  const t = e.desde + f / fps;
  const pasos = (e.pasos as PasoEditor[]) ?? [];
  const i = Math.max(0, pasos.filter((p) => t >= p.en).length - 1);
  const pasoIni = en(pasos[i]?.en ?? e.desde);
  const golpePaso = tramo(f, pasoIni, pasoIni + 8, rebota);

  // el video: mismo clip todo el tiempo (nunca se corta), con subtítulos propios quemados desde `subtitulosEn`
  const durClip = (e.durClip as number) ?? 10;
  const tClip = ((f / fps + ((e.desdeClip as number) ?? 0)) % durClip + durClip) % durClip;
  // trozos cortos y parejos (≤ 3 palabras) que salen completos: así nunca se ve «La IA» y luego «La IA elige una»
  const subsClip = useMemo(() => trozos(frases(palabras((e.subsClip as Caption[]) ?? []), 99), 3), [e.subsClip]);
  const frClip = f >= en(e.subtitulosEn) ? fraseEn(subsClip, tClip) : null;

  // contador sobre el clip (paso 3)
  const cIni = en(e.contadorEn);
  const contA = (e.contadorA as number) ?? 10;
  const contGolpe = tramo(f, cIni, cIni + 10, rebota);

  // pedido escrito a la IA (paso 3): se teclea con la voz
  const chat = e.chat as { texto: string; en: number; hasta?: number } | undefined;
  const chatIni = chat ? en(chat.en) : 99999;
  const chatFin = chat ? en(chat.hasta ?? chat.en + 1.8) : 99999;
  const letras = chat ? Math.round(interpolate(f, [chatIni, chatFin], [0, chat.texto.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })) : 0;

  const poseAhora = pasos[i]?.pose ?? "explica";
  const habla = hablaEn(ps, t);
  const tituloEstudio = f >= en(e.estudioEn);
  const titA = tramo(f, en(e.estudioEn), en(e.estudioEn) + 10, rebota);

  // columna derecha: solo las tarjetas del paso actual
  const columna = (() => {
    if (i === 0) {
      const sube = en(e.subeEn);
      const p = tramo(f, sube + 4, sube + 40);
      return (
        <Tarjeta desde={sube}>
          <Fila icono="Upload" texto="mi‑video.mp4" acento={acento} check={tramo(f, sube + 40, sube + 48, rebota)} />
          <Barra p={p} acento={acento} etiqueta={`${Math.round(p * 100)}%`} />
        </Tarjeta>
      );
    }
    if (i === 1) {
      return (
        <>
          <Tarjeta desde={en(e.subtitulosEn)}><Fila icono="Captions" texto="Subtítulos" acento={acento} check={tramo(f, en(e.subtitulosEn) + 10, en(e.subtitulosEn) + 18, rebota)} /></Tarjeta>
          <Tarjeta desde={en(e.compuEn)}><Fila icono="Laptop" texto="En tu computadora" acento="#0EA5E9" /></Tarjeta>
        </>
      );
    }
    if (i === 2) {
      const elige = en(e.estiloEn);
      const sel = tramo(f, elige, elige + 8, rebota);
      const colores = ["#FF6FB5", acento, "#3DF5B0"];
      return (
        <>
          <Tarjeta desde={en(pasos[2].en) + 6}>
            <div style={{ fontSize: 34, fontWeight: 800, color: "#6E687D" }}>Estilo</div>
            <div style={{ display: "flex", gap: 18 }}>
              {colores.map((c, k) => (
                <div key={k} style={{ width: 118, height: 118, borderRadius: 22, background: `linear-gradient(135deg, ${c}, #1D1A24)`, outline: k === 1 ? `${8 * sel}px solid ${acento}` : "none", outlineOffset: 5, transform: `scale(${k === 1 ? 1 + sel * 0.06 : 1 - sel * 0.06})`, opacity: k === 1 ? 1 : 1 - sel * 0.45 }} />
              ))}
            </div>
          </Tarjeta>
          {chat ? (
            <Tarjeta desde={chatIni}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 52, height: 52, borderRadius: 16, background: acento, display: "flex", alignItems: "center", justifyContent: "center" }}><Icono nombre="Sparkles" tam={30} color="#fff" /></div>
                <div style={{ fontSize: 30, fontWeight: 800, color: "#6E687D" }}>Tu pedido a la IA</div>
              </div>
              <div style={{ fontSize: 40, fontWeight: 700, color: "#1D1A24", lineHeight: 1.15, minHeight: 92 }}>
                {chat.texto.slice(0, letras)}
                {letras < chat.texto.length ? <span style={{ display: "inline-block", width: 4, height: 38, background: acento, marginLeft: 4, verticalAlign: "middle", opacity: Math.floor(f / 8) % 2 ? 1 : 0.2 }} /> : null}
              </div>
            </Tarjeta>
          ) : null}
        </>
      );
    }
    const prueba = en(e.pruebaEn);
    const pp = tramo(f, prueba + 2, prueba + 34);
    const baja = en(e.descargaEn);
    return (
      <>
        <Tarjeta desde={prueba}>
          <Fila icono="Clapperboard" texto="Prueba de 8 s" acento={acento} />
          <Barra p={pp} acento={acento} etiqueta={`0:0${Math.round(pp * 8)}`} />
        </Tarjeta>
        <Tarjeta desde={baja}><Fila icono="Download" texto="Descargado" acento="#22C55E" check={tramo(f, baja + 10, baja + 18, rebota)} /></Tarjeta>
      </>
    );
  })();

  // cada paso nuevo: la columna se renueva con un pequeño golpe
  const colA = tramo(f, pasoIni, pasoIni + 10);
  const verVentana = useAparece(0, 14);
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Aurora />
      {/* la ventana del editor: x 50–1030, y 490–1250 (subtítulos en y 320) (todo texto dentro de la zona segura) */}
      <div style={{ ...verVentana.estilo, position: "absolute", left: 50, top: 490, width: 980, height: 760, borderRadius: 34, background: "rgba(22,20,40,0.88)", border: "2px solid rgba(255,255,255,0.18)", boxShadow: `0 30px 80px rgba(0,0,0,0.45), 0 0 60px ${acento}55`, overflow: "hidden" }}>
        {/* barra de título: insignia del paso + nombre del programa */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 92, display: "flex", alignItems: "center", gap: 18, padding: "0 28px", borderBottom: "2px solid rgba(255,255,255,0.1)" }}>
          <div style={{ height: 60, padding: "0 24px", borderRadius: 30, background: acento, color: "#fff", fontSize: 36, fontWeight: 800, display: "flex", alignItems: "center", transform: `scale(${0.8 + golpePaso * 0.2})`, boxShadow: `0 0 ${30 * (1 - golpePaso) + 10}px ${acento}` }}>
            Paso {i + 1}
          </div>
          {tituloEstudio ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12, opacity: Math.min(1, titA * 1.5), transform: `translateX(${(1 - titA) * 30}px)` }}>
              <Icono nombre="Clapperboard" tam={40} color="#fff" />
              <div style={{ fontSize: 40, fontWeight: 800, color: "#fff" }}>Editor Studio</div>
            </div>
          ) : null}
        </div>
        {/* el clip del usuario (9:16), mudo y sin cortes */}
        <div style={{ position: "absolute", left: 30, top: 108, width: 356, height: 632, borderRadius: 22, overflow: "hidden", background: "#000", boxShadow: "0 12px 40px rgba(0,0,0,0.5)" }}>
          <Medio video={e.video as string} desde={(e.desdeClip as number) ?? 0} />
          {/* «Sin editar» (paso 1) */}
          {i === 0 && f >= en(e.sinEditarEn) ? (
            <div style={{ position: "absolute", left: 18, top: 18, padding: "10px 18px", borderRadius: 14, background: "#1D1A24", color: "#fff", fontSize: 30, fontWeight: 800, transform: `scale(${tramo(f, en(e.sinEditarEn), en(e.sinEditarEn) + 8, rebota)})`, transformOrigin: "0 0" }}>Sin editar</div>
          ) : null}
          {/* subtítulos automáticos sobre el clip */}
          {frClip ? (
            <div style={{ position: "absolute", left: 12, right: 12, top: 410, textAlign: "center", fontFamily: "'Poppins', sans-serif", fontSize: 36, fontWeight: 800, lineHeight: 1.15, color: "#fff", textShadow: "0 3px 10px rgba(0,0,0,0.9)" }}>
              {frClip.palabras.map((p, k) => (
                <span key={k} style={{ marginRight: "0.25em", color: tClip >= p.ini && (k === frClip.palabras.length - 1 || tClip < frClip.palabras[k + 1].ini) ? "#FFE14D" : "#fff" }}>{p.texto}</span>
              ))}
            </div>
          ) : null}
          {/* contador 3D en cuenta regresiva (paso 3 en adelante) */}
          {f >= cIni ? (
            <div style={{ position: "absolute", right: 10, top: 10, transform: `scale(${contGolpe})`, transformOrigin: "100% 0" }}>
              <Contador3D f={f} desde={cIni + 6} de={contA} acento={acento} tam={110} />
            </div>
          ) : null}
        </div>
        {/* columna derecha: lo que pasa en este paso */}
        <div key={i} style={{ position: "absolute", left: 412, top: 108, width: 500, height: 632, display: "flex", flexDirection: "column", justifyContent: "center", gap: 26, opacity: colA, transform: `translateX(${(1 - colA) * 40}px)` }}>
          {columna}
        </div>
      </div>
      {/* el personaje mira desde abajo y habla con la voz */}
      <div style={{ position: "absolute", left: 270, top: 1300 }}>
        <Personaje datos={plan.marca?.personaje} pose={poseAhora} habla={habla} ancho={540} semilla={3} desdePose={pasoIni} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1780, bottom: 0, background: "#6E5146", boxShadow: "0 -10px 0 #8C6A5C" }} />
    </div>
  );
};

/** parte cada frase en trozos parejos de hasta `max` palabras (7 → 3·2·2), cada uno con su inicio y fin */
const trozos = (fs: readonly Frase[], max: number): Frase[] =>
  fs.flatMap((fr) => {
    const n = Math.ceil(fr.palabras.length / max);
    const out: Frase[] = [];
    let i = 0;
    for (let k = 0; k < n; k++) {
      const cuantas = Math.ceil((fr.palabras.length - i) / (n - k));
      const ps = fr.palabras.slice(i, i + cuantas);
      i += cuantas;
      out.push({ palabras: ps, ini: ps[0].ini, fin: ps[ps.length - 1].fin, texto: ps.map((p) => p.texto).join(" ") });
    }
    return out;
  });

/** mezcla dos colores hex: p = cuánto del primero (0–1) */
const mezcla = (a: string, b: string, p: number) => {
  const h = (s: string) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16));
  const [x, y] = [h(a), h(b)];
  const q = Math.max(0, Math.min(1, p));
  return `rgb(${x.map((v, i) => Math.round(v * q + y[i] * (1 - q))).join(",")})`;
};

/** contador 3D: moneda con canto que gira apenas en el espacio; los números caen en cuenta regresiva (de → 0) con giro de tapa */
const Contador3D: React.FC<{ f: number; desde: number; de: number; acento: string; paso?: number; tam?: number }> = ({ f, desde, de, acento, paso = 11, tam = 170 }) => {
  const t = Math.max(0, f - desde);
  const idx = Math.min(de, Math.floor(t / paso));
  const valor = de - idx;
  const local = f < desde ? 99 : t - idx * paso;
  const giro = idx === 0 && f < desde ? 1 : tramo(local, 0, 7, rebota);
  const fin = idx === de ? tramo(local, 0, 10, rebota) : 0;
  const progreso = f < desde ? 1 : Math.max(0, 1 - t / (paso * de));
  const ry = Math.sin(f * 0.06) * 24;
  const rx = 14 + Math.sin(f * 0.045 + 1) * 6;
  const r = tam / 2 - 12;
  const circ = 2 * Math.PI * r;
  const c = (p: number, con: string) => mezcla(acento, con, p);
  return (
    <div style={{ width: tam, height: tam, perspective: 700 }}>
      <div style={{ position: "relative", width: tam, height: tam, transformStyle: "preserve-3d", transform: `rotateX(${rx}deg) rotateY(${ry}deg) scale(${1 + fin * 0.12})` }}>
        {/* canto: discos apilados hacia atrás */}
        {Array.from({ length: 12 }).map((_, k) => (
          <div key={k} style={{ position: "absolute", inset: 0, borderRadius: "50%", background: k === 11 ? "#140B3A" : c(0.55 - k * 0.03, "#0E0830"), transform: `translateZ(${-(k + 1) * 2.2}px)` }} />
        ))}
        {/* cara */}
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: `radial-gradient(circle at 32% 28%, #ffffff 0%, ${c(0.55, "#ffffff")} 22%, ${acento} 62%, ${c(0.7, "#000000")} 100%)`, border: "5px solid rgba(255,255,255,0.9)", boxSizing: "border-box", boxShadow: `0 0 ${40 + fin * 50}px ${acento}, inset 0 -10px 22px rgba(0,0,0,0.35)` }}>
          <svg width={tam} height={tam} style={{ position: "absolute", left: -5, top: -5 }}>
            <circle cx={tam / 2} cy={tam / 2} r={r} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={8} />
            <circle cx={tam / 2} cy={tam / 2} r={r} fill="none" stroke="#fff" strokeWidth={8} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - progreso)} transform={`rotate(-90 ${tam / 2} ${tam / 2})`} />
          </svg>
        </div>
        {/* número: sobresale de la cara y cae girando sobre su eje */}
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", transform: `translateZ(18px) rotateX(${(1 - giro) * -95}deg)`, transformOrigin: "50% 40%", opacity: Math.min(1, giro * 2) }}>
          <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: tam * 0.48, fontWeight: 800, color: "#fff", fontVariantNumeric: "tabular-nums", lineHeight: 1, textShadow: `0 2px 0 ${c(0.6, "#000000")}, 0 4px 0 ${c(0.45, "#000000")}, 0 6px 0 ${c(0.3, "#000000")}, 0 10px 16px rgba(0,0,0,0.5)` }}>{valor}</div>
        </div>
      </div>
    </div>
  );
};
