import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { useCreateBatch } from "@/features/batches/api";
import { useProducts } from "@/features/products/api";
import { ApiError } from "@/lib/http";

function buildEmptyForm(preselectedProductId) {
  return { product_id: preselectedProductId ?? "", quantity: "", unit_cost: "", reason: "" };
}

export function BatchFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedProductId = searchParams.get("producto") ?? "";

  const { data: products = [], isLoading: isLoadingProducts } = useProducts();
  const createBatch = useCreateBatch();

  const [form, setForm] = useState(() => buildEmptyForm(preselectedProductId));
  const [error, setError] = useState(null);

  function updateField(field) {
    return (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);

    if (!form.product_id) {
      setError("Selecciona el producto que ingresa al inventario.");
      return;
    }
    if (!form.quantity || Number(form.quantity) <= 0) {
      setError("La cantidad debe ser mayor a cero.");
      return;
    }
    if (form.unit_cost === "" || Number(form.unit_cost) < 0) {
      setError("Ingresa el costo unitario del lote.");
      return;
    }
    if (!form.reason.trim()) {
      setError("Indica el motivo de la entrada (ej. compra a proveedor, producción interna).");
      return;
    }

    try {
      await createBatch.mutateAsync({
        product_id: form.product_id,
        quantity: Number(form.quantity),
        unit_cost: Number(form.unit_cost),
        reason: form.reason.trim(),
      });
      toast.success("Lote registrado correctamente.");
      navigate("/lotes");
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "No se pudo registrar el lote.";
      setError(message);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Nueva entrada de lote"
        description="Registra una entrada de inventario siguiendo el orden PEPS: cada lote conserva su propio costo unitario."
        actions={
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft /> Volver
          </Button>
        }
      />

      {error ? (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardContent>
          <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="product_id">Producto *</Label>
              <Select
                value={form.product_id || null}
                onValueChange={(value) => setForm((prev) => ({ ...prev, product_id: value }))}
                disabled={isLoadingProducts}
              >
                <SelectTrigger id="product_id" className="w-full">
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

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="quantity">Cantidad *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  step="any"
                  value={form.quantity}
                  onChange={updateField("quantity")}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="unit_cost">Costo unitario *</Label>
                <Input
                  id="unit_cost"
                  type="number"
                  min="0"
                  step="any"
                  value={form.unit_cost}
                  onChange={updateField("unit_cost")}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="reason">Motivo de la entrada *</Label>
              <Textarea
                id="reason"
                placeholder="ej. Compra a proveedor Harinas del Sur, factura #123"
                value={form.reason}
                onChange={updateField("reason")}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => navigate("/lotes")}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createBatch.isPending}>
                {createBatch.isPending ? <Loader2 className="animate-spin" /> : null}
                Registrar lote
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
