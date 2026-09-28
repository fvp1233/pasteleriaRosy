import sgMail from "@sendgrid/mail";
import { config } from "../../config.js";

sgMail.setApiKey(config.email.apiKey);

// SendGrid con Single Sender Verification: el remitente debe ser exactamente
// el correo que verificaste en SendGrid (Settings > Sender Authentication),
// no requiere dominio propio, pero sí puede enviar a cualquier destinatario.
export async function sendEmail({ to, subject, html }) {
  await sgMail.send({
    to,
    from: config.email.fromAddress,
    subject,
    html,
  });
}
