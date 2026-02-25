import "dotenv/config";
import express from "express";
import { dbConnect } from "./src/config/dbConnect.js";
import authRoutes from "./src/routes/auth.routes.js";

let app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

await dbConnect();

app.use("/api/v1/auth", authRoutes);

app.listen(process.env.PORT || 8080, ()=>{
    console.log("Server is listening on", process.env.PORT);
})