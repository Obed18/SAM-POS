import { Product, Customer, Sale, DailySales } from '@/types';

export const products: Product[] = [
  {
    id: '1',
    name: 'Wireless Headphones',
    category: 'Electronics',
    price: 99.99,
    stock: 25,
    image: '/api/placeholder/150/150',
    barcode: '123456789012',
    description: 'High-quality wireless headphones with noise cancellation'
  },
  {
    id: '2',
    name: 'Smart Watch',
    category: 'Electronics',
    price: 249.99,
    stock: 15,
    image: '/api/placeholder/150/150',
    barcode: '123456789013',
    description: 'Fitness tracking smartwatch with heart rate monitor'
  },
  {
    id: '3',
    name: 'Coffee Maker',
    category: 'Appliances',
    price: 79.99,
    stock: 8,
    image: '/api/placeholder/150/150',
    barcode: '123456789014',
    description: '12-cup programmable coffee maker'
  },
  {
    id: '4',
    name: 'Running Shoes',
    category: 'Sports',
    price: 129.99,
    stock: 20,
    image: '/api/placeholder/150/150',
    barcode: '123456789015',
    description: 'Comfortable running shoes with arch support'
  },
  {
    id: '5',
    name: 'Laptop Stand',
    category: 'Accessories',
    price: 39.99,
    stock: 12,
    image: '/api/placeholder/150/150',
    barcode: '123456789016',
    description: 'Adjustable aluminum laptop stand'
  }
];

export const customers: Customer[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@email.com',
    phone: '+1-555-0123',
    totalSpent: 459.96,
    totalOrders: 3,
    joinDate: '2024-01-15'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@email.com',
    phone: '+1-555-0124',
    totalSpent: 329.97,
    totalOrders: 2,
    joinDate: '2024-02-01'
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob.johnson@email.com',
    phone: '+1-555-0125',
    totalSpent: 189.98,
    totalOrders: 1,
    joinDate: '2024-02-20'
  }
];

export const recentSales: Sale[] = [
  {
    id: '1',
    items: [
      { product: products[0], quantity: 1 },
      { product: products[2], quantity: 1 }
    ],
    subtotal: 179.98,
    tax: 14.40,
    discount: 0,
    total: 194.38,
    paymentMethod: 'card',
    amountReceived: 200.00,
    change: 5.62,
    customerId: '1',
    customerName: 'John Doe',
    reference: 'TXN-001',
    createdAt: new Date('2024-12-01T10:30:00')
  },
  {
    id: '2',
    items: [
      { product: products[1], quantity: 1 }
    ],
    subtotal: 249.99,
    tax: 20.00,
    discount: 0,
    total: 269.99,
    paymentMethod: 'cash',
    amountReceived: 270.00,
    change: 0.01,
    customerId: '2',
    customerName: 'Jane Smith',
    reference: 'TXN-002',
    createdAt: new Date('2024-12-01T11:15:00')
  },
  {
    id: '3',
    items: [
      { product: products[3], quantity: 1 },
      { product: products[4], quantity: 1 }
    ],
    subtotal: 169.98,
    tax: 13.60,
    discount: 0,
    total: 183.58,
    paymentMethod: 'mobile',
    amountReceived: 183.58,
    change: 0,
    customerId: '3',
    customerName: 'Bob Johnson',
    reference: 'TXN-003',
    createdAt: new Date('2024-12-01T14:20:00')
  }
];

export const purchaseHistory = [
  {
    id: '1',
    customerId: '1',
    date: '2024-12-01',
    items: 2,
    paymentMethod: 'card',
    total: 194.38
  },
  {
    id: '2',
    customerId: '1',
    date: '2024-11-28',
    items: 1,
    paymentMethod: 'cash',
    total: 99.99
  },
  {
    id: '3',
    customerId: '2',
    date: '2024-12-01',
    items: 1,
    paymentMethod: 'cash',
    total: 269.99
  },
  {
    id: '4',
    customerId: '3',
    date: '2024-12-01',
    items: 2,
    paymentMethod: 'mobile',
    total: 183.58
  }
];

export const dailySalesData: DailySales[] = [
  { date: '2024-11-25', sales: 12, revenue: 2450.50 },
  { date: '2024-11-26', sales: 8, revenue: 1890.25 },
  { date: '2024-11-27', sales: 15, revenue: 3200.75 },
  { date: '2024-11-28', sales: 10, revenue: 2150.00 },
  { date: '2024-11-29', sales: 18, revenue: 3875.50 },
  { date: '2024-11-30', sales: 22, revenue: 4650.25 },
  { date: '2024-12-01', sales: 14, revenue: 3100.00 }
];

export const productPerformance = [
  { name: 'Wireless Headphones', revenue: 2999.70, sales: 30 },
  { name: 'Smart Watch', revenue: 7499.70, sales: 30 },
  { name: 'Coffee Maker', revenue: 2399.70, sales: 30 },
  { name: 'Running Shoes', revenue: 3899.70, sales: 30 },
  { name: 'Laptop Stand', revenue: 1199.70, sales: 30 }
];