import { Router } from "express";
import batchController from "../controllers/batchController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = Router();

router.use(authMiddleware.validateAuthToken);

router.post("/", batchController.create);
router.get("/", batchController.getAll);
router.get("/product/:productId", batchController.getByProduct);
router.get("/:id", batchController.getById);

export default router;
