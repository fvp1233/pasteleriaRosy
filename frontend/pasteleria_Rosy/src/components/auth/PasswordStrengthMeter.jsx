import { Check } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { evaluatePasswordStrength } from "@/lib/password";

const LABELS = ["Muy débil", "Débil", "Media", "Buena", "Fuerte y segura"];

export function PasswordStrengthMeter({ password }) {
  if (!password) return null;

  const { score, meetsPolicy } = evaluatePasswordStrength(password);
  const percent = (score / 4) * 100;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Nivel de seguridad de la clave:</span>
        <span
          className={`flex items-center gap-1 font-medium ${
            meetsPolicy ? "text-brand-secondary" : "text-muted-foreground"
          }`}
        >
          {meetsPolicy ? <Check className="size-3.5" /> : null}
          {LABELS[score]}
        </span>
      </div>
      <Progress value={percent} />
      <p className="text-xs text-muted-foreground">
        Cumple con el criterio del sistema: mínimo 8 caracteres, números y caracteres especiales.
      </p>
    </div>
  );
}
