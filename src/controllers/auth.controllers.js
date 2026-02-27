import userModel from "../models/user.model.js";
import { sendRegistrationEmail } from "../services/email.services.js";
import { generateAccessToken, generateRefreshToken } from "../utils/token.utils.js";
import { loginSchema, registerSchema } from "../validators/auth.validators.js";
import bcrypt from "bcryptjs";

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

        await userModel.findByIdAndUpdate(isUserExists._id, { refreshToken: refreshToken });
        return res.status(200).cookie("accessToken", accessToken, cookieOptions).cookie("refreshToken", refreshToken, cookieOptions).json({ success: true, message: "User login successfully" });
    }
    catch(error)
    {
        console.log(error)
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
}