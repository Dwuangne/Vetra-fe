export const API_ENDPOINTS = {
  publicScan: "/api/publics",
  auth: {
    login: "/api/auths/login",
    changePassword: "/api/auths/change-password",
  },
  tenantUsers: "/api/tenant-users",
  tenants: "/api/tenants",
  parties: "/api/parties",
  locations: "/api/locations",
  products: "/api/products",
  certificates: "/api/certificates",
  productionOrders: "/api/production-orders",
  batches: "/api/batches",
  productInstances: "/api/product-instances",
  tenantDashboard: "/api/tenant-dashboard",
} as const;
