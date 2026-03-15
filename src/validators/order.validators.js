import { z } from "zod";

export let orderSchema = z.object({
    shippingAddress: z.object({
        name: z
            .string({ message: "Name is required" })
            .min(4, { message: "Name must be at least 4 characters" }),
        phone: z
            .string({ message: "Phone number is required" })
            .regex(/^[0-9]{10}$/, "Mobile number must be exactly 10 digits"),
        address: z
            .string({ message: "Address is required" })
            .min(5, { message: "Name must be at least 5 characters" }),
        city: z
            .string({ message: "City is required" })
            .min(2, { message: "City must be at least 2 characters" }),
        pincode: z
            .string({ message: "Pincode is required" })
            .regex(/^[0-9]{6}$/, "Pincode must be exactly 6 digits")
    })
});
