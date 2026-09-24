import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpFromLine, Layers, TrendingDown, TrendingUp } from "lucide-react";
import { HorizontalBarChart } from "@/components/charts/HorizontalBarChart";
import { LineChart } from "@/components/charts/LineChart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { useLowStockAlerts, useOverStockAlerts } from "@/features/alerts/api";
import {
  buildMovementsTrend,
  buildTopRotation,
  buildTopValuation,
  buildTypeSplit,
} from "@/features/dashboard/chartData";
import { ProductTypeSplitCard } from "@/features/dashboard/ProductTypeSplitCard";
import { useMovements } from "@/features/movements/api";
import { MOVEMENT_TYPE_BADGE_VARIANTS, MOVEMENT_TYPE_LABELS } from "@/features/movements/constants";
import { useProducts } from "@/features/products/api";
import { useInventoryValuation } from "@/features/reports/api";
import { formatCurrency } from "@/features/reports/format";
import { CHART_COLORS } from "@/lib/chartColors";

function isToday(dateValue) {
  const date = new Date(dateValue);
  const now = new Date();
  return (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
}

export function DashboardPage() {
  const { user, isAdmin } = useAuth();

  const { data: lowStock = [], isLoading: isLoadingLow } = useLowStockAlerts();
  const { data: overStock = [], isLoading: isLoadingOver } = useOverStockAlerts();
  const { data: movements = [], isLoading: isLoadingMovements } = useMovements();
  const { data: products = [], isLoading: isLoadingProducts } = useProducts();
  // El reporte de valorización es Admin-only en el backend (reportRoutes.js);
  // para Operator lo dejamos deshabilitado en vez de disparar un 403.
  const { data: valuation, isLoading: isLoadingValuation } = useInventoryValuation(undefined, {
    enabled: isAdmin,
  });

  const movementsToday = movements.filter((movement) => isToday(movement.movement_date)).length;
  const hasAlerts = lowStock.length > 0 || overStock.length > 0;

  const productsById = useMemo(() => new Map(products.map((product) => [product._id, product])), [
    products,
  ]);
  const trend = useMemo(() => buildMovementsTrend(movements), [movements]);
  const topRotation = useMemo(
    () => buildTopRotation(movements, productsById),
    [movements, productsById]
  );
  const typeSplit = useMemo(() => buildTypeSplit(products), [products]);
  const topValuation = useMemo(
    () => (valuation?.products ? buildTopValuation(valuation.products) : []),
    [valuation]
  );

  const trendSeries = [
    { key: "in", label: "Entradas", color: CHART_COLORS.teal, values: trend.entradas },
    { key: "out", label: "Salidas", color: CHART_COLORS.pink, values: trend.salidas },
    { key: "adjustment", label: "Ajustes", color: CHART_COLORS.amber, values: trend.ajustes },
  ];
  const isLoadingCharts = isLoadingMovements || isLoadingProducts;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold text-foreground">
          Bienvenida, {user?.name} {user?.last_name}
        </h1>
        <p className="text-sm text-muted-foreground">
          Sesión activa como <span className="font-medium text-foreground">{user?.role}</span>.
          Resumen del inventario al día de hoy.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Bajo stock</CardTitle>
            <TrendingDown className="size-4 text-destructive" />
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-foreground">
            {isLoadingLow ? <Skeleton className="h-8 w-12" /> : lowStock.length}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Sobre stock</CardTitle>
            <TrendingUp className="size-4 text-amber-500" />
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-foreground">
            {isLoadingOver ? <Skeleton className="h-8 w-12" /> : overStock.length}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Movimientos hoy</CardTitle>
            <Layers className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-foreground">
            {isLoadingMovements ? <Skeleton className="h-8 w-12" /> : movementsToday}
          </CardContent>
        </Card>

        {isAdmin ? (
          <Card>
            <CardHeader>
              <CardTitle>Valor del inventario</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold text-foreground">
              {isLoadingValuation ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                formatCurrency(valuation?.grand_total)
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Valor del inventario</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Solo visible para administradores.
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button render={<Link to="/movimientos/salida" />}>
          <ArrowUpFromLine /> Registrar salida
        </Button>
        <Button variant="outline" render={<Link to="/lotes/nuevo" />}>
          <Layers /> Nueva entrada de lote
        </Button>
        {hasAlerts ? (
          <Button variant="outline" render={<Link to="/alertas" />}>
            Ver alertas
          </Button>
        ) : null}
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Movimientos de los últimos 14 días</CardTitle>
          <Link
            to="/movimientos"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Ver detalle <ArrowRight className="size-3.5" />
          </Link>
        </CardHeader>
        <CardContent>
          {isLoadingCharts ? (
            <Skeleton className="h-55 w-full" />
          ) : (
            <LineChart series={trendSeries} xLabels={trend.xLabels} />
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Top 5 productos con más salidas</CardTitle>
            <Link
              to="/reportes/rotacion"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Ver detalle <ArrowRight className="size-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            {isLoadingCharts ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <HorizontalBarChart
                data={topRotation}
                color={CHART_COLORS.pink}
                emptyMessage="Aún no hay salidas de productos terminados."
                renderRow={(row, content) => (
                  <Link key={row.key} to={`/productos/${row.productId}`} className="block">
                    {content}
                  </Link>
                )}
              />
            )}
          </CardContent>
        </Card>

        {isLoadingCharts ? (
          <Card>
            <CardHeader>
              <CardTitle>Catálogo por tipo</CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        ) : (
          <ProductTypeSplitCard
            rawMaterials={typeSplit.rawMaterials}
            finishedGoods={typeSplit.finishedGoods}
            total={typeSplit.total}
          />
        )}
      </div>

      {isAdmin ? (
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Top 5 productos por valor de inventario</CardTitle>
            <Link
              to="/reportes/valorizacion"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Ver detalle <ArrowRight className="size-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            {isLoadingValuation ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <HorizontalBarChart
                data={topValuation}
                color={CHART_COLORS.pink}
                valueFormatter={formatCurrency}
                emptyMessage="No hay lotes activos para valorizar."
                renderRow={(row, content) => (
                  <Link key={row.key} to={`/productos/${row.productId}`} className="block">
                    {content}
                  </Link>
                )}
              />
            )}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Últimos movimientos</CardTitle>
          <Link
            to="/movimientos"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Ver todos <ArrowRight className="size-3.5" />
          </Link>
        </CardHeader>
        <CardContent>
          {isLoadingMovements ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-full" />
              ))}
            </div>
          ) : movements.length ? (
            <ul className="flex flex-col divide-y divide-border">
              {movements.slice(0, 6).map((movement) => (
                <li key={movement._id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-medium text-foreground">
                      {movement.product_id
                        ? `${movement.product_id.code} · ${movement.product_id.description}`
                        : "—"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(movement.movement_date).toLocaleString("es-MX")}
                      {movement.user_id
                        ? ` · ${movement.user_id.name} ${movement.user_id.last_name}`
                        : ""}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant={MOVEMENT_TYPE_BADGE_VARIANTS[movement.movement_type] ?? "outline"}>
                      {MOVEMENT_TYPE_LABELS[movement.movement_type] ?? movement.movement_type}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{movement.quantity}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Aún no hay movimientos registrados.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
