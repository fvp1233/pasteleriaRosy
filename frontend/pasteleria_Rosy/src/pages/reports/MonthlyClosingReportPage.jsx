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
import { PRODUCT_TYPE_LABELS } from "@/features/products/constants";
import { useMonthlyClosing } from "@/features/reports/api";
import { formatCurrency } from "@/features/reports/format";

const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const now = new Date();

export function MonthlyClosingReportPage() {
  const { data: products = [] } = useProducts();
  const [year, setYear] = useState(String(now.getFullYear()));
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [productId, setProductId] = useState("all");

  const { data, isLoading, isError } = useMonthlyClosing({
    year,
    month,
    product_id: productId === "all" ? undefined : productId,
  });

  const rows = data?.products ?? [];

  const columns = [
    { key: "code", header: "Código" },
    { key: "description", header: "Descripción" },
    { key: "type", header: "Tipo", cell: (row) => PRODUCT_TYPE_LABELS[row.type] ?? row.type },
    { key: "closing_quantity", header: "Existencia" },
    { key: "closing_value", header: "Valor", cell: (row) => formatCurrency(row.closing_value) },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="year">Año *</Label>
          <Input
            id="year"
            type="number"
            value={year}
            onChange={(event) => setYear(event.target.value)}
            className="w-28"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="month">Mes *</Label>
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger id="month" className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((label, index) => (
                <SelectItem key={label} value={String(index + 1)}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="product">Producto</Label>
          <Select value={productId} onValueChange={setProductId}>
            <SelectTrigger id="product" className="w-full sm:w-64">
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
      </div>

      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        isError={isError}
        getRowKey={(row) => row.product_id}
        emptyMessage="No hay existencias para este cierre."
      />

      {!isLoading && !isError && data ? (
        <Card>
          <CardContent className="flex items-center justify-between py-4">
            <span className="text-sm font-medium text-muted-foreground">
              Valor total del cierre ({data.period})
            </span>
            <span className="text-xl font-semibold text-foreground">
              {formatCurrency(data.grand_total)}
            </span>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
