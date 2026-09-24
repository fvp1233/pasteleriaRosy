import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { RecipeBuilder } from "@/features/products/RecipeBuilder";
import {
  useCreateProduct,
  useProduct,
  useProducts,
  useUpdateProduct,
} from "@/features/products/api";
import { ApiError } from "@/lib/http";

const EMPTY_FORM = {
  code: "",
  type: "Raw Material",
  description: "",
  unit_of_measure: "",
  minimum_stock: "",
  maximum_stock: "",
};

export function ProductFormPage() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const { data: product, isLoading: isLoadingProduct } = useProduct(id);
  const { data: rawMaterials = [], isLoading: isLoadingRawMaterials } = useProducts({
    type: "Raw Material",
  });

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const [form, setForm] = useState(EMPTY_FORM);
  const [recipe, setRecipe] = useState([]);
  const [error, setError] = useState(null);

  // Precarga el formulario cuando llega el producto a editar.
  useEffect(() => {
    if (!isEditMode || !product) return;
    setForm({
      code: product.code,
      type: product.type,
      description: product.description,
      unit_of_measure: product.unit_of_measure,
      minimum_stock: product.minimum_stock ?? "",
      maximum_stock: product.maximum_stock ?? "",
    });
    setRecipe(
      (product.recipe ?? []).map((item) => ({
        raw_material_id: item.raw_material_id?._id ?? item.raw_material_id,
        required_quantity: item.required_quantity,
      }))
    );
  }, [isEditMode, product]);

  function updateField(field) {
    return (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }));
  }

  const isFinishedGood = form.type === "Finished Good";
  const isSubmitting = createProduct.isPending || updateProduct.isPending;

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);

    if (!form.description.trim() || !form.unit_of_measure.trim()) {
      setError("Descripción y unidad de medida son obligatorias.");
      return;
    }
    if (!isEditMode && !form.code.trim()) {
      setError("El código es obligatorio.");
      return;
    }
    if (
      isFinishedGood &&
      recipe.some((item) => !item.raw_material_id || item.required_quantity === "")
    ) {
      setError("Completa la materia prima y la cantidad de cada ingrediente de la receta.");
      return;
    }

    const cleanRecipe = isFinishedGood
      ? recipe.map((item) => ({
          raw_material_id: item.raw_material_id,
          required_quantity: Number(item.required_quantity),
        }))
      : [];

    try {
      if (isEditMode) {
        await updateProduct.mutateAsync({
          id,
          description: form.description.trim(),
          unit_of_measure: form.unit_of_measure.trim(),
          minimum_stock: Number(form.minimum_stock) || 0,
          maximum_stock: Number(form.maximum_stock) || 0,
          recipe: cleanRecipe,
        });
        toast.success("Producto actualizado correctamente.");
      } else {
        await createProduct.mutateAsync({
          code: form.code.trim(),
          type: form.type,
          description: form.description.trim(),
          unit_of_measure: form.unit_of_measure.trim(),
          minimum_stock: Number(form.minimum_stock) || 0,
          maximum_stock: Number(form.maximum_stock) || 0,
          recipe: cleanRecipe,
        });
        toast.success("Producto creado correctamente.");
      }
      navigate("/productos");
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "No se pudo guardar el producto.";
      setError(message);
    }
  }

  if (isEditMode && isLoadingProduct) {
    return <p className="text-sm text-muted-foreground">Cargando producto…</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={isEditMode ? "Editar producto" : "Nuevo producto / insumo"}
        description={
          isEditMode
            ? "El código y el tipo no se pueden modificar una vez creado el producto."
            : "Registra un insumo (materia prima) o un producto terminado con su receta."
        }
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
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="code">Código *</Label>
                <Input
                  id="code"
                  value={form.code}
                  onChange={updateField("code")}
                  disabled={isEditMode}
                  placeholder="ej. HAR-001"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="type">Tipo *</Label>
                <Select
                  value={form.type}
                  onValueChange={(value) => setForm((prev) => ({ ...prev, type: value }))}
                  disabled={isEditMode}
                >
                  <SelectTrigger id="type" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Raw Material">Materia Prima</SelectItem>
                    <SelectItem value="Finished Good">Producto Terminado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="description">Descripción *</Label>
              <Input
                id="description"
                value={form.description}
                onChange={updateField("description")}
                placeholder="ej. Harina de trigo 000"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="unit_of_measure">Unidad de medida *</Label>
                <Input
                  id="unit_of_measure"
                  value={form.unit_of_measure}
                  onChange={updateField("unit_of_measure")}
                  placeholder="kg, lt, unidad..."
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="minimum_stock">Stock mínimo</Label>
                <Input
                  id="minimum_stock"
                  type="number"
                  min="0"
                  value={form.minimum_stock}
                  onChange={updateField("minimum_stock")}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="maximum_stock">Stock máximo</Label>
                <Input
                  id="maximum_stock"
                  type="number"
                  min="0"
                  value={form.maximum_stock}
                  onChange={updateField("maximum_stock")}
                />
              </div>
            </div>

            {isFinishedGood ? (
              <RecipeBuilder
                items={recipe}
                onChange={setRecipe}
                rawMaterials={rawMaterials}
                isLoadingRawMaterials={isLoadingRawMaterials}
              />
            ) : null}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => navigate("/productos")}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin" /> : null}
                {isEditMode ? "Guardar cambios" : "Crear producto"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
