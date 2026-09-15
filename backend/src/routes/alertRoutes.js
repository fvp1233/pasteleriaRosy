import { Router } from "express";
import alertController from "../controllers/alertController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = Router();

router.use(authMiddleware.validateAuthToken);

router.get("/low-stock", alertController.getLowStock);
router.get("/over-stock", alertController.getOverStock);

export default router;
