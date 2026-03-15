import multer from "multer";
import fs from "fs";
import path from "path";

let uploadPath = "uploads/";
if(!fs.existsSync(uploadPath)) 
{
    fs.mkdirSync(uploadPath);
}

let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        let fileName = Date.now() + "-" + path.extname(file.originalname);
        cb(null, fileName);
    }
})

let fileFilter = (req, file, cb) =>{
    let allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if(allowedTypes.includes(file.mimetype))
    {
        cb(null, true);
    }
    else
    {
        cb(new Error("Only images are allowed"), false)
    }
}


export let upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter
});