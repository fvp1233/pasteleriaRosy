import { useEffect, useState } from "react";
import { AlertCircle, KeyRound, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { ChangePasswordDialog } from "@/features/users/ChangePasswordDialog";
import { useUpdateProfile } from "@/features/users/api";
import { ApiError } from "@/lib/http";

const EMPTY_FORM = { name: "", last_name: "" };

export function ConfigurationPage() {
  const { user, isAdmin, refreshSession } = useAuth();
  const updateProfile = useUpdateProfile();

  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState(null);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  // Precarga el formulario en cuanto llega (o cambia) el usuario de la sesión.
  useEffect(() => {
    if (!user) return;
    setForm({ name: user.name ?? "", last_name: user.last_name ?? "" });
  }, [user]);

  function updateField(field) {
    return (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);

    if (!form.name.trim() || !form.last_name.trim()) {
      setError("Nombre y apellido son obligatorios.");
      return;
    }

    try {
      await updateProfile.mutateAsync({
        name: form.name.trim(),
        last_name: form.last_name.trim(),
      });
      // El JWT solo trae id/role; el nombre mostrado en el Sidebar vive en el
      // estado de AuthContext, así que hay que refrescarlo tras guardar.
      await refreshSession();
      toast.success("Perfil actualizado correctamente.");
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "No se pudo actualizar el perfil.";
      setError(message);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Configuración" description="Datos de tu cuenta en Rosy Pasteles." />

      {error ? (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Mi perfil</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name">Nombre *</Label>
                <Input id="name" value={form.name} onChange={updateField("name")} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="last_name">Apellido *</Label>
                <Input id="last_name" value={form.last_name} onChange={updateField("last_name")} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input id="email" value={user?.email ?? ""} disabled />
                <p className="text-xs text-muted-foreground">
                  El correo no se puede cambiar desde aquí.
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Rol</Label>
                <div>
                  <Badge variant="outline">{isAdmin ? "Administrador" : "Operador"}</Badge>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={updateProfile.isPending}>
                {updateProfile.isPending ? <Loader2 className="animate-spin" /> : null}
                Guardar cambios
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Seguridad</CardTitle>
          <CardDescription>
            El cambio de contraseña requiere verificar un código enviado a tu correo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => setChangePasswordOpen(true)}>
            <KeyRound /> Cambiar contraseña
          </Button>
        </CardContent>
      </Card>

      <ChangePasswordDialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen} />
    </div>
  );
}
