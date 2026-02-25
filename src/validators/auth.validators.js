import { z } from "zod";

export let loginSchema = z.object({
    email: z
        .string({ message: "Email is required" })
        .email({ message: "Invalid email format" })
        .min(15, { message: "Email must be at least 15 characters long" })
        .max(50, { message: "Email must not be greater than 50 characters" }),
    password: z
        .string({ message: "Password is required" })
        .min(8, { message: "Password must be at least 8 characters long" })
        .max(50, { message: "Password must not be greater than 50 characters" })
})

export let registerSchema = loginSchema.extend({
    username: z
        .string({ message: "Username is required" })
        .min(5, { message: "Username must be at least 5 characters long" })
        .max(50, { message: "Username must not be greater than 50 characters" })
})