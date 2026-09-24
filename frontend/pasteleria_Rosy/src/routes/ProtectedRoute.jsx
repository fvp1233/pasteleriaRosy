import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

function SessionLoader() {
  return (
    <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">
      Cargando sesión…
    </div>
  );
}

export function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) return <SessionLoader />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export function PublicOnlyRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <SessionLoader />;
  if (isAuthenticated) return <Navigate to="/" replace />;

  return <Outlet />;
}
