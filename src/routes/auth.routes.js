import express from "express";
import { logoutController, refreshTokenController, userLoginController, userRegistrationController } from "../controllers/auth.controllers.js";
import { authMiddleware } from "../middlewares/auth.middlewares.js";

let router = express.Router();

router.post("/register", userRegistrationController);
router.post("/login", userLoginController);
router.post("/refresh-token", refreshTokenController);
router.post("/logout", authMiddleware, logoutController);

export default router;