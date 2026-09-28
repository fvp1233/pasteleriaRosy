import jsonwebtoken from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import userModel from "../models/User.js";
import { config } from "../../config.js";
import { cookieSecurity } from "../lib/cookieOptions.js";

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 15 * 60 * 1000; // 15 minutos

const userController = {};

userController.login = async (req, res) => {
  try {
    //#1 solicitar los datos de acceso
    const { email, password } = req.body;

    //#2 buscar el usuario por email
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    //#3 validar si la cuenta esta activa
    if (!user.is_active) {
      return res.status(403).json({ message: "Account is inactive, contact an administrator" });
    }

    //#4 validar si la cuenta esta verificada
    if (!user.is_verified) {
      return res.status(403).json({ message: "Account not verified, check your email" });
    }

    //#5 validar si la cuenta esta bloqueada por intentos fallidos
    if (user.time_out && user.time_out > Date.now()) {
      return res.status(403).json({ message: "Account temporarily locked, try again later" });
    }

    //#6 comparar la contraseña
    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      //#6.1 incrementar los intentos fallidos
      user.login_attemps = (user.login_attemps || 0) + 1;

      //#6.2 bloquear la cuenta si se supera el limite de intentos
      if (user.login_attemps >= MAX_LOGIN_ATTEMPTS) {
        user.time_out = Date.now() + LOCK_TIME;
      }

      await user.save();
      return res.status(400).json({ message: "Invalid credentials" });
    }

    //#7 reiniciar los intentos fallidos tras un login exitoso
    user.login_attemps = 0;
    user.time_out = undefined;
    await user.save();

    //#8 generar el token JWT
    const token = jsonwebtoken.sign(
      { id: user._id, role: user.role },
      config.JWT.secret,
      { expiresIn: config.JWT.expiresIn }
    );

    //#9 enviar el token en una cookie httpOnly
    res.cookie("authToken", token, {
      httpOnly: true,
      ...cookieSecurity,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 dias
    });

    //#10 responder al cliente con los datos del usuario
    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

userController.getSession = async (req, res) => {
  try {
    //#1 buscar el usuario autenticado por el id del token
    const user = await userModel.findById(req.user.id).select("-password");

    //#2 validar que el usuario exista y siga activo
    if (!user || !user.is_active) {
      return res.status(401).json({ message: "Session invalid" });
    }

    //#3 responder al cliente con los datos del usuario
    return res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

userController.updateProfile = async (req, res) => {
  try {
    //#1 solicitar los datos a actualizar (solo nombre y apellido son editables)
    const { name, last_name } = req.body;

    if (!name?.trim() || !last_name?.trim()) {
      return res.status(400).json({ message: "Name and last name are required" });
    }

    //#2 buscar al usuario autenticado por el id del token
    const user = await userModel.findById(req.user.id);
    if (!user || !user.is_active) {
      return res.status(401).json({ message: "Session invalid" });
    }

    //#3 actualizar los campos permitidos
    user.name = name.trim();
    user.last_name = last_name.trim();
    await user.save();

    //#4 responder al cliente con los datos actualizados
    return res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

userController.logout = async (req, res) => {
  try {
    //#1 limpiar la cookie del token
    res.clearCookie("authToken", cookieSecurity);

    //#2 responder al cliente
    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default userController;
