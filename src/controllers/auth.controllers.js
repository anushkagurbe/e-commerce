import redis from "../config/redis.js";
import userModel from "../models/user.model.js";
import { sendRegistrationEmail } from "../services/email.services.js";
import { generateAccessToken, generateRefreshToken } from "../utils/token.utils.js";
import { loginSchema, registerSchema } from "../validators/auth.validators.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

let cookieOptions = {
    httpOnly: true,
    sameSite: "strict"
}

export let userRegistrationController = async (req, res)=>{
    try
    {
        let result = registerSchema.safeParse(req.body);
        if(!result.success)
        {
            let errors = result.error.issues.map((error)=>({
                field: error.path[0],
                message: error.message
            }));
            console.log(errors);
            return res.status(400).json({ success: false, message: errors });
        }
        let { username, email, password } = req.body; 
        let isUserExists = await userModel.findOne({ email: email });
        if(isUserExists)
        {
            return res.status(409).json({ success: false, message: "Email already exists" });
        }
        let hashedPassword = await bcrypt.hash(password, 12);
        await userModel.create({ username, email, password: hashedPassword });
        await sendRegistrationEmail(email, username);
        return res.status(201).json({ success: true, message: "User registered successfully" });
    }
    catch(error)
    {
        console.log(error)
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
}

export let userLoginController = async(req, res)=>{
    try
    {
        let result = loginSchema.safeParse(req.body);
        if(!result.success)
        {
            let errors = result.error.issues.map((error)=>({
                field: error.path[0],
                message: error.message
            }));
            console.log(errors);
            return res.status(400).json({ success: false, message: errors });
        }
        let { email, password } = req.body;
        let isUserExists = await userModel.findOne({ email });
        if(!isUserExists)
        {
            return res.status(404).json({ success: false, message: "User not found" });
        } 
        let isValidPassword = await bcrypt.compare(password, isUserExists.password);
        if(!isValidPassword)
        {
            return res.status(400).json({ success: false, message: "Incorrect password" });
        }
        let accessToken = generateAccessToken(isUserExists._id);
        let refreshToken = generateRefreshToken(isUserExists._id, isUserExists.username);

        await userModel.findByIdAndUpdate(isUserExists._id, { $addToSet: { refreshToken: refreshToken } });
        return res.status(200).cookie("accessToken", accessToken, cookieOptions).cookie("refreshToken", refreshToken, cookieOptions).json({ success: true, message: "User login successfully" });
    }
    catch(error)
    {
        console.log(error)
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
}


export let refreshTokenController = async(req, res)=>{
    try
    {
        let refreshToken = req.cookies?.refreshToken;
        if(!refreshToken)
        {
            return res.status(400).json({ success: false, message: "Refresh token not found" });
        }

        let decodedRefreshToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        let user = await userModel.findById(decodedRefreshToken._id);
        let isBlacklisted = await redis.get(`bl_${refreshToken}`);
        if(isBlacklisted)
        {
            return res.status(403).json({ success: false, message: "Token is revoked" });
        }
        if(!user || !user.refreshToken.includes(refreshToken))
        {
            return res.status(403).json({ success: false, message: "Invalid refresh token" });
        }

        let decodedToken = jwt.decode(refreshToken)
        if(decodedToken?.exp)
        {
            let ttl = decodedToken.exp - Math.floor(Date.now() / 1000);
            if(ttl > 0)
            {
                await redis.set(`bl_${refreshToken}`, "true", "EX", ttl);
            }
        }

        let newAccessToken = generateAccessToken(decodedRefreshToken._id);
        let newRefreshToken = generateRefreshToken(decodedRefreshToken._id, decodedRefreshToken.username);

        await userModel.findByIdAndUpdate(decodedRefreshToken._id, { $pull: { refreshToken: refreshToken }, $addToSet: { refreshToken: newRefreshToken } });
        return res.status(200).cookie("accessToken", newAccessToken, cookieOptions).cookie("refreshToken", newRefreshToken, cookieOptions).json({ success: true, message: "Token refreshed successfully" });

    }
    catch(error)
    {
        console.log(error);
        return res.status(500).json({ success: false, message: "Token invalid or expired" });
    }
}


export let logoutController = async(req, res)=>{
    try
    {
        let accessToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        let refreshToken = req.cookies?.refreshToken;
        let currentTime = Math.floor(Date.now() / 1000);
        if(accessToken)
        {
            let decodedAccess = jwt.decode(accessToken);
            if(decodedAccess?.exp && decodedAccess.exp > currentTime)
            {
                let ttl = decodedAccess.exp - currentTime;
                if(ttl > 0)
                {
                    await redis.set(`bl_${accessToken}`, "true", "EX", ttl);
                }
            }
        }

        if(refreshToken)
        {
            let decodedRefresh = jwt.decode(refreshToken);
            if(decodedRefresh?.exp && decodedRefresh.exp > currentTime)
            {
                let ttl = decodedRefresh.exp - currentTime;
                if(ttl > 0)
                {
                    await redis.set(`bl_${refreshToken}`, "true", "EX", ttl);
                }
            }
        }

        await userModel.findByIdAndUpdate(req.user._id, { $pull: { refreshToken: refreshToken }});
        return res.status(200).json({ success: true, message: "Logout successful" });
    }
    catch(error)
    {
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}