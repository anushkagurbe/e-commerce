import mongoose, { mongo } from "mongoose";

let cartSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
        unique: true,
        index: true
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "product",
            required: true
        },
        quantity: {
            type: Number,
            min: 1,
            required: true
        },
        price: {
            type: Number
        }
    }]
},
{
    timestamps: true
});

let cartModel = mongoose.model("cart", cartSchema);

export default cartModel;