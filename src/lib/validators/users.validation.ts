import { z } from "zod"

export const createUserSchema = z.object({
  name: z.string().trim().min(1, { message: "Name is required" }),
  email: z.email({ message: "Valid email is required" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  image: z.string().optional(),
  role: z.enum(["USER", "ADMIN"]).default("USER"),
})

export const updateUserSchema = createUserSchema.partial()

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
