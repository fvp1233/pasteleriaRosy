import { Router } from "express";
import productController from "../controllers/productController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", authMiddleware.validateAuthToken, productController.getAll);
router.get("/:id", authMiddleware.validateAuthToken, productController.getById);

router.post(
  "/",
  authMiddleware.validateAuthToken,
  authMiddleware.validateRole("Admin"),
  productController.create
);
router.put(
  "/:id",
  authMiddleware.validateAuthToken,
  authMiddleware.validateRole("Admin"),
  productController.update
);
router.patch(
  "/:id/deactivate",
  authMiddleware.validateAuthToken,
  authMiddleware.validateRole("Admin"),
  productController.deactivate
);

export default router;
