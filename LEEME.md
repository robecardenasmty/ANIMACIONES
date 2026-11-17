# Reels Factory · Nivel 2 · Animaciones (prueba)

Micro app de prueba: escribes un guion, Fish Audio lo convierte en voz, Claude dirige las escenas y el motor
del pack "videos-sin-suscripcion" las anima en el navegador (39 estilos).

## Qué hace y qué no

- Hace: voz con tu id de Fish, plan de escenas con Claude, vista previa animada con audio y subtítulos,
  cambio de estilo sin volver a gastar voz, descarga de la voz (mp3) y del plan (json).
- No hace todavía: exportar el mp4, clips de Pexels/Pixabay, música, marca de agua, Drive.

## Subirlo (GitHub web + Vercel)

1. En GitHub crea un repositorio **privado** (el código del pack es comprado: no lo publiques).
2. Descomprime este zip y arrastra TODO el contenido a "uploading an existing file". Commit.
3. En Vercel: Add New → Project → importa el repo. Framework: Vite (lo detecta solo). Deploy.
4. En Vercel → Settings → Environment Variables agrega:
   - `FISH_API_KEY`  (fish.audio → API Keys)
   - `ANTHROPIC_API_KEY`  (console.anthropic.com)
   - `APP_CLAVE`  (la contraseña que tú quieras; la página la pide antes de gastar créditos)
   - Opcionales: `CLAUDE_MODEL` (por defecto claude-sonnet-5-5) y `FISH_MODEL` (por defecto s2-pro)
5. Deployments → Redeploy, para que tome las variables.

## Cómo se protegen las llaves

Las llaves solo existen en las funciones de `api/` (servidor de Vercel). El navegador llama a `/api/voz`
y `/api/plan`; nunca recibe una llave. Con `APP_CLAVE` puesta, nadie más puede usar tu saldo aunque tenga el enlace.

## Probar en tu PC (opcional, solo la demo)

    npm install
    npm run dev

La demo funciona sin llaves. Para voz y plan en local se necesita `vercel dev`; es más simple probar ya desplegado.

## Mapa

- `api/voz.js`  Fish Audio: guion → mp3 + segundo de cada palabra
- `api/plan.js`  Claude: palabras con tiempo → escenas del estilo elegido (con saneado del resultado)
- `api/estado.js`  dice qué llaves están puestas, sin mostrarlas
- `src/App.tsx`  la interfaz y el reproductor
- `src/demo.ts`  demo sin créditos y reparto de tiempos de respaldo
- `src/sin-rostro/`  motor del pack (solo se cambió cómo resuelve rutas de audio, imagen y video)
