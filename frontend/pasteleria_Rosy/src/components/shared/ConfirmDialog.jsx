import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * Dialogo de confirmacion reutilizable para acciones destructivas o dificiles de
 * revertir (desactivar producto, registrar un ajuste de merma, etc.). El padre
 * controla el estado abierto/cerrado, igual que el resto de dialogos de shadcn.
 *
 * Ejemplo:
 *   const [open, setOpen] = useState(false);
 *   const deactivate = useDeactivateProduct();
 *
 *   <ConfirmDialog
 *     open={open}
 *     onOpenChange={setOpen}
 *     title="¿Desactivar este producto?"
 *     description="Dejará de aparecer en el catálogo activo. Podrás reactivarlo después."
 *     isLoading={deactivate.isPending}
 *     onConfirm={() => deactivate.mutate({ id: product._id }, { onSuccess: () => setOpen(false) })}
 *   />
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  onConfirm,
  isLoading = false,
  variant = "destructive",
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button variant={variant} onClick={onConfirm} disabled={isLoading}>
            {isLoading ? "Procesando..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
