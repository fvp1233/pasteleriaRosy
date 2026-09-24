import { useQuery } from "@tanstack/react-query";
import { createResourceHooks } from "@/lib/apiResource";
import { http } from "@/lib/http";

const batches = createResourceHooks("batches", "/batches");

// GET /batches?product_id=&status=
// Nota: este endpoint NO viene con el producto populado (a diferencia de getById),
// por eso las pantallas de listado cruzan con la lista de productos ya cargada
// (useProducts) para mostrar código/descripción en vez del ObjectId crudo.
export const useBatches = batches.useList;

// GET /batches/:id — sí viene con product_id populado (code, description, unit_of_measure)
export const useBatch = batches.useDetail;

// POST /batches — { product_id, quantity, unit_cost, reason }
export const useCreateBatch = batches.useCreate;

// GET /batches/product/:productId — solo lotes activos de ese producto, orden PEPS.
// Comparte el prefijo de queryKey "batches" para que useCreateBatch invalide esta
// consulta automáticamente al registrar una nueva entrada.
export function useBatchesByProduct(productId, options) {
  return useQuery({
    queryKey: ["batches", "byProduct", productId],
    queryFn: () => http.get(`/batches/product/${productId}`),
    enabled: Boolean(productId),
    ...options,
  });
}
