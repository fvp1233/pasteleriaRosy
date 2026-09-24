import { NavLink, Outlet } from "react-router-dom";
import { PageHeader } from "@/components/shared/PageHeader";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "Valorización", to: "/reportes/valorizacion" },
  { label: "Kardex", to: "/reportes/kardex" },
  { label: "Cierre mensual", to: "/reportes/cierre-mensual" },
  { label: "Rotación", to: "/reportes/rotacion" },
  { label: "Mermas", to: "/reportes/mermas" },
];

export function ReportsLayout() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Reportes y Kardex"
        description="Reportes financieros y de movimiento de inventario, calculados con el método PEPS."
      />

      <div className="flex flex-wrap gap-1 border-b border-border">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              cn(
                "border-b-2 border-transparent px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                isActive && "border-primary text-foreground"
              )
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </div>

      <Outlet />
    </div>
  );
}
