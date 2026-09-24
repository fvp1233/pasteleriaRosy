import { ArrowLeftRight, BarChart3, Bell, LayoutDashboard, Layers, Package } from "lucide-react";

export const NAV_SECTIONS = [
  {
    key: "dashboard",
    title: "Dashboard",
    icon: LayoutDashboard,
    items: [{ label: "Dashboard de Inventario PEPS", to: "/" }],
  },
  {
    key: "productos",
    title: "Catálogo de Productos",
    icon: Package,
    items: [
      { label: "Catálogo y Recetas", to: "/productos" },
      { label: "Nuevo Producto / Insumo", to: "/productos/nuevo", adminOnly: true },
    ],
  },
  {
    key: "lotes",
    title: "Lotes y Entradas PEPS",
    icon: Layers,
    items: [
      { label: "Lotes y Secuencia PEPS", to: "/lotes" },
      { label: "Nueva Entrada de Lote", to: "/lotes/nuevo" },
    ],
  },
  {
    key: "movimientos",
    title: "Movimientos y Bajas",
    icon: ArrowLeftRight,
    items: [
      { label: "Historial de Movimientos", to: "/movimientos" },
      { label: "Registrar Salida", to: "/movimientos/salida" },
      { label: "Registrar Ajuste", to: "/movimientos/ajuste" },
    ],
  },
  {
    key: "alertas",
    title: "Alertas de Stock",
    icon: Bell,
    badgeKey: "alerts",
    // Los umbrales (minimum_stock/maximum_stock) se editan desde la ficha del
    // producto (PUT /products/:id) — el backend no tiene un endpoint propio de
    // "umbrales", así que no hay una segunda entrada de navegación aquí.
    items: [{ label: "Alertas y Notificaciones", to: "/alertas" }],
  },
  {
    key: "reportes",
    title: "Reportes PEPS",
    icon: BarChart3,
    adminOnly: true,
    items: [
      { label: "Valorización de Inventario", to: "/reportes/valorizacion" },
      { label: "Kardex por Producto", to: "/reportes/kardex" },
      { label: "Cierre Mensual", to: "/reportes/cierre-mensual" },
      { label: "Rotación de Productos Terminados", to: "/reportes/rotacion" },
      { label: "Reporte de Mermas", to: "/reportes/mermas" },
    ],
  },
];
