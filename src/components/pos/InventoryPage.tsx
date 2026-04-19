import React, { useState, useMemo, useEffect, } from 'react';
import { getProducts } from '@/services/dataService';
import { Product } from '@/types';
import {
  Warehouse,
  AlertTriangle,
  Search,
  Filter,
  ArrowUpDown,
  Package,
} from 'lucide-react';

const InventoryPage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'name' | 'stock-asc' | 'stock-desc'>('stock-asc');

    const categories = [
  'All',
  ...new Set(products.map(p => p.category)),
];


const loadProducts = async (showLoader = false) => {
  if (showLoader) setLoading(true);

  try {
    const data = await getProducts();
    setProducts(data);
  } catch (err) {
    console.error('Failed to load products');
  } finally {
    if (showLoader) setLoading(false);
  }
};

useEffect(() => {
  loadProducts(true); // first load shows loader

  const interval = setInterval(() => {
    loadProducts(false); // silent refresh
  }, 5000);

  return () => clearInterval(interval);
}, []);

  const filtered = useMemo(() => {
    const items = [...products].filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = filterCategory === 'All' || p.category === filterCategory;
      return matchSearch && matchCat;
    });

    if (sortBy === 'stock-asc') items.sort((a, b) => a.stock - b.stock);
    else if (sortBy === 'stock-desc') items.sort((a, b) => b.stock - a.stock);
    else items.sort((a, b) => a.name.localeCompare(b.name));

    return items;
  }, [products, searchQuery, filterCategory, sortBy]);

  const lowStockCount = products.filter(p => p.stock <= 10).length;
  const medStockCount = products.filter(p => p.stock > 10 && p.stock <= 30).length;
  const totalStock = products.reduce((s, p) => s + p.stock, 0);

  const getStockColor = (stock: number) => {
    if (stock <= 10) return { bar: 'bg-red-500', bg: 'bg-red-100', text: 'text-red-600', badge: 'bg-red-50 text-red-600 border-red-200' };
    if (stock <= 30) return { bar: 'bg-amber-500', bg: 'bg-amber-100', text: 'text-amber-600', badge: 'bg-amber-50 text-amber-600 border-amber-200' };
    return { bar: 'bg-emerald-500', bg: 'bg-emerald-100', text: 'text-emerald-600', badge: 'bg-emerald-50 text-emerald-600 border-emerald-200' };
  };

  const maxStock = Math.max(...products.map(p => p.stock), 1);

  if (loading) {
  return (
    <div className="flex items-center justify-center h-64 text-slate-400">
      <p>Loading inventory...</p>
    </div>
  );
}

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Inventory</h1>
        <p className="text-sm text-slate-500 mt-0.5">Monitor stock levels and manage inventory</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50">
              <Warehouse className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{totalStock}</p>
              <p className="text-sm text-slate-500">Total Stock</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-50">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{lowStockCount}</p>
              <p className="text-sm text-slate-500">Low Stock Items</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50">
              <Package className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{medStockCount}</p>
              <p className="text-sm text-slate-500">Medium Stock</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 border border-slate-200">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search inventory..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none w-full"
          />
        </div>
        <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 border border-slate-200">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-transparent text-sm text-slate-700 outline-none"
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 border border-slate-200">
          <ArrowUpDown className="w-4 h-4 text-slate-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'stock-asc' | 'stock-desc')}
            className="bg-transparent text-sm text-slate-700 outline-none"
          >
            <option value="stock-asc">Stock: Low to High</option>
            <option value="stock-desc">Stock: High to Low</option>
            <option value="name">Name: A-Z</option>
          </select>
        </div>
      </div>

      {/* Inventory List */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="divide-y divide-slate-50">
          {filtered.map((product) => {
            const colors = getStockColor(product.stock);
            const percentage = (product.stock / maxStock) * 100;
            return (
              <div key={product.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/50 transition-colors">
                <img src={product.image} alt={product.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-slate-800 truncate">{product.name}</p>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                      {product.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`flex-1 h-2 rounded-full ${colors.bg} max-w-xs`}>
                      <div
                        className={`h-full rounded-full ${colors.bar} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className={`text-xs font-semibold ${colors.text} min-w-[60px]`}>
                      {product.stock} units
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {product.stock <= 10 && (
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${colors.badge}`}>
                      <AlertTriangle className="w-3 h-3" />
                      Low Stock
                    </span>
                  )}
                  {product.stock > 10 && product.stock <= 30 && (
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${colors.badge}`}>
                      Warning
                    </span>
                  )}
                  {product.stock > 30 && (
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${colors.badge}`}>
                      In Stock
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <Warehouse className="w-10 h-10 mb-2 opacity-40" />
            <p className="text-sm font-medium">No inventory items found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryPage;
