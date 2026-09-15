import { Router } from "express";
import movementController from "../controllers/movementController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = Router();

router.use(authMiddleware.validateAuthToken);

router.post("/exit", movementController.registerExit);
router.post("/adjustment", movementController.registerAdjustment);
router.get("/", movementController.getAll);

export default router;
