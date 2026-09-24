import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createResourceHooks } from "@/lib/apiResource";
import { http } from "@/lib/http";

const movements = createResourceHooks("movements", "/movements");

// GET /movements?product_id=&batch_id=&movement_type=
// Viene con product_id y user_id populados (code/description, name/last_name).
export const useMovements = movements.useList;

// Salidas y ajustes no son un "create" genérico sobre /movements (son sub-rutas
// propias), y ademas cambian tres colecciones a la vez: movements, batches
// (PEPS) y products (total_stock). Por eso invalidamos las tres.
function useMovementMutation(path, options) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body) => http.post(path, body),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["movements"] });
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      options?.onSuccess?.(...args);
    },
  });
}

// POST /movements/exit — { product_id, quantity, reason }
export function useRegisterExit(options) {
  return useMovementMutation("/movements/exit", options);
}

// POST /movements/adjustment — { product_id, quantity, reason } (reason obligatorio)
export function useRegisterAdjustment(options) {
  return useMovementMutation("/movements/adjustment", options);
}
