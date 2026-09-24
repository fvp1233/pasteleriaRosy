import { Link } from "react-router-dom";
import { TrendingDown, TrendingUp } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useLowStockAlerts, useOverStockAlerts } from "@/features/alerts/api";
import { PRODUCT_TYPE_LABELS } from "@/features/products/constants";

export function AlertsPage() {
  const { isAdmin } = useAuth();
  const { data: lowStock = [], isLoading: isLoadingLow, isError: isErrorLow } = useLowStockAlerts();
  const {
    data: overStock = [],
    isLoading: isLoadingOver,
    isError: isErrorOver,
  } = useOverStockAlerts();

  // Las columnas son casi idénticas entre bajo/sobre stock; solo cambia qué
  // umbral se muestra (mínimo vs máximo).
  function buildColumns(thresholdKey, thresholdLabel) {
    return [
      { key: "code", header: "Código" },
      { key: "description", header: "Descripción" },
      {
        key: "type",
        header: "Tipo",
        cell: (product) => (
          <Badge variant={product.type === "Finished Good" ? "default" : "outline"}>
            {PRODUCT_TYPE_LABELS[product.type] ?? product.type}
          </Badge>
        ),
      },
      {
        key: "total_stock",
        header: "Stock actual",
        cell: (product) => `${product.total_stock} ${product.unit_of_measure}`,
      },
      {
        key: "threshold",
        header: thresholdLabel,
        cell: (product) => product[thresholdKey],
      },
      {
        key: "actions",
        header: "",
        className: "text-right",
        cell: (product) => (
          <Link
            to={isAdmin ? `/productos/${product._id}/editar` : `/productos/${product._id}`}
            className="text-sm font-medium text-primary hover:underline"
          >
            {isAdmin ? "Ajustar umbrales" : "Ver producto"}
          </Link>
        ),
      },
    ];
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Alertas de stock"
        description="Productos activos fuera del rango de stock mínimo/máximo configurado en su ficha."
      />

      <Card>
        <CardHeader className="flex-row items-center gap-2">
          <TrendingDown className="size-5 text-destructive" />
          <CardTitle>Bajo stock ({lowStock.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={buildColumns("minimum_stock", "Stock mínimo")}
            data={lowStock}
            isLoading={isLoadingLow}
            isError={isErrorLow}
            getRowKey={(product) => product._id}
            emptyMessage="Ningún producto está por debajo de su stock mínimo."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center gap-2">
          <TrendingUp className="size-5 text-amber-500" />
          <CardTitle>Sobre stock ({overStock.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={buildColumns("maximum_stock", "Stock máximo")}
            data={overStock}
            isLoading={isLoadingOver}
            isError={isErrorOver}
            getRowKey={(product) => product._id}
            emptyMessage="Ningún producto supera su stock máximo."
          />
        </CardContent>
      </Card>
    </div>
  );
}
