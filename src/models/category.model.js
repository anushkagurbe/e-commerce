import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

let categorySchema = mongoose.Schema({
    category: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        index: true
    }
},
{
    timestamps: true
});

categorySchema.plugin(mongoosePaginate);
let categoryModel = mongoose.model("category", categorySchema);

export default categoryModel;