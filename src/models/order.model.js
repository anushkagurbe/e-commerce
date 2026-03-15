import mongoose, { mongo } from "mongoose";

let orderSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
        index: true
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'product',
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        price: {
            type: Number,
            required: true
        }
    }],
    totalPrice: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["pending","confirmed","shipped","delivered","cancelled"],
        default: "pending"
    },

    paymentStatus: {
        type: String,
        enum: ["pending","paid"],
        default: "pending"
    },

    shippingAddress: {
        name: String,
        phone: String,
        address: String,
        city: String,
        pincode: String
    }
},
{
    timestamps: true
});


let orderModel = mongoose.model("order", orderSchema);

export default orderModel;

