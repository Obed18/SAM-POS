import React, { useState, useMemo, useRef, useEffect } from 'react';
import useAppContext from '@/hooks/useAppContext';
import Modal from './Modal';
import {
  getStorageSize,
  formatStorageSize,
  getStorageKeys,
  exportStorageData,
  importStorageData,
  getLastModified,
} from '@/hooks/useLocalStorage';
import { getProducts, getCustomers, getSales, resetAllDatabaseData } from '@/services/dataService';
import { Product, Customer, Sale } from '@/types';
import {
  Settings,
  Database,
  HardDrive,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Package,
  Users,
  ShoppingCart,
  Receipt,
  AlertTriangle,
  CheckCircle,
  Info,
  FileJson,
  Loader2,
} from 'lucide-react';


const SettingsPage: React.FC = () => {
  const {
    productList: localProducts,
    customerList: localCustomers,
    salesList: localSales,
    cart,
    resetAllData,
    showToast,
  } = useAppContext();

  const [showResetModal, setShowResetModal] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [dbCustomers, setDbCustomers] = useState<Customer[]>([]);
  const [dbSales, setDbSales] = useState<Sale[]>([]);
  const [isLoadingDb, setIsLoadingDb] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [isDatabaseConnected, setIsDatabaseConnected] = useState(false);

  useEffect(() => {
    const fetchDbData = async () => {
      setIsLoadingDb(true);
      setDbError(null);
      try {
        const [products, customers, sales] = await Promise.all([
          getProducts(),
          getCustomers(),
          getSales(),
        ]);
        setDbProducts(products);
        setDbCustomers(customers);
        setDbSales(sales);
        setIsDatabaseConnected(true);
      } catch (err) {
        console.error('Failed to fetch database data:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to connect to database';
        setDbError(errorMessage);
        setIsDatabaseConnected(false);
      } finally {
        setIsLoadingDb(false);
      }
    };
    fetchDbData();
  }, []);

  const dbProductCount = dbProducts.length;
  const dbCustomerCount = dbCustomers.length;
  const dbSalesCount = dbSales.length;

  // Compute storage metrics
  const storageSize = useMemo(() => getStorageSize(), []);
  const storageKeys = useMemo(() => getStorageKeys(), []);
  const lastModified = useMemo(() => getLastModified(), []);
  const formattedSize = formatStorageSize(storageSize);

  // Storage capacity estimate (5MB typical localStorage limit)
  const maxStorage = 5 * 1024 * 1024;
  const usagePercent = Math.min((storageSize / maxStorage) * 100, 100);

  const dataStats = [
    {
      label: 'Products',
      count: dbProductCount,
      icon: Package,
      color: 'text-blue-500',
      bg: 'bg-blue-50',
      source: 'database',
    },
    {
      label: 'Customers',
      count: dbCustomerCount,
      icon: Users,
      color: 'text-violet-500',
      bg: 'bg-violet-50',
      source: 'database',
    },
    {
      label: 'Sales Records',
      count: dbSalesCount,
      icon: Receipt,
      color: 'text-emerald-500',
      bg: 'bg-emerald-50',
      source: 'database',
    },
    {
      label: 'Cart Items',
      count: cart.length,
      icon: ShoppingCart,
      color: 'text-amber-500',
      bg: 'bg-amber-50',
      source: 'local',
    },
  ];

  // ─── Handlers ───

  const handleReset = async () => {
    if (resetConfirmText !== 'RESET') {
      showToast('error', 'Please type RESET to confirm');
      return;
    }
    setIsResetting(true);
    try {
      if (isDatabaseConnected) {
        await resetAllDatabaseData();
        setDbProducts([]);
        setDbCustomers([]);
        setDbSales([]);
      }
      resetAllData();
      showToast('success', 'All data has been reset to defaults');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset database data';
      showToast('error', errorMessage);
      resetAllData();
    }
    setIsResetting(false);
    setShowResetModal(false);
    setResetConfirmText('');
  };

  const handleExport = () => {
    try {
      const data = exportStorageData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `swiftpos-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('success', 'Data exported successfully');
    } catch {
      showToast('error', 'Failed to export data');
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      if (content) {
        const success = importStorageData(content);
        if (success) {
          showToast('success', 'Data imported successfully. Refreshing...');
          setTimeout(() => window.location.reload(), 1200);
        } else {
          showToast('error', 'Failed to import data. Invalid file format.');
        }
      }
    };
    reader.readAsText(file);
    // Reset input so the same file can be re-selected
    e.target.value = '';
  };




  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Manage data persistence, storage, and application preferences
        </p>
      </div>

      {/* Database Status Banner */}
      <div className={`rounded-2xl p-5 flex items-start gap-4 ${
        isDatabaseConnected && !dbError
          ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200'
          : 'bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200'
      }`}>
        <div className={`p-2.5 rounded-xl flex-shrink-0 ${
          isDatabaseConnected && !dbError ? 'bg-emerald-100' : 'bg-amber-100'
        }`}>
          {isLoadingDb ? (
            <Loader2 className="w-5 h-5 text-amber-600 animate-spin" />
          ) : isDatabaseConnected && !dbError ? (
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          ) : (
            <ShieldAlert className="w-5 h-5 text-amber-600" />
          )}
        </div>
        <div className="flex-1">
          <h3 className={`text-sm font-semibold ${
            isDatabaseConnected && !dbError ? 'text-emerald-800' : 'text-amber-800'
          }`}>
            {isLoadingDb
              ? 'Connecting to Database...'
              : isDatabaseConnected && !dbError
              ? 'Database Connected'
              : 'Database Connection Issue'}
          </h3>
          <p className={`text-xs mt-1 leading-relaxed ${
            isDatabaseConnected && !dbError ? 'text-emerald-600' : 'text-amber-600'
          }`}>
            {isLoadingDb
              ? 'Establishing connection to Supabase database...'
              : isDatabaseConnected && !dbError
              ? 'All data (products, customers, sales) is stored in the cloud database and synced in real-time. Data persists across devices and browsers.'
              : `Failed to connect: ${dbError || 'Unknown error'}. Data is being loaded from localStorage as fallback.`}
          </p>
          {isDatabaseConnected && !dbError && lastModified && (
            <div className="flex items-center gap-1.5 mt-2">
              <Clock className="w-3 h-3 text-emerald-500" />
              <span className="text-[11px] text-emerald-500 font-medium">
                Last synced: {new Date(lastModified).toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Data Overview Cards */}
      <div>
        <h2 className="text-base font-semibold text-slate-800 mb-3">
          Database Overview
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {dataStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-white rounded-2xl border border-slate-100 p-4 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${stat.bg}`}>
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-slate-800">
                      {stat.count}
                    </p>
                    <p className="text-xs text-slate-500">{stat.label}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Storage Usage */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-slate-100">
            <HardDrive className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-800">
              Storage Usage
            </h2>
            <p className="text-xs text-slate-400">
              Browser localStorage capacity
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Used</span>
            <span className="font-semibold text-slate-800">
              {formattedSize}
            </span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                usagePercent > 80
                  ? 'bg-red-500'
                  : usagePercent > 50
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.max(usagePercent, 1)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{storageKeys.length} storage keys</span>
            <span>~5 MB limit</span>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-slate-100">
            <Database className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-800">
              Data Management
            </h2>
            <p className="text-xs text-slate-400">
              Export, import, or reset your data
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Export */}
          <button
            onClick={handleExport}
            className="flex items-center gap-3 p-4 rounded-xl border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200 text-left group"
          >
            <div className="p-2 rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors">
              <Download className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Export Data</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Download as JSON backup
              </p>
            </div>
          </button>

          {/* Import */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-3 p-4 rounded-xl border-2 border-slate-200 hover:border-violet-300 hover:bg-violet-50/50 transition-all duration-200 text-left group"
          >
            <div className="p-2 rounded-lg bg-violet-50 group-hover:bg-violet-100 transition-colors">
              <Upload className="w-4 h-4 text-violet-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Import Data</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Restore from JSON file
              </p>
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />

          {/* Reset */}
          <button
            onClick={() => setShowResetModal(true)}
            className="flex items-center gap-3 p-4 rounded-xl border-2 border-slate-200 hover:border-red-300 hover:bg-red-50/50 transition-all duration-200 text-left group"
          >
            <div className="p-2 rounded-lg bg-red-50 group-hover:bg-red-100 transition-colors">
              <RefreshCw className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Reset Data</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Restore factory defaults
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Database Tables Detail */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-slate-100">
            <FileJson className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-800">
              Database Tables
            </h2>
            <p className="text-xs text-slate-400">
              Supabase database tables
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {[
            { table: 'public.products', label: 'Products Catalog', icon: Package, count: dbProductCount },
            { table: 'public.customers', label: 'Customer Records', icon: Users, count: dbCustomerCount },
            { table: 'public.sales', label: 'Sales History', icon: Receipt, count: dbSalesCount },
            { table: 'localStorage', label: 'Active Cart (Session)', icon: ShoppingCart, count: cart.length, source: 'local' },
          ].map((item) => {
            const Icon = item.icon;
            const isConnected = isDatabaseConnected && !dbError;
            const hasData = isConnected ? item.count > 0 : localStorage.getItem(item.table || '') !== null;
            return (
              <div
                key={item.table}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-colors"
              >
                <Icon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700">
                    {item.label}
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono truncate">
                    {item.table}
                  </p>
                </div>
                <span className="text-xs font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                  {item.count} records
                </span>
                <div className="flex items-center gap-1">
                  {(item.source === 'local' || isConnected) && hasData ? (
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Info className="w-4 h-4 text-slate-300" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-semibold text-blue-800">
            About Database Storage
          </h4>
          <p className="text-xs text-blue-600 mt-1 leading-relaxed">
            Data is stored in Supabase (PostgreSQL) cloud database. Your data is accessible
            from any device with internet connection. Cart items are stored locally
            per browser session. Use Export to create local backups.
          </p>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={showResetModal}
        onClose={() => {
          setShowResetModal(false);
          setResetConfirmText('');
        }}
        title="Reset All Data"
        size="md"
      >
        <div className="space-y-5">
          {/* Warning */}
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">
              Are you absolutely sure?
            </h3>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed max-w-sm">
              This will permanently delete all your data and restore factory
              defaults. This includes all products, customers, sales history, and
              cart items.
            </p>
          </div>

          {/* What will be deleted */}
          <div className="bg-red-50 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-red-700 uppercase tracking-wider">
              Data to be reset:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                `${dbProductCount} products (database)`,
                `${dbCustomerCount} customers (database)`,
                `${dbSalesCount} sales (database)`,
                `${cart.length} cart items (local)`,
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-1.5 text-xs text-red-600"
                >
                  <Trash2 className="w-3 h-3" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Confirmation Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Type <span className="font-bold text-red-600">RESET</span> to
              confirm
            </label>
            <input
              type="text"
              value={resetConfirmText}
              onChange={(e) => setResetConfirmText(e.target.value)}
              placeholder="Type RESET here..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-all font-mono tracking-wider"
              autoComplete="off"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowResetModal(false);
                setResetConfirmText('');
              }}
              className="flex-1 py-3 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleReset}
              disabled={resetConfirmText !== 'RESET' || isResetting}
              className="flex-1 py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isResetting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Reset All Data
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SettingsPage;
