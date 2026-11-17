// Videos sin rostro · motor de los estilos «por tema». Todos hablan el mismo idioma de escenas (titular, dibujo, lista,
// cifra, comparación, pasos, cierre) y cada estilo lo dibuja a su manera: material (tiza, marcador, línea, crayón,
// acuarela, plano, neón, píxel), tarjetas, letra, entrada y fondo. Un estilo puede sumar escenas propias (`extras`)
// y una capa fija sobre todo el video (`capa`: zócalo de noticiero, reloj, HUD de juego…).
import React, { useId } from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Escena, Frase, Palabra, azar, enEscena, esClave, fraseEn, rebota, tramo, useEscena, usePlan } from "../base";
import { Icono, Medio } from "../interfaz";

export type Material = "tiza" | "marcador" | "linea" | "crayon" | "acuarela" | "plano" | "neon" | "pixel";
export type Entrada = "escribir" | "golpe" | "deslizar" | "teclear" | "subir";
export type TipoCaja = "ninguna" | "blanca" | "oscura" | "vidrio" | "papel" | "pixel" | "tv" | "ventana";

export type SubtitulosTema = {
  readonly y: number;
  readonly tam: number;
  readonly color: string;
  readonly clave: string;
  readonly mayus?: boolean;
  readonly alinear?: "centro" | "izquierda";
  /** cómo se presenta: texto suelto, pastilla, zócalo de TV, cuadro de diálogo de juego, palabra resaltada en caja */
  readonly caja?: "pastilla" | "zocalo" | "dialogo" | "resalta";
  readonly fondoCaja?: string;
  readonly contorno?: string;
  readonly peso?: number;
};

export type Tema = {
  readonly id: string;
  readonly nombre: string;
  readonly material: Material;
  readonly entrada: Entrada;
  readonly caja: TipoCaja;
  readonly tinta: string;
  readonly acento: string;
  readonly acento2: string;
  readonly mayus?: boolean;
  readonly alinear?: "centro" | "izquierda";
  /** multiplica el tamaño de los textos (letras anchas como la de píxeles van más chicas) */
  readonly escalaTexto?: number;
  /** el titular va dentro de una caja del estilo (fondos donde el texto suelto no se lee) */
  readonly titularEnCaja?: boolean;
  /** zona donde viven las escenas (px en 1080×1920) */
  readonly zona?: { readonly top: number; readonly alto: number };
  readonly sub: SubtitulosTema;
  /** carga las fuentes (una sola vez) y devuelve sus familias */
  readonly fuentes: () => { readonly titulo: string; readonly texto: string };
  readonly Fondo: React.FC<{ e?: Escena }>;
  readonly Capa?: React.FC<{ escenas: readonly Escena[]; ps: readonly Palabra[] }>;
  readonly extras?: Readonly<Record<string, React.FC<{ e: Escena; t: TemaVivo }>>>;
};

/** el tema con sus fuentes ya cargadas y el acento del plan aplicado */
export type TemaVivo = Tema & { readonly fTitulo: string; readonly fTexto: string };

export const ZONA = { top: 300, alto: 830 };

// ───────────────────────── filtros de materiales (una vez por video) ─────────────────────────

export const FiltrosMaterial: React.FC = () => (
  <svg width={0} height={0} style={{ position: "absolute" }}>
    <defs>
      <filter id="m-crayon"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" /><feDisplacementMap in="SourceGraphic" scale="5" /></filter>
      <filter id="m-tiza"><feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="1" seed="7" result="r" /><feColorMatrix in="r" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 -0.9 1.2" result="g" /><feComposite in="SourceGraphic" in2="g" operator="in" /></filter>
      <filter id="m-acuarela"><feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" seed="5" /><feDisplacementMap in="SourceGraphic" scale="40" /></filter>
      <filter id="m-mano"><feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="2" /><feDisplacementMap in="SourceGraphic" scale="3" /></filter>
    </defs>
  </svg>
);

const filtroDe = (m: Material) => (m === "crayon" ? "url(#m-crayon)" : m === "tiza" ? "url(#m-tiza)" : m === "marcador" || m === "linea" ? "url(#m-mano)" : undefined);
const aMano = (m: Material) => m === "tiza" || m === "marcador" || m === "linea" || m === "crayon" || m === "acuarela";

// ───────────────────────── primitivas ─────────────────────────

/** texto que entra según el estilo: se escribe a mano, golpea, se desliza, se teclea o sube */
export const TextoEntra: React.FC<{ texto: string; desde: number; t: TemaVivo; tam: number; color?: string; fuente?: string; peso?: number; italica?: boolean }> = ({
  texto, desde, t, tam: tamBase, color, fuente, peso = 700, italica,
}) => {
  const f = useCurrentFrame();
  const tam = tamBase * (t.escalaTexto ?? 1);
  if (f < desde) return <span style={{ visibility: "hidden", fontSize: tam }}>{texto}</span>;
  const base: React.CSSProperties = { display: "inline-block", fontFamily: fuente ?? t.fTitulo, fontSize: tam, fontWeight: peso, color: color ?? t.tinta, lineHeight: 1.08, textTransform: t.mayus ? "uppercase" : undefined, fontStyle: italica ? "italic" : undefined, filter: filtroDe(t.material), whiteSpace: "pre-wrap" };
  if (t.material === "neon") base.textShadow = `0 0 18px ${color ?? t.acento}, 0 0 42px ${color ?? t.acento}`;
  switch (t.entrada) {
    case "escribir": {
      const dura = Math.min(34, 6 + texto.length * 1.3);
      const p = tramo(f, desde, desde + dura, (x) => x);
      return <span style={{ ...base, clipPath: `inset(-20% ${(1 - p) * 100}% -30% -5%)` }}>{texto}</span>;
    }
    case "teclear": {
      const n = Math.floor((f - desde) / 1.4);
      return <span style={base}>{texto.slice(0, n)}<span style={{ opacity: n < texto.length && Math.floor(f / 6) % 2 ? 1 : 0 }}>▌</span></span>;
    }
    case "golpe": {
      const a = tramo(f, desde, desde + 8, rebota);
      return <span style={{ ...base, transform: `scale(${1.7 - a * 0.7})`, opacity: Math.min(1, a * 2), filter: `${base.filter ?? ""} blur(${(1 - a) * 6}px)` }}>{texto}</span>;
    }
    case "deslizar": {
      const a = tramo(f, desde, desde + 12);
      return <span style={{ ...base, transform: `translateX(${(1 - a) * -80}px)`, opacity: a, clipPath: `inset(-20% ${(1 - a) * 100}% -30% 0)` }}>{texto}</span>;
    }
    default: {
      const a = tramo(f, desde, desde + 10, rebota);
      return <span style={{ ...base, transform: `translateY(${(1 - a) * 40}px)`, opacity: Math.min(1, a * 1.6) }}>{texto}</span>;
    }
  }
};

/** ícono dibujado a trazo (materiales a mano), en placa (plano, neón) o en píxeles */
export const IconoTema: React.FC<{ nombre: string; desde: number; t: TemaVivo; tam: number; color?: string }> = ({ nombre, desde, t, tam, color }) => {
  const f = useCurrentFrame();
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  if (f < desde) return <div style={{ width: tam, height: tam }} />;
  if (aMano(t.material)) {
    const p = tramo(f, desde, desde + 22, (x) => x);
    const tinta = color ?? (t.material === "acuarela" ? t.tinta : t.material === "crayon" ? t.acento : t.tinta);
    const flor = tramo(f, desde, desde + 26);
    return (
      <div className={`tz${id}`} style={{ width: tam, height: tam, position: "relative", filter: filtroDe(t.material) }}>
        <style>{`.tz${id} svg *{stroke-dasharray:100;stroke-dashoffset:${(100 * (1 - p)).toFixed(1)}}`}</style>
        {t.material === "acuarela" ? (
          <div style={{ position: "absolute", inset: -tam * 0.12, borderRadius: "48% 52% 45% 55%", background: `radial-gradient(circle at 40% 40%, ${t.acento}cc, ${t.acento2}55 60%, transparent 72%)`, filter: "url(#m-acuarela) blur(6px)", transform: `scale(${0.4 + flor * 0.6})`, opacity: 0.9 }} />
        ) : null}
        <div style={{ position: "absolute", inset: 0 }}><Icono nombre={nombre} tam={tam} color={tinta} grosor={t.material === "linea" ? 1.2 : t.material === "crayon" ? 2.6 : 1.8} /></div>
      </div>
    );
  }
  const a = tramo(f, desde, desde + 10, rebota);
  if (t.material === "pixel") {
    const paso = Math.floor(tramo(f, desde, desde + 8) * 4) / 4;
    return (
      <div style={{ width: tam, height: tam, background: t.acento, border: `${tam * 0.05}px solid ${t.tinta}`, boxShadow: `${tam * 0.05}px ${tam * 0.05}px 0 ${t.tinta}`, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${0.4 + paso * 0.6})`, imageRendering: "pixelated" }}>
        <Icono nombre={nombre} tam={tam * 0.62} color={t.tinta} grosor={3} />
      </div>
    );
  }
  const neon = t.material === "neon";
  return (
    <div style={{ width: tam, height: tam, borderRadius: tam * 0.26, background: neon ? "transparent" : t.acento, border: neon ? `3px solid ${t.acento}` : undefined, boxShadow: neon ? `0 0 40px ${t.acento}, inset 0 0 30px ${t.acento}55` : `0 ${tam * 0.06}px ${tam * 0.16}px rgba(0,0,0,0.2)`, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${0.5 + a * 0.5}) rotate(${(1 - a) * -12}deg)`, opacity: Math.min(1, a * 2) }}>
      <Icono nombre={nombre} tam={tam * 0.56} color={neon ? t.acento : "#fff"} grosor={2} />
    </div>
  );
};

/** contenedor (tarjeta) según el estilo */
export const Caja: React.FC<{ t: TemaVivo; desde: number; children: React.ReactNode; ancho?: number | string; pad?: number; estilo?: React.CSSProperties }> = ({ t, desde, children, ancho, pad = 34, estilo }) => {
  const f = useCurrentFrame();
  const a = tramo(f, desde, desde + 12, rebota);
  if (f < desde) return null;
  const mov: React.CSSProperties = t.material === "pixel" ? { transform: `scale(${Math.floor(a * 4) / 4})` } : { transform: `translateY(${(1 - a) * 40}px) scale(${0.9 + a * 0.1})`, opacity: Math.min(1, a * 1.5) };
  const cajas: Record<TipoCaja, React.CSSProperties> = {
    ninguna: {},
    blanca: { background: "#fff", borderRadius: 30, boxShadow: "0 20px 50px rgba(20,20,40,0.16)" },
    oscura: { background: "#16161D", borderRadius: 30, border: "1.5px solid rgba(255,255,255,0.1)", boxShadow: "0 30px 70px rgba(0,0,0,0.5)" },
    vidrio: { background: "rgba(255,255,255,0.08)", borderRadius: 30, border: "1.5px solid rgba(255,255,255,0.18)", backdropFilter: "blur(16px)" },
    papel: { background: "#FFFDF6", borderRadius: 6, boxShadow: "0 12px 30px rgba(60,40,20,0.18)", transform: `rotate(${(azar(desde) - 0.5) * 3}deg)` },
    pixel: { background: "#FFF7E0", border: `8px solid ${t.tinta}`, boxShadow: `10px 10px 0 ${t.tinta}` },
    tv: { background: "linear-gradient(180deg,#0E2A5C,#081A3A)", borderLeft: `14px solid ${t.acento}`, boxShadow: "0 20px 50px rgba(0,0,0,0.4)" },
    ventana: { background: "#fff", borderRadius: 22, boxShadow: "0 30px 70px rgba(0,0,0,0.35)", overflow: "hidden" },
  };
  return <div style={{ width: ancho, padding: pad, boxSizing: "border-box", ...cajas[t.caja], ...mov, ...estilo }}>{children}</div>;
};

/** número que sube hasta `valor` */
const Numero: React.FC<{ valor: number; de?: number; desde: number; t: TemaVivo; tam: number; prefijo?: string; sufijo?: string; color?: string }> = ({ valor, de = 0, desde, t, tam, prefijo = "", sufijo = "", color }) => {
  const f = useCurrentFrame();
  const p = tramo(f, desde, desde + 30);
  const v = interpolate(p, [0, 1], [de, valor]);
  const txt = valor >= 1000 ? Math.round(v).toLocaleString("es-ES") : Number.isInteger(valor) ? Math.round(v).toString() : v.toFixed(1);
  if (f < desde) return null;
  return (
    <div style={{ fontFamily: t.fTitulo, fontSize: tam, fontWeight: 800, color: color ?? t.acento, lineHeight: 1, fontVariantNumeric: "tabular-nums", filter: filtroDe(t.material), textShadow: t.material === "neon" ? `0 0 30px ${t.acento}` : undefined }}>
      {t.material === "pixel" ? `${prefijo}${Math.round(v)}${sufijo}` : `${prefijo}${txt}${sufijo}`}
    </div>
  );
};

// ───────────────────────── escenas comunes ─────────────────────────

type Linea = { texto: string; en: number; clave?: boolean };
type ItemLista = { texto: string; en: number; icono?: string };

export const EscenaComun: React.FC<{ e: Escena; t: TemaVivo }> = ({ e, t }) => {
  const { fps } = useEscena(e);
  const en = (s: unknown, def = 3) => (typeof s === "number" ? Math.max(0, enEscena(e, s, fps)) : def);
  const zona = t.zona ?? ZONA;
  const izq = t.alinear === "izquierda";
  // zonas bajas (cuenta regresiva): todo se achica en proporción para que entre
  const escala = Math.min(1, zona.alto / 760);
  const alto = zona.alto / escala;
  const marco: React.CSSProperties = { position: "absolute", left: 70 / escala - (1080 / escala - 1080) / 2, width: (1080 - 140) / escala, top: zona.top + zona.alto / 2 - alto / 2, height: alto, transform: `scale(${escala})`, transformOrigin: "50% 50%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: izq ? "flex-start" : "center", textAlign: izq ? "left" : "center", gap: 28 };
  const Extra = t.extras?.[e.tipo];
  if (Extra) return <Extra e={e} t={t} />;

  switch (e.tipo) {
    case "titular": {
      const lineas = (e.lineas as Linea[]) ?? [{ texto: e.texto as string, en: (e.en as number) ?? e.desde }];
      const tam = lineas.length > 2 ? 165 : 185;
      return (
        <div style={marco}>
          {t.titularEnCaja ? (
            <Caja t={t} desde={en(lineas[0]?.en, 1)} pad={50} estilo={{ textAlign: "center" }}>
              {lineas.map((l, i) => <div key={i}><TextoEntra texto={l.texto} desde={en(l.en)} t={t} tam={l.clave ? tam * 1.08 : tam} color={l.clave ? t.acento : t.tinta} peso={800} /></div>)}
            </Caja>
          ) : (
            lineas.map((l, i) => (
              <div key={i}><TextoEntra texto={l.texto} desde={en(l.en)} t={t} tam={l.clave ? tam * 1.08 : tam} color={l.clave ? t.acento : t.tinta} peso={800} /></div>
            ))
          )}
        </div>
      );
    }
    case "medio":
    case "dibujo":
      if (e.video || e.imagen) {
        return (
          <div style={marco}>
            <Caja t={t} desde={en(e.en, 2)} pad={t.caja === "ninguna" ? 0 : 18} estilo={{ width: 760 }}>
              <div style={{ width: "100%", aspectRatio: (e.formato as string) ?? "4 / 5", maxHeight: zona.alto - (e.titulo ? 180 : 40), overflow: "hidden", borderRadius: t.material === "pixel" ? 0 : 18 }}>
                <Medio imagen={e.imagen as string} video={e.video as string} desde={e.desdeClip as number} />
              </div>
            </Caja>
            {e.titulo ? <TextoEntra texto={e.titulo as string} desde={en(e.tituloEn ?? e.en, 8) + (e.tituloEn ? 0 : 10)} t={t} tam={96} peso={800} /> : null}
          </div>
        );
      }
      return (
        <div style={marco}>
          <IconoTema nombre={(e.icono as string) ?? "Sparkles"} desde={en(e.en, 2)} t={t} tam={420} />
          {e.titulo ? <TextoEntra texto={e.titulo as string} desde={en(e.tituloEn ?? e.en, 8) + (e.tituloEn ? 0 : 10)} t={t} tam={116} peso={800} /> : null}
        </div>
      );
    case "lista": {
      const items = (e.items as ItemLista[]) ?? [];
      return (
        <div style={{ ...marco, alignItems: "stretch" }}>
          <Caja t={t} desde={2} pad={t.caja === "ninguna" ? 0 : 40}>
            {e.titulo ? <div style={{ marginBottom: 18 }}><TextoEntra texto={e.titulo as string} desde={3} t={t} tam={78} color={t.acento} peso={800} /></div> : null}
            {items.map((it, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 26, padding: "16px 0" }}>
                {it.icono ? <IconoTema nombre={it.icono} desde={en(it.en)} t={t} tam={112} /> : <Viñeta t={t} desde={en(it.en)} n={i + 1} grande />}
                <TextoEntra texto={it.texto} desde={en(it.en)} t={{ ...t, mayus: false }} tam={78} peso={700} fuente={t.fTexto} />
              </div>
            ))}
          </Caja>
        </div>
      );
    }
    case "cifra":
      return (
        <div style={marco}>
          <Caja t={t} desde={en(e.en, 2)} pad={t.caja === "ninguna" ? 0 : 50}>
            <Numero valor={e.valor as number} de={e.de as number} desde={en(e.en, 2) + 4} t={t} tam={380 * (t.escalaTexto ?? 1)} prefijo={e.prefijo as string} sufijo={e.sufijo as string} />
            {e.etiqueta ? <div style={{ marginTop: 14 }}><TextoEntra texto={e.etiqueta as string} desde={en(e.en, 2) + 12} t={{ ...t, mayus: false }} tam={80} fuente={t.fTexto} /></div> : null}
          </Caja>
        </div>
      );
    case "comparacion": {
      const lados = [e.izq as { titulo: string; icono?: string }, e.der as { titulo: string; icono?: string }];
      const tachar = e.tachar as "izq" | "der" | undefined;
      const tachaEn = en(e.tacharEn, 30);
      return (
        <div style={{ ...marco, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 30 }}>
          {lados.map((l, i) => (
            <div key={i} style={{ position: "relative" }}>
              <Caja t={t} desde={en(i ? e.derEn ?? e.en : e.en, 2) + i * 6} ancho={455} pad={36} estilo={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 26, minHeight: 540, justifyContent: "center" }}>
                {l?.icono ? <IconoTema nombre={l.icono} desde={en(i ? e.derEn ?? e.en : e.en, 2) + i * 6 + 4} t={t} tam={230} color={i ? t.acento : undefined} /> : null}
                <TextoEntra texto={l?.titulo ?? ""} desde={en(i ? e.derEn ?? e.en : e.en, 2) + i * 6 + 8} t={{ ...t, mayus: false }} tam={66} peso={800} fuente={t.fTexto} />
              </Caja>
              {tachar === (i ? "der" : "izq") ? <Tachon t={t} desde={tachaEn} /> : null}
            </div>
          ))}
        </div>
      );
    }
    case "pasos": {
      const pasos = (e.pasos as ItemLista[]) ?? [];
      return (
        <div style={{ ...marco, alignItems: "stretch", gap: 10 }}>
          {pasos.map((p, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 28 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <Viñeta t={t} desde={en(p.en)} n={i + 1} grande />
                {i < pasos.length - 1 ? <Conector t={t} desde={en(p.en) + 6} hasta={en(pasos[i + 1].en)} /> : null}
              </div>
              <TextoEntra texto={p.texto} desde={en(p.en) + 3} t={{ ...t, mayus: false }} tam={84} peso={700} fuente={t.fTexto} />
            </div>
          ))}
        </div>
      );
    }
    case "cierre":
      return (
        <div style={marco}>
          <TextoEntra texto={(e.titulo as string) ?? ""} desde={en(e.en, 3)} t={t} tam={140} peso={800} color={t.tinta} />
          {e.palabra ? (
            <Caja t={t} desde={en(e.palabraEn, 16)} pad={30}>
              <span style={{ fontFamily: t.fTexto, fontSize: 44, color: t.caja === "oscura" || t.caja === "tv" || t.caja === "vidrio" ? "#ffffffaa" : "#00000088" }}>comenta </span>
              <TextoEntra texto={e.palabra as string} desde={en(e.palabraEn, 16) + 6} t={{ ...t, entrada: "teclear" }} tam={78} color={t.acento} peso={800} />
            </Caja>
          ) : null}
        </div>
      );
    default:
      return null;
  }
};

/** viñeta numerada de listas y pasos */
const Viñeta: React.FC<{ t: TemaVivo; desde: number; n: number; grande?: boolean }> = ({ t, desde, n, grande }) => {
  const f = useCurrentFrame();
  const a = tramo(f, desde, desde + 8, rebota);
  const tam = grande ? 124 : 90;
  if (f < desde) return <div style={{ width: tam, height: tam }} />;
  const aMan = aMano(t.material);
  return (
    <div style={{ width: tam, height: tam, flexShrink: 0, borderRadius: t.material === "pixel" ? 0 : tam / 2, border: aMan ? `5px solid ${t.acento}` : t.material === "pixel" ? `6px solid ${t.tinta}` : undefined, background: aMan ? "transparent" : t.acento, color: aMan ? t.acento : t.material === "pixel" ? t.tinta : "#fff", fontFamily: t.fTitulo, fontWeight: 800, fontSize: tam * 0.48, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${0.4 + a * 0.6})`, filter: filtroDe(t.material), boxShadow: t.material === "neon" ? `0 0 26px ${t.acento}` : undefined }}>
      {n}
    </div>
  );
};

/** línea que une un paso con el siguiente (se dibuja entre las dos palabras) */
const Conector: React.FC<{ t: TemaVivo; desde: number; hasta: number }> = ({ t, desde, hasta }) => {
  const f = useCurrentFrame();
  const p = tramo(f, desde, Math.max(desde + 6, hasta));
  return <div style={{ width: 8, height: 90, background: `${t.acento}33`, position: "relative", filter: filtroDe(t.material) }}><div style={{ position: "absolute", left: 0, right: 0, top: 0, height: `${p * 100}%`, background: t.acento }} /></div>;
};

/** tachón que cruza una tarjeta (lo que ya no hace falta) */
const Tachon: React.FC<{ t: TemaVivo; desde: number }> = ({ t, desde }) => {
  const f = useCurrentFrame();
  const p = tramo(f, desde, desde + 8);
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", filter: filtroDe(t.material) }}>
      <path d="M 8 12 L 92 88" stroke={t.material === "pixel" ? t.tinta : "#E53935"} strokeWidth={4} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} fill="none" />
      <path d="M 92 12 L 8 88" stroke={t.material === "pixel" ? t.tinta : "#E53935"} strokeWidth={4} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - tramo(f, desde + 5, desde + 13)} fill="none" />
    </svg>
  );
};

// ───────────────────────── subtítulos por tema ─────────────────────────

/** subtítulo de cada estilo: una frase por línea, palabra a palabra, la clave en el color del estilo */
export const SubtituloTema: React.FC<{ fs: readonly Frase[]; claves?: readonly string[]; t: TemaVivo }> = ({ fs, claves, t }) => {
  const f = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const s = t.sub;
  const tt = f / fps;
  const fr = fraseEn(fs, tt);
  if (!fr) return null;
  const izq = s.alinear === "izquierda";
  const contorno = s.contorno ? { WebkitTextStroke: `${s.tam * 0.12}px ${s.contorno}`, paintOrder: "stroke fill" as const } : {};
  const palabras = fr.palabras.map((p, i) => {
    if (tt < p.ini) return null;
    const a = tramo(f, p.ini * fps, p.ini * fps + 5, rebota);
    const clave = esClave(p, claves);
    const resalta = s.caja === "resalta" && clave;
    return (
      <span key={i} style={{ display: "inline-block", marginRight: `${s.tam * (s.caja === "dialogo" ? 0.7 : 0.26)}px`, transform: `translateY(${(1 - a) * 14}px)`, opacity: Math.min(1, a * 1.6), color: resalta ? "#111" : clave ? s.clave : s.color, background: resalta ? s.clave : undefined, padding: resalta ? "0 0.14em" : undefined, borderRadius: resalta ? 8 : undefined, ...contorno }}>
        {s.caja === "dialogo" ? p.texto : p.texto}
      </span>
    );
  });
  const texto: React.CSSProperties = { fontFamily: t.fTexto, fontSize: s.tam, fontWeight: s.peso ?? 700, lineHeight: 1.18, textTransform: s.mayus ? "uppercase" : undefined, textAlign: izq ? "left" : "center", filter: filtroDe(t.material === "tiza" || t.material === "crayon" ? t.material : "plano") };
  if (s.caja === "zocalo") {
    return (
      <div style={{ position: "absolute", left: 50, right: 50, top: s.y, background: s.fondoCaja ?? "#0B2E6B", borderLeft: `16px solid ${t.acento}`, padding: "20px 30px", boxSizing: "border-box", ...texto, textAlign: "left" }}>{palabras}</div>
    );
  }
  if (s.caja === "dialogo") {
    return (
      <div style={{ position: "absolute", left: 50, right: 50, top: s.y, background: s.fondoCaja ?? "#1B1B3A", border: "8px solid #fff", outline: "8px solid #1B1B3A", padding: "26px 30px", boxSizing: "border-box", minHeight: 200, ...texto, textAlign: "left", lineHeight: 1.5 }}>
        {palabras}
        <span style={{ position: "absolute", right: 24, bottom: 14, color: "#fff", opacity: Math.floor(f / 10) % 2 ? 1 : 0, fontSize: s.tam * 0.8 }}>▼</span>
      </div>
    );
  }
  if (s.caja === "pastilla") {
    return (
      <div style={{ position: "absolute", left: 0, width, top: s.y, display: "flex", justifyContent: "center" }}>
        <div style={{ maxWidth: 940, background: s.fondoCaja ?? "rgba(0,0,0,0.6)", borderRadius: 24, padding: "14px 28px", ...texto }}>{palabras}</div>
      </div>
    );
  }
  return <div style={{ position: "absolute", left: izq ? 70 : 60, right: 60, top: s.y, ...texto }}>{palabras}</div>;
};

/** la escena que corresponde al segundo t */
export const escenaEn = (es: readonly Escena[], t: number) => es.find((e) => t >= e.desde && t < e.hasta);

/** acento del plan (marca) sobre el tema */
export const conMarca = (t: Tema, acento?: string): Tema => (acento ? { ...t, acento, sub: { ...t.sub, clave: t.sub.clave === t.acento ? acento : t.sub.clave } } : t);

export { usePlan };
