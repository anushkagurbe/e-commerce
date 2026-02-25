import express from "express";
import { userLoginController, userRegistrationController } from "../controllers/auth.controllers.js";

let router = express.Router();

router.post("/register", userRegistrationController);
router.post("/login", userLoginController);

export default router;