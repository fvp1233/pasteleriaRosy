import { useId, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, ArrowRight, Loader2, Mail, ShieldCheck, Utensils } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import { RoleOptionCard } from "@/components/auth/RoleOptionCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { http, ApiError } from "@/lib/http";
import { evaluatePasswordStrength } from "@/lib/password";

const ROLES = [
  {
    value: "Operator",
    title: "Operador de Cocina",
    description: "Registro de lotes, deducción de mermas, pesaje e insumos en tiempo real.",
    icon: Utensils,
  },
  {
    value: "Admin",
    title: "Administrador",
    description: "Control de catálogo, costes financieros, gestión de usuarios y proveedores.",
    icon: ShieldCheck,
  },
];

const INITIAL_FORM = {
  name: "",
  last_name: "",
  email: "",
  role: "Operator",
  password: "",
  confirmPassword: "",
};

function validate(form, acceptedTerms) {
  const errors = {};

  if (!form.name.trim()) errors.name = "El nombre es obligatorio.";
  if (!form.last_name.trim()) errors.last_name = "El apellido es obligatorio.";

  if (!form.email.trim()) {
    errors.email = "El correo es obligatorio.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = "Ingresa un correo válido.";
  }

  const { meetsPolicy } = evaluatePasswordStrength(form.password);
  if (!form.password) {
    errors.password = "La contraseña es obligatoria.";
  } else if (!meetsPolicy) {
    errors.password = "Debe tener 8+ caracteres, un número y un carácter especial.";
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = "Confirma tu contraseña.";
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = "Las contraseñas no coinciden.";
  }

  if (!acceptedTerms) {
    errors.terms = "Debes aceptar los términos para continuar.";
  }

  return errors;
}

export function RegisterPage() {
  const navigate = useNavigate();
  const termsId = useId();

  const [form, setForm] = useState(INITIAL_FORM);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field) {
    return (event) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setApiError(null);

    const validationErrors = validate(form, acceptedTerms);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const data = await http.post("/users/register", {
        name: form.name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      });
      navigate("/verificar-cuenta", {
        state: { email: form.email.trim(), expiresAt: new Date(data.expiresAt).getTime() },
      });
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "No se pudo crear la cuenta. Intenta de nuevo.";
      setApiError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
              Crear una nueva cuenta
            </h2>
            <Badge variant="outline">Paso 1 de 2</Badge>
          </div>
          <p className="text-base text-muted-foreground">
            Registra a un nuevo miembro del equipo de cocina o administración del obrador.
          </p>
        </div>

        {apiError ? (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertDescription>{apiError}</AlertDescription>
          </Alert>
        ) : null}

        <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                placeholder="ej. Sofía"
                value={form.name}
                onChange={updateField("name")}
                aria-invalid={Boolean(errors.name)}
                className="h-11"
              />
              {errors.name ? <p className="text-xs text-destructive">{errors.name}</p> : null}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="last_name">Apellido *</Label>
              <Input
                id="last_name"
                placeholder="ej. Morales"
                value={form.last_name}
                onChange={updateField("last_name")}
                aria-invalid={Boolean(errors.last_name)}
                className="h-11"
              />
              {errors.last_name ? (
                <p className="text-xs text-destructive">{errors.last_name}</p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Correo corporativo / personal *</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="sofia@rosypasteles.com"
                value={form.email}
                onChange={updateField("email")}
                aria-invalid={Boolean(errors.email)}
                className="h-11 pl-9"
              />
            </div>
            {errors.email ? <p className="text-xs text-destructive">{errors.email}</p> : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Rol inicial solicitado *</Label>
            <div role="radiogroup" className="grid grid-cols-2 gap-4">
              {ROLES.map((role) => (
                <RoleOptionCard
                  key={role.value}
                  icon={role.icon}
                  title={role.title}
                  description={role.description}
                  value={role.value}
                  selected={form.role === role.value}
                  onSelect={(value) => setForm((prev) => ({ ...prev, role: value }))}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <PasswordInput
              id="password"
              label="Contraseña *"
              value={form.password}
              onChange={updateField("password")}
              error={errors.password}
              className="h-11"
            />
            <PasswordInput
              id="confirmPassword"
              label="Confirmar contraseña *"
              value={form.confirmPassword}
              onChange={updateField("confirmPassword")}
              error={errors.confirmPassword}
              className="h-11"
            />
          </div>

          <PasswordStrengthMeter password={form.password} />

          <div className="flex items-start gap-2.5">
            <Checkbox
              id={termsId}
              checked={acceptedTerms}
              onCheckedChange={(checked) => {
                setAcceptedTerms(Boolean(checked));
                setErrors((prev) => ({ ...prev, terms: undefined }));
              }}
              className="mt-0.5"
            />
            <label htmlFor={termsId} className="block text-sm leading-snug text-muted-foreground">
              Acepto los{" "}
              <span className="font-medium text-foreground underline underline-offset-2">
                términos de servicio
              </span>{" "}
              y las{" "}
              <span className="font-medium text-foreground underline underline-offset-2">
                políticas de seguridad interna y manipulación de recetas
              </span>{" "}
              de Rosy Pasteles.
            </label>
          </div>
          {errors.terms ? <p className="-mt-2 text-xs text-destructive">{errors.terms}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-linear-to-r from-brand-secondary to-brand-primary text-base font-medium text-white transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-60"
          >
            {isSubmitting ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <>
                Crear cuenta y Continuar a Verificación
                <ArrowRight className="size-5" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-base text-muted-foreground">
          ¿Ya tienes una cuenta activa en el obrador?{" "}
          <Link to="/login" className="font-medium text-brand-primary hover:underline">
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
