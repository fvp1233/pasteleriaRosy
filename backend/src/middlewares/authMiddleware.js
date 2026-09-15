import jsonwebtoken from "jsonwebtoken";
import { config } from "../../config.js";

const authMiddleware = {};

authMiddleware.validateAuthToken = (req, res, next) => {
  try {
    //#1 obtener el token desde las cookies
    const { authToken } = req.cookies;

    //#2 validar que el token exista
    if (!authToken) {
      return res.status(401).json({ message: "No token provided, access denied" });
    }

    //#3 verificar y decodificar el token
    const decoded = jsonwebtoken.verify(authToken, config.JWT.secret);

    //#4 adjuntar la info del usuario a la request
    req.user = decoded;

    //#5 continuar con la siguiente funcion
    next();
  } catch (error) {
    console.log("error" + error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

authMiddleware.validateRole = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      //#1 validar que el middleware de autenticacion ya se haya ejecutado
      if (!req.user) {
        return res.status(401).json({ message: "Access denied, no user found" });
      }

      //#2 validar que el rol del usuario este permitido
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ message: "Access denied, insufficient permissions" });
      }

      //#3 continuar con la siguiente funcion
      next();
    } catch (error) {
      console.log("error" + error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
};

export default authMiddleware;
