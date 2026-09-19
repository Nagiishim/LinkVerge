import type {
  RawRetailerProduct,
  RawRetailerOffer,
} from "./normalizer.js";

export interface RetailerCatalog {
  products: RawRetailerProduct[];
  offers: RawRetailerOffer[];
}

export interface RetailerAdapter {
  retailerId: string;

  fetchCatalog(): Promise<RetailerCatalog>;
}