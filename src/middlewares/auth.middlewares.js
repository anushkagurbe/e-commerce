import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";
import redis from "../config/redis.js";

export let authMiddleware = async (req, res, next)=>{
    try
    {
        let token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        if(!token)
        {
            return res.status(401).json({ success: false, message: "Token not found" })
        }
        let isBlacklisted = await redis.get(`bl_${token}`);
        if(isBlacklisted)
        {
            return res.status(403).json({ success: false, message: "Token is revoked" });
        }
        let decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        let user = await userModel.findById(decodedToken._id).select("-password");
        req.user = user;
        next();
    }
    catch(error)
    {
        console.log(error);
        return res.status(403).json({ success: false, message: "Token expired or invalid" });
    }
}