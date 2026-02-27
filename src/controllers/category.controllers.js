import slugify from "slugify";
import categoryModel from "../models/category.model.js";
import { categorySchema } from "../validators/category.validators.js";
import mongoose from "mongoose";
import productModel from "../models/product.model.js";

export let addCategoryController = async(req, res) =>{
    try
    {
        let result = categorySchema.safeParse(req.body);
        if(!result.success)
        {
            let errors = result.error.issues.map((error)=>({
                field: error.path[0],
                message: error.message
            }));
            if(errors)
            {
                return res.status(400).json({ status: false, message: errors });
            }
        }
        let { category } = req.body;
        let isCategory = await categoryModel.findOne({ category });
        if(isCategory)
        {
            return res.status(409).json({ success: false, message: "Category already exists" });
        }
        let slug = slugify(category, { lower: true });
        let newCategory = await categoryModel.create({category, slug})
        return res.status(201).json({ success: true, message: "Category created successfully", category: newCategory });
    }
    catch(error)
    {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export let updateCategoryController = async(req, res) =>{
    try
    {
        let result = categorySchema.safeParse(req.body);
        if(!result.success)
        {
            let errors = result.error.issues.map((error)=>({
                field: error.path[0],
                message: error.message
            }));
            if(errors)
            {
                return res.status(400).json({ status: false, message: errors });
            }
        }
        let catId = req.params.catId;
        let catName = req.body.category;
        if(!mongoose.Types.ObjectId.isValid(catId))
        {
            return res.status(400).json({ success: false, message: "Invalid category ID" })
        }
        let isCategory = await categoryModel.findById(catId);
        if(!isCategory)
        {
            return res.status(404).json({ success: false, message: "Category not found" });
        }
        let isCategoryName = await categoryModel.findOne({ category: catName, _id: { $ne: catId } });
        if(isCategoryName)
        {
            return res.status(409).json({ success: false, message: "Category name already exists" });
        }
        let slug = slugify(catName, { lower: true });
        let newCategory = await categoryModel.findByIdAndUpdate(catId, { category: catName, slug }, { new: true });
        return res.status(200).json({ success: true, message: "Category updated successfully", category: newCategory });
    }
    catch(error)
    {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export let getAllCategoriesController = async(req, res) =>{
    try
    {
        let page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 3;

        let categories = await categoryModel.paginate({}, { page, limit, sort: { createdAt: -1 }, lean: true, select: "_id category slug" });
        return res.status(200).json({ success: true, 
            message: "Categories fetched successfully", 
            categories: categories.docs,       
            totalDocs: categories.totalDocs,
            limit: categories.limit,
            page: categories.page,
            totalPages: categories.totalPages,
            hasNextPage: categories.hasNextPage,
            hasPrevPage: categories.hasPrevPage 
        });
    }
    catch(error)
    {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export let deleteCategoryController = async(req, res) =>{
    try
    {
        let { catId } = req.params;
        if(!mongoose.Types.ObjectId.isValid(catId))
        {
            return res.status(400).json({ success: false, message: "Invalid category ID" });
        }
        let category = await categoryModel.findById(catId);
        if(!category)
        {
            return res.status(404).json({ success: false, message: "Category not found" })
        }
        let isCategoryUsed = await productModel.exists({ category: catId });
        if(isCategoryUsed)
        {
            return res.status(400).json({ success: false, message: "Cannot delete category. Products are linked to this category" });
        }
        await categoryModel.findByIdAndDelete(catId);
        return res.status(200).json({ success: true, message: "Category deleted successfully" });
    }
    catch(error)
    {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}