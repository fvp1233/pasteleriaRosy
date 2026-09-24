import { Construction } from "lucide-react";

export function ComingSoonPage({ title }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <Construction className="size-5 text-muted-foreground" />
      </div>
      <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        Esta sección se construirá en una próxima fase.
      </p>
    </div>
  );
}
