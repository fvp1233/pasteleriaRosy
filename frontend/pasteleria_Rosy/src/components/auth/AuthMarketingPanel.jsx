import { BarChart3, ChefHat, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const FEATURES = [
  {
    icon: Zap,
    iconClass: "bg-brand-secondary/10 text-brand-secondary",
    title: "Control PEPS Automático",
    description:
      "Primeras entradas, primeras salidas. Prioriza la frescura de harina, lácteos e insumos perecederos.",
  },
  {
    icon: ChefHat,
    iconClass: "bg-brand-primary/10 text-brand-primary",
    title: "Deducción de Insumos por Receta",
    description:
      "Al preparar una orden de bizcochos o betunes, el stock se descuenta en gramos milimétricos.",
  },
  {
    icon: BarChart3,
    iconClass: "bg-brand-accent/10 text-brand-accent",
    title: "Métricas en Tiempo Real",
    description:
      "Margen bruto por lote horneado y pronósticos precisos de resurtido semanal.",
  },
];

export function AuthMarketingPanel() {
  return (
    <div className="flex h-full max-w-2xl flex-col justify-center gap-12 px-10 py-16 sm:px-14 lg:px-20">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col items-start gap-3">
          <img
            src="/logo-wordmark-tagline.png"
            alt="Rosy Pasteles — El sabor de lo especial"
            className="w-32"
          />
          <div>
            <Badge variant="secondary">SAAS CORE</Badge>
            <p className="mt-1 text-base text-muted-foreground">
              Gestión inteligente de talleres de repostería
            </p>
          </div>
        </div>

        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-muted/50 px-3.5 py-1.5 text-sm text-muted-foreground">
          <span className="size-1.5 rounded-full bg-brand-secondary" />
          Sistema v3.2.0 • Módulo de Inventario Gastronómico
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h1 className="text-4xl leading-tight font-semibold text-balance text-foreground sm:text-5xl">
          Control exacto de ingredientes, porciones y recetas maestras.
        </h1>
        <p className="max-w-lg text-base text-muted-foreground">
          La plataforma diseñada especialmente para obradores y pastelerías que
          necesitan trazabilidad estricta de mermas, costos por gramo y
          producción en cadena.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {FEATURES.map(({ icon: Icon, iconClass, title, description }) => (
          <div key={title} className="flex gap-4">
            <div
              className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
            >
              <Icon className="size-5" />
            </div>
            <div>
              <p className="text-base font-medium text-foreground">{title}</p>
              <p className="text-base text-muted-foreground">{description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4 border-l-2 border-brand-primary/60 pl-5">
        <p className="text-base text-balance text-muted-foreground italic">
          "Optimizamos el rendimiento de cada lote y evitamos mermas en cocina
          en un 34% durante nuestro primer trimestre."
        </p>
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-brand-primary/15 text-sm font-semibold text-brand-primary">
            CP
          </div>
          <div>
            <p className="text-base font-medium text-foreground">
              Chef Patricia Rosales
            </p>
            <p className="text-sm text-muted-foreground">
              Jefa de Pastelería y Producción
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
