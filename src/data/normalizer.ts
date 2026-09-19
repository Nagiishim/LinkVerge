import type { Product } from "../schemas/product.js";
import type { Offer } from "../schemas/offer.js";

export interface RawRetailerProduct {
  product_id: string;
  title: string;
  creator?: string;
  description?: string;
  category: string;
  product_type?: Product["product_type"];
  price: number;
  currency?: string;
  rating?: number;
  attributes?: Record<
    string,
    string | number | boolean | string[]
  >;
  product_url: string;
  affiliate_url?: string;
}

export interface RawRetailerOffer {
  offer_id: string;
  product_id: string;
  retailer_id: string;
  price: number;
  currency: "NGN" | "USD" | "KES" | "GHS";
  in_stock: boolean;
  product_url: string;
  affiliate_url?: string;
  seller_name?: string;
  shippable_locations?: string[];
  last_verified_at: string;
}

export function normalizeProduct(
  raw: RawRetailerProduct
): Product {
  return {
    product_id: raw.product_id,
    title: raw.title,
    creator: raw.creator ?? "Unknown creator",
    description:
      raw.description ?? "No description available.",
    category: raw.category.trim(),
    product_type: raw.product_type ?? "other",
    price: raw.price,
    currency: raw.currency ?? "NGN",
    rating: raw.rating,
    attributes: raw.attributes ?? {},
    product_url: raw.product_url,
    affiliate_url: raw.affiliate_url,
  };
}

export function normalizeOffer(
  raw: RawRetailerOffer
): Offer {
  return {
    offer_id: raw.offer_id,
    product_id: raw.product_id,
    retailer_id: raw.retailer_id,
    price: raw.price,
    currency: raw.currency,
    in_stock: raw.in_stock,
    product_url: raw.product_url,
    affiliate_url: raw.affiliate_url,
    seller_name: raw.seller_name,
    shippable_locations:
      raw.shippable_locations ?? ["NG"],
    last_verified_at: raw.last_verified_at,
  };
}