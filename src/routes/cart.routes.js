import express from "express";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
import { isAdminMiddleware, isUserMiddleware } from "../middlewares/role.middlewares.js";
import { addToCartController, getCartItemsController, removeCartItemController, updateCartController } from "../controllers/cart.controllers.js";

let router = express.Router();

router.post("/", authMiddleware, isUserMiddleware, addToCartController);
router.put("/", authMiddleware, isUserMiddleware, updateCartController);
router.delete("/:productId", authMiddleware, isUserMiddleware, removeCartItemController);
router.get("/", authMiddleware, isUserMiddleware, getCartItemsController);

export default router;