const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

// Manejo global de sesión expirada: cualquier request que reciba 401 (token
// ausente/expirado/inválido, ver authMiddleware.validateAuthToken en el backend)
// emite este evento. AuthContext lo escucha una sola vez y desloguea al usuario
// en cualquier pantalla, sin que cada página tenga que detectarlo por su cuenta.
const SESSION_EXPIRED_EVENT = "session-expired";

export function onSessionExpired(callback) {
  window.addEventListener(SESSION_EXPIRED_EVENT, callback);
  return () => window.removeEventListener(SESSION_EXPIRED_EVENT, callback);
}

async function request(path, { method = "GET", body, headers, ...rest } = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    credentials: "include",
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    ...rest,
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    if (response.status === 401) {
      window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
    }
    throw new ApiError(data?.message ?? "Ocurrió un error inesperado", response.status, data);
  }

  return data;
}

export const http = {
  get: (path, options) => request(path, { ...options, method: "GET" }),
  post: (path, body, options) => request(path, { ...options, method: "POST", body }),
  put: (path, body, options) => request(path, { ...options, method: "PUT", body }),
  patch: (path, body, options) => request(path, { ...options, method: "PATCH", body }),
  delete: (path, options) => request(path, { ...options, method: "DELETE" }),
};

// Arma "path?clave=valor" ignorando valores vacios/undefined/null.
// Usado por los hooks de listado (createResourceHooks) para pasar filtros
// como los que ya aceptan los controllers del backend (product_id, status, etc.)
export function withQuery(path, params) {
  if (!params) return path;
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    searchParams.set(key, value);
  }
  const query = searchParams.toString();
  return query ? `${path}?${query}` : path;
}
