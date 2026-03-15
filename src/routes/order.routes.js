import express from "express";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
import { isAdminMiddleware, isUserMiddleware } from "../middlewares/role.middlewares.js";
import { cancelOrderController, changeOrderStatusController, createOrderController, getOrdersController, getSingleOrderDetails } from "../controllers/order.controllers.js";

let router = express.Router();

router.post("/", authMiddleware, isUserMiddleware, createOrderController);
router.get("/", authMiddleware, isUserMiddleware, getOrdersController);
router.get("/:orderId", authMiddleware, isUserMiddleware, getSingleOrderDetails);
router.delete("/:orderId", authMiddleware, isUserMiddleware, cancelOrderController);
router.patch("/:orderId", authMiddleware, isAdminMiddleware, changeOrderStatusController);

export default router;