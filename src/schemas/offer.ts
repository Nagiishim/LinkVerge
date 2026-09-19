import { z } from "zod";

/**
 * Valid ISO currency codes supported by FindIt.
 */
export const CurrencySchema = z.enum(["NGN", "USD", "KES", "GHS"]);
export type Currency = z.infer<typeof CurrencySchema>;

/**
 * Represents a retailer's specific listing for a product.
 * Separating Product specs from Offer pricing prevents stale catalog duplication.
 */
export const OfferSchema = z.object({
  offer_id: z.string().min(1),

  product_id: z.string().min(1),

  retailer_id: z.string().min(1),

  price: z.number().nonnegative(),

  currency: CurrencySchema,

  in_stock: z.boolean(),

  product_url: z.string().url(),

  affiliate_url: z.string().url().optional(),

  seller_name: z.string().min(1).optional(),

  /**
   * ISO 3166-1 alpha-2 country codes where this offer is valid/shippable.
   * e.g., ["NG"]
   */
  shippable_locations: z.array(z.string().length(2).toUpperCase()).default(["NG"]),

  last_verified_at: z.string().datetime(),
});

export type Offer = z.infer<typeof OfferSchema>;