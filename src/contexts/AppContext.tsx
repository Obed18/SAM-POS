import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Product, CartItem, Sale, Toast, PageType, Customer } from '@/types';
import {
  products as initialProducts,
  customers as initialCustomers,
  recentSales as initialSales,
} from '@/data/mockData';
import {
  useLocalStorage,
  clearAllStorage,
  updateLastModified,
} from '@/hooks/useLocalStorage';

interface AppContextType {
  // Navigation
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  currentPage: PageType;
  setCurrentPage: (page: PageType) => void;

  // Auth
  isAuthenticated: boolean;
  login: (email: string, password: string, role: 'admin' | 'cashier') => Promise<boolean>;
  logout: () => void;
  userEmail: string;
  userRole: 'admin' | 'cashier' | null;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartSubtotal: number;
  cartTax: number;
  cartTotal: number;

  // Products
  productList: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;

  // Customers
  customerList: Customer[];
  addCustomer: (customer: Customer) => void;

  // Sales
  salesList: Sale[];
  completeSale: (sale: Sale) => void;

  // Toast
  toasts: Toast[];
  showToast: (type: Toast['type'], message: string) => void;
  removeToast: (id: string) => void;

  // Receipt
  receiptSale: Sale | null;
  setReceiptSale: (sale: Sale | null) => void;

  // Settings / Reset
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType>({} as AppContextType);

export const useAppContext = () => useContext(AppContext);
export default AppContext;

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ─── Navigation (not persisted) ───
  const [sidebarOpen, setSidebarOpen] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= 1024
  );
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');

  // ─── Auth (persisted) ───
  const [isAuthenticated, setIsAuthenticated] = useLocalStorage<boolean>('auth', true);
  const [userEmail, setUserEmail] = useLocalStorage<string>('userEmail', 'admin@posapp.com');
  const [userRole, setUserRole] = useLocalStorage<'admin' | 'cashier' | null>(
    'userRole',
    null
  );

  // ─── Core data (persisted via useLocalStorage) ───
  const [cart, setCart] = useLocalStorage<CartItem[]>('cart', []);
  const [productList, setProductList] = useLocalStorage<Product[]>('products', initialProducts);
  const [customerList, setCustomerList] = useLocalStorage<Customer[]>('customers', initialCustomers);
  const [salesList, setSalesList] = useLocalStorage<Sale[]>('sales', initialSales);

  // ─── Transient UI state (not persisted) ───
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [receiptSale, setReceiptSale] = useState<Sale | null>(null);

  // ─── Toast ───
  const showToast = useCallback((type: Toast['type'], message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ─── Navigation ───
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  // ─── Auth ───
  const login = async (
    email: string,
    password: string,
    role: 'admin' | 'cashier'
  ): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 1500));

    const users = [
      { email: 'admin@posapp.com', password: 'admin123', role: 'admin' },
      { email: 'cashier@posapp.com', password: 'cashier123', role: 'cashier' },
    ];

    // 🔍 Step 1: Find user by email + password
    const user = users.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) return false;

    // ⚠️ Step 2: Check role mismatch
    if (user.role !== role) {
      showToast('error', `You are registered as a ${user.role}, not ${role}`);
      return false;
    }

    // ✅ Step 3: Login success
    setIsAuthenticated(true);
    setUserEmail(user.email);
    setUserRole(user.role);
    setCurrentPage(
      user.role === 'admin' ? 'admin-dashboard' : 'cashier-dashboard'
    );

    return true;
  };
  const logout = () => {
    setIsAuthenticated(false);
    setCurrentPage('login');
    setUserEmail('');
    setUserRole(null);
  };

  // ─── Cart ───
  const addToCart = useCallback(
    (product: Product) => {
      setCart((prev) => {
        const existing = prev.find((item) => item.product.id === product.id);
        if (existing) {
          if (existing.quantity >= product.stock) return prev;
          return prev.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return [...prev, { product, quantity: 1 }];
      });
    },
    [setCart]
  );

  const removeFromCart = useCallback(
    (productId: string) => {
      setCart((prev) => prev.filter((item) => item.product.id !== productId));
    },
    [setCart]
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(productId);
        return;
      }
      setCart((prev) =>
        prev.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item
        )
      );
    },
    [removeFromCart, setCart]
  );

  const clearCart = useCallback(() => setCart([]), [setCart]);

  const cartSubtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const cartTax = cartSubtotal * 0.08;
  const cartTotal = cartSubtotal + cartTax;

  // ─── Products ───
  const addProduct = (product: Product) => {
    setProductList((prev) => [...prev, product]);
    updateLastModified();
  };

  const updateProduct = (product: Product) => {
    setProductList((prev) =>
      prev.map((p) => (p.id === product.id ? product : p))
    );
    updateLastModified();
  };

  const deleteProduct = (id: string) => {
    setProductList((prev) => prev.filter((p) => p.id !== id));
    updateLastModified();
  };

  // ─── Customers ───
  const addCustomer = (customer: Customer) => {
    setCustomerList((prev) => [...prev, customer]);
    updateLastModified();
  };

  // ─── Sales ───
  const completeSale = (sale: Sale) => {
    setSalesList((prev) => [sale, ...prev]);
    // Update stock
    sale.items.forEach((item) => {
      setProductList((prev) =>
        prev.map((p) =>
          p.id === item.product.id
            ? { ...p, stock: Math.max(0, p.stock - item.quantity) }
            : p
        )
      );
    });
    clearCart();
    updateLastModified();
  };

  // ─── Reset All Data ───
  const resetAllData = () => {
    clearAllStorage();
    setProductList(initialProducts);
    setCustomerList(initialCustomers);
    setSalesList(initialSales);
    setCart([]);
    setIsAuthenticated(true);
    setUserEmail('admin@posapp.com');
    setUserRole(null);
    setCurrentPage('dashboard');
  };

  return (
    <AppContext.Provider
      value={{
        sidebarOpen,
        toggleSidebar,
        currentPage,
        setCurrentPage,
        isAuthenticated,
        login,
        logout,
        userEmail,
        userRole,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartSubtotal,
        cartTax,
        cartTotal,
        productList,
        addProduct,
        updateProduct,
        deleteProduct,
        customerList,
        addCustomer,
        salesList,
        completeSale,
        toasts,
        showToast,
        removeToast,
        receiptSale,
        setReceiptSale,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
