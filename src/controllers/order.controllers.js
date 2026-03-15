import mongoose from "mongoose";
import orderModel from "../models/order.model.js";
import cartModel from "../models/cart.model.js";
import { orderSchema } from "../validators/order.validators.js";
import productModel from "../models/product.model.js";

export let createOrderController = async(req, res)=>{
    let session = await mongoose.startSession();
    session.startTransaction();
    try
    {
        let result = orderSchema.safeParse(req.body);
        if(!result.success)
        {
            let errors = result.error.issues.map((error)=>({
                field: error.path[0],
                message: error.message                    
            }));
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ success: false, message: errors });
        }
        let cart = await cartModel.findOne({ user: req.user._id }).populate("items.product", "price stock").session(session);
        if(!cart || cart.items.length == 0)
        {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ success: false, message: "Cart is empty" });
        }

        let orderItems = [];
        let totalPrice = 0;

        for(let item of cart.items)
        {
            let product = await productModel.findOneAndUpdate({ _id: item.product._id, stock: { $gte: item.quantity } }, { $inc: { stock: -item.quantity } }, { new: true, session });

            if(!product)
            {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({ success: false, message: "Product out of stock" });
            }

            orderItems.push({
                product: item.product._id,
                quantity: item.quantity,
                price: item.price
            });

            totalPrice += item.quantity * item.price;
        }

        let order = await orderModel.create([{
            user: req.user._id,
            items: orderItems,
            totalPrice,
            shippingAddress: result.data.shippingAddress,
            status: "confirmed"
        }], { session });

        await cartModel.updateOne({ user: req.user._id }, { $set: { items: [] } }, { session });

        await session.commitTransaction();
        session.endSession();

        return res.status(201).json({ success: true, message: "Order placed successfully", order: order });
    }
    catch(error)
    {
        await session.abortTransaction();
        session.endSession();
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export let getOrdersController = async(req, res)=>{
    try
    {
        let orders = await orderModel.find({ user: req.user._id }).populate("items.product", "images name price").sort({ createdAt: -1 }).lean();
        return res.status(200).json({ success: true, orders: orders });
    }
    catch(error)
    {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export let getSingleOrderDetails = async(req, res)=>{
    try
    {
        let { orderId } = req.params;
        if(!mongoose.Types.ObjectId.isValid(orderId))
        {
            return res.status(400).json({ success: false, message: "Invalid order Id" });
        }

        let order = await orderModel.findOne({ _id: orderId, user: req.user._id }).populate("items.product", "name price images").lean();

        if(!order)
        {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        return res.status(200).json({ success: true, order: order, message: "Order details fetched successfully" });
    }
    catch(error)
    {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export let cancelOrderController = async(req, res)=>{
    let session = await mongoose.startSession();
    session.startTransaction();
    try
    {
        let { orderId } = req.params;
        if(!mongoose.Types.ObjectId.isValid(orderId))
        {
            return res.status(400).json({ success: false, message: "Invalid order Id" });
        }

        let order = await orderModel.findOne({ _id: orderId, user: req.user._id }).session(session);

        if(!order)
        {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        if(order.status == "cancelled")
        {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ success: false, message: "Order already cancelled" });
        }

        if(order.status == "delivered")
        {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ success: false, message: "Delivered order cannot be cancelled" });
        }

        for(let item of order.items)
        {
            await productModel.findOneAndUpdate({ _id: item.product }, { $inc: { stock: item.quantity } }, { session });
        }

        await orderModel.findByIdAndUpdate(orderId, { $set: { status: "cancelled" } }, { session });
        await session.commitTransaction();
        session.endSession();
        return res.status(200).json({ success: true, message: "Order cancelled successfully" });

    }
    catch(error)
    {
        await session.abortTransaction();
        session.endSession();
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export let changeOrderStatusController = async(req, res)=>{
    try
    {
        let { orderId } = req.params;
        let { status } = req.body;

        if(!mongoose.Types.ObjectId.isValid(orderId))
        {
            return res.status(400).json({ success: false, message: "Invalid order Id" });
        }

        let allowedStatus = [ "confirmed", "shipped", "delivered", "cancelled" ];
        if(!allowedStatus.includes(status))
        {
            return res.status(400).json({ success: false, message: "Invalid order status" });
        }

        let updatedOrder = await orderModel.findOneAndUpdate({ _id: orderId, status: { $nin: ["cancelled","delivered"] } }, { $set: { status } }, { new: true });

        if(!updatedOrder)
        {
            return res.status(400).json({ success: false, message: "Order not found or cannot be updated" })
        }
        return res.status(200).json({ success: true, message: "Order status updated successfully", order: updatedOrder });
    }
    catch(error)
    {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}