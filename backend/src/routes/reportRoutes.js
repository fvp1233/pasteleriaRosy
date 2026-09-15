import { Router } from "express";
import reportController from "../controllers/reportController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = Router();

router.use(authMiddleware.validateAuthToken, authMiddleware.validateRole("Admin"));

router.get("/valuation", reportController.getInventoryValuation);
router.get("/kardex", reportController.getKardex);
router.get("/monthly-closing", reportController.getMonthlyClosing);
router.get("/rotation", reportController.getFinishedGoodsRotation);
router.get("/shrinkage", reportController.getShrinkageReport);

export default router;
