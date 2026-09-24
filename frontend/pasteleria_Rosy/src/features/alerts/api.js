import { useQuery } from "@tanstack/react-query";
import { http } from "@/lib/http";

// GET /alerts/low-stock — productos activos con total_stock <= minimum_stock
export function useLowStockAlerts(options) {
  return useQuery({
    queryKey: ["alerts", "low-stock"],
    queryFn: () => http.get("/alerts/low-stock"),
    ...options,
  });
}

// GET /alerts/over-stock — productos activos con maximum_stock > 0 y total_stock >= maximum_stock
export function useOverStockAlerts(options) {
  return useQuery({
    queryKey: ["alerts", "over-stock"],
    queryFn: () => http.get("/alerts/over-stock"),
    ...options,
  });
}
