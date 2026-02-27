import mongoose from "mongoose";

let productSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        index: true
    },
    stock: {
        type: Number,
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "category",
        required: true,
        index: true
    },
    images: [
        {
            url: String
        }
    ],
    ratingsAverage: {
        type: Number,
        default: 0
    }
},
{
    timestamps: true
});

let productModel = mongoose.model("product", productSchema);

export default productModel;