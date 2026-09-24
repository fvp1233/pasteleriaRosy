import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Info,
  Loader2,
  Mail,
  Pencil,
  RefreshCw,
} from "lucide-react";
import { OtpInput } from "@/components/auth/OtpInput";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { http, ApiError } from "@/lib/http";

const VERIFICATION_WINDOW_MS = 15 * 60 * 1000;
const RESEND_COOLDOWN_MS = 45 * 1000;

function formatCountdown(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")} min`;
}

function formatResendCooldown(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}s`;
}

export function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email ?? "";

  const [expiresAt] = useState(() => location.state?.expiresAt ?? Date.now() + VERIFICATION_WINDOW_MS);
  const [resendAvailableAt, setResendAvailableAt] = useState(() => Date.now() + RESEND_COOLDOWN_MS);
  const [now, setNow] = useState(Date.now());

  const [code, setCode] = useState("");
  const [error, setError] = useState(null);
  const [resendNotice, setResendNotice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const remainingMs = Math.max(0, expiresAt - now);
  const resendRemainingMs = Math.max(0, resendAvailableAt - now);
  const isExpired = remainingMs === 0;
  const canResend = resendRemainingMs === 0 && !isResending;

  async function handleVerify(codeToVerify) {
    if (isSubmitting || codeToVerify.length !== 6) return;
    setError(null);
    setResendNotice(null);
    setIsSubmitting(true);
    try {
      await http.post("/users/verify-email", { verificationCode: codeToVerify });
      navigate("/login", { state: { verified: true } });
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "No se pudo verificar la cuenta. Intenta de nuevo.";
      setError(message);
      setCode("");
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    if (code.length === 6) {
      handleVerify(code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  async function handleResend() {
    if (!canResend) return;
    setError(null);
    setResendNotice(null);
    setIsResending(true);
    try {
      await http.post("/users/resend-verification");
      setCode("");
      setResendAvailableAt(Date.now() + RESEND_COOLDOWN_MS);
      setResendNotice("Te enviamos un código nuevo.");
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "No se pudo reenviar el código. Intenta de nuevo.";
      setError(message);
    } finally {
      setIsResending(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-muted/30 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="relative mb-2">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-brand-primary/10">
              <Mail className="size-7 text-brand-primary" />
            </div>
            <div className="absolute -right-1 -bottom-1 flex size-5 items-center justify-center rounded-full bg-brand-secondary text-white ring-4 ring-card">
              <CheckCircle2 className="size-3.5" />
            </div>
          </div>

          <h1 className="text-xl font-semibold text-foreground">Verifica tu correo electrónico</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Hemos enviado un código de seguridad de 6 dígitos a{" "}
            <span className="font-semibold text-foreground">{email || "tu correo"}</span>. Ingrésalo a
            continuación para activar tu cuenta.
          </p>

          <Link
            to="/registro"
            className="inline-flex items-center gap-1 text-sm font-medium text-brand-secondary hover:underline"
          >
            <Pencil className="size-3.5" />
            ¿Correo incorrecto? Cambiar dirección
          </Link>
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <OtpInput length={6} value={code} onChange={setCode} disabled={isSubmitting} error={Boolean(error)} />
        </div>

        <div className="mt-6 rounded-xl border border-border bg-muted/40 p-3.5">
          <div className="flex items-center justify-between gap-2 text-sm">
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <Clock className="size-4" />
              {isExpired ? "El código expiró" : "El código expira en:"}
            </span>
            {!isExpired ? (
              <span className="rounded-md border border-border bg-card px-2 py-0.5 font-mono text-xs font-semibold text-foreground tabular-nums">
                {formatCountdown(remainingMs)}
              </span>
            ) : null}
          </div>
          <Progress
            value={isExpired ? 0 : (remainingMs / VERIFICATION_WINDOW_MS) * 100}
            className="mt-2 **:data-[slot=progress-indicator]:bg-linear-to-r **:data-[slot=progress-indicator]:from-brand-secondary **:data-[slot=progress-indicator]:to-brand-primary"
          />
        </div>

        <div className="mt-4 flex items-center justify-center gap-1.5 text-sm">
          <span className="text-muted-foreground">¿No recibiste el código?</span>
          <button
            type="button"
            onClick={handleResend}
            disabled={!canResend}
            className="inline-flex items-center gap-1 font-medium text-brand-primary hover:underline disabled:pointer-events-none disabled:text-muted-foreground disabled:no-underline"
          >
            {isResending ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
            {resendRemainingMs > 0
              ? `Reenviar código (disponible en ${formatResendCooldown(resendRemainingMs)})`
              : "Reenviar código"}
          </button>
        </div>

        {resendNotice ? (
          <Alert className="mt-4">
            <CheckCircle2 />
            <AlertDescription>{resendNotice}</AlertDescription>
          </Alert>
        ) : null}

        {error ? (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <div className="mt-4 flex gap-2 rounded-xl bg-muted/40 p-3.5 text-xs text-muted-foreground">
          <Info className="size-4 shrink-0" />
          <p>
            Revisa también tu carpeta de spam o correo no deseado si no observas el mensaje en los
            próximos instantes.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleVerify(code)}
          disabled={isSubmitting || code.length !== 6}
          className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-linear-to-r from-brand-secondary to-brand-primary text-base font-medium text-white transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-60"
        >
          {isSubmitting ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <>
              Verificar y Acceder al Sistema
              <ArrowRight className="size-5" />
            </>
          )}
        </button>

        <Link
          to="/login"
          className="mt-4 flex items-center justify-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Regresar al Inicio de Sesión
        </Link>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        ¿Problemas para acceder a Rosy Pasteles? Contactar al administrador del sistema
      </p>
    </div>
  );
}
