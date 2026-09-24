import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Plus, Power } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { PageHeader } from "@/components/shared/PageHeader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";
import { useBatchesByProduct } from "@/features/batches/api";
import { useDeactivateProduct, useProduct } from "@/features/products/api";
import { PRODUCT_TYPE_LABELS } from "@/features/products/constants";

export function ProductDetailPage() {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const { data: product, isLoading, isError } = useProduct(id);
  const { data: activeBatches = [], isLoading: isLoadingBatches } = useBatchesByProduct(id);
  const deactivateProduct = useDeactivateProduct();
  const [confirmOpen, setConfirmOpen] = useState(false);

  function handleDeactivate() {
    deactivateProduct.mutate(
      { id },
      {
        onSuccess: () => {
          toast.success("Producto desactivado correctamente.");
          setConfirmOpen(false);
        },
        onError: () => toast.error("No se pudo desactivar el producto."),
      }
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Producto no encontrado</AlertTitle>
        <AlertDescription>No se pudo cargar la información de este producto.</AlertDescription>
      </Alert>
    );
  }

  const isFinishedGood = product.type === "Finished Good";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={product.description}
        description={`Código ${product.code} · ${PRODUCT_TYPE_LABELS[product.type] ?? product.type}`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate("/productos")}>
              <ArrowLeft /> Volver
            </Button>
            {isAdmin ? (
              <>
                <Button render={<Link to={`/productos/${id}/editar`} />} variant="outline">
                  <Pencil /> Editar
                </Button>
                {product.is_active !== false ? (
                  <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
                    <Power /> Desactivar
                  </Button>
                ) : null}
              </>
            ) : null}
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Stock actual</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-foreground">
            {product.total_stock}{" "}
            <span className="text-sm font-normal text-muted-foreground">
              {product.unit_of_measure}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Stock mínimo</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-foreground">
            {product.minimum_stock ?? 0}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Stock máximo</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-foreground">
            {product.maximum_stock ?? 0}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Estado</CardTitle>
          </CardHeader>
          <CardContent>
            {product.is_active === false ? (
              <Badge variant="destructive">Inactivo</Badge>
            ) : (
              <Badge variant="secondary">Activo</Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {isFinishedGood ? (
        <Card>
          <CardHeader>
            <CardTitle>Receta</CardTitle>
          </CardHeader>
          <CardContent>
            {product.recipe?.length ? (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Materia prima</TableHead>
                    <TableHead>Cantidad requerida</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {product.recipe.map((item, index) => (
                    <TableRow key={item.raw_material_id?._id ?? index}>
                      <TableCell>
                        {item.raw_material_id?.code} · {item.raw_material_id?.description}
                      </TableCell>
                      <TableCell>
                        {item.required_quantity} {item.raw_material_id?.unit_of_measure}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground">
                Este producto aún no tiene receta definida.
              </p>
            )}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Lotes activos (orden PEPS)</CardTitle>
          <Button
            variant="outline"
            size="sm"
            render={<Link to={`/lotes/nuevo?producto=${id}`} />}
          >
            <Plus /> Nueva entrada
          </Button>
        </CardHeader>
        <CardContent>
          {isLoadingBatches ? (
            <p className="text-sm text-muted-foreground">Cargando lotes…</p>
          ) : activeBatches.length ? (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Fecha de entrada</TableHead>
                  <TableHead>Cantidad disponible</TableHead>
                  <TableHead>Costo unitario</TableHead>
                  <TableHead className="text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeBatches.map((batch) => (
                  <TableRow key={batch._id}>
                    <TableCell>{new Date(batch.entry_date).toLocaleDateString("es-MX")}</TableCell>
                    <TableCell>
                      {batch.available_quantity} {product.unit_of_measure}
                    </TableCell>
                    <TableCell>${Number(batch.unit_cost).toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <Link
                        to={`/lotes/${batch._id}`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        Ver detalle
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">
              Este producto no tiene lotes activos en inventario.
            </p>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="¿Desactivar este producto?"
        description="Dejará de aparecer en el catálogo activo. Podrás verlo de nuevo activando el filtro de inactivos."
        confirmLabel="Desactivar"
        isLoading={deactivateProduct.isPending}
        onConfirm={handleDeactivate}
      />
    </div>
  );
}
