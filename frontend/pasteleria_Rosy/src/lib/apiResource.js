import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { http, withQuery } from "@/lib/http";

/**
 * Fabrica los hooks de React Query mas comunes (listar, detalle, crear, actualizar,
 * patch puntual) para un recurso REST del backend. Cada modulo (productos, lotes,
 * movimientos...) crea un archivo de hooks propio llamando a esta funcion una vez,
 * y encima le agrega las mutations que no encajen en el patron generico
 * (por ejemplo POST /movements/exit y POST /movements/adjustment, que no son un
 * "create" comun sobre /movements).
 *
 * Ejemplo (Fase 2 - productos), en src/features/products/api.js:
 *
 *   const products = createResourceHooks("products", "/products");
 *   export const useProducts = products.useList;              // GET /products?type=...
 *   export const useProduct = products.useDetail;              // GET /products/:id
 *   export const useCreateProduct = products.useCreate;        // POST /products
 *   export const useUpdateProduct = products.useUpdate;        // PUT /products/:id
 *   export const useDeactivateProduct = () =>
 *     products.usePatch((id) => `/products/${id}/deactivate`); // PATCH /products/:id/deactivate
 */
export function createResourceHooks(resourceKey, basePath) {
  function useList(params, options) {
    return useQuery({
      queryKey: [resourceKey, "list", params ?? null],
      queryFn: () => http.get(withQuery(basePath, params)),
      ...options,
    });
  }

  function useDetail(id, options) {
    return useQuery({
      queryKey: [resourceKey, "detail", id],
      queryFn: () => http.get(`${basePath}/${id}`),
      enabled: Boolean(id),
      ...options,
    });
  }

  function invalidateResource(queryClient) {
    return queryClient.invalidateQueries({ queryKey: [resourceKey] });
  }

  function useCreate(options) {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (body) => http.post(basePath, body),
      ...options,
      onSuccess: (...args) => {
        invalidateResource(queryClient);
        options?.onSuccess?.(...args);
      },
    });
  }

  function useUpdate(options) {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ id, ...body }) => http.put(`${basePath}/${id}`, body),
      ...options,
      onSuccess: (...args) => {
        invalidateResource(queryClient);
        options?.onSuccess?.(...args);
      },
    });
  }

  // Para acciones PATCH que no son una actualizacion generica (ej. desactivar).
  // buildPath recibe el id y arma la ruta exacta contra ese recurso.
  function usePatch(buildPath, options) {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ id, ...body }) => http.patch(buildPath(id), body),
      ...options,
      onSuccess: (...args) => {
        invalidateResource(queryClient);
        options?.onSuccess?.(...args);
      },
    });
  }

  return { useList, useDetail, useCreate, useUpdate, usePatch };
}
