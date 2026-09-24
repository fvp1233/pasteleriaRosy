import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AlertCircle, ArrowRight, KeyRound, Loader2 } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { http, ApiError } from "@/lib/http";

export function VerifyRecoveryCodePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email ?? "";

  const [code, setCode] = useState("");
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);

    if (!/^\d{6}$/.test(code)) {
      setError("El código debe tener 6 dígitos.");
      return;
    }

    setIsSubmitting(true);
    try {
      await http.post("/users/recovery/verify-code", { code });
      navigate("/recuperar-contrasena/nueva", { state: { email } });
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "No se pudo verificar el código. Intenta de nuevo.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
            Verifica tu código
          </h2>
          <p className="text-base text-muted-foreground">
            Enviamos un código de recuperación a{" "}
            <span className="font-medium text-foreground">{email || "tu correo"}</span>. Ingrésalo
            para continuar.
          </p>
        </div>

        {error ? (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="code">Código de recuperación</Label>
            <div className="relative">
              <KeyRound className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="code"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
                className="h-11 pl-9 tracking-[0.3em]"
              />
            </div>
            <p className="text-sm text-muted-foreground">El código expira 15 minutos después de solicitarlo.</p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-linear-to-r from-brand-secondary to-brand-primary text-base font-medium text-white transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-60"
          >
            {isSubmitting ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <>
                Verificar código
                <ArrowRight className="size-5" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-base text-muted-foreground">
          ¿No te llegó el código?{" "}
          <Link
            to="/recuperar-contrasena"
            className="font-medium text-brand-primary hover:underline"
          >
            Solicita uno nuevo
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
