import { useState } from "react";
import { DataTable } from "@/components/shared/DataTable";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProducts } from "@/features/products/api";
import { PRODUCT_TYPE_LABELS } from "@/features/products/constants";
import { useInventoryValuation } from "@/features/reports/api";
import { formatCurrency } from "@/features/reports/format";

export function ValuationReportPage() {
  const [productFilter, setProductFilter] = useState("all");
  const { data: products = [] } = useProducts();

  const { data, isLoading, isError } = useInventoryValuation({
    product_id: productFilter === "all" ? undefined : productFilter,
  });

  const rows = data?.products ?? [];

  const columns = [
    { key: "code", header: "Código" },
    { key: "description", header: "Descripción" },
    { key: "type", header: "Tipo", cell: (row) => PRODUCT_TYPE_LABELS[row.type] ?? row.type },
    {
      key: "total_quantity",
      header: "Cantidad",
      cell: (row) => `${row.total_quantity} ${row.unit_of_measure}`,
    },
    { key: "total_value", header: "Valor", cell: (row) => formatCurrency(row.total_value) },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Select value={productFilter} onValueChange={setProductFilter}>
        <SelectTrigger className="w-64">
          <SelectValue placeholder="Todos los productos" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los productos</SelectItem>
          {products.map((product) => (
            <SelectItem key={product._id} value={product._id}>
              {product.code} · {product.description}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        isError={isError}
        getRowKey={(row) => row.product_id}
        emptyMessage="No hay lotes activos para valorizar."
      />

      {!isLoading && !isError ? (
        <Card>
          <CardContent className="flex items-center justify-between py-4">
            <span className="text-sm font-medium text-muted-foreground">
              Valor total del inventario
            </span>
            <span className="text-xl font-semibold text-foreground">
              {formatCurrency(data?.grand_total)}
            </span>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
