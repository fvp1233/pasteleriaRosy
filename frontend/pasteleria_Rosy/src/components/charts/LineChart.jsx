import { useState } from "react";

const numberFormatter = new Intl.NumberFormat("es-MX");

function niceMax(rawMax) {
  if (rawMax <= 0) return 4;
  const magnitude = 10 ** Math.floor(Math.log10(rawMax));
  const normalized = rawMax / magnitude;
  const niceNormalized = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return niceNormalized * magnitude;
}

// Cada zona de hover cubre desde el punto medio con su vecino anterior hasta
// el punto medio con el siguiente — así el crosshair "encuentra la X" sin
// necesitar seguir el mouse pixel a pixel.
function buildHoverZones(count) {
  if (count <= 1) return [[0, 100]];
  const step = 100 / (count - 1);
  return Array.from({ length: count }, (_, index) => {
    const center = index * step;
    return [index === 0 ? 0 : center - step / 2, index === count - 1 ? 100 : center + step / 2];
  });
}

/**
 * Gráfico de líneas multi-serie, sin dependencias externas. Los trazos van en
 * SVG (con vector-effect="non-scaling-stroke" para que el grosor no se
 * distorsione al estirar el viewBox al ancho del contenedor); los puntos,
 * ejes y el tooltip van en HTML/CSS superpuesto con las mismas coordenadas en
 * porcentaje, para que el texto nunca quede deformado por el viewBox.
 *
 * series: [{ key, label, color, values: number[] }]  (mismo largo que xLabels)
 * xLabels: string[]
 */
export function LineChart({ series, xLabels, height = 220, valueFormatter = numberFormatter.format }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const pointCount = xLabels.length;
  const hasData = pointCount > 0 && series.some((serie) => serie.values.some((value) => value > 0));

  if (!hasData) {
    return (
      <div
        style={{ height }}
        className="flex items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground"
      >
        Sin movimientos en este periodo.
      </div>
    );
  }

  const rawMax = Math.max(...series.flatMap((serie) => serie.values));
  const yMax = niceMax(rawMax);
  const yTicks = [yMax, yMax / 2, 0];
  const xStep = pointCount > 1 ? 100 / (pointCount - 1) : 0;
  const hoverZones = buildHoverZones(pointCount);

  // Muestra como mucho ~7 etiquetas de fecha para que no choquen entre sí.
  const labelEvery = Math.max(1, Math.ceil(pointCount / 7));

  function pointPosition(value, index) {
    return { x: index * xStep, y: 100 - (value / yMax) * 100 };
  }

  const tooltipIndex = hoveredIndex;
  const tooltipLeft = tooltipIndex !== null ? tooltipIndex * xStep : 0;

  return (
    <div>
      <div className="flex gap-2">
        {/* Eje Y */}
        <div className="relative w-9 shrink-0 text-right text-[11px] text-muted-foreground" style={{ height }}>
          {yTicks.map((tick) => (
            <span
              key={tick}
              className="absolute right-0 -translate-y-1/2"
              style={{ top: `${100 - (tick / yMax) * 100}%` }}
            >
              {valueFormatter(Math.round(tick))}
            </span>
          ))}
        </div>

        {/* Área de trazado */}
        <div className="relative min-w-0 flex-1" style={{ height }}>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible">
            {yTicks.map((tick) => (
              <line
                key={tick}
                x1="0"
                x2="100"
                y1={100 - (tick / yMax) * 100}
                y2={100 - (tick / yMax) * 100}
                vectorEffect="non-scaling-stroke"
                strokeWidth="1"
                className="stroke-border"
              />
            ))}

            {tooltipIndex !== null ? (
              <line
                x1={tooltipLeft}
                x2={tooltipLeft}
                y1="0"
                y2="100"
                vectorEffect="non-scaling-stroke"
                strokeWidth="1"
                className="stroke-foreground/25"
              />
            ) : null}

            {series.map((serie) => (
              <polyline
                key={serie.key}
                fill="none"
                stroke={serie.color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                points={serie.values
                  .map((value, index) => {
                    const { x, y } = pointPosition(value, index);
                    return `${x},${y}`;
                  })
                  .join(" ")}
              />
            ))}
          </svg>

          {/* Puntos (HTML, no SVG, para que no se estiren en óvalos) */}
          {series.map((serie) =>
            serie.values.map((value, index) => {
              const { x, y } = pointPosition(value, index);
              return (
                <span
                  key={`${serie.key}-${index}`}
                  className="absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-background"
                  style={{ left: `${x}%`, top: `${y}%`, backgroundColor: serie.color }}
                />
              );
            })
          )}

          {/* Zonas de hover/foco, una por posición del eje X */}
          {hoverZones.map(([start, end], index) => (
            <button
              key={index}
              type="button"
              aria-label={`${xLabels[index]}: ${series
                .map((serie) => `${serie.label} ${valueFormatter(serie.values[index])}`)
                .join(", ")}`}
              className="absolute top-0 h-full cursor-default appearance-none border-0 bg-transparent p-0 outline-none"
              style={{ left: `${start}%`, width: `${end - start}%` }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex((current) => (current === index ? null : current))}
              onFocus={() => setHoveredIndex(index)}
              onBlur={() => setHoveredIndex((current) => (current === index ? null : current))}
            />
          ))}

          {/* Tooltip */}
          {tooltipIndex !== null ? (
            <div
              className="pointer-events-none absolute top-0 z-10 w-44 -translate-y-2 rounded-lg border border-border bg-popover p-2.5 text-xs shadow-md"
              style={{
                left: `${tooltipLeft}%`,
                transform: `translateX(${tooltipIndex === 0 ? "0%" : tooltipIndex === pointCount - 1 ? "-100%" : "-50%"})`,
              }}
            >
              <p className="mb-1.5 font-medium text-foreground">{xLabels[tooltipIndex]}</p>
              <div className="flex flex-col gap-1">
                {series.map((serie) => (
                  <div key={serie.key} className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <span className="h-0.5 w-3 shrink-0 rounded-full" style={{ backgroundColor: serie.color }} />
                      {serie.label}
                    </span>
                    <span className="font-semibold text-foreground">
                      {valueFormatter(serie.values[tooltipIndex])}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Eje X */}
      <div className="relative mt-1 ml-11 h-4 text-[11px] text-muted-foreground">
        {xLabels.map((label, index) =>
          index % labelEvery === 0 ? (
            <span
              key={index}
              className="absolute -translate-x-1/2"
              style={{ left: `${index * xStep}%` }}
            >
              {label}
            </span>
          ) : null
        )}
      </div>

      {/* Leyenda — siempre presente con 2+ series */}
      {series.length >= 2 ? (
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
          {series.map((serie) => (
            <span key={serie.key} className="flex items-center gap-1.5">
              <span className="h-0.5 w-3.5 shrink-0 rounded-full" style={{ backgroundColor: serie.color }} />
              {serie.label}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
