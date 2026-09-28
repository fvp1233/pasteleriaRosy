import crypto from "crypto";
import jsonwebtoken from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import userModel from "../models/User.js";
import { config } from "../../config.js";
import { buildVerificationEmailHtml } from "../emails/verificationEmail.js";
import { sendEmail } from "../emails/mailer.js";
import { cookieSecurity } from "../lib/cookieOptions.js";

const PENDING_REGISTRATION_TOKEN_PURPOSE = "pending-registration";
const PENDING_REGISTRATION_COOKIE = "pendingRegistrationToken";

const registerUserController = {};

// genera un codigo nuevo, firma el token del registro pendiente, lo guarda en
// la cookie httpOnly y envia el correo de verificacion. Usado por /register y
// por /resend-verification para no repetir esta logica.
async function issuePendingRegistration(res, { name, last_name, email, role, hashedPassword }) {
  const verificationCode = crypto.randomInt(100000, 999999).toString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  const hashedCode = await bcryptjs.hash(verificationCode, 10);

  const pendingToken = jsonwebtoken.sign(
    {
      purpose: PENDING_REGISTRATION_TOKEN_PURPOSE,
      name,
      last_name,
      email,
      role,
      password: hashedPassword,
      codeHash: hashedCode,
    },
    config.JWT.secret,
    { expiresIn: "15m" }
  );

  res.cookie(PENDING_REGISTRATION_COOKIE, pendingToken, {
    httpOnly: true,
    ...cookieSecurity,
    maxAge: 15 * 60 * 1000, // 15 minutos
  });

  await sendEmail({
    to: email,
    subject: "Verifica tu cuenta - Rosy Pasteles",
    html: buildVerificationEmailHtml({ name, verificationCode, expiresAt }),
  });

  return expiresAt;
}

registerUserController.register = async (req, res) => {
  try {
    //#1 solicitar los datos a guardar
    const { name, last_name, email, password, role } = req.body;

    //#2 validar si el correo ya pertenece a una cuenta verificada
    const existingUser = await userModel.findOne({ email, is_verified: true });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    //#3 hashear la contraseña antes de que salga de este request
    const hashedPassword = await bcryptjs.hash(password, 10);

    //#4 generar el codigo, guardar el registro pendiente en cookie y enviar el correo
    const expiresAt = await issuePendingRegistration(res, { name, last_name, email, role, hashedPassword });

    //#5 responder al cliente
    return res.status(201).json({
      message: "Verification code sent, check your email to verify your account",
      expiresAt,
    });
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

registerUserController.resendVerification = async (req, res) => {
  try {
    //#1 leer el registro pendiente desde la cookie
    const pendingToken = req.cookies[PENDING_REGISTRATION_COOKIE];
    if (!pendingToken) {
      return res.status(400).json({ message: "No pending registration found" });
    }

    let pendingRegistration;
    try {
      pendingRegistration = jsonwebtoken.verify(pendingToken, config.JWT.secret);
    } catch (error) {
      return res.status(400).json({ message: "Invalid or expired registration" });
    }

    if (pendingRegistration.purpose !== PENDING_REGISTRATION_TOKEN_PURPOSE) {
      return res.status(400).json({ message: "Invalid registration token" });
    }

    //#2 generar un codigo nuevo (reutilizando los datos ya capturados) y reenviar
    const expiresAt = await issuePendingRegistration(res, {
      name: pendingRegistration.name,
      last_name: pendingRegistration.last_name,
      email: pendingRegistration.email,
      role: pendingRegistration.role,
      hashedPassword: pendingRegistration.password,
    });

    return res.status(200).json({ message: "Verification code resent", expiresAt });
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

registerUserController.verifyEmail = async (req, res) => {
  try {
    //#1 solicitar el codigo escrito por el usuario y el token de la cookie
    const { verificationCode } = req.body;
    const pendingToken = req.cookies[PENDING_REGISTRATION_COOKIE];

    if (!pendingToken || !verificationCode) {
      return res.status(400).json({ message: "Missing verification data" });
    }

    //#2 verificar y decodificar el token del registro pendiente
    let pendingRegistration;
    try {
      pendingRegistration = jsonwebtoken.verify(pendingToken, config.JWT.secret);
    } catch (error) {
      return res.status(400).json({ message: "Invalid or expired verification code" });
    }

    //#3 validar que el token corresponda a un registro pendiente
    if (pendingRegistration.purpose !== PENDING_REGISTRATION_TOKEN_PURPOSE) {
      return res.status(400).json({ message: "Invalid verification token" });
    }

    //#4 comparar el codigo recibido contra el hash guardado en el token
    const codeMatches = await bcryptjs.compare(verificationCode, pendingRegistration.codeHash);
    if (!codeMatches) {
      return res.status(400).json({ message: "Invalid or expired verification code" });
    }

    //#5 validar que el correo no haya sido tomado por otra cuenta mientras tanto
    const existingUser = await userModel.findOne({ email: pendingRegistration.email, is_verified: true });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    //#6 recien ahora se inserta el usuario, ya verificado y activo
    const newUser = new userModel({
      name: pendingRegistration.name,
      last_name: pendingRegistration.last_name,
      email: pendingRegistration.email,
      password: pendingRegistration.password,
      role: pendingRegistration.role,
      is_verified: true,
      is_active: true,
      login_attemps: 0,
    });
    await newUser.save();

    //#7 limpiar la cookie del registro pendiente
    res.clearCookie(PENDING_REGISTRATION_COOKIE, cookieSecurity);

    //#8 responder al cliente
    return res.status(200).json({ message: "Account verified successfully" });
  } catch (error) {
    //#9 el correo pudo haber sido tomado justo entre el paso #5 y el guardado
    if (error.code === 11000) {
      return res.status(400).json({ message: "User already exists" });
    }
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default registerUserController;
