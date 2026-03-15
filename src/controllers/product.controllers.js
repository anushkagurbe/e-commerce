import { productSchema } from "../validators/product.validators.js"
import { deleteFromCloudinary, uploadOnCloudinary } from "../config/cloudinary.js";
import productModel from "../models/product.model.js";
import mongoose from "mongoose";

export let addProductController = async (req, res)=>{
    try
    {
        let result = productSchema.safeParse(req.body);
        if(!result.success)
        {
            let errors = result.error.issues.map((error)=>({
                field: error.path[0],
                message: error.message
            }));
            return res.status(400).json({ success: false, message: errors });
        }
        if(!req.files || req.files.length == 0)
        {
            return res.status(400).json({ success: false, message: "At least one product image is required" });
        }
        if(req.files.length > 5)
        {
            return res.status(400).json({ success: false, message: "You can upload maximum 5 images" });
        }
        let cloudinaryImagesUrls = [];
        for(let file of req.files)
        {
            let uploadedImage = await uploadOnCloudinary(file.path);
            if(!uploadedImage?.url)
            {
                return res.status(500).json({ success: false, message: "Failed to upload image" });
            }
            cloudinaryImagesUrls.push(uploadedImage);
        }
        let { name, description, price, stock } = result.data;
        let { category } = req.body;
        let product = await productModel.create({ name, description, price, stock, images: cloudinaryImagesUrls, category });
        return res.status(201).json({success: true, message: "Product added successfully", product: product});
    }
    catch(error)
    {
        console.log(error);
        return res.status(500).json({success: false, message: "Internal server error"});
    }
}


export let deleteProductController = async(req, res)=>{
    try
    {
        let { productId } = req.params;
        if(!mongoose.Types.ObjectId.isValid(productId))
        {
            return res.status(400).json({ success: false, message: "Invalid product Id" });
        }
        let product = await productModel.findById(productId);
        if(!product)
        {
            return res.status(404).json({ success: false, message: "Product not found" })
        }
        for(let image of product.images)
        {
            await deleteFromCloudinary(image._id);
        }
        await productModel.findByIdAndDelete(productId);
        return res.status(200).json({ success: true, message: "Product deleted successfully" });
    }
    catch(error)
    {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}


export let getSingleProductDetailsController = async(req, res)=>{
    try
    {
        let { productId } = req.params;
        if(!mongoose.Types.ObjectId.isValid(productId))
        {
            return res.status(400).json({ success: false, message: "Invalid product Id" });
        }
        let product = await productModel.findById(productId).lean();
        if(!product)
        {
            return res.status(404).json({ success: false, message: "Product not found" })
        }
        return res.status(200).json({ success: true, message: "Product fetched successfully", data: product });
    }
    catch(error)
    {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}


export let getAllproductsController = async(req, res)=>{
    try
    {
        let page = Math.max(parseInt(req.query.page) || 1, 1);
        let limit = Math.min(parseInt(req.query.limit) || 10, 50);

        let products = await productModel.paginate({}, { page, limit, sort: { createdAt: -1 }, lean: true, populate: { path: "category", select: "category slug" } });
        return res.status(200).json({ success: true, 
            message: "products fetched successfully", 
            data: products.docs,       
            totalDocs: products.totalDocs,
            limit: products.limit,
            page: products.page,
            totalPages: products.totalPages,
            hasNextPage: products.hasNextPage,
            hasPrevPage: products.hasPrevPage 
        });
    }
    catch(error)
    {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}