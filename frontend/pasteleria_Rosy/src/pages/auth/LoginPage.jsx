import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AlertCircle, ArrowRight, CheckCircle2, Headset, Loader2, Mail } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginMarketingPanel } from "@/components/auth/LoginMarketingPanel";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/http";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname ?? "/";
  const justVerified = Boolean(location.state?.verified);
  const justResetPassword = Boolean(location.state?.passwordReset);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberDevice, setRememberDevice] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Ingresa tu correo y contraseña.");
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ email: email.trim(), password });
      navigate(from, { replace: true });
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "No se pudo iniciar sesión. Intenta de nuevo.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      panel={<LoginMarketingPanel />}
      topBar={
        <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
          <Headset className="size-4" />
          Soporte Técnico
        </span>
      }
    >
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">Bienvenido de nuevo</h2>
          <p className="text-base text-muted-foreground">
            Ingresa tus credenciales autorizadas para acceder a los módulos de stock, producción y
            recetas.
          </p>
        </div>

        {justVerified ? (
          <Alert>
            <CheckCircle2 />
            <AlertDescription>Tu cuenta fue verificada. Ya puedes iniciar sesión.</AlertDescription>
          </Alert>
        ) : null}

        {justResetPassword ? (
          <Alert>
            <CheckCircle2 />
            <AlertDescription>Tu contraseña fue actualizada. Inicia sesión con la nueva.</AlertDescription>
          </Alert>
        ) : null}

        {error ? (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Correo Electrónico Corporativo</Label>
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

          <PasswordInput
            id="password"
            label="Contraseña"
            labelAction={
              <Link
                to="/recuperar-contrasena"
                className="text-sm font-medium text-brand-primary hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            }
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-11"
          />

          <label className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <Checkbox
              checked={rememberDevice}
              onCheckedChange={(checked) => setRememberDevice(Boolean(checked))}
            />
            Mantener sesión iniciada en este equipo
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-linear-to-r from-brand-secondary to-brand-primary text-base font-medium text-white transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-60"
          >
            {isSubmitting ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <>
                Iniciar Sesión
                <ArrowRight className="size-5" />
              </>
            )}
          </button>
        </form>

        <div className="flex flex-col items-center gap-3">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Roles de sistema soportados
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Badge variant="outline" className="gap-1.5">
              <span className="size-1.5 rounded-full bg-brand-primary" />
              Rol Admin: Acceso Total
            </Badge>
            <Badge variant="outline" className="gap-1.5">
              <span className="size-1.5 rounded-full bg-brand-secondary" />
              Rol Operator: Lotes y PEPS
            </Badge>
          </div>
        </div>

        <p className="text-center text-base text-muted-foreground">
          ¿No tienes una cuenta aún?{" "}
          <Link to="/registro" className="font-medium text-brand-primary hover:underline">
            Solicita acceso a tu supervisor
          </Link>
        </p>

        <p className="text-center text-xs text-muted-foreground">
          Rosy Pasteles SaaS • Plataforma protegida contra accesos no autorizados.
        </p>
      </div>
    </AuthShell>
  );
}
