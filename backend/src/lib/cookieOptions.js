const isProduction = process.env.NODE_ENV === "production";

// En producción el frontend (Vercel) y la API (Render) viven en dominios
// distintos, así que la cookie viaja cross-site: eso exige SameSite=None,
// que el navegador solo acepta si Secure está presente. En desarrollo
// (localhost) "strict" basta y no requiere HTTPS.
export const cookieSecurity = {
  secure: isProduction,
  sameSite: isProduction ? "none" : "strict",
};
