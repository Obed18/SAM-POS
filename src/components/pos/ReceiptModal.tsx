import React from 'react';
import useAppContext from '@/hooks/useAppContext';
import Modal from './Modal';
import { Printer, Zap } from 'lucide-react';

const ReceiptModal: React.FC = () => {
  const { receiptSale, setReceiptSale } = useAppContext();

  if (!receiptSale) return null;

  const handlePrint = () => {
    const printContent = document.querySelector('.receipt-container')?.innerHTML;
    if (!printContent) return;

    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${receiptSale.id.toUpperCase()}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
              font-size: 14px;
              line-height: 1.5;
              color: #1e293b;
              padding: 20px;
              max-width: 300px;
              margin: 0 auto;
            }
            .text-center { text-align: center; }
            .border-b { border-bottom: 1px solid #e2e8f0; }
            .pb-4 { padding-bottom: 1rem; }
            .mb-1 { margin-bottom: 0.25rem; }
            .mb-4 { margin-bottom: 1rem; }
            .flex { display: flex; }
            .items-center { align-items: center; }
            .justify-between { justify-content: space-between; }
            .gap-2 { gap: 0.5rem; }
            .text-xs { font-size: 0.75rem; }
            .text-sm { font-size: 0.875rem; }
            .text-lg { font-size: 1.125rem; }
            .font-semibold { font-weight: 600; }
            .font-medium { font-weight: 500; }
            .font-bold { font-weight: 700; }
            .tracking-wide { letter-spacing: 0.025em; }
            .text-slate-400 { color: #94a3b8; }
            .text-slate-500 { color: #64748b; }
            .text-slate-800 { color: #1e293b; }
            .text-emerald-600 { color: #059669; }
            .border-y { border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; }
            .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
            .border-t { border-top: 1px solid #e2e8f0; }
            .pt-2 { padding-top: 0.5rem; }
            .pt-3 { padding-top: 0.75rem; }
            .mt-2 { margin-top: 0.5rem; }
            .space-y-2 > * + * { margin-top: 0.5rem; }
            .space-y-1 > * + * { margin-top: 0.25rem; }
            .flex-1 { flex: 1; }
            .w-5 { width: 1.25rem; }
            .h-5 { height: 1.25rem; }
            .uppercase { text-transform: uppercase; }
            .capitalize { text-transform: capitalize; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>${printContent}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };
      const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
  }).format(amount);


  return (
    <Modal isOpen={!!receiptSale} onClose={() => setReceiptSale(null)} title="Receipt" size="sm">
      
      <div className="receipt-container bg-white text-slate-800 p-5 rounded-xl shadow-sm font-mono text-sm print:shadow-none print:p-0">
        
        {/* Header */}
        <div className="text-center border-b pb-4 mb-4">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Zap className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-semibold tracking-wide">Mr. Sam POS</h2>
          </div>
          <p className="text-xs text-slate-500">Ayeduase, Kumasi - Ghana</p>
          <p className="text-xs text-slate-500">Tel: (+233) 123-4567</p>
        </div>

        {/* Receipt Info */}
        <div className="flex justify-between text-xs text-slate-500 mb-4">
          <span>Receipt #{receiptSale.id.toUpperCase()}</span>
          <span>{receiptSale.createdAt.toLocaleDateString()} {receiptSale.createdAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
        </div>

        {/* Items */}
        <div className="space-y-2 border-y py-3 mb-4">
          {receiptSale.items.map((item, i) => (
            <div key={i} className="flex justify-between">
              <div className="flex-1">
                <p className="text-slate-800">
                  {item.product.name}
                  <span className="text-slate-400 ml-1">x{item.quantity}</span>
                </p>
              </div>
              <p className="font-medium">
                {formatCurrency(item.product.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="space-y-1 mb-4">
          <div className="flex justify-between text-slate-500">
            <span>Subtotal</span>
            <span>{formatCurrency(receiptSale.total)}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Tax (8%)</span>
            <span>{formatCurrency(receiptSale.tax)}</span>
          </div>

          {receiptSale.discount > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>Discount</span>
              <span>-{formatCurrency(receiptSale.discount)}</span>
            </div>
          )}

          <div className="flex justify-between font-bold border-t pt-2 mt-2">
            <span>Total</span>
            <span>{formatCurrency(receiptSale.total)}</span>
          </div>
        </div>

        {/* Payment */}
        <div className="border rounded-lg p-3 bg-slate-50 mb-4 space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-500">Payment</span>
            <span className="capitalize font-medium">{receiptSale.paymentMethod}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Received</span>
            <span>{formatCurrency(receiptSale.amountReceived)}</span>
          </div>
          {receiptSale.change > 0 && (
            <div className="flex justify-between">
              <span className="text-slate-500">Change</span>
              <span className="text-emerald-600">
                {formatCurrency(receiptSale.change)}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center border-t pt-3">
          <p className="text-xs text-slate-500">Thank you for your purchase</p>
          <p className="text-xs text-slate-400">Please come again</p>
        </div>

        {/* Actions (Hidden in Print) */}
        <div className="flex gap-3 mt-5 print:hidden">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-900 text-white rounded-lg text-sm hover:bg-black"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>

          <button
            onClick={() => setReceiptSale(null)}
            className="flex-1 py-2.5 bg-slate-200 text-slate-800 rounded-lg text-sm hover:bg-slate-300"
          >
            Close
          </button>
        </div>
      </div>

    </Modal>
  );
};

export default ReceiptModal;