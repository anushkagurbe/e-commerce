import jwt from "jsonwebtoken";

export let generateAccessToken =(userId)=>{
    let token = jwt.sign({_id: userId}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" } );
    return token;
}

export let generateRefreshToken =(userId, username)=>{
    let token = jwt.sign({_id: userId, username: username}, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "1h" } );
    return token;
}