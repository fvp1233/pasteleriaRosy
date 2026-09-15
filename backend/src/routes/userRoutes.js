import { Router } from "express";
import userController from "../controllers/userController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/login", userController.login);
router.post("/logout", authMiddleware.validateAuthToken, userController.logout);

export default router;
