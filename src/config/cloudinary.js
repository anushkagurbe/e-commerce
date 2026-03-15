import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export let uploadOnCloudinary = async (localfilepath)=>{
    try
    {
        if(!localfilepath)
        {
            return null;
        }
        let response = await cloudinary.uploader.upload(localfilepath, {
            resource_type: "auto",
            folder: "eshop/products"
        });
        console.log("File is uploaded on coudinary ", response.url);
        return response;
    }
    catch(error)
    {
        console.log("Failed to upload the file on cloudinary", error);
        return null;
    }
    finally
    {
        if (localfilepath && fs.existsSync(localfilepath)) 
        {
            fs.unlinkSync(localfilepath);
        }
    }
}


export let deleteFromCloudinary = async (productId)=>{
    try
    {
        await cloudinary.uploader.destroy(productId);
        console.log("Image deleted from cloudinary");
    }
    catch(error)
    {
        return res.status(500).json({ success: false, message: "Failed to delete image from cloudinary" });
    }
}