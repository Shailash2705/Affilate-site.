import { z } from "zod";

export const feedbackSchema = z.object({
  name: z.string().trim().min(1, "Name required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  message: z.string().trim().min(5, "Message too short").max(2000),
});

export const authSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(8, "At least 8 characters").max(72),
});

const urlSchema = z
  .string()
  .trim()
  .url("Must be a valid URL")
  .refine((u) => /^https?:\/\//.test(u), "Must start with http(s)://");

export const productSchema = z.object({
  title: z.string().trim().min(1).max(150),
  description: z.string().trim().max(1000).default(""),
  image_url: z.string().trim().max(1000).default(""),
  affiliate_url: urlSchema,
  category: z.string().trim().min(1).max(50).default("general"),
  platform: z.string().trim().min(1).max(50).default("amazon"),
});

export type ProductInput = z.infer<typeof productSchema>;
