import "@shopify/shopify-app-remix/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  BillingInterval,
  shopifyApp,
} from "@shopify/shopify-app-remix/server";

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY!,
  scopes: process.env.SHOPIFY_SCOPES?.split(",") || [
    "write_products",
    "read_products",
    "write_orders",
    "read_orders",
    "write_checkouts",
    "read_checkouts",
  ],
  hostName: process.env.SHOPIFY_APP_URL!.replace(/https?:\/\//, ""),
  apiVersion: ApiVersion.January24,
  appDistribution: AppDistribution.AppStore,
  ...(process.env.SHOPIFY_APP_URL && {
    appUrl: process.env.SHOPIFY_APP_URL,
  }),
  billing: undefined, // Optional: Billing konfigurieren
  isEmbeddedApp: true,
});

export default shopify;
export const apiVersion = ApiVersion.January24;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
