import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
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
import { useBatches } from "@/features/batches/api";
import { BATCH_STATUS_LABELS } from "@/features/batches/constants";
import { useProducts } from "@/features/products/api";

export function BatchesListPage() {
  const [productFilter, setProductFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Se reutiliza para el filtro y para resolver código/descripción de cada lote,
  // ya que GET /batches no viene con el producto populado.
  const { data: products = [] } = useProducts();
  const productsById = useMemo(() => new Map(products.map((product) => [product._id, product])), [
    products,
  ]);

  const {
    data: batches = [],
    isLoading,
    isError,
  } = useBatches({
    product_id: productFilter === "all" ? undefined : productFilter,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const columns = [
    {
      key: "product",
      header: "Producto",
      cell: (batch) => {
        const product = productsById.get(batch.product_id);
        return product ? `${product.code} · ${product.description}` : batch.product_id;
      },
    },
    {
      key: "entry_date",
      header: "Fecha de entrada",
      cell: (batch) => new Date(batch.entry_date).toLocaleDateString("es-MX"),
    },
    { key: "initial_quantity", header: "Cantidad inicial" },
    { key: "available_quantity", header: "Cantidad disponible" },
    {
      key: "unit_cost",
      header: "Costo unitario",
      cell: (batch) => `$${Number(batch.unit_cost).toFixed(2)}`,
    },
    {
      key: "status",
      header: "Estado",
      cell: (batch) => (
        <Badge variant={batch.status === "Active" ? "secondary" : "outline"}>
          {BATCH_STATUS_LABELS[batch.status] ?? batch.status}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: (batch) => (
        <Link
          to={`/lotes/${batch._id}`}
          className="text-sm font-medium text-primary hover:underline"
        >
          Ver detalle
        </Link>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Lotes y secuencia PEPS"
        description="Entradas de inventario ordenadas por fecha: el lote más antiguo se consume primero."
        actions={
          <Button render={<Link to="/lotes/nuevo" />}>
            <Plus /> Nueva entrada de lote
          </Button>
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

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Todos los estados" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="Active">Activo</SelectItem>
            <SelectItem value="Depleted">Agotado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={batches}
        isLoading={isLoading}
        isError={isError}
        getRowKey={(batch) => batch._id}
        emptyMessage="No hay lotes registrados con estos filtros."
      />
    </div>
  );
}
