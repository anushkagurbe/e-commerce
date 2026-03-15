import { z } from "zod";
import mongoose from "mongoose";

export let productSchema = z.object({
    name: z
        .string({ message: "Product name is required" })
        .min(2, { message: "Product name must be at least 2 characters long" })
        .max(50, { message: "Product name should not be greater than 50 characters" }),
    description: z
        .string({ message: "Product description is required" })
        .min(10, { message: "Product description must be at least 10 characters long" })
        .max(200, { message: "Product description should not be greater than 200 characters" }),
    price: z.coerce
        .number({ message: "Price is required" })
        .positive({ message: "Price must be positive" }),
    stock: z.coerce
        .number({ message: "Stock is required" })
        .int({ message: "Stock must be integer" })
        .nonnegative({ message: "Stock cannot be negative" }),
    category: z
        .string({ message: "Category is required" })
        .refine((val) => mongoose.Types.ObjectId.isValid(val), {
            message: "Invalid category id"})
})