import mongoose from "mongoose"

export let dbConnect = async()=>{
    try
    {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("MongoDB connected successfully");
    }
    catch(error)
    {
        console.log("Database connection failed", error.message);
        process.exit(1);
    }
}