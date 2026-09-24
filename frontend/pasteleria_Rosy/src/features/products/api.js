import { createResourceHooks } from "@/lib/apiResource";

const products = createResourceHooks("products", "/products");

// GET /products?type=&includeInactive=
export const useProducts = products.useList;
// GET /products/:id (populado con la receta)
export const useProduct = products.useDetail;
// POST /products
export const useCreateProduct = products.useCreate;
// PUT /products/:id (el backend solo acepta description, unit_of_measure,
// minimum_stock, maximum_stock y recipe — code y type no son editables)
export const useUpdateProduct = products.useUpdate;

// PATCH /products/:id/deactivate
export function useDeactivateProduct(options) {
  return products.usePatch((id) => `/products/${id}/deactivate`, options);
}
