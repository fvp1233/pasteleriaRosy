import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useBatch } from "@/features/batches/api";
import { BATCH_STATUS_LABELS } from "@/features/batches/constants";

export function BatchDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: batch, isLoading, isError } = useBatch(id);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (isError || !batch) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Lote no encontrado</AlertTitle>
        <AlertDescription>No se pudo cargar la información de este lote.</AlertDescription>
      </Alert>
    );
  }

  // GET /batches/:id sí viene con el producto populado (code, description, unit_of_measure).
  const product = batch.product_id;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={product ? `${product.code} · ${product.description}` : "Lote"}
        description={`Entrada del ${new Date(batch.entry_date).toLocaleDateString("es-MX")}`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate("/lotes")}>
              <ArrowLeft /> Volver
            </Button>
            {product ? (
              <Button variant="outline" render={<Link to={`/productos/${product._id}`} />}>
                Ver producto
              </Button>
            ) : null}
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Cantidad inicial</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-foreground">
            {batch.initial_quantity}{" "}
            <span className="text-sm font-normal text-muted-foreground">
              {product?.unit_of_measure}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Cantidad disponible</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-foreground">
            {batch.available_quantity}{" "}
            <span className="text-sm font-normal text-muted-foreground">
              {product?.unit_of_measure}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Costo unitario</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-foreground">
            ${Number(batch.unit_cost).toFixed(2)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={batch.status === "Active" ? "secondary" : "outline"}>
              {BATCH_STATUS_LABELS[batch.status] ?? batch.status}
            </Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
