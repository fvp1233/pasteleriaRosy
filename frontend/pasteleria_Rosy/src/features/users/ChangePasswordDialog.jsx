import { useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { ApiError, http } from "@/lib/http";
import { evaluatePasswordStrength } from "@/lib/password";

const STEPS = {
  REQUEST: "request",
  VERIFY: "verify",
  RESET: "reset",
};

/**
 * Cambio de contraseña desde Configuración. No existe (ni queremos crear) un
 * endpoint de "cambiar contraseña estando logueado" aparte: reutilizamos las
 * mismas 3 rutas de recoveryPasswordController que usa "olvidé mi contraseña"
 * (/users/recovery/request-code -> verify-code -> new-password), solo que acá
 * el correo ya lo conocemos (el de la sesión) en vez de pedírselo al usuario.
 * Al terminar, cerramos la sesión para que vuelva a entrar con la clave nueva.
 */
export function ChangePasswordDialog({ open, onOpenChange }) {
  const { user, logout } = useAuth();
  const [step, setStep] = useState(STEPS.REQUEST);
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function reset() {
    setStep(STEPS.REQUEST);
    setCode("");
    setNewPassword("");
    setConfirmNewPassword("");
    setErrors({});
    setError(null);
    setIsSubmitting(false);
  }

  function handleOpenChange(nextOpen) {
    if (!nextOpen) reset();
    onOpenChange(nextOpen);
  }

  async function handleRequestCode() {
    setError(null);
    setIsSubmitting(true);
    try {
      await http.post("/users/recovery/request-code", { email: user.email });
      toast.success("Te enviamos un código a tu correo.");
      setStep(STEPS.VERIFY);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo enviar el código.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVerifyCode(event) {
    event.preventDefault();
    setError(null);

    if (!/^\d{6}$/.test(code)) {
      setError("El código debe tener 6 dígitos.");
      return;
    }

    setIsSubmitting(true);
    try {
      await http.post("/users/recovery/verify-code", { code });
      setStep(STEPS.RESET);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Código inválido o expirado.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResetPassword(event) {
    event.preventDefault();
    setError(null);

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
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await http.post("/users/recovery/new-password", { newPassword, confirmNewPassword });
      toast.success("Contraseña actualizada. Vuelve a iniciar sesión.");
      onOpenChange(false);
      reset();
      await logout();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo actualizar la contraseña.");
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cambiar contraseña</DialogTitle>
          <DialogDescription>
            {step === STEPS.REQUEST
              ? "Por seguridad, primero te enviamos un código de verificación a tu correo."
              : null}
            {step === STEPS.VERIFY ? `Ingresa el código de 6 dígitos que enviamos a ${user?.email}.` : null}
            {step === STEPS.RESET ? "Define tu nueva contraseña." : null}
          </DialogDescription>
        </DialogHeader>

        {error ? (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        {step === STEPS.REQUEST ? (
          <p className="text-sm text-muted-foreground">
            Correo: <span className="font-medium text-foreground">{user?.email}</span>
          </p>
        ) : null}

        {step === STEPS.VERIFY ? (
          <form
            id="change-password-verify-form"
            className="flex flex-col gap-3"
            onSubmit={handleVerifyCode}
            noValidate
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="change-password-code">Código de verificación</Label>
              <Input
                id="change-password-code"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
                className="tracking-[0.3em]"
              />
              <p className="text-xs text-muted-foreground">
                El código expira 15 minutos después de solicitarlo.
              </p>
            </div>
            <button
              type="button"
              onClick={handleRequestCode}
              disabled={isSubmitting}
              className="self-start text-sm font-medium text-primary hover:underline disabled:pointer-events-none disabled:opacity-60"
            >
              Reenviar código
            </button>
          </form>
        ) : null}

        {step === STEPS.RESET ? (
          <form
            id="change-password-reset-form"
            className="flex flex-col gap-4"
            onSubmit={handleResetPassword}
            noValidate
          >
            <PasswordInput
              id="change-new-password"
              label="Nueva contraseña"
              value={newPassword}
              onChange={(event) => {
                setNewPassword(event.target.value);
                setErrors((prev) => ({ ...prev, newPassword: undefined }));
              }}
              error={errors.newPassword}
            />
            <PasswordStrengthMeter password={newPassword} />
            <PasswordInput
              id="change-confirm-password"
              label="Confirmar nueva contraseña"
              value={confirmNewPassword}
              onChange={(event) => {
                setConfirmNewPassword(event.target.value);
                setErrors((prev) => ({ ...prev, confirmNewPassword: undefined }));
              }}
              error={errors.confirmNewPassword}
            />
          </form>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          {step === STEPS.REQUEST ? (
            <Button onClick={handleRequestCode} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin" /> : null}
              Enviar código
            </Button>
          ) : null}
          {step === STEPS.VERIFY ? (
            <Button type="submit" form="change-password-verify-form" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin" /> : null}
              Verificar código
            </Button>
          ) : null}
          {step === STEPS.RESET ? (
            <Button type="submit" form="change-password-reset-form" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin" /> : null}
              Actualizar contraseña
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
