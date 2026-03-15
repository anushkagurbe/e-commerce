import { cartSchema } from "../validators/cart.validators.js";
import productModel from "../models/product.model.js";
import cartModel from "../models/cart.model.js";
import mongoose from "mongoose";

export let addToCartController = async(req, res)=>{
    try
    {
        let result = cartSchema.safeParse(req.body);
        if(!result.success)
        {
            let errors = result.error.issues.map((error)=>({
                field: error.path[0],
                message: error.message
            }));
            return res.status(400).json({ success: false, message: errors });
        }
        
        let product = await productModel.findById(result.data.productId);
        if(!product)
        {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        if(product.stock < result.data.quantity)
        {
            return res.status(400).json({ success: false, message: "Requested quantity exceeds available stock" });
        }

        let cart = await cartModel.findOne({ user: req.user._id });
        if(!cart)
        {
            let cart = await cartModel.create({ user: req.user._id, items: [{ product: result.data.productId, quantity: result.data.quantity, price: product.price }] });
            return res.status(201).json({ success: true, message: "Product added to cart", cart: cart });
        }

        let existingItem = cart.items.find((item)=> item.product.toString() == result.data.productId);
        if(existingItem)
        {
            let newQuantity = existingItem.quantity + result.data.quantity;
            if(newQuantity > product.stock)
            {
                return res.status(400).json({ success: false, message: "Not enough stock available" });
            }
            await cartModel.updateOne({ user: req.user._id, "items.product": result.data.productId }, { $inc: { "items.$.quantity": result.data.quantity } });
        }
        else
        {
            await cartModel.updateOne({ user: req.user._id }, { $push: { items: { product: result.data.productId, quantity: result.data.quantity, price: product.price } } });
        }

        let updatedCart = await cartModel.findOne({ user: req.user._id }).populate("items.product", "name images price");
        return res.status(200).json({ success: true, message: "Cart updated successfully", cart: updatedCart });
    }
    catch(error)
    {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}


export let updateCartController = async(req, res)=>{
    try
    {
        let result = cartSchema.safeParse(req.body);
        if(!result.success)
        {
            let errors = result.error.issues.map((error)=>({
                field: error.path[0],
                message: error.message
            }));
            return res.status(400).json({ success: false, message: errors });
        }
        
        let product = await productModel.findById(result.data.productId);
        if(!product)
        {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        if(product.stock < result.data.quantity)
        {
            return res.status(400).json({ success: false, message: "Requested quantity exceeds available stock" });
        }

        let updatedCart = await cartModel.findOneAndUpdate({ user: req.user._id, "items.product": result.data.productId }, { $set: { "items.$.quantity": result.data.quantity } }, { new: true });
        if(!updatedCart)
        {
            return res.status(404).json({ success: false, message: "Product not found in cart" });
        }

        return res.status(200).json({ success: true, message: "Cart item updated", cart: updatedCart })
    }
    catch(error)
    {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}


export let removeCartItemController = async(req, res)=>{
    try
    {
        let { productId } = req.params;
        if(!mongoose.Types.ObjectId.isValid(productId))
        {
            return res.status(400).json({ success: false, message: "Invalid product Id" });
        }

        let updatedCart = await cartModel.findOneAndUpdate({ user: req.user._id, "items.product": productId }, { $pull: { items: { product: productId } } }, { new: true });
        if(!updatedCart)
        {
            return res.status(404).json({ success: false, message: "Product not found in cart" });
        }

        return res.status(200).json({ success: true, message: "Product removed from the cart", cart: updatedCart });
    }
    catch(error)
    {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export let getCartItemsController = async(req, res)=>{
    try
    {
        let cart = await cartModel.findOne({ user: req.user._id }).populate("items.product", "name images price").lean();
        if(!cart || cart.items.length == 0)
        {
            return res.status(200).json({ success: true, items: [], totalPrice: 0 });
        }

        let totalPrice = 0;
        let totalItems = 0;
        let items = cart.items.map((item)=>{
            let itemTotal = item.quantity * item.price;
            totalPrice = totalPrice + itemTotal;
            totalItems = totalItems + item.quantity;
            return {
                ...item,
                itemTotal
            }
        });

        return res.status(200).json({ success: true, items: items, totalItems, totalPrice })
    }
    catch(error)
    {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}