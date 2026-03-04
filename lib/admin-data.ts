// Admin dashboard types and fake data

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user" | "moderator";
  status: "active" | "inactive" | "suspended";
  createdAt: string;
  lastLogin: string;
  avatar?: string;
}

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
  brand: "Cuisinart" | "Whirlpool" | "KitchenAid";
  category: string;
  price: number;
  stock: number;
  status: "active" | "draft" | "archived";
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
export const fakeUsers: AdminUser[] = [
  {
    id: "1",
    name: "Marcus George",
    email: "marcus.george@email.com",
    role: "admin",
    status: "active",
    createdAt: "2024-01-15",
    lastLogin: "2026-03-03",
    avatar: "/images/avatars/marcus.jpg",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    role: "user",
    status: "active",
    createdAt: "2024-02-20",
    lastLogin: "2026-03-02",
  },
  {
    id: "3",
    name: "Michael Chen",
    email: "michael.chen@email.com",
    role: "user",
    status: "active",
    createdAt: "2024-03-10",
    lastLogin: "2026-03-01",
  },
  {
    id: "4",
    name: "Emily Rodriguez",
    email: "emily.rodriguez@email.com",
    role: "moderator",
    status: "active",
    createdAt: "2024-04-05",
    lastLogin: "2026-02-28",
  },
  {
    id: "5",
    name: "James Wilson",
    email: "james.wilson@email.com",
    role: "user",
    status: "inactive",
    createdAt: "2024-05-12",
    lastLogin: "2026-01-15",
  },
  {
    id: "6",
    name: "Lisa Anderson",
    email: "lisa.anderson@email.com",
    role: "user",
    status: "suspended",
    createdAt: "2024-06-18",
    lastLogin: "2025-12-20",
  },
  {
    id: "7",
    name: "David Kim",
    email: "david.kim@email.com",
    role: "user",
    status: "active",
    createdAt: "2024-07-22",
    lastLogin: "2026-03-03",
  },
  {
    id: "8",
    name: "Amanda Foster",
    email: "amanda.foster@email.com",
    role: "user",
    status: "active",
    createdAt: "2024-08-30",
    lastLogin: "2026-03-02",
  },
];

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
    brand: "Cuisinart",
    category: "Coffee Makers",
    price: 99.99,
    stock: 45,
    status: "active",
    createdAt: "2024-01-10",
    updatedAt: "2026-02-15",
  },
  {
    id: "2",
    name: "KitchenAid Artisan Stand Mixer",
    brand: "KitchenAid",
    category: "Mixers",
    price: 449.99,
    stock: 23,
    status: "active",
    createdAt: "2024-02-15",
    updatedAt: "2026-03-01",
  },
  {
    id: "3",
    name: "Whirlpool French Door Refrigerator",
    brand: "Whirlpool",
    category: "Refrigerators",
    price: 2199.0,
    stock: 8,
    status: "active",
    createdAt: "2024-03-20",
    updatedAt: "2026-02-28",
  },
  {
    id: "4",
    name: "Cuisinart Air Fryer Toaster Oven",
    brand: "Cuisinart",
    category: "Ovens",
    price: 229.99,
    stock: 67,
    status: "active",
    createdAt: "2024-04-05",
    updatedAt: "2026-03-02",
  },
  {
    id: "5",
    name: "KitchenAid Pro Line Blender",
    brand: "KitchenAid",
    category: "Blenders",
    price: 549.99,
    stock: 12,
    status: "active",
    createdAt: "2024-05-12",
    updatedAt: "2026-02-20",
  },
  {
    id: "6",
    name: "Whirlpool Smart Dishwasher",
    brand: "Whirlpool",
    category: "Dishwashers",
    price: 899.0,
    stock: 0,
    status: "draft",
    createdAt: "2024-06-18",
    updatedAt: "2026-01-15",
  },
  {
    id: "7",
    name: "Cuisinart Food Processor",
    brand: "Cuisinart",
    category: "Food Processors",
    price: 179.99,
    stock: 34,
    status: "active",
    createdAt: "2024-07-22",
    updatedAt: "2026-03-03",
  },
  {
    id: "8",
    name: "KitchenAid Hand Mixer",
    brand: "KitchenAid",
    category: "Mixers",
    price: 79.99,
    stock: 89,
    status: "archived",
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
  { name: "Electronics", amount: 1200000, color: "#F97316" },
  { name: "Fashion", amount: 950000, color: "#FB923C" },
  { name: "Home & Kitchen", amount: 750000, color: "#FDBA74" },
  { name: "Beauty & Personal Care", amount: 500000, color: "#FED7AA" },
];

export const trafficSources = [
  { name: "Direct Traffic", percentage: 40 },
  { name: "Organic Search", percentage: 30 },
  { name: "Social Media", percentage: 15 },
  { name: "Referral Traffic", percentage: 10 },
  { name: "Email Campaigns", percentage: 5 },
];

export const activeUsersByCountry = [
  { country: "United States", percentage: 36 },
  { country: "United Kingdom", percentage: 24 },
  { country: "Indonesia", percentage: 17.5 },
  { country: "Russia", percentage: 15 },
];

export const conversionFunnel = {
  productViews: { value: 25000, change: 9 },
  addToCart: { value: 12000, change: 6 },
  proceedToCheckout: { value: 8500, change: 4 },
  completedPurchases: { value: 6200, change: 7 },
  abandonedCarts: { value: 3000, change: -5 },
};
