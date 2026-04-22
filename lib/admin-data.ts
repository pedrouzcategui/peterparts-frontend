// Admin dashboard types and fake data

export interface AdminOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  total: number;
  items: number;
  createdAt: string;
  paymentMethod: "credit_card" | "paypal" | "bank_transfer";
}

export interface AdminProduct {
  id: string;
  name: string;
  imageUrl: string | null;
  brand: string;
  category: string;
  categories?: string[];
  price: number;
  priceUsd?: number;
  priceVes?: number;
  stock: number;
  status: "active" | "draft" | "archived";
  featuredRank: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminManagedCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  productsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminManagedCategoryOption {
  id: string;
  name: string;
  slug: string;
  displayName: string;
}

export interface AdminColorSuggestion {
  label: string;
  colorValue: string;
}

export interface AdminManagedColorProduct {
  id: string;
  name: string;
  brand: string;
  status: "active" | "draft" | "archived";
}

export interface AdminManagedColor {
  id: string;
  label: string;
  colorValue: string;
  isPredefined: boolean;
  productsCount: number;
  variantCount: number;
  availableVariantCount: number;
  primaryProductsCount: number;
  products: AdminManagedColorProduct[];
}

export interface AdminProductEditorImage {
  id: string;
  url: string;
  altText: string;
  colorIds: string[];
}

export interface AdminProductEditorColor {
  id: string;
  label: string;
  colorValue: string;
  available: boolean;
}

export interface AdminProductEditorReview {
  id: string;
  reviewerName: string;
  title: string;
  body: string;
  rating: number;
  isPublished: boolean;
  createdAt: string;
}

export type AdminProductPromotionBadge =
  | "sale"
  | "just_in"
  | "best_seller"
  | null;

export interface AdminProductEditorData {
  id: string;
  name: string;
  brand: string;
  primaryCategoryId: string;
  primaryCategoryName: string;
  categoryLabels: string[];
  primaryColor: string | null;
  primaryColorValue: string | null;
  colors: AdminProductEditorColor[];
  priceUsd: number;
  priceVes: number | null;
  compareAtPriceUsd: number | null;
  compareAtPriceVes: number | null;
  stock: number;
  status: "active" | "draft" | "archived";
  badge: AdminProductPromotionBadge;
  featuredRank: number | null;
  description: string;
  images: AdminProductEditorImage[];
  reviews: AdminProductEditorReview[];
}

export interface AdminExchangeRate {
  rate: number;
  source?: string | null;
  effectiveAt: string;
  fetchedAt: string;
}

export interface AdminManagedExchangeRate extends AdminExchangeRate {
  id: string;
  baseCurrency: string;
  quoteCurrency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  totalVisitors: number;
  salesChange: number;
  ordersChange: number;
  visitorsChange: number;
}

// Fake data for admin dashboard
export const fakeOrders: AdminOrder[] = [
  {
    id: "1",
    orderNumber: "ORD-2026-001",
    customerName: "Sarah Johnson",
    customerEmail: "sarah.johnson@email.com",
    status: "delivered",
    total: 599.99,
    items: 2,
    createdAt: "2026-03-01",
    paymentMethod: "credit_card",
  },
  {
    id: "2",
    orderNumber: "ORD-2026-002",
    customerName: "Michael Chen",
    customerEmail: "michael.chen@email.com",
    status: "shipped",
    total: 1299.0,
    items: 1,
    createdAt: "2026-03-02",
    paymentMethod: "paypal",
  },
  {
    id: "3",
    orderNumber: "ORD-2026-003",
    customerName: "Emily Rodriguez",
    customerEmail: "emily.rodriguez@email.com",
    status: "processing",
    total: 449.5,
    items: 3,
    createdAt: "2026-03-02",
    paymentMethod: "credit_card",
  },
  {
    id: "4",
    orderNumber: "ORD-2026-004",
    customerName: "James Wilson",
    customerEmail: "james.wilson@email.com",
    status: "pending",
    total: 899.0,
    items: 1,
    createdAt: "2026-03-03",
    paymentMethod: "bank_transfer",
  },
  {
    id: "5",
    orderNumber: "ORD-2026-005",
    customerName: "Lisa Anderson",
    customerEmail: "lisa.anderson@email.com",
    status: "cancelled",
    total: 249.99,
    items: 2,
    createdAt: "2026-03-03",
    paymentMethod: "credit_card",
  },
  {
    id: "6",
    orderNumber: "ORD-2026-006",
    customerName: "David Kim",
    customerEmail: "david.kim@email.com",
    status: "delivered",
    total: 1599.0,
    items: 4,
    createdAt: "2026-02-28",
    paymentMethod: "paypal",
  },
  {
    id: "7",
    orderNumber: "ORD-2026-007",
    customerName: "Amanda Foster",
    customerEmail: "amanda.foster@email.com",
    status: "shipped",
    total: 799.99,
    items: 2,
    createdAt: "2026-02-27",
    paymentMethod: "credit_card",
  },
  {
    id: "8",
    orderNumber: "ORD-2026-008",
    customerName: "Robert Taylor",
    customerEmail: "robert.taylor@email.com",
    status: "processing",
    total: 349.0,
    items: 1,
    createdAt: "2026-02-26",
    paymentMethod: "credit_card",
  },
];

export const fakeProducts: AdminProduct[] = [
  {
    id: "1",
    name: "Cuisinart 14-Cup Coffee Maker",
    imageUrl: null,
    brand: "Cuisinart",
    category: "Cafeteras",
    price: 99.99,
    stock: 45,
    status: "active",
    featuredRank: 1,
    createdAt: "2024-01-10",
    updatedAt: "2026-02-15",
  },
  {
    id: "2",
    name: "KitchenAid Artisan Stand Mixer",
    imageUrl: null,
    brand: "KitchenAid",
    category: "Batidoras",
    price: 449.99,
    stock: 23,
    status: "active",
    featuredRank: 2,
    createdAt: "2024-02-15",
    updatedAt: "2026-03-01",
  },
  {
    id: "3",
    name: "Whirlpool French Door Refrigerator",
    imageUrl: null,
    brand: "Whirlpool",
    category: "Refrigeradores",
    price: 2199.0,
    stock: 8,
    status: "active",
    featuredRank: null,
    createdAt: "2024-03-20",
    updatedAt: "2026-02-28",
  },
  {
    id: "4",
    name: "Cuisinart Air Fryer Toaster Oven",
    imageUrl: null,
    brand: "Cuisinart",
    category: "Hornos",
    price: 229.99,
    stock: 67,
    status: "active",
    featuredRank: 3,
    createdAt: "2024-04-05",
    updatedAt: "2026-03-02",
  },
  {
    id: "5",
    name: "KitchenAid Pro Line Blender",
    imageUrl: null,
    brand: "KitchenAid",
    category: "Licuadoras",
    price: 549.99,
    stock: 12,
    status: "active",
    featuredRank: null,
    createdAt: "2024-05-12",
    updatedAt: "2026-02-20",
  },
  {
    id: "6",
    name: "Whirlpool Smart Dishwasher",
    imageUrl: null,
    brand: "Whirlpool",
    category: "Lavavajillas",
    price: 899.0,
    stock: 0,
    status: "draft",
    featuredRank: null,
    createdAt: "2024-06-18",
    updatedAt: "2026-01-15",
  },
  {
    id: "7",
    name: "Cuisinart Food Processor",
    imageUrl: null,
    brand: "Cuisinart",
    category: "Procesadores de alimentos",
    price: 179.99,
    stock: 34,
    status: "active",
    featuredRank: null,
    createdAt: "2024-07-22",
    updatedAt: "2026-03-03",
  },
  {
    id: "8",
    name: "KitchenAid Hand Mixer",
    imageUrl: null,
    brand: "KitchenAid",
    category: "Batidoras",
    price: 79.99,
    stock: 89,
    status: "archived",
    featuredRank: null,
    createdAt: "2024-08-30",
    updatedAt: "2025-12-10",
  },
];

export const dashboardStats: DashboardStats = {
  totalSales: 983410,
  totalOrders: 58375,
  totalVisitors: 237782,
  salesChange: 3.54,
  ordersChange: -2.89,
  visitorsChange: 8.02,
};

export const topCategories = [
  { name: "Refrigeracion", amount: 1200000, color: "#F97316" },
  { name: "Coccion", amount: 950000, color: "#FB923C" },
  { name: "Preparacion", amount: 750000, color: "#FDBA74" },
  { name: "Cuidado del hogar", amount: 500000, color: "#FED7AA" },
];

export const trafficSources = [
  { name: "Trafico directo", percentage: 40 },
  { name: "Busqueda organica", percentage: 30 },
  { name: "Redes sociales", percentage: 15 },
  { name: "Referidos", percentage: 10 },
  { name: "Campanas de correo", percentage: 5 },
];

export const activeUsersByCountry = [
  { country: "Estados Unidos", percentage: 36 },
  { country: "Reino Unido", percentage: 24 },
  { country: "Indonesia", percentage: 17.5 },
  { country: "Rusia", percentage: 15 },
];

export const conversionFunnel = {
  productViews: { value: 25000, change: 9 },
  addToCart: { value: 12000, change: 6 },
  proceedToCheckout: { value: 8500, change: 4 },
  completedPurchases: { value: 6200, change: 7 },
  abandonedCarts: { value: 3000, change: -5 },
};
