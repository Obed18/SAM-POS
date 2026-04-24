import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import BarcodeScanner from './BarcodeScanner';
import { getDashboardData } from '@/services/dataService';
import { Sale, Product, Customer } from '@/types';
import { formatRole } from '@/lib/stringUtils';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  ArrowRight,
  CreditCard,
  Banknote,
  Smartphone,
  Database,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';



const paymentIcons = {
  cash: Banknote,
  card: CreditCard,
  mobile: Smartphone,
};

const DashboardPage: React.FC = () => {
  const [salesList, setSalesList] = useState<Sale[]>([]);
  const [productList, setProductList] = useState<Product[]>([]);
  const [customerList, setCustomerList] = useState<Customer[]>([]);
  const [dailySales, setDailySales] = useState<{ date: string; revenue: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [scannerActive, setScannerActive] = useState(false);
  const [detectedBarcode, setDetectedBarcode] = useState('');
  const { setCurrentPage } = useAppContext();
  const currentMonth = new Date().toLocaleString('default', {
  month: 'long',
  year: 'numeric',
});
const [error, setError] = useState('');
const { userRole } = useAppContext();


const loadDashboard = useCallback(async () => {
  try {
    const data = await getDashboardData();
    setSalesList(data.sales);
    setProductList(data.products);
    setCustomerList(data.customers);
    setDailySales(data.dailySales);
  } catch (err) {
  console.error(err);
  setError('Failed to load dashboard data');
}
 finally {
    setLoading(false);
  }
}, []);

useEffect(() => {
  loadDashboard();

  const handleVisibility = () => {
    if (document.visibilityState === 'visible') {
      loadDashboard();
    }
  };

  document.addEventListener('visibilitychange', handleVisibility);

  return () => {
    document.removeEventListener('visibilitychange', handleVisibility);
  };
}, [loadDashboard]);


    const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
  }).format(amount);

  // Compute live stats from persisted data
  const liveStats = useMemo(() => {
    const totalRevenue = salesList.reduce((sum, s) => sum + (s.total || 0), 0);
    return {
      totalSales: salesList.length,
      revenue: totalRevenue,
      totalProducts: productList.length,
      totalCustomers: customerList.length,
    };
  }, [salesList, productList, customerList]);

const stats = [
  {
    label: 'Total Sales',
    value: liveStats.totalSales.toLocaleString(),
    change: 12.5,
    icon: ShoppingBag,
    bg: 'bg-blue-50',
    iconColor: 'text-blue-500',
  },
  {
    label: 'Revenue',
    value: formatCurrency(liveStats.revenue),
    change: 8.3,
    icon: DollarSign,
    bg: 'bg-emerald-50',
    iconColor: 'text-emerald-500',
  },
  {
    label: 'Products',
    value: liveStats.totalProducts.toString(),
    change: 3,
    icon: Package,
    bg: 'bg-violet-50',
    iconColor: 'text-violet-500',
  },
  {
    label: 'Customers',
    value: liveStats.totalCustomers.toString(),
    change: 15.2,
    icon: Users,
    bg: 'bg-amber-50',
    iconColor: 'text-amber-500',
  },
];

const actions = [
  {
    label: 'New Sale',
    page: 'pos' as const,
    color: 'bg-emerald-500 hover:bg-emerald-600',
    icon: ShoppingBag,
    roles: ['admin', 'cashier'],
  },
  {
    label: 'Add Product',
    page: 'products' as const,
    color: 'bg-blue-500 hover:bg-blue-600',
    icon: Package,
    roles: ['admin'], 
  },
  {
    label: 'View Reports',
    page: 'reports' as const,
    color: 'bg-violet-500 hover:bg-violet-600',
    icon: TrendingUp,
    roles: ['admin'], 
  },
  {
    label: 'Customers',
    page: 'customers' as const,
    color: 'bg-amber-500 hover:bg-amber-600',
    icon: Users,
    roles: ['admin', 'cashier'],
  },
];
  // Use the most recent 5 sales from persisted data
  const recentSalesDisplay = useMemo(
    () =>
      [...salesList]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 5),
    [salesList]
  );

  if (loading) {
  return <p className="text-center py-10">Loading dashboard...</p>;
}

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Welcome back, {formatRole(userRole) || 'User'}</h1>
          <p className="text-slate-500 text-sm mt-0.5">Here's what's happening with your store today.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200">
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-xs font-medium text-emerald-700">Data persisted</span>
          </div>
          <button
            onClick={() => setCurrentPage('pos')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-500/25 text-sm"
          >
            New Sale
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setScannerActive(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-500 text-white font-medium rounded-xl hover:bg-sky-600 transition-all shadow-sm text-sm"
          >
            Scan Barcode
            <Package className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isPositive = stat.change > 0;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-2xl p-5 border border-slate-100 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="flex items-start justify-between">
                <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                  <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
                  {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {Math.abs(stat.change)}%
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                <p className="text-sm text-slate-500 mt-0.5">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {scannerActive && (
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-slate-800">Barcode Scanner</h3>
            <button
              onClick={() => setScannerActive(false)}
              className="text-xs text-slate-500 hover:text-slate-700"
            >
              Close
            </button>
          </div>
          <BarcodeScanner
            onDetected={(code) => {
              setDetectedBarcode(code);
              setScannerActive(false);
              setCurrentPage('pos');
            }}
            onClose={() => setScannerActive(false)}
          />
          <p className="mt-3 text-sm text-slate-600">Scanned barcode: <span className="font-semibold text-slate-800">{detectedBarcode || 'No barcode scanned yet'}</span></p>
        </div>
      )}

      {/* Chart + Recent Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold text-slate-800">Revenue Overview</h3>
              <p className="text-sm text-slate-400 mt-0.5">Daily revenue for {currentMonth}</p>
            </div>
            <div className="flex gap-1 bg-slate-100 rounded-lg p-0.5">
              {['7D', '14D', '30D'].map((period, i) => (
                <button
                  key={period}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    i === 2 ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
                {dailySales.length === 0 ? (
        <div className="flex items-center justify-center h-[280px] text-slate-400 text-sm">
          No revenue data yet
        </div>
      ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={dailySales}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) } tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => formatCurrency(v)} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  fontSize: '13px',
                }}
                formatter={(value: number) => [formatCurrency(value), 'Revenue']}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                strokeWidth={2.5}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>)}
        </div>

        {/* Recent Sales */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-semibold text-slate-800">Recent Sales</h3>
            <button
              onClick={() => setCurrentPage('reports')}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
            >
              View All
            </button>
          </div>
          {recentSalesDisplay.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
              <ShoppingBag className="w-8 h-8 mb-2 opacity-40" />
              <p className="text-sm font-medium">No sales yet</p>
              <p className="text-xs mt-0.5">Complete a sale to see it here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentSalesDisplay.map((sale) => {
                const PayIcon = paymentIcons[sale.paymentMethod as keyof typeof paymentIcons] || Banknote;
                return (
                  <div key={sale.id} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <PayIcon className="w-4 h-4 text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">
                        {sale.customerName || 'Walk-in Customer'}
                      </p>
                      <p className="text-xs text-slate-400">{new Date(sale.createdAt).toLocaleDateString('en-GB')} &middot; {(sale.items?.length || 0)} items</p>
                    </div>
                    <p className="text-sm font-semibold text-slate-800">{formatCurrency(sale.total)}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {actions
            .filter(action => userRole && action.roles.includes(userRole))
            .map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={() => setCurrentPage(action.page)}
                  className={`${action.color} text-white rounded-2xl p-5 text-left transition-all duration-200 shadow-lg hover:shadow-xl group`}
                >
                  <Icon className="w-6 h-6 mb-3 opacity-80 group-hover:opacity-100 transition-opacity" />
                  <p className="text-sm font-semibold">{action.label}</p>
                </button>
              );
            })}
        </div>
    </div>
  );
};

export default DashboardPage;
