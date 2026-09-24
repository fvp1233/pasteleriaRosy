import { useMutation } from "@tanstack/react-query";
import { http } from "@/lib/http";

// PUT /users/me — { name, last_name }
// El backend solo permite editar nombre y apellido; email y role son de solo lectura.
export function useUpdateProfile(options) {
  return useMutation({
    mutationFn: (body) => http.put("/users/me", body),
    ...options,
  });
}
