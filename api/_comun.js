// Piezas comunes de las funciones del servidor. Las llaves viven SOLO aquí (variables de entorno de Vercel):
// el navegador nunca las ve, solo habla con /api/*.

export const leerCuerpo = async (req) => {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  const trozos = [];
  for await (const t of req) trozos.push(t);
  return JSON.parse(Buffer.concat(trozos).toString("utf8") || "{}");
};

/** si en Vercel existe APP_CLAVE, toda llamada debe traerla en el encabezado x-clave */
export const claveValida = (req) => {
  const esperada = process.env.APP_CLAVE;
  if (!esperada) return true;
  return req.headers["x-clave"] === esperada;
};

export const responder = (res, estado, datos) => {
  res.statusCode = estado;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.setHeader("cache-control", "no-store");
  res.end(JSON.stringify(datos));
};

/** entrada común: solo POST, con clave, con cuerpo JSON. Devuelve el cuerpo o null si ya respondió. */
export const entrada = async (req, res) => {
  if (req.method !== "POST") { responder(res, 405, { error: "Solo POST" }); return null; }
  if (!claveValida(req)) { responder(res, 401, { error: "Clave incorrecta" }); return null; }
  try { return await leerCuerpo(req); } catch { responder(res, 400, { error: "El cuerpo no es JSON válido" }); return null; }
};
