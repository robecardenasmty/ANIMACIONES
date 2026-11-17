// Videos sin rostro · grupo C: 7 estilos de «explicador» (inspirados en formatos que funcionan, diseño propio).
// Cada uno usa las escenas comunes y suma su escena estrella: papel en capas, synthwave, objeto 3D, ecuación,
// mascota con gráfico de torta, dominó que cae y átomo brillante.
import { loadFont as fredoka } from "@remotion/google-fonts/Fredoka";
import { loadFont as ibmMono } from "@remotion/google-fonts/IBMPlexMono";
import { loadFont as interTight } from "@remotion/google-fonts/InterTight";
import { loadFont as lora } from "@remotion/google-fonts/Lora";
import { loadFont as orbitron } from "@remotion/google-fonts/Orbitron";
import { loadFont as righteous } from "@remotion/google-fonts/Righteous";
import { loadFont as spaceGrotesk } from "@remotion/google-fonts/SpaceGrotesk";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import React, { useLayoutEffect } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { Escena, azar, enEscena, rebota, tramo, useEscena } from "../base";
import { Caja, Tema, TemaVivo, TextoEntra } from "./tema";

const L = { subsets: ["latin"] as ("latin")[] };
const en = (e: Escena, s: unknown, fps: number, d = 3) => (typeof s === "number" ? Math.max(0, enEscena(e, s, fps)) : d);

// ═══════════ 1 · Papel recortado ═══════════
/** capas de papel con sombra: cielo, montes y olas que se mueven apenas (parallax) */
const FondoPapel: React.FC<{ noche?: boolean }> = ({ noche = true }) => {
  const f = useCurrentFrame();
  const capas = noche ? ["#1B2A4A", "#22365E", "#2C4676", "#3B5C8F", "#4E77A8"] : ["#F7D9B0", "#E9B88A", "#C98F6B", "#9C6B55", "#6E4B45"];
  return (
    <div style={{ position: "absolute", inset: 0, background: noche ? "#101A33" : "#FCEBD2", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 700, top: 230, width: 170, height: 170, borderRadius: "50%", background: noche ? "#F4E9C8" : "#FFD27A", boxShadow: "0 10px 30px rgba(0,0,0,0.35)" }} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <defs><filter id="sombraPapel" x="-10%" y="-10%" width="120%" height="140%"><feDropShadow dx="0" dy="-10" stdDeviation="9" floodColor="#000" floodOpacity="0.45" /></filter></defs>
        {capas.map((c, i) => {
          const y = 1050 + i * 170, a = 60 + i * 12, dx = Math.sin(f / (60 - i * 6) + i) * (8 + i * 6);
          const d = `M ${-60 + dx} ${y} ${Array.from({ length: 7 }).map((_, k) => `Q ${-60 + dx + k * 200 + 100} ${y - a * (k % 2 ? 0.4 : 1.2)} ${-60 + dx + (k + 1) * 200} ${y}`).join(" ")} L 1200 1920 L -60 1920 Z`;
          return <path key={i} d={d} fill={c} filter="url(#sombraPapel)" />;
        })}
      </svg>
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.16, mixBlendMode: "multiply" }}><filter id="fibra"><feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" /><feColorMatrix type="saturate" values="0" /></filter><rect width="100%" height="100%" filter="url(#fibra)" /></svg>
    </div>
  );
};

const PAPEL_RECORTADO: Tema = {
  id: "papel-recortado", nombre: "Papel recortado", material: "plano", entrada: "subir", caja: "oscura", tinta: "#FFF8EC", acento: "#FFC857", acento2: "#F4E9C8", titularEnCaja: false,
  sub: { y: 1160, tam: 56, color: "#FFF8EC", clave: "#FFC857", peso: 500, contorno: "#101A33" },
  fuentes: () => ({ titulo: lora("normal", { weights: ["700"], ...L }).fontFamily, texto: lora("normal", { weights: ["500"], ...L }).fontFamily }),
  Fondo: () => <FondoPapel />,
};

// ═══════════ 2 · Synthwave ═══════════
const FondoSynth: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(#0B0221 0%, #2A0845 45%, #6A0F6B 62%, #0B0221 62.2%)", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 290, top: 760, width: 500, height: 500, borderRadius: "50%", background: "linear-gradient(#FFE66D, #FF6F91 60%, #C239B3)", WebkitMaskImage: "linear-gradient(#000 45%, transparent 45%, transparent 50%, #000 50%, #000 58%, transparent 58%, transparent 63%, #000 63%, #000 70%, transparent 70%, transparent 76%, #000 76%)", boxShadow: "0 0 120px #FF6F91" }} />
      <svg width={1080} height={400} style={{ position: "absolute", left: 0, top: 870 }}>
        <path d="M 0 330 L 120 160 L 230 260 L 360 90 L 470 230 L 560 300 L 650 150 L 780 270 L 900 120 L 1080 320 L 1080 400 L 0 400 Z" fill="#14052E" stroke="#FF4FD8" strokeWidth={3} />
        {[0.3, 0.55, 0.8].map((k) => <path key={k} d={`M 0 ${330 + 0} L 360 ${90 + 240 * k} L 650 ${150 + 180 * k} L 900 ${120 + 200 * k} L 1080 320`} stroke="#FF4FD8" strokeWidth={1.5} fill="none" opacity={0.5} />)}
      </svg>
      <div style={{ position: "absolute", left: -540, right: -540, top: 1190, height: 1400, transform: "perspective(500px) rotateX(70deg)", transformOrigin: "50% 0%", backgroundImage: "linear-gradient(#FF4FD8 3px, transparent 3px), linear-gradient(90deg, #FF4FD8 3px, transparent 3px)", backgroundSize: "120px 120px", backgroundPosition: `0 ${(f * 6) % 120}px`, opacity: 0.85, boxShadow: "0 0 40px #FF4FD8" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1170, height: 60, background: "linear-gradient(#0B0221, transparent)" }} />
    </div>
  );
};

const SYNTHWAVE: Tema = {
  id: "synthwave", nombre: "Synthwave", material: "neon", entrada: "golpe", caja: "vidrio", tinta: "#FDF6FF", acento: "#FF4FD8", acento2: "#3DF5FF", mayus: true,
  zona: { top: 260, alto: 520 },
  sub: { y: 1080, tam: 54, color: "#FDF6FF", clave: "#3DF5FF", peso: 400, mayus: true, contorno: "#0B0221" },
  fuentes: () => ({ titulo: righteous("normal", { weights: ["400"], ...L }).fontFamily, texto: orbitron("normal", { weights: ["600"], ...L }).fontFamily }),
  Fondo: () => <FondoSynth />,
};

// ═══════════ 3 · Explicador 3D ═══════════
type Forma3D = "panel" | "cubo" | "esfera" | "chip" | "celular" | "moneda" | "caja";

const CamaraObjeto: React.FC = () => {
  const { camera, gl, scene } = useThree();
  useLayoutEffect(() => { camera.position.set(0, 2.2, 7); camera.lookAt(0, 0.4, 0); gl.setClearColor(0x000000, 0); scene.background = null; }, [camera, gl, scene]);
  return null;
};

const Objeto3D: React.FC<{ forma: Forma3D; color: string; giro: number; aparece: number }> = ({ forma, color, giro, aparece }) => {
  const s = 0.3 + aparece * 0.7;
  const mat = <meshStandardMaterial color={color} roughness={0.35} metalness={0.25} />;
  return (
    <group rotation={[0.15, giro, 0]} position={[0, 0.4 + (1 - aparece) * 1.5, 0]} scale={[s, s, s]}>
      {forma === "panel" ? (
        <>
          <mesh rotation={[-0.6, 0, 0]} castShadow><boxGeometry args={[3, 0.08, 2]} /><meshStandardMaterial color="#1E3A8A" roughness={0.2} metalness={0.6} /></mesh>
          {Array.from({ length: 6 }).map((_, i) => <mesh key={i} rotation={[-0.6, 0, 0]} position={[-1.25 + i * 0.5, 0.05, 0]}><boxGeometry args={[0.02, 0.1, 2]} /><meshStandardMaterial color="#93C5FD" /></mesh>)}
          <mesh position={[0, -0.7, 0.2]}><cylinderGeometry args={[0.08, 0.08, 1.2, 16]} /><meshStandardMaterial color="#9CA3AF" metalness={0.8} roughness={0.3} /></mesh>
        </>
      ) : forma === "cubo" || forma === "caja" ? (
        <mesh castShadow><boxGeometry args={[1.8, 1.8, 1.8]} />{mat}</mesh>
      ) : forma === "esfera" ? (
        <mesh castShadow><sphereGeometry args={[1.2, 64, 48]} />{mat}</mesh>
      ) : forma === "chip" ? (
        <>
          <mesh castShadow><boxGeometry args={[2, 0.25, 2]} /><meshStandardMaterial color="#111827" roughness={0.4} metalness={0.5} /></mesh>
          <mesh position={[0, 0.14, 0]}><boxGeometry args={[1.1, 0.04, 1.1]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} /></mesh>
          {Array.from({ length: 16 }).map((_, i) => <mesh key={i} position={[i < 8 ? -1.1 : 1.1, 0, -0.85 + (i % 8) * 0.24]}><boxGeometry args={[0.25, 0.05, 0.08]} /><meshStandardMaterial color="#D1D5DB" metalness={0.9} roughness={0.2} /></mesh>)}
        </>
      ) : forma === "celular" ? (
        <>
          <mesh castShadow><boxGeometry args={[1.3, 2.6, 0.14]} /><meshStandardMaterial color="#111827" roughness={0.3} metalness={0.6} /></mesh>
          <mesh position={[0, 0, 0.075]}><boxGeometry args={[1.18, 2.45, 0.01]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} /></mesh>
        </>
      ) : (
        <mesh castShadow rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[1.1, 1.1, 0.2, 64]} /><meshStandardMaterial color="#F5C542" metalness={0.9} roughness={0.25} /></mesh>
      )}
    </group>
  );
};

const EscenaObjeto3D: React.FC<{ e: Escena; t: TemaVivo }> = ({ e, t }) => {
  const { f, fps } = useEscena(e);
  const d = en(e, e.en, fps, 2);
  const aparece = tramo(f, d, d + 18, rebota);
  return (
    <>
      <div style={{ position: "absolute", left: 0, top: 260, width: 1080, height: 820 }}>
        <ThreeCanvas width={1080} height={820} shadows gl={{ alpha: true }} style={{ background: "transparent" }} camera={{ fov: 40, position: [0, 2.2, 7] }}>
          <CamaraObjeto />
          <ambientLight intensity={0.35} />
          <spotLight position={[3, 7, 4]} angle={0.5} penumbra={0.6} intensity={120} castShadow color="#FFFFFF" />
          <pointLight position={[-4, 2, -2]} intensity={25} color={t.acento} />
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]} receiveShadow><circleGeometry args={[2.3, 64]} /><meshStandardMaterial color="#2A2C36" roughness={0.3} metalness={0.4} transparent opacity={0.55} /></mesh>
          {f >= d ? <Objeto3D forma={(e.forma as Forma3D) ?? "cubo"} color={(e.color as string) ?? t.acento} giro={-0.45 + Math.sin((f / fps) * 0.9) * 0.55} aparece={aparece} /> : null}
        </ThreeCanvas>
      </div>
      {e.titulo ? <div style={{ position: "absolute", left: 70, right: 70, top: 300, textAlign: "center" }}><TextoEntra texto={e.titulo as string} desde={en(e, e.tituloEn ?? e.en, fps, 6) + 4} t={t} tam={78} /></div> : null}
      {e.nota ? <div style={{ position: "absolute", left: 70, right: 70, top: 980, textAlign: "center" }}><TextoEntra texto={e.nota as string} desde={d + 20} t={{ ...t, mayus: false }} tam={44} color="#9CA3AF" fuente={t.fTexto} peso={500} /></div> : null}
    </>
  );
};

const EXPLICADOR_3D: Tema = {
  id: "explicador-3d", nombre: "Explicador 3D", material: "plano", entrada: "subir", caja: "vidrio", tinta: "#F4F4F6", acento: "#4F8CFF", acento2: "#FFFFFF",
  sub: { y: 1160, tam: 54, color: "#F4F4F6", clave: "#7FB0FF", peso: 600 },
  fuentes: () => ({ titulo: interTight("normal", { weights: ["700"], ...L }).fontFamily, texto: interTight("normal", { weights: ["500"], ...L }).fontFamily }),
  Fondo: () => (
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(90% 55% at 50% 40%, #23252F 0%, #0B0C10 70%)" }}>
      <div style={{ position: "absolute", left: 240, top: 120, width: 600, height: 700, background: "radial-gradient(closest-side, rgba(255,255,255,0.12), transparent)", filter: "blur(20px)" }} />
    </div>
  ),
  extras: { objeto3d: EscenaObjeto3D },
};

// ═══════════ 4 · Diagrama matemático ═══════════
const Ecuacion: React.FC<{ e: Escena; t: TemaVivo }> = ({ e, t }) => {
  const { f, fps } = useEscena(e);
  const cajas = (e.cajas as { texto: string; en?: number }[]) ?? [];
  const res = e.resultado as string | undefined;
  const dRes = en(e, e.resultadoEn, fps, 40);
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 300, height: 830, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 46 }}>
      {e.titulo ? <TextoEntra texto={e.titulo as string} desde={2} t={t} tam={64} /> : null}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 18, maxWidth: 960 }}>
        {cajas.map((c, i) => {
          const d = en(e, c.en, fps, 6 + i * 5);
          const a = tramo(f, d, d + 10, rebota);
          return (
            <div key={i} style={{ minWidth: 150, height: 150, padding: "0 26px", borderRadius: 75, border: `5px solid ${t.tinta}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: t.fTitulo, fontSize: 70, color: t.tinta, transform: `scale(${0.5 + a * 0.5})`, opacity: Math.min(1, a * 2), background: "#FFFDF7" }}>
              {c.texto}
            </div>
          );
        })}
      </div>
      {res ? (
        <div style={{ display: "flex", alignItems: "center", gap: 24, opacity: tramo(f, dRes, dRes + 8) }}>
          <div style={{ fontFamily: t.fTitulo, fontSize: 70, color: t.tinta }}>=</div>
          <div style={{ padding: "18px 40px", borderRadius: 18, background: t.acento, color: "#fff", fontFamily: t.fTitulo, fontSize: 80, transform: `scale(${0.7 + tramo(f, dRes, dRes + 12, rebota) * 0.3})` }}>{res}</div>
        </div>
      ) : null}
    </div>
  );
};

const DIAGRAMA: Tema = {
  id: "diagrama", nombre: "Diagrama matemático", material: "linea", entrada: "subir", caja: "blanca", tinta: "#22252B", acento: "#E8743B", acento2: "#3B6FE8",
  sub: { y: 1160, tam: 52, color: "#22252B", clave: "#E8743B", peso: 500 },
  fuentes: () => ({ titulo: ibmMono("normal", { weights: ["600"], ...L }).fontFamily, texto: spaceGrotesk("normal", { weights: ["500"], ...L }).fontFamily }),
  Fondo: () => (
    <div style={{ position: "absolute", inset: 0, background: "#F2EEE3" }}>
      <div style={{ position: "absolute", left: 50, right: 50, top: 150, bottom: 300, border: "2px solid rgba(34,37,43,0.25)", borderRadius: 24, background: "#FBF8F0", boxShadow: "0 20px 40px rgba(0,0,0,0.08)" }}>
        <div style={{ position: "absolute", left: 30, top: 24, fontFamily: "IBM Plex Mono, monospace", fontSize: 24, color: "rgba(34,37,43,0.5)" }}>FIG. 01</div>
      </div>
    </div>
  ),
  extras: { ecuacion: Ecuacion },
};

// ═══════════ 5 · Explicador cartoon (mascota) ═══════════
/** mascota propia: un bloque redondeado con cara, que rebota y parpadea */
const Mascota: React.FC<{ color: string; tam?: number }> = ({ color, tam = 220 }) => {
  const f = useCurrentFrame();
  const salto = Math.abs(Math.sin(f / 9)) * 18;
  const parpadeo = f % 90 < 4 ? 0.15 : 1;
  return (
    <div style={{ width: tam, height: tam * 0.82, transform: `translateY(${-salto}px) scaleY(${1 - salto / 400})`, transformOrigin: "50% 100%", position: "relative" }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: tam * 0.16, background: color, boxShadow: `inset -${tam * 0.06}px -${tam * 0.06}px 0 rgba(0,0,0,0.15), 0 ${tam * 0.06}px 0 rgba(0,0,0,0.2)` }} />
      {[0.3, 0.62].map((x) => <div key={x} style={{ position: "absolute", left: tam * x, top: tam * 0.24, width: tam * 0.1, height: tam * 0.13 * parpadeo, borderRadius: tam * 0.05, background: "#2B1E16" }} />)}
      <div style={{ position: "absolute", left: tam * 0.38, top: tam * 0.46, width: tam * 0.26, height: tam * 0.12, borderBottomLeftRadius: tam * 0.14, borderBottomRightRadius: tam * 0.14, background: "#2B1E16" }} />
      {[-0.08, 0.98].map((x, i) => <div key={i} style={{ position: "absolute", left: tam * x, top: tam * 0.4, width: tam * 0.12, height: tam * 0.22, borderRadius: tam * 0.06, background: color, transform: `rotate(${(i ? -1 : 1) * (20 + Math.sin(f / 6) * 15)}deg)` }} />)}
    </div>
  );
};

const Torta: React.FC<{ e: Escena; t: TemaVivo }> = ({ e, t }) => {
  const { f, fps } = useEscena(e);
  const d = en(e, e.en, fps, 4);
  const p = interpolate(tramo(f, d, d + 30), [0, 1], [0, ((e.porcentaje as number) ?? 50) / 100]);
  const r = 230, c = 2 * Math.PI * r;
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 300, height: 830, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 30 }}>
      <Caja t={t} desde={2} pad={40} estilo={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        {e.titulo ? <TextoEntra texto={e.titulo as string} desde={4} t={t} tam={60} /> : null}
        <svg width={560} height={560} viewBox="-280 -280 560 560">
          <circle r={r} fill="none" stroke={t.acento2} strokeWidth={120} opacity={0.9} />
          <circle r={r} fill="none" stroke={t.acento} strokeWidth={120} strokeDasharray={`${c * p} ${c}`} transform="rotate(-90)" />
          <text y={24} textAnchor="middle" fontSize={96} fontWeight={700} fill={t.tinta} fontFamily={t.fTitulo}>{Math.round(p * 100)}%</text>
        </svg>
        {e.etiqueta ? <TextoEntra texto={e.etiqueta as string} desde={d + 20} t={{ ...t, mayus: false }} tam={52} fuente={t.fTexto} /> : null}
      </Caja>
    </div>
  );
};

const CapaMascota: React.FC = () => (
  <div style={{ position: "absolute", left: 60, top: 1300 }}><Mascota color="#F28B50" tam={270} /></div>
);

const CARTOON: Tema = {
  id: "cartoon-explicador", nombre: "Explicador cartoon", material: "plano", entrada: "golpe", caja: "blanca", tinta: "#3A2A20", acento: "#F28B50", acento2: "#7BC8A4",
  sub: { y: 1160, tam: 58, color: "#3A2A20", clave: "#E2602A", peso: 600 },
  fuentes: () => ({ titulo: fredoka("normal", { weights: ["700"], ...L }).fontFamily, texto: fredoka("normal", { weights: ["500"], ...L }).fontFamily }),
  Fondo: () => <div style={{ position: "absolute", inset: 0, background: "#EFE4CF", backgroundImage: "radial-gradient(rgba(58,42,32,0.07) 3px, transparent 3px)", backgroundSize: "40px 40px" }} />,
  Capa: CapaMascota,
  extras: { torta: Torta },
};

// ═══════════ 6 · Dominó ═══════════
const CamaraDomino: React.FC = () => {
  const { camera, gl } = useThree();
  useLayoutEffect(() => { gl.setClearColor(0x000000, 0); }, [gl]);
  useLayoutEffect(() => { camera.position.set(0, 7, 7.5); camera.lookAt(0, 0.3, 0.3); }, [camera]);
  return null;
};

const EscenaDomino: React.FC<{ e: Escena; t: TemaVivo }> = ({ e, t }) => {
  const { f, fps } = useEscena(e);
  const d = en(e, e.en, fps, 3);
  const n = 22;
  // fichas en curva en S; cada una cae un poco después que la anterior
  const fichas = Array.from({ length: n }).map((_, i) => {
    const u = i / (n - 1);
    const x = -5 + u * 10, z = Math.sin(u * Math.PI * 2) * 1.6;
    const ang = Math.atan2(Math.cos(u * Math.PI * 2) * 1.6 * Math.PI * 2 / 10, 1);
    const cae = tramo(f, d + i * 2.2, d + i * 2.2 + 7);
    return { x, z, ang, cae };
  });
  const fin = d + n * 2.2 + 8;
  return (
    <>
      <div style={{ position: "absolute", left: 0, top: 480, width: 1080, height: 760 }}>
        <ThreeCanvas width={1080} height={760} shadows gl={{ alpha: true }} style={{ background: "transparent" }} camera={{ fov: 46, position: [0, 7, 7.5] }}>
          <CamaraDomino />
          <ambientLight intensity={0.5} />
          <directionalLight position={[4, 10, 6]} intensity={2.2} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[40, 40]} /><shadowMaterial opacity={0.25} /></mesh>
          {fichas.map((p, i) => (
            <group key={i} position={[p.x, 0, p.z]} rotation={[0, -p.ang, 0]}>
              <group rotation={[0, 0, -p.cae * 1.35]} position={[0.1, 0, 0]}>
                <mesh position={[-0.1, 0.6, 0]} castShadow><boxGeometry args={[0.2, 1.2, 0.6]} /><meshStandardMaterial color={i % 2 ? "#FFFFFF" : t.acento} roughness={0.4} /></mesh>
              </group>
            </group>
          ))}
        </ThreeCanvas>
      </div>
      {e.texto ? <div style={{ position: "absolute", left: 60, right: 60, top: 330, textAlign: "center" }}><TextoEntra texto={e.texto as string} desde={Math.round(fin)} t={t} tam={120} /></div> : null}
    </>
  );
};

const DOMINO: Tema = {
  id: "domino", nombre: "Dominó", material: "plano", entrada: "golpe", caja: "blanca", tinta: "#2B2420", acento: "#C8553D", acento2: "#2B2420", mayus: true,
  sub: { y: 1160, tam: 56, color: "#2B2420", clave: "#C8553D", peso: 600, mayus: true },
  fuentes: () => ({ titulo: interTight("normal", { weights: ["800"], ...L }).fontFamily, texto: interTight("normal", { weights: ["600"], ...L }).fontFamily }),
  Fondo: () => <div style={{ position: "absolute", inset: 0, background: "linear-gradient(#F4ECDD, #E6D7BE)" }} />,
  extras: { domino: EscenaDomino },
};

// ═══════════ 7 · Átomo brillante ═══════════
const Atomo: React.FC<{ e: Escena; t: TemaVivo }> = ({ e, t }) => {
  const { f, fps } = useEscena(e);
  const d = en(e, e.en, fps, 2);
  const a = tramo(f, d, d + 16);
  const orbitas = Math.max(1, Math.min(4, (e.orbitas as number) ?? 3));
  const electrones = (e.electrones as number) ?? orbitas;
  return (
    <>
      <svg width={1080} height={1000} style={{ position: "absolute", left: 0, top: 260, opacity: a }}>
        <defs>
          <radialGradient id="nucleo"><stop offset="0" stopColor="#FFF4D6" /><stop offset="0.5" stopColor="#FF9F43" /><stop offset="1" stopColor="#C2410C" /></radialGradient>
          <filter id="brilloAtomo" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        <g transform="translate(540 480)">
          {Array.from({ length: orbitas }).map((_, i) => (
            <ellipse key={i} rx={170 + i * 90} ry={60 + i * 30} fill="none" stroke={t.acento} strokeWidth={2.5} opacity={0.55} transform={`rotate(${i * 60})`} />
          ))}
          {Array.from({ length: 9 }).map((_, i) => <circle key={i} cx={Math.cos(i * 2.4) * 34 * azar(i)} cy={Math.sin(i * 2.4) * 34 * azar(i + 3)} r={30} fill="url(#nucleo)" />)}
          {Array.from({ length: electrones }).map((_, i) => {
            const o = i % orbitas, rx = 170 + o * 90, ry = 60 + o * 30;
            const th = (f / fps) * (2.2 - o * 0.4) + (i * Math.PI * 2) / electrones;
            const x0 = Math.cos(th) * rx, y0 = Math.sin(th) * ry, rot = (o * 60 * Math.PI) / 180;
            return <circle key={i} cx={x0 * Math.cos(rot) - y0 * Math.sin(rot)} cy={x0 * Math.sin(rot) + y0 * Math.cos(rot)} r={14} fill="#E8FBFF" filter="url(#brilloAtomo)" />;
          })}
        </g>
      </svg>
      {e.nucleo ? <div style={{ position: "absolute", left: 60, right: 60, top: 300, textAlign: "center" }}><TextoEntra texto={e.nucleo as string} desde={d + 4} t={t} tam={80} /></div> : null}
      {e.etiqueta ? <div style={{ position: "absolute", left: 60, right: 60, top: 1040, textAlign: "center" }}><TextoEntra texto={e.etiqueta as string} desde={d + 18} t={{ ...t, mayus: false }} tam={48} color="#9FC7FF" fuente={t.fTexto} peso={500} /></div> : null}
    </>
  );
};

const ATOMO: Tema = {
  id: "atomo", nombre: "Átomo brillante", material: "neon", entrada: "subir", caja: "vidrio", tinta: "#EAF6FF", acento: "#5CC8FF", acento2: "#FFB547",
  sub: { y: 1160, tam: 54, color: "#EAF6FF", clave: "#FFB547", peso: 600 },
  fuentes: () => ({ titulo: spaceGrotesk("normal", { weights: ["700"], ...L }).fontFamily, texto: spaceGrotesk("normal", { weights: ["500"], ...L }).fontFamily }),
  Fondo: () => {
    const f = useCurrentFrame();
    return (
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(80% 55% at 50% 40%, #0F2A4F, #050B18 70%)" }}>
        {Array.from({ length: 50 }).map((_, i) => <div key={i} style={{ position: "absolute", left: `${azar(i) * 100}%`, top: `${azar(i + 30) * 100}%`, width: 3, height: 3, borderRadius: 2, background: "#BFE3FF", opacity: 0.2 + 0.4 * Math.abs(Math.sin(f / 20 + i)) }} />)}
      </div>
    );
  },
  extras: { atomo: Atomo },
};


export const TEMAS_C: Readonly<Record<string, Tema>> = Object.fromEntries(
  [PAPEL_RECORTADO, SYNTHWAVE, EXPLICADOR_3D, DIAGRAMA, CARTOON, DOMINO, ATOMO].map((t) => [t.id, t]),
);
