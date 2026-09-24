import { useLowStockAlerts, useOverStockAlerts } from "@/features/alerts/api";

// Usado por el badge del Sidebar. Al compartir queryKey con la página de Alertas
// (Fase 5), ambos consumen la misma caché de React Query en vez de duplicar el fetch.
export function useAlertsCount() {
  const { data: lowStock = [] } = useLowStockAlerts();
  const { data: overStock = [] } = useOverStockAlerts();
  return { data: lowStock.length + overStock.length };
}
