import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CHART_COLORS } from "@/lib/chartColors";

/**
 * Parte-del-todo con solo 2 categorías: una barra 100% apilada en vez de un
 * donut de 2 rebanadas (más fácil de leer el porcentaje exacto de un vistazo).
 */
export function ProductTypeSplitCard({ rawMaterials, finishedGoods, total }) {
  const rawPercent = total > 0 ? (rawMaterials / total) * 100 : 0;
  const finishedPercent = total > 0 ? (finishedGoods / total) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Catálogo por tipo</CardTitle>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <p className="text-sm text-muted-foreground">Aún no hay productos activos registrados.</p>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex h-5 gap-0.5 overflow-hidden rounded-md">
              {rawMaterials > 0 ? (
                <div
                  className="h-full first:rounded-l-md last:rounded-r-md"
                  style={{ width: `${rawPercent}%`, backgroundColor: CHART_COLORS.teal }}
                />
              ) : null}
              {finishedGoods > 0 ? (
                <div
                  className="h-full first:rounded-l-md last:rounded-r-md"
                  style={{ width: `${finishedPercent}%`, backgroundColor: CHART_COLORS.pink }}
                />
              ) : null}
            </div>

            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: CHART_COLORS.teal }}
                  />
                  Materia Prima
                </span>
                <span className="font-medium text-foreground">
                  {rawMaterials} · {rawPercent.toFixed(0)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: CHART_COLORS.pink }}
                  />
                  Producto Terminado
                </span>
                <span className="font-medium text-foreground">
                  {finishedGoods} · {finishedPercent.toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
