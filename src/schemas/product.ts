import { z } from "zod";

export const DigitalProductTypeSchema = z.enum([
  "course",
  "ebook",
  "template",
  "guide",
  "community",
  "software",
  "bundle",
  "other",
]);

export const ProductSchema = z.object({
  product_id: z.string().min(1),

  title: z.string().min(1),

  creator: z.string().min(1),

  description: z.string().min(1),

  category: z.string().min(1),

  product_type: DigitalProductTypeSchema,

  price: z.number().nonnegative(),

  currency: z.string().default("NGN"),

  rating: z.number().min(0).max(5).optional(),

  attributes: z.record(
    z.string(),
    z.union([
      z.string(),
      z.number(),
      z.boolean(),
      z.array(z.string()),
    ])
  ),

  product_url: z.string().url(),

  affiliate_url: z.string().url().optional(),
});

export type Product = z.infer<typeof ProductSchema>;