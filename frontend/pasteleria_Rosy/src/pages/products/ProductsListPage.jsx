import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { useProducts } from "@/features/products/api";
import { PRODUCT_TYPE_LABELS } from "@/features/products/constants";

export function ProductsListPage() {
  const { isAdmin } = useAuth();
  const [typeFilter, setTypeFilter] = useState("all");
  const [showInactive, setShowInactive] = useState(false);

  const {
    data: products = [],
    isLoading,
    isError,
  } = useProducts({
    type: typeFilter === "all" ? undefined : typeFilter,
    includeInactive: showInactive ? "true" : undefined,
  });

  const columns = [
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
      header: "Stock",
      cell: (product) => `${product.total_stock} ${product.unit_of_measure}`,
    },
    {
      key: "status",
      header: "Estado",
      cell: (product) =>
        product.is_active === false ? (
          <Badge variant="destructive">Inactivo</Badge>
        ) : (
          <Badge variant="secondary">Activo</Badge>
        ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: (product) => (
        <Link
          to={`/productos/${product._id}`}
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
        title="Catálogo de productos"
        description="Insumos y productos terminados registrados en el sistema."
        actions={
          isAdmin ? (
            <Button render={<Link to="/productos/nuevo" />}>
              <Plus /> Nuevo producto
            </Button>
          ) : null
        }
      />

      <div className="flex flex-wrap items-center gap-4">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Todos los tipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            <SelectItem value="Raw Material">Materia Prima</SelectItem>
            <SelectItem value="Finished Good">Producto Terminado</SelectItem>
          </SelectContent>
        </Select>

        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <Checkbox
            checked={showInactive}
            onCheckedChange={(checked) => setShowInactive(Boolean(checked))}
          />
          Mostrar inactivos
        </label>
      </div>

      <DataTable
        columns={columns}
        data={products}
        isLoading={isLoading}
        isError={isError}
        getRowKey={(product) => product._id}
        emptyMessage="No hay productos registrados con estos filtros."
      />
    </div>
  );
}
