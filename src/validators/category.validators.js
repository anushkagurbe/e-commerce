import { z } from "zod";

export let categorySchema = z.object({
    category: z
        .string({ message: "Category is required" })
        .min(3, { message: "Category name must be at least 3 characters long" })
        .max(50, { message: "Category name must not be greater than 50 characters" })
});

