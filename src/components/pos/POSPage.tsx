import React, { useState, useEffect, useMemo } from 'react';
import BarcodeScanner from './BarcodeScanner';
import { useAppContext } from '@/contexts/AppContext';
import { categories } from '@/data/mockData';
import { payWithPaystack } from '@/services/paystack';
import { Sale } from '@/types';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle,
  ScanBarcode,
  X,
} from 'lucide-react';

const POSPage: React.FC = () => {
  const {
    productList,
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartSubtotal,
    cartTax,
    cartTotal,
    completeSale,
    showToast,
    setReceiptSale,
  } = useAppContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [scannedBarcode, setScannedBarcode] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'mobile'>('cash');
  const [amountReceived, setAmountReceived] = useState('');
  const [discount, setDiscount] = useState(0);
  const [showCheckout, setShowCheckout] = useState(false);
  const [saleComplete, setSaleComplete] = useState(false);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
  if (scanning) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "auto";
  }

  return () => {
    document.body.style.overflow = "auto";
  };
}, [scanning]);

  const filteredProducts = useMemo(() => {
    return productList.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.barcode.includes(searchQuery);
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [productList, searchQuery, selectedCategory]);

  const handleDetected = (code: string) => {
    setScannedBarcode(code);
    setSearchQuery(code);

    const result = productList.find(p => p.barcode === code);
    if (result) {
      if (result.stock <= 0) {
        showToast('error', `${result.name} is out of stock`);
      } else {
        addToCart(result);
        showToast('success', `Scanned and added ${result.name}`);
      }
    } else {
      showToast('info', `Barcode ${code} not found`);
    }
  };

  const finalTotal = cartTotal - discount;
  const change = paymentMethod === 'cash' ? Math.max(0, parseFloat(amountReceived || '0') - finalTotal) : 0;

  const finalizeSale = (reference?: string) => {
  const sale: Sale = {
    id: Date.now().toString(),
    items: cart,
    subtotal: cartSubtotal,
    tax: cartTax,
    total: finalTotal,
    paymentMethod,
    amountReceived: paymentMethod === 'cash' ? parseFloat(amountReceived) : finalTotal,
    change,
    reference: reference || null,
    createdAt: new Date(),
  };

  completeSale(sale);
  setReceiptSale(sale);

  clearCart();
  setSaleComplete(true);
  setShowCheckout(false);
  setAmountReceived('');
  setDiscount(0);

  showToast('success', 'Sale completed successfully!');
};

  const handlePaystackPayment = () => {
  if (cart.length === 0) {
    showToast('error', 'Cart is empty.');
    return;
  }

  payWithPaystack({
    email: 'customer@email.com', // 🔥 make dynamic later
    amount: finalTotal,

    onSuccess: (reference) => {
      finalizeSale(reference);
    },

    onClose: () => {
      showToast('info', 'Payment cancelled');
    },
  });
};


const handleCompleteSale = () => {
  if (cart.length === 0) {
    showToast('error', 'Cart is empty. Add items first.');
    return;
  }

  if (paymentMethod === 'cash') {
    const received = parseFloat(amountReceived || '0');
    if (received < finalTotal) {
      showToast('error', 'Insufficient amount received.');
      return;
    }
  }

  finalizeSale(); // no reference for cash
};
return (
    <div className="flex flex-col lg:flex-row gap-5 h-[calc(100vh-7rem)]">
      {/* LEFT: Product Grid */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1 flex items-center gap-2 bg-white rounded-xl px-4 py-3 border border-slate-200 shadow-sm">
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search products or scan barcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none w-full"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            )}
            <button
            onClick={() => setScanning(true)}
            className="text-slate-500 hover:text-emerald-600 transition-colors"
          >
            <ScanBarcode className="w-5 h-5" />
          </button>
          </div>

          <div className="flex-1 bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
            <p className="text-xs text-slate-500 mb-2">Scanned barcode</p>
            <input
              type="text"
              value={scannedBarcode}
              readOnly
              placeholder="Scanned barcode appears here"
              className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-sm"
            />
          </div>
        </div>

          {scanning && (
            <BarcodeScanner
              onDetected={(code) => {
                handleDetected(code);
                setScanning(false);
              }}
              onClose={() => setScanning(false)}
            />
          )}
        {/* Categories */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-slate-800 text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto pr-1">
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400">
              <Search className="w-10 h-10 mb-3 opacity-50" />
              <p className="text-sm font-medium">No products found</p>
              <p className="text-xs mt-1">Try a different search or category</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => {
                    if (product.stock <= 0) {
                      showToast('error', `${product.name} is out of stock`);
                      return;
                    }
                    addToCart(product);
                    showToast('success', `Added ${product.name} to cart`);
                  }}
                  className={`bg-white rounded-2xl border border-slate-100 p-3 text-left hover:shadow-lg hover:border-emerald-200 transition-all duration-200 group ${
                    product.stock <= 0 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <div className="aspect-square rounded-xl overflow-hidden bg-slate-50 mb-3">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <p className="text-sm font-semibold text-slate-800 truncate">{product.name}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-base font-bold text-emerald-600">${product.price.toFixed(2)}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      product.stock <= 10
                        ? 'bg-red-50 text-red-600'
                        : product.stock <= 30
                        ? 'bg-amber-50 text-amber-600'
                        : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      {product.stock} left
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Cart Panel */}
      <div className="w-full lg:w-96 flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Cart Header */}
        <div className="px-5 py-4 border-b border-slate-700 bg-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-slate-100" />
            <h3 className="text-base font-semibold text-slate-100">Current Order</h3>
            {cart.length > 0 && (
              <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {cart.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </div>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-red-500 hover:text-red-600 font-medium transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

{/* Cart Items */}
<div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0B1E3A]">
  {cart.length === 0 ? (
    <div className="flex flex-col items-center justify-center h-40 text-blue-200">
      <ShoppingCart className="w-10 h-10 mb-2 opacity-50 text-blue-300" />
      <p className="text-sm font-medium text-white">Cart is empty</p>
      <p className="text-xs mt-0.5 text-blue-300">
        Click products to add them
      </p>
    </div>
  ) : (
    cart.map((item) => (
      <div
        key={item.product.id}
        className="flex items-center gap-3 bg-[#132B50]/80 backdrop-blur-md rounded-xl p-3 group border border-blue-900/40 hover:border-blue-500/40 transition-all"
      >
        <img
          src={item.product.image}
          alt={item.product.name}
          className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-blue-800"
        />

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">
            {item.product.name}
          </p>
          <p className="text-xs text-blue-300">
            ${item.product.price.toFixed(2)} each
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
            className="w-7 h-7 rounded-lg bg-[#0F2547] border border-blue-800 flex items-center justify-center hover:bg-blue-600 transition-colors"
          >
            <Minus className="w-3 h-3 text-blue-200" />
          </button>

          <span className="w-8 text-center text-sm font-semibold text-white">
            {item.quantity}
          </span>

          <button
            onClick={() => {
              if (item.quantity < item.product.stock) {
                updateQuantity(item.product.id, item.quantity + 1);
              }
            }}
            className="w-7 h-7 rounded-lg bg-[#0F2547] border border-blue-800 flex items-center justify-center hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-3 h-3 text-blue-200" />
          </button>
        </div>

        <div className="text-right">
          <p className="text-sm font-semibold text-cyan-300">
            ${(item.product.price * item.quantity).toFixed(2)}
          </p>

          <button
            onClick={() => removeFromCart(item.product.id)}
            className="text-red-400 hover:text-red-500 transition-colors mt-0.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    ))
  )}
</div>
{/* Checkout Section */}
{cart.length > 0 && (
  <div className="border-t border-slate-700 bg-slate-900 p-5 space-y-4">
    {!showCheckout ? (
      <>
        {/* Summary */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-slate-400">
            <span>Subtotal</span>
            <span>${cartSubtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-400">
            <span>Tax (8%)</span>
            <span>${cartTax.toFixed(2)}</span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between text-sm text-emerald-400">
              <span>Discount</span>
              <span>-${discount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between text-lg font-bold text-white pt-2 border-t border-slate-700">
            <span>Total</span>
            <span>${finalTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Discount Input */}
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Discount ($)"
            value={discount || ''}
            onChange={(e) =>
              setDiscount(Math.max(0, parseFloat(e.target.value) || 0))
            }
            className="flex-1 px-3 py-2 rounded-lg border border-slate-600 text-sm bg-slate-800 text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        {/* KEEP BUTTON SAME */}
        <button
          onClick={() => setShowCheckout(true)}
          className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-500/25 text-sm"
        >
          Proceed to Checkout
        </button>
      </>
    ) : (
      <>
        {/* Payment Method */}
        <div>
          <p className="text-sm font-medium text-slate-200 mb-2">
            Payment Method
          </p>

          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'cash' as const, label: 'Cash', icon: Banknote },
              { id: 'card' as const, label: 'Card', icon: CreditCard },
              { id: 'mobile' as const, label: 'Mobile', icon: Smartphone },
            ].map((method) => {
              const Icon = method.icon;
              return (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-sm font-medium ${
                    paymentMethod === method.id
                      ? 'border-emerald-500 bg-emerald-900/30 text-emerald-400'
                      : 'border-slate-600 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {method.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Cash Input */}
        {paymentMethod === 'cash' && (
          <div>
            <p className="text-sm font-medium text-slate-200 mb-1.5">
              Amount Received
            </p>

            <input
              type="number"
              placeholder="0.00"
              value={amountReceived}
              onChange={(e) => setAmountReceived(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-600 text-lg font-bold text-white bg-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />

            {parseFloat(amountReceived || '0') >= finalTotal && (
              <p className="text-sm text-emerald-400 font-medium mt-1.5">
                Change: ${change.toFixed(2)}
              </p>
            )}
          </div>
        )}

        {/* Total */}
        <div className="bg-slate-800 text-white rounded-xl p-4 text-center border border-slate-700">
          <p className="text-xs text-slate-400 mb-1">Total Amount</p>
          <p className="text-2xl font-bold">${finalTotal.toFixed(2)}</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowCheckout(false)}
            className="flex-1 py-3 bg-slate-700 text-slate-200 font-medium rounded-xl hover:bg-slate-600 transition-colors text-sm"
          >
            Back
          </button>

          {/* KEEP BUTTON SAME */}

          
  {paymentMethod === 'cash' ? (
    <button
      onClick={handleCompleteSale}
      disabled={saleComplete}
      className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-xl"
    >
      Complete Sale
    </button>
  ) : (
    <button
      onClick={handlePaystackPayment}
      className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
    >
      <CreditCard className="w-4 h-4" />
      Proceed to Pay
    </button>
  )}
</div>      
      </>
    )}
  </div>
)}
      </div>
    </div>
  );
};

export default POSPage;
