// Paleta categórica para gráficos, derivada de los tokens de marca
// (brand-primary/secondary) pero llevada a un paso más oscuro/saturado: los
// tokens de marca en src/index.css son pasteles pensados para fondos y
// badges, y fallan la validación de accesibilidad (contraste, separación
// CVD) si se usan directo como color de dato en un gráfico. Validado con
// dataviz/scripts/validate_palette.js — las 3 pasan las 6 verificaciones
// (contraste, banda de luminosidad, piso de croma, separación CVD y piso de
// visión normal) salvo un WARN de contraste en el ámbar, mitigado con las
// etiquetas de valor siempre visibles en los gráficos que lo usan.
export const CHART_COLORS = {
  teal: "#289FBD", // misma familia que brand-secondary — Entradas / Materia Prima
  pink: "#E2366A", // misma familia que brand-primary — Salidas / serie única / Producto Terminado
  amber: "#CF8B17", // Ajustes (mermas) — única serie con tono de alerta
};
