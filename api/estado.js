// Dice a la página qué está configurado, sin revelar ninguna llave.
import { responder } from "./_comun.js";

export default function handler(req, res) {
  responder(res, 200, {
    fish: Boolean(process.env.FISH_API_KEY),
    claude: Boolean(process.env.ANTHROPIC_API_KEY),
    pideClave: Boolean(process.env.APP_CLAVE),
  });
}
