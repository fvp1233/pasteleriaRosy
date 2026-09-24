import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * Editor de receta (BOM) para productos de tipo "Finished Good": cada fila es un
 * ingrediente de materia prima + la cantidad requerida por unidad producida.
 * `items` sigue la forma que espera el backend: [{ raw_material_id, required_quantity }]
 */
export function RecipeBuilder({ items, onChange, rawMaterials, isLoadingRawMaterials }) {
  function updateItem(index, patch) {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function addItem() {
    onChange([...items, { raw_material_id: "", required_quantity: "" }]);
  }

  function removeItem(index) {
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border p-4">
      <div className="flex items-center justify-between">
        <Label>Receta (ingredientes) *</Label>
        <Button type="button" variant="outline" size="sm" onClick={addItem}>
          <Plus /> Agregar ingrediente
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Agrega al menos un ingrediente de materia prima para este producto terminado.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className="flex-1">
                <Select
                  value={item.raw_material_id || null}
                  onValueChange={(value) => updateItem(index, { raw_material_id: value })}
                  disabled={isLoadingRawMaterials}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona una materia prima" />
                  </SelectTrigger>
                  <SelectContent>
                    {rawMaterials.map((rawMaterial) => (
                      <SelectItem key={rawMaterial._id} value={rawMaterial._id}>
                        {rawMaterial.code} · {rawMaterial.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Input
                type="number"
                min="0"
                step="any"
                placeholder="Cantidad"
                value={item.required_quantity}
                onChange={(event) => updateItem(index, { required_quantity: event.target.value })}
                className="w-32"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeItem(index)}
                aria-label="Quitar ingrediente"
              >
                <Trash2 className="text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
