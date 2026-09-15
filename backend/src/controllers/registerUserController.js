import crypto from "crypto";
import { Resend } from "resend";
import userModel from "../models/User.js";
import { config } from "../../config.js";

const resend = new Resend(config.email.apiKey);

const registerUserController = {};

registerUserController.register = async (req, res) => {
  try {
    //#1 solicitar los datos a guardar
    const { name, last_name, email, password, role } = req.body;

    //#2 Validar si el correo existe en la base de datos
    const existsUser = await userModel.findOne({ email });
    if (existsUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    //#3 Generar el codigo de verificacion
    const verificationCode = crypto.randomInt(100000, 999999).toString();

    //#4 Crear el nuevo usuario (sin verificar) con el codigo y su expiracion
    const newUser = new userModel({
      name,
      last_name,
      email,
      password,
      role,
      is_verified: false,
      is_active: true,
      login_attemps: 0,
      verification_code: verificationCode,
      verification_code_expires: Date.now() + 15 * 60 * 1000, // 15 minutos
    });

    //#5 Guardar el usuario en la base de datos
    await newUser.save();

    //#6 Enviar el correo de verificacion con Resend
    await resend.emails.send({
      from: "Rosy Pasteles <onboarding@resend.dev>",
      to: email,
      subject: "Verifica tu cuenta - Rosy Pasteles",
      html: `<p>Hola ${name}, tu código de verificación es: <strong>${verificationCode}</strong></p><p>Este código expira en 15 minutos.</p>`,
    });

    //#7 responder al cliente
    return res.status(201).json({ message: "User registered, check your email to verify your account" });
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

registerUserController.verifyEmail = async (req, res) => {
  try {
    //#1 solicitar los datos a validar
    const { email, verificationCode } = req.body;

    //#2 buscar el usuario por email
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    //#3 validar si ya esta verificado
    if (user.is_verified) {
      return res.status(400).json({ message: "User already verified" });
    }

    //#4 validar el codigo y su expiracion
    if (
      user.verification_code !== verificationCode ||
      Date.now() > user.verification_code_expires
    ) {
      return res.status(400).json({ message: "Invalid or expired verification code" });
    }

    //#5 marcar el usuario como verificado y limpiar el codigo
    user.is_verified = true;
    user.verification_code = undefined;
    user.verification_code_expires = undefined;
    await user.save();

    //#6 responder al cliente
    return res.status(200).json({ message: "Account verified successfully" });
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default registerUserController;
