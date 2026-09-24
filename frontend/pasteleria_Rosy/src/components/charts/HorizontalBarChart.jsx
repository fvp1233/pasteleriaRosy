const numberFormatter = new Intl.NumberFormat("es-MX");

/**
 * Ranking de barras horizontales, serie única (un solo color de marca — no
 * corresponde colorear por valor: eso gasta el canal de identidad en
 * re-codificar lo que ya muestra el largo de la barra). El valor va siempre
 * como texto a la derecha de la barra, nunca adentro, así nunca se recorta
 * sin importar el ancho de la tarjeta.
 *
 * data: [{ key, label, value, href? }]
 */
export function HorizontalBarChart({
  data,
  color,
  valueFormatter = numberFormatter.format,
  emptyMessage = "Sin datos para mostrar.",
  renderRow,
}) {
  if (!data.length) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  const max = Math.max(...data.map((row) => row.value), 1);

  return (
    <div className="flex flex-col gap-2.5">
      {data.map((row) => {
        const percent = Math.max((row.value / max) * 100, 2);
        const content = (
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-md px-1.5 py-1 transition-colors hover:bg-muted/50">
            <div className="flex flex-col gap-1">
              <span className="truncate text-xs font-medium text-foreground" title={row.label}>
                {row.label}
              </span>
              <div className="h-4 rounded-r-[4px] bg-muted">
                <div
                  className="h-full rounded-r-[4px]"
                  style={{ width: `${percent}%`, backgroundColor: color }}
                />
              </div>
            </div>
            <span className="text-sm font-semibold tabular-nums text-foreground">
              {valueFormatter(row.value)}
            </span>
          </div>
        );
        return renderRow ? renderRow(row, content) : <div key={row.key}>{content}</div>;
      })}
    </div>
  );
}
