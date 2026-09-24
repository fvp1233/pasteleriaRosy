import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, ArrowRight, Loader2, Mail } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { http, ApiError } from "@/lib/http";

export function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Ingresa tu correo.");
      return;
    }

    setIsSubmitting(true);
    try {
      await http.post("/users/recovery/request-code", { email: email.trim() });
      navigate("/recuperar-contrasena/codigo", { state: { email: email.trim() } });
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "No se pudo enviar el código. Intenta de nuevo.";
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
            Recupera tu contraseña
          </h2>
          <p className="text-base text-muted-foreground">
            Ingresa el correo de tu cuenta y te enviaremos un código para restablecer tu
            contraseña.
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
            <Label htmlFor="email">Correo</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="operador@rosypasteles.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-11 pl-9"
              />
            </div>
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
                Enviar código
                <ArrowRight className="size-5" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-base text-muted-foreground">
          ¿Ya la recordaste?{" "}
          <Link to="/login" className="font-medium text-brand-primary hover:underline">
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
