export const API_ENDPOINTS = {
  publicScan: "/api/publics",
  auth: {
    login: "/api/auths/login",
  },
  tenants: "/api/tenants",
  parties: "/api/parties",
  locations: "/api/locations",
  products: "/api/products",
  productionOrders: "/api/production-orders",
  batches: "/api/batches",
  productInstances: "/api/product-instances",
} as const;
