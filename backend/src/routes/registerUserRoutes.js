import { Router } from "express";
import registerUserController from "../controllers/registerUserController.js";

const router = Router();

router.post("/register", registerUserController.register);
router.post("/verify-email", registerUserController.verifyEmail);

export default router;
