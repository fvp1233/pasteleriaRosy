import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpFromLine, Sparkles } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMovements } from "@/features/movements/api";
import { MOVEMENT_TYPE_BADGE_VARIANTS, MOVEMENT_TYPE_LABELS } from "@/features/movements/constants";
import { useProducts } from "@/features/products/api";

export function MovementsListPage() {
  const [productFilter, setProductFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Solo para el filtro; el listado de movimientos ya viene con el producto populado.
  const { data: products = [] } = useProducts();

  const {
    data: movements = [],
    isLoading,
    isError,
  } = useMovements({
    product_id: productFilter === "all" ? undefined : productFilter,
    movement_type: typeFilter === "all" ? undefined : typeFilter,
  });

  const columns = [
    {
      key: "movement_date",
      header: "Fecha",
      cell: (movement) => new Date(movement.movement_date).toLocaleString("es-MX"),
    },
    {
      key: "product",
      header: "Producto",
      cell: (movement) =>
        movement.product_id
          ? `${movement.product_id.code} · ${movement.product_id.description}`
          : "—",
    },
    {
      key: "movement_type",
      header: "Tipo",
      cell: (movement) => (
        <Badge variant={MOVEMENT_TYPE_BADGE_VARIANTS[movement.movement_type] ?? "outline"}>
          {MOVEMENT_TYPE_LABELS[movement.movement_type] ?? movement.movement_type}
        </Badge>
      ),
    },
    { key: "quantity", header: "Cantidad" },
    {
      key: "user",
      header: "Usuario",
      cell: (movement) =>
        movement.user_id ? `${movement.user_id.name} ${movement.user_id.last_name}` : "—",
    },
    { key: "reason", header: "Motivo" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Historial de movimientos"
        description="Entradas, salidas y ajustes registrados en el inventario."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" render={<Link to="/movimientos/ajuste" />}>
              <Sparkles /> Registrar ajuste
            </Button>
            <Button render={<Link to="/movimientos/salida" />}>
              <ArrowUpFromLine /> Registrar salida
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-4">
        <Select value={productFilter} onValueChange={setProductFilter}>
          <SelectTrigger className="w-full sm:w-64">
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

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Todos los tipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            <SelectItem value="In">Entrada</SelectItem>
            <SelectItem value="Out">Salida</SelectItem>
            <SelectItem value="Adjustment">Ajuste</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={movements}
        isLoading={isLoading}
        isError={isError}
        getRowKey={(movement) => movement._id}
        emptyMessage="No hay movimientos registrados con estos filtros."
      />
    </div>
  );
}
