import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { useRegisterAdjustment } from "@/features/movements/api";
import { useProducts } from "@/features/products/api";
import { ApiError } from "@/lib/http";

const EMPTY_FORM = { product_id: "", quantity: "", reason: "" };

export function MovementAdjustmentFormPage() {
  const navigate = useNavigate();
  const { data: products = [], isLoading: isLoadingProducts } = useProducts();
  const registerAdjustment = useRegisterAdjustment();

  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState(null);

  const selectedProduct = useMemo(
    () => products.find((product) => product._id === form.product_id),
    [products, form.product_id]
  );

  function updateField(field) {
    return (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);

    if (!form.product_id) {
      setError("Selecciona el producto a ajustar.");
      return;
    }
    if (!form.quantity || Number(form.quantity) <= 0) {
      setError("La cantidad debe ser mayor a cero.");
      return;
    }
    if (!form.reason.trim()) {
      setError("El motivo es obligatorio para un ajuste de inventario.");
      return;
    }

    try {
      await registerAdjustment.mutateAsync({
        product_id: form.product_id,
        quantity: Number(form.quantity),
        reason: form.reason.trim(),
      });
      toast.success("Ajuste registrado correctamente.");
      navigate("/movimientos");
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "No se pudo registrar el ajuste.";
      setError(message);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Registrar ajuste de inventario"
        description="Usa esta opción para mermas, derrames, caducidad o errores de conteo. El motivo es obligatorio."
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
              {selectedProduct ? (
                <p className="text-xs text-muted-foreground">
                  Disponible: {selectedProduct.total_stock} {selectedProduct.unit_of_measure}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="quantity">Cantidad a dar de baja *</Label>
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
              <Label htmlFor="reason">Motivo *</Label>
              <Textarea
                id="reason"
                placeholder="ej. Merma por caducidad, derrame en producción"
                value={form.reason}
                onChange={updateField("reason")}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => navigate("/movimientos")}>
                Cancelar
              </Button>
              <Button type="submit" variant="destructive" disabled={registerAdjustment.isPending}>
                {registerAdjustment.isPending ? <Loader2 className="animate-spin" /> : null}
                Registrar ajuste
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
