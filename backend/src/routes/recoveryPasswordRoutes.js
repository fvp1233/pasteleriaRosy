import { Router } from "express";
import recoveryPasswordController from "../controllers/recoveryPasswordController.js";

const router = Router();

router.post("/request-code", recoveryPasswordController.requestCode);
router.post("/verify-code", recoveryPasswordController.verifyCode);
router.post("/new-password", recoveryPasswordController.newPassword);

export default router;
