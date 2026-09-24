import { useQuery } from "@tanstack/react-query";
import { http, withQuery } from "@/lib/http";

// GET /reports/valuation?product_id=
export function useInventoryValuation(params, options) {
  return useQuery({
    queryKey: ["reports", "valuation", params ?? null],
    queryFn: () => http.get(withQuery("/reports/valuation", params)),
    ...options,
  });
}

// GET /reports/kardex?product_id=&start_date=&end_date= (product_id es obligatorio)
export function useKardex(params, options) {
  return useQuery({
    queryKey: ["reports", "kardex", params ?? null],
    queryFn: () => http.get(withQuery("/reports/kardex", params)),
    enabled: Boolean(params?.product_id),
    ...options,
  });
}

// GET /reports/monthly-closing?year=&month=&product_id= (year y month son obligatorios)
export function useMonthlyClosing(params, options) {
  return useQuery({
    queryKey: ["reports", "monthly-closing", params ?? null],
    queryFn: () => http.get(withQuery("/reports/monthly-closing", params)),
    enabled: Boolean(params?.year && params?.month),
    ...options,
  });
}

// GET /reports/rotation?start_date=&end_date=
export function useFinishedGoodsRotation(params, options) {
  return useQuery({
    queryKey: ["reports", "rotation", params ?? null],
    queryFn: () => http.get(withQuery("/reports/rotation", params)),
    ...options,
  });
}

// GET /reports/shrinkage?start_date=&end_date=&product_id=
export function useShrinkageReport(params, options) {
  return useQuery({
    queryKey: ["reports", "shrinkage", params ?? null],
    queryFn: () => http.get(withQuery("/reports/shrinkage", params)),
    ...options,
  });
}
