import mongoose from "mongoose";
import { z } from "zod";

export let cartSchema = z.object({
    productId: z
        .string({ message: "Product Id is required" })
        .refine((val)=> mongoose.Types.ObjectId.isValid(val), {
            message: "Invalid product id"
        }),
    quantity: z.coerce
        .number({ message: "Quantity is required" })
        .int({ message: "Quantity must be an integer" })
        .min(1, { message: "Quantity must be at least 1" })
        .max(10, { message: "Maximum 10 items allowed per product" })
})
