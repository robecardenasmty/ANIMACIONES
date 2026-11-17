import { Player, type PlayerRef } from "@remotion/player";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { GUION_DEMO, planDemo, repartir } from "./demo";
import { SinRostro } from "./sin-rostro/SinRostro";
import type { Caption, Plan } from "./sin-rostro/base";
import { TEMAS_A } from "./sin-rostro/estilos/grupo-a";
import { TEMAS_B } from "./sin-rostro/estilos/grupo-b";
import { TEMAS_C } from "./sin-rostro/estilos/grupo-c";

const VOZ_INICIAL = "3f45a7fd7a614655a61eb7027b955783";
const GRUPOS = [
  { titulo: "Con escenas propias", temas: TEMAS_A },
  { titulo: "Explicadores", temas: TEMAS_C },
  { titulo: "Más looks", temas: TEMAS_B },
];

type Voz = { url: string; duracion: number; captions: Caption[]; tiempos: string; guion: string };
type Estado = { fish: boolean; claude: boolean; pideClave: boolean } | null;

const guardado = (k: string, def = "") => { try { return localStorage.getItem(k) ?? def; } catch { return def; } };
const guardar = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* sin almacenamiento: no pasa nada */ } };

const duracionDe = async (bytes: ArrayBuffer): Promise<number> => {
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new Ctx();
  try { return (await ctx.decodeAudioData(bytes.slice(0))).duration; } finally { void ctx.close(); }
};

export const App: React.FC = () => {
  const [estado, setEstado] = useState<Estado>(null);
  const [clave, setClave] = useState(() => guardado("n2-clave"));
  const [guion, setGuion] = useState(GUION_DEMO);
  const [vozId, setVozId] = useState(() => guardado("n2-voz", VOZ_INICIAL));
  const [estilo, setEstilo] = useState("pizarra");
  const [acento, setAcento] = useState("");
  const [voz, setVoz] = useState<Voz | null>(null);
  const [plan, setPlan] = useState<Plan>(() => planDemo("pizarra"));
  const [esDemo, setEsDemo] = useState(true);
  const [paso, setPaso] = useState("");
  const [error, setError] = useState("");
  const player = useRef<PlayerRef>(null);

  useEffect(() => { fetch("/api/estado").then((r) => r.json()).then(setEstado).catch(() => setEstado(null)); }, []);
  useEffect(() => guardar("n2-clave", clave), [clave]);
  useEffect(() => guardar("n2-voz", vozId), [vozId]);

  const api = async (ruta: string, cuerpo: unknown) => {
    const r = await fetch(ruta, { method: "POST", headers: { "content-type": "application/json", "x-clave": clave }, body: JSON.stringify(cuerpo) });
    const datos = await r.json().catch(() => ({ error: `Respuesta ${r.status} sin JSON` }));
    if (!r.ok) throw new Error([datos.error, datos.detalle].filter(Boolean).join(" · "));
    return datos;
  };

  const pedirVoz = async (): Promise<Voz> => {
    setPaso("Generando la voz con Fish Audio…");
    const d = await api("/api/voz", { texto: guion, voz: vozId });
    const bytes = Uint8Array.from(atob(d.audio), (c) => c.charCodeAt(0));
    const duracion = await duracionDe(bytes.buffer);
    const captions: Caption[] = d.captions?.length ? d.captions : repartir(guion, duracion);
    if (voz) URL.revokeObjectURL(voz.url);
    const nueva = { url: URL.createObjectURL(new Blob([bytes], { type: d.mime })), duracion, captions, tiempos: d.tiempos, guion };
    setVoz(nueva);
    return nueva;
  };

  const pedirPlan = async (v: Voz, est: string) => {
    setPaso("Claude está dirigiendo las escenas…");
    const duracion = Math.round((v.duracion + 0.6) * 100) / 100;
    const d = await api("/api/plan", { estilo: est, duracion, captions: v.captions });
    setPlan({ estilo: est, fps: 30, duracion, voz: v.url, captions: v.captions, claves: d.claves, cintillo: d.cintillo, marca: acento ? { acento } : undefined, escenas: d.escenas });
    setEsDemo(false);
    player.current?.seekTo(0);
  };

  const correr = async (tarea: () => Promise<void>) => {
    setError("");
    try { await tarea(); } catch (e) { setError(e instanceof Error ? e.message : String(e)); } finally { setPaso(""); }
  };

  const generar = () => correr(async () => { const v = await pedirVoz(); await pedirPlan(v, estilo); });
  const otroEstilo = () => correr(async () => { if (voz) await pedirPlan(voz, estilo); });
  const demo = () => { setError(""); setPlan(planDemo(estilo, acento || undefined)); setEsDemo(true); player.current?.seekTo(0); };

  // en la demo, cambiar de estilo o de color se ve al instante (no gasta nada)
  useEffect(() => { if (esDemo) setPlan(planDemo(estilo, acento || undefined)); }, [estilo, acento, esDemo]);

  const bajarPlan = () => {
    const limpio = { ...plan, voz: "voz.mp3" };
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(limpio, null, 2)], { type: "application/json" }));
    a.download = `plan-${plan.estilo}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };

  const frames = Math.max(1, Math.round(plan.duracion * plan.fps));
  const props = useMemo(() => ({ plan }), [plan]);
  const ocupado = paso !== "";
  const listo = estado?.fish && estado?.claude;
  const vozVigente = voz && voz.guion === guion;

  return (
    <div className="app">
      <header>
        <h1>Reels Factory <span>· Nivel 2 · Animaciones</span></h1>
        <p className="estado">
          {estado === null ? "Sin servidor: solo funciona la demo" : (
            <>
              <i className={estado.fish ? "ok" : "no"} /> Fish Audio
              <i className={estado.claude ? "ok" : "no"} /> Claude
            </>
          )}
        </p>
      </header>

      <main>
        <section className="panel">
          <label>Guion <small>{guion.length} / 1800</small></label>
          <textarea value={guion} onChange={(e) => setGuion(e.target.value)} rows={9} maxLength={1800} />

          <label>Estilo de animación</label>
          <select value={estilo} onChange={(e) => setEstilo(e.target.value)}>
            {GRUPOS.map((g) => (
              <optgroup key={g.titulo} label={g.titulo}>
                {Object.values(g.temas).map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
              </optgroup>
            ))}
          </select>

          <div className="fila">
            <div>
              <label>Voz de Fish <small>id o enlace</small></label>
              <input value={vozId} onChange={(e) => setVozId(e.target.value)} spellCheck={false} />
            </div>
            <div className="color">
              <label>Acento</label>
              <input type="color" value={acento || "#ff5000"} onChange={(e) => setAcento(e.target.value)} />
              {acento ? <button className="mini" onClick={() => setAcento("")}>quitar</button> : null}
            </div>
          </div>

          {estado?.pideClave ? (
            <>
              <label>Clave de acceso</label>
              <input type="password" value={clave} onChange={(e) => setClave(e.target.value)} autoComplete="off" />
            </>
          ) : null}

          <div className="botones">
            <button className="principal" disabled={ocupado || !listo || guion.trim().length < 20} onClick={generar}>
              {ocupado ? paso : "Generar voz + animación"}
            </button>
            <button disabled={ocupado || !vozVigente || !listo} onClick={otroEstilo} title="Vuelve a dirigir las escenas en el estilo elegido, sin gastar otra voz">
              Mismo audio, este estilo
            </button>
            <button disabled={ocupado} onClick={demo}>Ver demo sin gastar</button>
          </div>

          {!listo && estado ? <p className="aviso">Faltan llaves en Vercel: {[!estado.fish && "FISH_API_KEY", !estado.claude && "ANTHROPIC_API_KEY"].filter(Boolean).join(" y ")}. Mientras tanto usa la demo.</p> : null}
          {error ? <p className="error">{error}</p> : null}
          {voz && !esDemo ? (
            <p className="nota">
              Voz de {voz.duracion.toFixed(1)} s · tiempos de palabra: {voz.tiempos === "fish" ? "exactos (Fish)" : "aproximados"} ·{" "}
              <a href={voz.url} download="voz.mp3">bajar voz</a> · <button className="enlace" onClick={bajarPlan}>bajar plan</button>
            </p>
          ) : null}
        </section>

        <section className="visor">
          <div className="marco">
            <Player ref={player} component={SinRostro} inputProps={props} durationInFrames={frames} fps={plan.fps} compositionWidth={1080} compositionHeight={1920} controls loop acknowledgeRemotionLicense style={{ width: "100%", height: "100%" }} />
          </div>
          <p className="pie">{esDemo ? "Demo sin voz" : "Tu video"} · {plan.estilo} · {plan.duracion.toFixed(1)} s</p>
        </section>

        <section className="escenas">
          <h2>Escenas</h2>
          <ol>
            {plan.escenas.map((e, i) => (
              <li key={i}>
                <button onClick={() => player.current?.seekTo(Math.round(e.desde * plan.fps) + 12)}>
                  <b>{e.desde.toFixed(1)}–{e.hasta.toFixed(1)}</b> {e.tipo}
                  {typeof e.etiqueta === "string" ? <em>{e.etiqueta}</em> : null}
                </button>
              </li>
            ))}
          </ol>
        </section>
      </main>
    </div>
  );
};
