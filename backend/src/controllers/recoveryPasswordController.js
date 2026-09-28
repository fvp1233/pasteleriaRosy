import crypto from "crypto";
import jsonwebtoken from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import userModel from "../models/User.js";
import { config } from "../../config.js";
import { buildPasswordRecoveryEmailHtml } from "../emails/passwordRecoveryEmail.js";
import { sendEmail } from "../emails/mailer.js";

const PASSWORD_RECOVERY_TOKEN_PURPOSE = "password-recovery";
const PASSWORD_RECOVERY_COOKIE = "passwordRecoveryToken";

const recoveryPasswordController = {};

recoveryPasswordController.requestCode = async (req, res) => {
  try {
    //#1 solicitar los datos
    const { email } = req.body;

    //#2 validar que el correo pertenezca a una cuenta verificada
    const userFound = await userModel.findOne({ email, is_verified: true });
    if (!userFound) {
      return res.status(404).json({ message: "User not found" });
    }

    //#3 generar el codigo de recuperacion (nunca se guarda en la base de datos)
    const verificationCode = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    //#4 hashear el codigo antes de que salga de este request
    const hashedCode = await bcryptjs.hash(verificationCode, 10);

    //#5 empaquetar la recuperacion pendiente en un token firmado y sin estado
    const token = jsonwebtoken.sign(
      {
        purpose: PASSWORD_RECOVERY_TOKEN_PURPOSE,
        email,
        codeHash: hashedCode,
        verified: false,
      },
      config.JWT.secret,
      { expiresIn: "15m" }
    );

    //#6 guardar el token en una cookie httpOnly (no en el body, no en la base de datos)
    res.cookie(PASSWORD_RECOVERY_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutos
    });

    //#7 enviar el correo de recuperacion
    await sendEmail({
      to: email,
      subject: "Recuperación de contraseña - Rosy Pasteles",
      html: buildPasswordRecoveryEmailHtml({ name: userFound.name, verificationCode, expiresAt }),
    });

    //#8 responder al cliente
    return res.status(200).json({ message: "Recovery code sent, check your email" });
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

recoveryPasswordController.verifyCode = async (req, res) => {
  try {
    //#1 solicitar el codigo escrito por el usuario y el token de la cookie
    const { code } = req.body;
    const token = req.cookies[PASSWORD_RECOVERY_COOKIE];

    if (!token || !code) {
      return res.status(400).json({ message: "Missing verification data" });
    }

    //#2 verificar y decodificar el token de la recuperacion pendiente
    let decoded;
    try {
      decoded = jsonwebtoken.verify(token, config.JWT.secret);
    } catch (error) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    //#3 validar que el token corresponda a una recuperacion pendiente
    if (decoded.purpose !== PASSWORD_RECOVERY_TOKEN_PURPOSE) {
      return res.status(400).json({ message: "Invalid recovery token" });
    }

    //#4 comparar el codigo recibido contra el hash guardado en el token
    const codeMatches = await bcryptjs.compare(code, decoded.codeHash);
    if (!codeMatches) {
      return res.status(400).json({ message: "Invalid code" });
    }

    //#5 emitir un token nuevo marcado como verificado, con otros 15 minutos
    //    para que el usuario alcance a escribir su nueva contraseña
    const verifiedToken = jsonwebtoken.sign(
      {
        purpose: PASSWORD_RECOVERY_TOKEN_PURPOSE,
        email: decoded.email,
        verified: true,
      },
      config.JWT.secret,
      { expiresIn: "15m" }
    );

    res.cookie(PASSWORD_RECOVERY_COOKIE, verifiedToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    return res.status(200).json({ message: "Code verified successfully" });
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

recoveryPasswordController.newPassword = async (req, res) => {
  try {
    //#1 solicitar la nueva contraseña
    const { newPassword, confirmNewPassword } = req.body;
    if (!newPassword || newPassword !== confirmNewPassword) {
      return res.status(400).json({ message: "Passwords don't match" });
    }

    //#2 verificar y decodificar el token de la recuperacion
    const token = req.cookies[PASSWORD_RECOVERY_COOKIE];
    if (!token) {
      return res.status(400).json({ message: "Missing recovery token" });
    }

    let decoded;
    try {
      decoded = jsonwebtoken.verify(token, config.JWT.secret);
    } catch (error) {
      return res.status(400).json({ message: "Invalid or expired recovery token" });
    }

    //#3 validar que el token corresponda a una recuperacion ya verificada
    if (decoded.purpose !== PASSWORD_RECOVERY_TOKEN_PURPOSE || !decoded.verified) {
      return res.status(400).json({ message: "Code not verified" });
    }

    //#4 encriptar la nueva contraseña
    const hashedPassword = await bcryptjs.hash(newPassword, 10);

    //#5 actualizar la contraseña en la base de datos y limpiar cualquier bloqueo previo
    const updatedUser = await userModel.findOneAndUpdate(
      { email: decoded.email },
      { password: hashedPassword, login_attemps: 0, time_out: null },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    //#6 limpiar la cookie de recuperacion
    res.clearCookie(PASSWORD_RECOVERY_COOKIE);

    return res.status(200).json({ message: "Password updated" });
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default recoveryPasswordController;
