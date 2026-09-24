import { BadgeCheck, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function LoginMarketingPanel() {
  return (
    <div className="flex h-full max-w-2xl flex-col justify-between gap-10 px-10 py-14 sm:px-14 lg:px-20">
      <div className="flex flex-col gap-10">
        <div className="flex flex-col items-start gap-3">
          <img
            src="/logo-wordmark-tagline.png"
            alt="Rosy Pasteles — El sabor de lo especial"
            className="w-40"
          />
          <Badge variant="secondary">SAAS v2.4</Badge>
        </div>

        <div className="flex flex-col gap-5">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-muted/50 px-3.5 py-1.5 text-sm text-muted-foreground">
            <span className="size-1.5 rounded-full bg-brand-secondary" />
            Sistema PEPS Activo • Trazabilidad Total
          </div>

          <h1 className="text-4xl leading-tight font-semibold text-balance text-foreground sm:text-5xl">
            El sabor de la tradición,{" "}
            <span className="bg-linear-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
              la precisión en tu inventario.
            </span>
          </h1>
          <p className="max-w-lg text-base text-muted-foreground">
            Control inteligente de mermas, gestión de materias primas por fecha de caducidad y
            cálculo automatizado de costos por porción para pastelerías de alto estándar.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-foreground">
              Lote Reciente: <span className="font-normal text-muted-foreground">Fresas Silvestres Orgánicas</span>
            </p>
            <Badge className="border-brand-secondary/20 bg-brand-secondary/10 text-brand-secondary" variant="outline">
              Método PEPS
            </Badge>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div>
              <p className="text-lg font-semibold text-foreground">48 Horas</p>
              <p className="text-xs text-muted-foreground">Caducidad</p>
              <p className="mt-1 text-xs font-medium text-destructive">Prioridad Alta</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">24.50 kg</p>
              <p className="text-xs text-muted-foreground">Stock Actual</p>
              <p className="mt-1 text-xs font-medium text-muted-foreground">En Cámara 02</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">$3.40 / kg</p>
              <p className="text-xs text-muted-foreground">Costo Unit.</p>
              <p className="mt-1 text-xs font-medium text-brand-secondary">Auditado OK</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          © 2025 Rosy Pasteles Inc. Software exclusivo de operación.
        </p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="size-3.5" />
            Cifrado SSL 256-bit
          </span>
          <span className="inline-flex items-center gap-1.5">
            <BadgeCheck className="size-3.5" />
            ISO 22000 Ready
          </span>
        </div>
      </div>
    </div>
  );
}
