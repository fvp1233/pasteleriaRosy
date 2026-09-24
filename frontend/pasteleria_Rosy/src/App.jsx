import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { DashboardPage } from "@/pages/DashboardPage";
import { ConfigurationPage } from "@/pages/ConfigurationPage";
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { VerifyEmailPage } from "@/pages/auth/VerifyEmailPage";
import { ForgotPasswordPage } from "@/pages/auth/ForgotPasswordPage";
import { VerifyRecoveryCodePage } from "@/pages/auth/VerifyRecoveryCodePage";
import { NewPasswordPage } from "@/pages/auth/NewPasswordPage";
import { ProductsListPage } from "@/pages/products/ProductsListPage";
import { ProductDetailPage } from "@/pages/products/ProductDetailPage";
import { ProductFormPage } from "@/pages/products/ProductFormPage";
import { BatchesListPage } from "@/pages/batches/BatchesListPage";
import { BatchDetailPage } from "@/pages/batches/BatchDetailPage";
import { BatchFormPage } from "@/pages/batches/BatchFormPage";
import { MovementsListPage } from "@/pages/movements/MovementsListPage";
import { MovementExitFormPage } from "@/pages/movements/MovementExitFormPage";
import { MovementAdjustmentFormPage } from "@/pages/movements/MovementAdjustmentFormPage";
import { AlertsPage } from "@/pages/alerts/AlertsPage";
import { ReportsLayout } from "@/pages/reports/ReportsLayout";
import { ValuationReportPage } from "@/pages/reports/ValuationReportPage";
import { KardexReportPage } from "@/pages/reports/KardexReportPage";
import { MonthlyClosingReportPage } from "@/pages/reports/MonthlyClosingReportPage";
import { RotationReportPage } from "@/pages/reports/RotationReportPage";
import { ShrinkageReportPage } from "@/pages/reports/ShrinkageReportPage";
import { ProtectedRoute, PublicOnlyRoute } from "@/routes/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />
        <Route path="/verificar-cuenta" element={<VerifyEmailPage />} />
        <Route path="/recuperar-contrasena" element={<ForgotPasswordPage />} />
        <Route path="/recuperar-contrasena/codigo" element={<VerifyRecoveryCodePage />} />
        <Route path="/recuperar-contrasena/nueva" element={<NewPasswordPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/productos" element={<ProductsListPage />} />
          <Route path="/productos/:id" element={<ProductDetailPage />} />
          <Route path="/lotes" element={<BatchesListPage />} />
          <Route path="/lotes/nuevo" element={<BatchFormPage />} />
          <Route path="/lotes/:id" element={<BatchDetailPage />} />
          <Route path="/movimientos" element={<MovementsListPage />} />
          <Route path="/movimientos/salida" element={<MovementExitFormPage />} />
          <Route path="/movimientos/ajuste" element={<MovementAdjustmentFormPage />} />
          <Route path="/alertas" element={<AlertsPage />} />
          <Route path="/configuracion" element={<ConfigurationPage />} />

          <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
            <Route path="/productos/nuevo" element={<ProductFormPage />} />
            <Route path="/productos/:id/editar" element={<ProductFormPage />} />

            <Route path="/reportes" element={<ReportsLayout />}>
              <Route index element={<Navigate to="valorizacion" replace />} />
              <Route path="valorizacion" element={<ValuationReportPage />} />
              <Route path="kardex" element={<KardexReportPage />} />
              <Route path="cierre-mensual" element={<MonthlyClosingReportPage />} />
              <Route path="rotacion" element={<RotationReportPage />} />
              <Route path="mermas" element={<ShrinkageReportPage />} />
            </Route>
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
