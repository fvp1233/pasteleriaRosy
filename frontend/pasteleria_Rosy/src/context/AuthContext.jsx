import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { http, onSessionExpired } from "@/lib/http";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("loading");
  // Se lee dentro del listener de "session-expired" para distinguir un 401
  // real (la sesión estaba activa y murió) de la primera carga sin sesión aún.
  const statusRef = useRef(status);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  // Cualquier request que reciba 401 (token vencido/inválido) dispara este
  // evento desde http.js. Lo escuchamos una sola vez aquí en vez de en cada
  // pantalla, así el usuario siempre vuelve a /login (vía ProtectedRoute) sin
  // importar en qué módulo estaba cuando la sesión expiró.
  useEffect(() => {
    return onSessionExpired(() => {
      const wasAuthenticated = statusRef.current === "authenticated";
      setUser(null);
      setStatus("unauthenticated");
      if (wasAuthenticated) {
        toast.error("Tu sesión expiró. Inicia sesión de nuevo.");
      }
    });
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const data = await http.get("/users/me");
      setUser(data.user);
      setStatus("authenticated");
      return data.user;
    } catch {
      setUser(null);
      setStatus("unauthenticated");
      return null;
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const login = useCallback(async ({ email, password }) => {
    const data = await http.post("/users/login", { email, password });
    setUser(data.user);
    setStatus("authenticated");
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await http.post("/users/logout");
    } finally {
      setUser(null);
      setStatus("unauthenticated");
    }
  }, []);

  const value = {
    user,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    isAdmin: user?.role === "Admin",
    login,
    logout,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}
