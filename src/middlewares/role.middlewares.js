export let isAdminMiddleware = async(req, res, next)=>{
    let role = req.user.role;
    if(role == "admin")
    {
        next();
    }
    else
    {
        return res.status(403).json({ success: false, message: "Access denied" });
    }
}

export let isUserMiddleware = async(req, res, next)=>{
    let role = req.user.role;
    if(role == "user")
    {
        next();
    }
    else
    {
        return res.status(403).json({ success: false, message: "Access denied" });
    }
}