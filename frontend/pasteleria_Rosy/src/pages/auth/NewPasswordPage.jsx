import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { http, ApiError } from "@/lib/http";
import { evaluatePasswordStrength } from "@/lib/password";

export function NewPasswordPage() {
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate() {
    const nextErrors = {};
    const { meetsPolicy } = evaluatePasswordStrength(newPassword);

    if (!newPassword) {
      nextErrors.newPassword = "La contraseña es obligatoria.";
    } else if (!meetsPolicy) {
      nextErrors.newPassword = "Debe tener 8+ caracteres, un número y un carácter especial.";
    }

    if (!confirmNewPassword) {
      nextErrors.confirmNewPassword = "Confirma tu contraseña.";
    } else if (newPassword !== confirmNewPassword) {
      nextErrors.confirmNewPassword = "Las contraseñas no coinciden.";
    }

    return nextErrors;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setApiError(null);

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await http.post("/users/recovery/new-password", { newPassword, confirmNewPassword });
      navigate("/login", { state: { passwordReset: true } });
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "No se pudo actualizar la contraseña. Intenta de nuevo.";
      setApiError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
            Crea una nueva contraseña
          </h2>
          <p className="text-base text-muted-foreground">
            Elige una contraseña segura para volver a acceder a tu cuenta.
          </p>
        </div>

        {apiError ? (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertDescription>{apiError}</AlertDescription>
          </Alert>
        ) : null}

        <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
          <PasswordInput
            id="newPassword"
            label="Nueva contraseña"
            value={newPassword}
            onChange={(event) => {
              setNewPassword(event.target.value);
              setErrors((prev) => ({ ...prev, newPassword: undefined }));
            }}
            error={errors.newPassword}
            className="h-11"
          />

          <PasswordStrengthMeter password={newPassword} />

          <PasswordInput
            id="confirmNewPassword"
            label="Confirmar nueva contraseña"
            value={confirmNewPassword}
            onChange={(event) => {
              setConfirmNewPassword(event.target.value);
              setErrors((prev) => ({ ...prev, confirmNewPassword: undefined }));
            }}
            error={errors.confirmNewPassword}
            className="h-11"
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-linear-to-r from-brand-secondary to-brand-primary text-base font-medium text-white transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-60"
          >
            {isSubmitting ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <>
                Actualizar contraseña
                <ArrowRight className="size-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </AuthShell>
  );
}
