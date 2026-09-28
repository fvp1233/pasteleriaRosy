import { BadgeCheck, ShieldCheck } from "lucide-react";

export function LoginMarketingPanel() {
  return (
    <div className="flex h-full max-w-2xl flex-col justify-between gap-10 px-10 py-14 sm:px-14 lg:px-20">
      <div className="flex flex-col gap-10">
        <img
          src="/logo-wordmark-tagline.png"
          alt="Rosy Pasteles — El sabor de lo especial"
          className="w-40"
        />

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
      </div>

      <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          © 2026 Rosy Pasteles. Software exclusivo de operación.
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
