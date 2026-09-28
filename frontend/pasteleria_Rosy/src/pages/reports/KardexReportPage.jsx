import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MOVEMENT_TYPE_BADGE_VARIANTS, MOVEMENT_TYPE_LABELS } from "@/features/movements/constants";
import { useProducts } from "@/features/products/api";
import { useKardex } from "@/features/reports/api";

export function KardexReportPage() {
  const { data: products = [] } = useProducts();
  const [productId, setProductId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data, isLoading, isError } = useKardex({
    product_id: productId,
    start_date: startDate,
    end_date: endDate,
  });

  const columns = [
    {
      key: "date",
      header: "Fecha",
      cell: (row) => new Date(row.date).toLocaleString("es-MX"),
    },
    {
      key: "type",
      header: "Tipo",
      cell: (row) => (
        <Badge variant={MOVEMENT_TYPE_BADGE_VARIANTS[row.type] ?? "outline"}>
          {MOVEMENT_TYPE_LABELS[row.type] ?? row.type}
        </Badge>
      ),
    },
    { key: "quantity", header: "Cantidad" },
    { key: "balance_after", header: "Saldo" },
    {
      key: "user",
      header: "Usuario",
      cell: (row) => (row.user ? `${row.user.name} ${row.user.last_name}` : "—"),
    },
    { key: "reason", header: "Motivo" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="kardex-product">Producto *</Label>
          <Select value={productId || null} onValueChange={setProductId}>
            <SelectTrigger id="kardex-product" className="w-full sm:w-64">
              <SelectValue placeholder="Selecciona un producto" />
            </SelectTrigger>
            <SelectContent>
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

      {!productId ? (
        <Alert>
          <AlertCircle />
          <AlertDescription>Selecciona un producto para generar su kardex.</AlertDescription>
        </Alert>
      ) : (
        <>
          {data ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader>
                  <CardTitle>Saldo inicial</CardTitle>
                </CardHeader>
                <CardContent className="text-xl font-semibold text-foreground">
                  {data.initial_balance}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Entradas</CardTitle>
                </CardHeader>
                <CardContent className="text-xl font-semibold text-foreground">
                  {data.total_entries}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Salidas / Ajustes</CardTitle>
                </CardHeader>
                <CardContent className="text-xl font-semibold text-foreground">
                  {data.total_exits} / {data.total_adjustments}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Saldo final</CardTitle>
                </CardHeader>
                <CardContent className="text-xl font-semibold text-foreground">
                  {data.final_balance}
                </CardContent>
              </Card>
            </div>
          ) : null}

          <DataTable
            columns={columns}
            data={data?.movements ?? []}
            isLoading={isLoading}
            isError={isError}
            getRowKey={(row, index) => `${row.date}-${index}`}
            emptyMessage="No hay movimientos en el rango seleccionado."
          />
        </>
      )}
    </div>
  );
}
