import React, { useState, useEffect } from 'react';
import useAppContext from '@/hooks/useAppContext';
import { supabase } from '@/supabase/supabase';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Calendar,
  CreditCard,
  Banknote,
  Smartphone,
  Download,
} from 'lucide-react';

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'];

const paymentIcons = {
  cash: Banknote,
  card: CreditCard,
  mobile: Smartphone,
};

type DailySalesData = {
  date: string;
  revenue: number;
  sales: number;
};

type ProductPerformanceData = {
  name: string;
  sales: number;
  revenue: number;
};

type PaymentBreakdownData = {
  name: string;
  value: number;
  color: string;
};

type SupabaseSaleRow = {
  sale_date: string;
  total: number | string;
};

type SupabaseSaleItemRow = {
  quantity: number;
  price: number;
  product_id: string;
  products: { name: string; }[];
};

type SupabasePaymentRow = {
  payment_method: 'cash' | 'card' | 'mobile' | string;
};

    const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
  }).format(amount);


const ReportsPage: React.FC = () => {
  const { salesList } = useAppContext();

  const [dailySales, setDailySales] = useState<DailySalesData[]>([]);
  const [productPerformance, setProductPerformance] = useState<ProductPerformanceData[]>([]);
  const [paymentBreakdown, setPaymentBreakdown] = useState<PaymentBreakdownData[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'transactions'>('overview');

const totalRevenue = dailySales.reduce((s, d) => s + d.revenue, 0);
const totalSales = dailySales.reduce((s, d) => s + d.sales, 0);
const avgOrderValue = totalSales ? totalRevenue / totalSales : 0;

  useEffect(() => {
  const fetchDailySales = async () => {
    const { data, error } = await supabase
  .from('sales')
  .select('sale_date, total');

if (error || !data) {
  console.error(error);
  return;
}

const grouped = (data as SupabaseSaleRow[]).reduce<DailySalesData[]>((acc, sale) => {
  const existing = acc.find((d) => d.date === sale.sale_date);
  const saleTotal = Number(sale.total);

  if (existing) {
    existing.revenue += saleTotal;
    existing.sales += 1;
  } else {
    acc.push({
      date: sale.sale_date,
      revenue: saleTotal,
      sales: 1,
    });
  }

  return acc;
}, []);

setDailySales(grouped);
  };

  fetchDailySales();
}, []);

useEffect(() => {
  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('sale_items')
      .select(`
        quantity,
        price,
        product_id,
        products(name)
      `);

    if (error) {
      console.error(error);
      return;
    }

    const grouped = (data as SupabaseSaleItemRow[]).reduce<Record<string, ProductPerformanceData>>((acc, item) => {
      const name = item.products?.[0]?.name ?? 'Unknown Product';

      if (!acc[name]) {
        acc[name] = {
          name,
          sales: 0,
          revenue: 0,
        };
      }

      acc[name].sales += item.quantity;
      acc[name].revenue += item.quantity * item.price;

      return acc;
    }, {});

    setProductPerformance(Object.values(grouped));
  };

  fetchProducts();
}, []);

useEffect(() => {
  const fetchPayments = async () => {
    const { data } = await supabase.from('sales').select('payment_method');

    const grouped = (data as SupabasePaymentRow[]).reduce<Record<string, number>>((acc, s) => {
      const method = s.payment_method ?? 'unknown';
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {});

    const total = (data ?? []).length || 0;

    const formatted = Object.entries(grouped).map(([key, value]) => ({
      name: key,
      value: total > 0 ? Math.round((value / total) * 100) : 0,
      color:
        key === 'cash' ? '#10b981' :
        key === 'card' ? '#3b82f6' :
        '#8b5cf6',
    }));

    setPaymentBreakdown(formatted);
  };

  fetchPayments();
}, []);

  const tabs = [
    { id: 'overview' as const, label: 'Overview' },
    { id: 'products' as const, label: 'Product Performance' },
    { id: 'transactions' as const, label: 'Transactions' },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Reports</h1>
          <p className="text-sm text-slate-500 mt-0.5">Sales analytics and performance insights</p>
        </div>
        <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-all text-sm">
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50">
              <DollarSign className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{formatCurrency(avgOrderValue)}</p>
              <p className="text-sm text-slate-500">Total Revenue</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50">
              <ShoppingBag className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{totalSales}</p>
              <p className="text-sm text-slate-500">Total Orders</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-violet-50">
              <TrendingUp className="w-5 h-5 text-violet-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{formatCurrency(avgOrderValue)}</p>
              <p className="text-sm text-slate-500">Avg Order Value</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === tab.id
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100">
            <h3 className="text-base font-semibold text-slate-800 mb-1">Daily Revenue</h3>
            <p className="text-sm text-slate-400 mb-6">Revenue trend for March 2026</p>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dailySales}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => formatCurrency(v)} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', fontSize: '13px' }}
                  formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Payment Breakdown */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100">
            <h3 className="text-base font-semibold text-slate-800 mb-1">Payment Methods</h3>
            <p className="text-sm text-slate-400 mb-4">Distribution by type</p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={paymentBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {paymentBreakdown.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '13px' }}
                  formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {paymentBreakdown.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-slate-600">{item.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-800">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sales Volume Chart */}
          <div className="lg:col-span-3 bg-white rounded-2xl p-6 border border-slate-100">
            <h3 className="text-base font-semibold text-slate-800 mb-1">Daily Sales Volume</h3>
            <p className="text-sm text-slate-400 mb-6">Number of transactions per day</p>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dailySales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '13px' }}
                />
                <Bar dataKey="sales" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Product Performance Chart */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100">
            <h3 className="text-base font-semibold text-slate-800 mb-1">Product Revenue</h3>
            <p className="text-sm text-slate-400 mb-6">Revenue by product</p>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={productPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => formatCurrency(v)} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={130} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '13px' }}
                  formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                />
                <Bar dataKey="revenue" radius={[0, 6, 6, 0]}>
                  {productPerformance.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Product Table */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100">
            <h3 className="text-base font-semibold text-slate-800 mb-1">Top Products</h3>
            <p className="text-sm text-slate-400 mb-4">Ranked by units sold</p>
            <div className="space-y-3">
              {[...productPerformance].sort((a, b) => b.sales - a.sales).map((product, i) => (
                <div key={product.name} className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                    i === 0 ? 'bg-amber-100 text-amber-700' :
                    i === 1 ? 'bg-slate-200 text-slate-600' :
                    i === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-slate-100 text-slate-500'
                  }`}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{product.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full max-w-[120px]">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${(product.sales / Math.max(...productPerformance.map(p => p.sales))) * 100}%`,
                            backgroundColor: COLORS[i % COLORS.length],
                          }}
                        />
                      </div>
                      <span className="text-xs text-slate-500">{product.sales} sold</span>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-slate-800">${product.revenue.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">ID</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Items</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Payment</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody>
                {salesList.map((sale) => {
                  const PayIcon = paymentIcons[sale.paymentMethod] ?? Banknote;
                  const createdAt = new Date(sale.createdAt);
                  const saleDate = createdAt.toLocaleDateString();
                  const saleTime = createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  return (
                    <tr key={sale.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3.5 text-sm font-mono text-slate-500">{sale.id.toUpperCase()}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-700">{sale.customerName || 'Walk-in'}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {saleDate} {saleTime}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-500">{sale.items.length} items</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <PayIcon className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-600 capitalize">{sale.paymentMethod}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right text-sm font-semibold text-slate-800">${sale.total.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
