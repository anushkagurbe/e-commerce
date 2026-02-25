import mongoose from "mongoose";

let userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["admin", "user"],
        default: "user"
    },
    address: {
        type: String,
        trim: true
    },
    refreshToken: {
        type: String
    }
},
{
    timestamps: true
});

let userModel = mongoose.model("user", userSchema);

export default userModel;