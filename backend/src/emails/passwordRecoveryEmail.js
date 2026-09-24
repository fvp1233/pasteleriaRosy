function formatExpiryTime(expiresAt) {
  return expiresAt.toLocaleTimeString("es-MX", { hour: "numeric", minute: "2-digit", hour12: true });
}

export function buildPasswordRecoveryEmailHtml({ name, verificationCode, expiresAt }) {
  const expiryLabel = formatExpiryTime(expiresAt);

  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#eef1f0;padding:36px 20px;">
  <tr>
    <td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;background-color:#ffffff;border-radius:16px;border:1px solid #e4e8e7;">
        <tr>
          <td style="padding:36px 40px 28px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="width:34px;height:34px;border-radius:9px;background-color:#0f8f81;text-align:center;vertical-align:middle;font-family:-apple-system,'Segoe UI',Roboto,Arial,sans-serif;font-size:13px;font-weight:700;color:#ffffff;letter-spacing:.02em;">
                  RP
                </td>
                <td style="padding-left:10px;font-family:-apple-system,'Segoe UI',Roboto,Arial,sans-serif;font-size:14px;font-weight:700;color:#16231f;vertical-align:middle;">
                  Rosy Pasteles
                  <div style="font-size:11px;font-weight:400;color:#7c8783;margin-top:1px;">Sistema de Inventario Gastronómico</div>
                </td>
              </tr>
            </table>

            <h1 style="margin:28px 0 8px;font-family:-apple-system,'Segoe UI',Roboto,Arial,sans-serif;font-size:21px;line-height:1.3;color:#16231f;font-weight:700;">
              Recupera tu contraseña
            </h1>
            <p style="margin:0;font-family:-apple-system,'Segoe UI',Roboto,Arial,sans-serif;font-size:14.5px;line-height:1.6;color:#5b6b67;">
              Hola <strong style="color:#16231f;">${name}</strong>, recibimos una solicitud para restablecer tu contraseña. Usa el siguiente código para continuar.
            </p>

            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:26px;">
              <tr>
                <td style="background-color:#16231f;border-radius:12px;padding:22px 24px;text-align:center;">
                  <div style="font-family:-apple-system,'Segoe UI',Roboto,Arial,sans-serif;font-size:11px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:#5fcabd;">
                    Tu código de recuperación
                  </div>
                  <div style="margin-top:10px;font-family:'SFMono-Regular',Consolas,'Liberation Mono',Menlo,Courier,monospace;font-size:36px;font-weight:700;letter-spacing:.28em;color:#ffffff;">
                    ${verificationCode}
                  </div>
                </td>
              </tr>
            </table>

            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:18px auto 0;">
              <tr>
                <td style="vertical-align:middle;padding-right:6px;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="display:block;">
                    <circle cx="12" cy="12" r="9" stroke="#8a938f" stroke-width="2"/>
                    <path d="M12 7v5l3.5 2" stroke="#8a938f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </td>
                <td style="font-family:-apple-system,'Segoe UI',Roboto,Arial,sans-serif;font-size:13px;color:#66716d;vertical-align:middle;">
                  Válido por <strong style="color:#16231f;">15 minutos</strong> · vence a las <strong style="color:#16231f;">${expiryLabel}</strong>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:0 40px;">
            <div style="border-top:1px solid #e4e8e7;"></div>
          </td>
        </tr>

        <tr>
          <td style="padding:22px 40px 34px;">
            <p style="margin:0;font-family:-apple-system,'Segoe UI',Roboto,Arial,sans-serif;font-size:12.5px;line-height:1.7;color:#8a938f;">
              ¿No solicitaste este cambio? Ignora este correo — tu contraseña actual sigue funcionando y no se modificará nada.
            </p>
            <p style="margin:14px 0 0;font-family:-apple-system,'Segoe UI',Roboto,Arial,sans-serif;font-size:12px;color:#a8b0ac;">
              Rosy Pasteles · Módulo de Inventario Gastronómico
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
`;
}
