import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import Modal from './Modal';
import { Printer, Download, Zap } from 'lucide-react';

const ReceiptModal: React.FC = () => {
  const { receiptSale, setReceiptSale } = useAppContext();

  if (!receiptSale) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={!!receiptSale} onClose={() => setReceiptSale(null)} title="Receipt" size="sm">
      <div className="space-y-4">
        {/* Store Header */}
        <div className="text-center pb-4 border-b border-dashed border-slate-200">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 mb-2">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">SwiftPOS</h3>
          <p className="text-xs text-slate-400">123 Commerce Street, Suite 100</p>
          <p className="text-xs text-slate-400">Tel: (555) 123-4567</p>
        </div>

        {/* Receipt Info */}
        <div className="flex justify-between text-xs text-slate-500">
          <span>Receipt #{receiptSale.id.toUpperCase()}</span>
          <span>{receiptSale.date} {receiptSale.time}</span>
        </div>

        {/* Items */}
        <div className="space-y-2 py-3 border-y border-dashed border-slate-200">
          {receiptSale.items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <div className="flex-1">
                <span className="text-slate-700">{item.product.name}</span>
                <span className="text-slate-400 ml-2">x{item.quantity}</span>
              </div>
              <span className="text-slate-700 font-medium">
                ${(item.product.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-sm text-slate-500">
            <span>Subtotal</span>
            <span>${receiptSale.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-500">
            <span>Tax (8%)</span>
            <span>${receiptSale.tax.toFixed(2)}</span>
          </div>
          {receiptSale.discount > 0 && (
            <div className="flex justify-between text-sm text-emerald-600">
              <span>Discount</span>
              <span>-${receiptSale.discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-bold text-slate-800 pt-2 border-t border-slate-200">
            <span>Total</span>
            <span>${receiptSale.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-slate-50 rounded-xl p-3 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Payment Method</span>
            <span className="text-slate-700 font-medium capitalize">{receiptSale.paymentMethod}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Amount Received</span>
            <span className="text-slate-700 font-medium">${receiptSale.amountReceived.toFixed(2)}</span>
          </div>
          {receiptSale.change > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Change</span>
              <span className="text-emerald-600 font-medium">${receiptSale.change.toFixed(2)}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center pt-2 border-t border-dashed border-slate-200">
          <p className="text-xs text-slate-400">Thank you for your purchase!</p>
          <p className="text-xs text-slate-400">Visit us again</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-900 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button
            onClick={() => setReceiptSale(null)}
            className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ReceiptModal;
