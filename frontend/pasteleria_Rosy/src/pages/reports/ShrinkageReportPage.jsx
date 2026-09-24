import { useState } from "react";
import { DataTable } from "@/components/shared/DataTable";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProducts } from "@/features/products/api";
import { useShrinkageReport } from "@/features/reports/api";
import { formatCurrency } from "@/features/reports/format";

export function ShrinkageReportPage() {
  const { data: products = [] } = useProducts();
  const [productId, setProductId] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data, isLoading, isError } = useShrinkageReport({
    product_id: productId === "all" ? undefined : productId,
    start_date: startDate,
    end_date: endDate,
  });

  const rows = data?.records ?? [];

  const columns = [
    {
      key: "date",
      header: "Fecha",
      cell: (row) => new Date(row.date).toLocaleDateString("es-MX"),
    },
    { key: "code", header: "Código" },
    { key: "description", header: "Descripción" },
    { key: "quantity", header: "Cantidad" },
    { key: "unit_cost", header: "Costo unitario", cell: (row) => formatCurrency(row.unit_cost) },
    { key: "value_lost", header: "Valor perdido", cell: (row) => formatCurrency(row.value_lost) },
    { key: "reason", header: "Motivo" },
    {
      key: "user",
      header: "Usuario",
      cell: (row) => (row.user?.name ? `${row.user.name} ${row.user.last_name}` : "—"),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="product">Producto</Label>
          <Select value={productId} onValueChange={setProductId}>
            <SelectTrigger id="product" className="w-64">
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
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="start_date">Desde</Label>
          <Input
            id="start_date"
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="end_date">Hasta</Label>
          <Input
            id="end_date"
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        isError={isError}
        getRowKey={(row, index) => `${row.date}-${index}`}
        emptyMessage="No hay ajustes por merma en este rango."
      />

      {!isLoading && !isError ? (
        <Card>
          <CardContent className="flex items-center justify-between py-4">
            <span className="text-sm font-medium text-muted-foreground">Valor total perdido</span>
            <span className="text-xl font-semibold text-destructive">
              {formatCurrency(data?.total_value_lost)}
            </span>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
