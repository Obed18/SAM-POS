// services/dataService.ts
import { supabase } from '@/supabase/supabase';
import { Product, Customer, Sale, Category } from '@/types';

const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// ✅ IMAGE UPLOAD
export const uploadProductImage = async (file: File): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
  const filePath = `products/${fileName}`;

  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || 'image/webp',
    });

  if (error) {
    console.error('Upload error:', error);
    throw error;
  }

  const { data: { publicUrl } } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath);

  return publicUrl;
};

// ✅ PRODUCTS
export const getProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase.from('products').select('*');

  if (error) throw error;
  return data || [];
};

export const addProduct = async (product: Partial<Product>, imageFile?: File) => {
  let imageUrl = product.image;

  if (imageFile) {
    imageUrl = await uploadProductImage(imageFile);
  }

  const productWithId = {
    ...product,
    id: product.id || generateId(),
    image: imageUrl,
  };

  const { data, error } = await supabase
    .from('products')
    .insert([productWithId])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateProduct = async (id: string, updates: Partial<Product>, newImageFile?: File) => {
  let imageUrl = updates.image;

  if (newImageFile) {
    imageUrl = await uploadProductImage(newImageFile);
  }

  const { data, error } = await supabase
    .from('products')
    .update({ ...updates, image: imageUrl })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteProduct = async (id: string) => {
  // First delete related sale_items
  await supabase.from('sale_items').delete().eq('product_id', id);
  
  // Then delete the product
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// ✅ CUSTOMERS
export const getCustomers = async (): Promise<Customer[]> => {
  const { data, error } = await supabase.from('customers').select('*');

  if (error) throw error;
  return data || [];
};

// ✅ SALES
export const getSales = async (): Promise<Sale[]> => {
  const { data, error } = await supabase.from('sales').select('*');

  if (error) throw error;
  return data || [];
};

export const getDashboardData = async () => {
  // 1️⃣ Get sales WITH items
  const { data: salesData, error: salesError } = await supabase
    .from('sales')
    .select(`
      id,
      customer_name,
      total,
      payment_method,
      sale_time,
      created_at,
      sale_items (
        product_id,
        quantity,
        price
      )
    `)
    .order('created_at', { ascending: false })
    .limit(10);

  if (salesError) throw salesError;

  // 2️⃣ Get products
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('*');

  if (productsError) throw productsError;

  // 3️⃣ Get customers
  const { data: customers, error: customersError } = await supabase
    .from('customers')
    .select('*');

  if (customersError) throw customersError;

  // 4️⃣ Get daily sales (chart)
  const { data: dailySalesRaw, error: dailyError } = await supabase
    .from('daily_sales')
    .select('*')
    .order('date', { ascending: true });

  if (dailyError) throw dailyError;

  // 5️⃣ Format for your frontend
  const sales: Sale[] = (salesData || []).map((s) => {
    const items = (s.sale_items || []).map((item) => ({
      product: {
        id: item.product_id,
        name: 'Unknown',
        category: '',
        price: Number(item.price),
        stock: 0,
        image: '',
        barcode: '',
      },
      quantity: item.quantity,
    }));

    const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const tax = subtotal * 0.08;
    const discount = 0;
    const total = Number(s.total) || subtotal + tax - discount;
    const amountReceived = total;
    const change = amountReceived - total;

    return {
      id: s.id,
      items,
      subtotal,
      tax,
      discount,
      total,
      paymentMethod: (s.payment_method as 'cash' | 'card' | 'mobile') || 'cash',
      amountReceived,
      change,
      customerName: s.customer_name || 'Walk-in',
      createdAt: s.created_at ? new Date(s.created_at) : new Date(),
      customerId: undefined,
      reference: null,
    };
  });

  const dailySales = (dailySalesRaw || []).map((d) => ({
    date: d.date,
    revenue: Number(d.revenue),
  }));

  return {
    sales,
    products: products || [],
    customers: customers || [],
    dailySales,
  };
};

export const getCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return data || [];
};

// ✅ AUTH
export const verifyUserCredentials = async (
  email: string,
  password: string
): Promise<{ role: 'admin' | 'cashier' } | null> => {
  const { data, error } = await supabase.functions.invoke('verify-user', {
    body: { email, password },
  });

  if (error || !data) return null;
  return data as { role: 'admin' | 'cashier' } | null;
};

// ✅ RESET ALL DATA
export const resetAllDatabaseData = async () => {
  const { error: salesError } = await supabase.from('sales').delete().neq('id', '');
  if (salesError) throw salesError;

  const { error: productsError } = await supabase.from('products').delete().neq('id', '');
  if (productsError) throw productsError;

  const { error: customersError } = await supabase.from('customers').delete().neq('id', '');
  if (customersError) throw customersError;
};