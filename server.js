import "dotenv/config";
import express from "express";
import { dbConnect } from "./src/config/dbConnect.js";
import authRoutes from "./src/routes/auth.routes.js";
import categoryRoutes from "./src/routes/category.routes.js";
import cookieParser from "cookie-parser";

let app = express();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

await dbConnect();

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/category", categoryRoutes);

app.listen(process.env.PORT || 8080, ()=>{
    console.log("Server is listening on", process.env.PORT);
})