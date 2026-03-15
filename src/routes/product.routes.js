import express from "express";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
import { isAdminMiddleware } from "../middlewares/role.middlewares.js";
import { addProductController, deleteProductController, getAllproductsController, getSingleProductDetailsController } from "../controllers/product.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";

let router = express.Router();

router.post("/", authMiddleware, isAdminMiddleware, upload.array("images", 5), addProductController);
router.delete("/:productId", authMiddleware, isAdminMiddleware, deleteProductController);
router.get("/:productId", getSingleProductDetailsController);
router.get("/", getAllproductsController)

export default router;
