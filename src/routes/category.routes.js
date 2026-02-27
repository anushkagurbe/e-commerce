import express from "express";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
import { isAdminMiddleware } from "../middlewares/role.middlewares.js";
import { addCategoryController, deleteCategoryController, getAllCategoriesController, updateCategoryController } from "../controllers/category.controllers.js";

let router = express.Router();

router.post("/", authMiddleware, isAdminMiddleware, addCategoryController);
router.put("/:catId", authMiddleware, isAdminMiddleware, updateCategoryController);
router.get("/", getAllCategoriesController);
router.delete("/:catId", authMiddleware, isAdminMiddleware, deleteCategoryController);

export default router;