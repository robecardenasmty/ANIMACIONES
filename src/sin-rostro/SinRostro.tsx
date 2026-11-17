// Videos sin rostro · la composición: voz + plan de escenas → video. Un solo componente para todos los estilos.
import { loadFont as caveat } from "@remotion/google-fonts/Caveat";
import { loadFont as dmSerif } from "@remotion/google-fonts/DMSerifDisplay";
import { loadFont as instrument } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as interTight } from "@remotion/google-fonts/InterTight";
import { loadFont as jetbrains } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as poppins } from "@remotion/google-fonts/Poppins";
import React, { useMemo, useState } from "react";
import { TEMAS_A } from "./estilos/grupo-a";
import { TEMAS_B } from "./estilos/grupo-b";
import { TEMAS_C } from "./estilos/grupo-c";

const TEMAS = { ...TEMAS_A, ...TEMAS_B, ...TEMAS_C };
import { EscenaComun, FiltrosMaterial, SubtituloTema, Tema, TemaVivo, conMarca, escenaEn } from "./estilos/tema";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Plan, PlanCtx, Transicion, frases, palabras, ruta } from "./base";
import { EscenaAvatar, FondoAvatar, PersonajeFijo } from "./estilos/avatar";
import { EscenaHistoria, historiaOscura } from "./estilos/historia";
import { EscenaLista, FondoLista } from "./estilos/lista";
import { SubtituloCursiva, SubtituloRecortes, SubtituloSuave } from "./subtitulos";

const { fontFamily: INTER_TIGHT } = interTight("normal", { weights: ["500", "600", "700", "800"], subsets: ["latin"] });
const { fontFamily: INSTRUMENT } = instrument("italic", { weights: ["400"], subsets: ["latin"] });
const { fontFamily: POPPINS } = poppins("normal", { weights: ["600", "700", "800"], subsets: ["latin"] });
const { fontFamily: DM_SERIF } = dmSerif("normal", { weights: ["400"], subsets: ["latin"] });
caveat("normal", { weights: ["600"], subsets: ["latin"] });
jetbrains("normal", { weights: ["500"], subsets: ["latin"] });

const dbAVolumen = (db: number) => Math.pow(10, db / 20);


const Subtitulos: React.FC<{ plan: Plan }> = ({ plan }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ps = useMemo(() => palabras(plan.captions, plan.correcciones), [plan]);
  const fs = useMemo(() => frases(ps, plan.estilo === "lista-recortes" ? 4 : 6), [ps, plan.estilo]);
  if (plan.subtitulos === false) return null;
  const e = escenaEn(plan.escenas, f / fps);
  if (e?.sinSubtitulos) return null;
  const acento = plan.marca?.acento;
  if (plan.estilo === "avatar-interfaz") return <SubtituloCursiva fs={fs} claves={plan.claves} y={250} fuente={INTER_TIGHT} fuenteClave={INSTRUMENT} acento={acento ?? "#E53935"} tam={72} />;
  if (plan.estilo === "lista-recortes") return <SubtituloRecortes fs={fs} claves={plan.claves} y={1300} fuente={DM_SERIF} tam={74} />;
  return <SubtituloSuave fs={fs} claves={plan.claves} y={320} fuente={POPPINS} acento={acento ?? "#7C4DFF"} tam={62} oscuro={e ? historiaOscura(e) : true} />;
};

/** los 17 estilos del grupo A: fondo (que puede cambiar por escena), escenas comunes, capa fija y subtítulos del tema */
const SinRostroTema: React.FC<{ plan: Plan; tema: Tema }> = ({ plan, tema }) => {
  const { fps } = useVideoConfig();
  const f = useCurrentFrame();
  const ps = useMemo(() => palabras(plan.captions, plan.correcciones), [plan]);
  const fs = useMemo(() => frases(ps, tema.sub.tam > 80 ? 3 : tema.sub.caja === "dialogo" ? 8 : 6), [ps, tema]);
  // las fuentes se cargan una sola vez, solo las del estilo que se usa
  const [fuentes] = useState(() => tema.fuentes());
  const t: TemaVivo = { ...conMarca(tema, plan.marca?.acento), fTitulo: fuentes.titulo, fTexto: fuentes.texto };
  const actual = escenaEn(plan.escenas, f / fps);
  const { Fondo, Capa } = t;
  return (
    <PlanCtx.Provider value={plan}>
      <AbsoluteFill style={{ fontFamily: fuentes.texto, overflow: "hidden", background: "#111" }}>
        <FiltrosMaterial />
        <Fondo e={actual} />
        {plan.escenas.map((e, i) => {
          const desde = Math.round(e.desde * fps);
          const dur = Math.max(1, Math.round(e.hasta * fps) - desde);
          return (
            <Sequence key={i} from={desde} durationInFrames={dur} name={`${i + 1} · ${e.tipo}`}>
              <Transicion dur={dur} entrada={8} salida={5}>
                <EscenaComun e={e} t={t} />
              </Transicion>
            </Sequence>
          );
        })}
        {Capa ? <Capa escenas={plan.escenas} ps={ps} /> : null}
        {plan.subtitulos === false || actual?.sinSubtitulos ? null : <SubtituloTema fs={fs} claves={plan.claves} t={t} />}
        {plan.voz ? <Audio src={ruta(plan.voz)} /> : null}
        {plan.musica ? <Audio src={ruta(plan.musica.src)} trimBefore={Math.round((plan.musica.desde ?? 0) * fps)} volume={dbAVolumen(plan.musica.db ?? -10)} /> : null}
      </AbsoluteFill>
    </PlanCtx.Provider>
  );
};

export const SinRostro: React.FC<{ plan: Plan }> = ({ plan }) => {
  const { fps } = useVideoConfig();
  const ps = useMemo(() => palabras(plan.captions, plan.correcciones), [plan]);
  const tema = TEMAS[plan.estilo];
  if (tema) return <SinRostroTema plan={plan} tema={tema} />;
  return (
    <PlanCtx.Provider value={plan}>
      <AbsoluteFill style={{ fontFamily: INTER_TIGHT, overflow: "hidden", background: "#111" }}>
        {plan.estilo === "avatar-interfaz" ? <FondoAvatar /> : plan.estilo === "lista-recortes" ? <FondoLista /> : null}
        {plan.escenas.map((e, i) => {
          const desde = Math.round(e.desde * fps);
          const dur = Math.max(1, Math.round(e.hasta * fps) - desde);
          return (
            <Sequence key={i} from={desde} durationInFrames={dur} name={`${i + 1} · ${e.tipo}`}>
              <Transicion dur={dur} entrada={plan.estilo === "historia-plana" ? 7 : 9} salida={5}>
                {plan.estilo === "historia-plana" ? <EscenaHistoria e={e} ps={ps} /> : plan.estilo === "avatar-interfaz" ? <EscenaAvatar e={e} /> : <EscenaLista e={e} />}
              </Transicion>
            </Sequence>
          );
        })}
        {plan.estilo === "avatar-interfaz" ? <PersonajeFijo escenas={plan.escenas} ps={ps} fps={fps} /> : null}
        <Subtitulos plan={plan} />
        {plan.voz ? <Audio src={ruta(plan.voz)} /> : null}
        {plan.musica ? <Audio src={ruta(plan.musica.src)} trimBefore={Math.round((plan.musica.desde ?? 0) * fps)} volume={dbAVolumen(plan.musica.db ?? -10)} /> : null}
      </AbsoluteFill>
    </PlanCtx.Provider>
  );
};
