export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  image: string;
  barcode: string;
  description?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalSpent: number;
  totalOrders: number;
  joinDate: string;
}

export interface Sale {
  id: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'mobile';
  amountReceived: number;
  change: number;
  customerId?: string;
  customerName?: string;
  date: string;
  time: string;
}

export interface DashboardStats {
  totalSales: number;
  revenue: number;
  totalProducts: number;
  totalCustomers: number;
  salesChange: number;
  revenueChange: number;
  productsChange: number;
  customersChange: number;
}

export interface DailySales {
  date: string;
  sales: number;
  revenue: number;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

export type PageType = 'dashboard' | 'pos' | 'products' | 'inventory' | 'customers' | 'reports' | 'settings' | 'login';
