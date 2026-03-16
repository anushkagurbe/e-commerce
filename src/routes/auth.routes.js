import express from "express";
import { refreshTokenController, userLoginController, userRegistrationController } from "../controllers/auth.controllers.js";

let router = express.Router();

router.post("/register", userRegistrationController);
router.post("/login", userLoginController);
router.post("/refresh-token", refreshTokenController);

export default router;