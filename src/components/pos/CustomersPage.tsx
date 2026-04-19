import React, { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { purchaseHistory } from '@/data/mockData';
import { Customer } from '@/types';
import Modal from './Modal';
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  ShoppingBag,
  DollarSign,
  Calendar,
  CreditCard,
  Banknote,
  Smartphone,
  ChevronRight,
  X,
} from 'lucide-react';

const paymentIcons = {
  cash: Banknote,
  card: CreditCard,
  mobile: Smartphone,
};

const CustomersPage: React.FC = () => {
  const { customerList, addCustomer, showToast } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '' });

  const filtered = customerList.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddCustomer = () => {
    if (!newCustomer.name || !newCustomer.email) {
      showToast('error', 'Name and email are required');
      return;
    }
    const customer: Customer = {
      id: `c${Date.now()}`,
      name: newCustomer.name,
      email: newCustomer.email,
      phone: newCustomer.phone,
      totalSpent: 0,
      totalOrders: 0,
      joinDate: new Date().toISOString().split('T')[0],
    };
    addCustomer(customer);
    showToast('success', 'Customer added successfully');
    setShowAddModal(false);
    setNewCustomer({ name: '', email: '', phone: '' });
  };

  const customerHistory = selectedCustomer
    ? purchaseHistory.filter(h => h.customerId === selectedCustomer.id)
    : [];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Customers</h1>
          <p className="text-sm text-slate-500 mt-0.5">{customerList.length} registered customers</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-500/25 text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Customer
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 border border-slate-200 max-w-md">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search customers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none w-full"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')}>
            <X className="w-4 h-4 text-slate-400" />
          </button>
        )}
      </div>

      {/* Customer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((customer) => (
          <div
            key={customer.id}
            onClick={() => setSelectedCustomer(customer)}
            className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg hover:border-emerald-200 transition-all duration-200 cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-semibold text-sm">
                  {customer.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{customer.name}</p>
                  <p className="text-xs text-slate-400">Since {customer.joinDate}</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition-colors" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Mail className="w-3.5 h-3.5" />
                <span>{customer.email}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Phone className="w-3.5 h-3.5" />
                <span>{customer.phone}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-xs font-semibold text-slate-700">${customer.totalSpent.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-xs font-semibold text-slate-700">{customer.totalOrders} orders</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <Users className="w-12 h-12 mb-3 opacity-40" />
          <p className="text-sm font-medium">No customers found</p>
        </div>
      )}

      {/* Add Customer Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Customer" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
            <input
              type="text"
              value={newCustomer.name}
              onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
            <input
              type="email"
              value={newCustomer.email}
              onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              placeholder="john@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
            <input
              type="tel"
              value={newCustomer.phone}
              onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              placeholder="+1 555-0100"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowAddModal(false)}
              className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleAddCustomer}
              className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all text-sm"
            >
              Add Customer
            </button>
          </div>
        </div>
      </Modal>

      {/* Customer Detail Modal */}
      <Modal
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        title={selectedCustomer?.name || ''}
        size="lg"
      >
        {selectedCustomer && (
          <div className="space-y-5">
            {/* Customer Info */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-bold text-lg">
                {selectedCustomer.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <p className="text-lg font-bold text-slate-800">{selectedCustomer.name}</p>
                <div className="flex items-center gap-4 mt-1">
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <Mail className="w-3 h-3" /> {selectedCustomer.email}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <Phone className="w-3 h-3" /> {selectedCustomer.phone}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-slate-800">${selectedCustomer.totalSpent.toFixed(2)}</p>
                <p className="text-xs text-slate-500">Total Spent</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-slate-800">{selectedCustomer.totalOrders}</p>
                <p className="text-xs text-slate-500">Orders</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-slate-800">{selectedCustomer.joinDate}</p>
                <p className="text-xs text-slate-500">Member Since</p>
              </div>
            </div>

            {/* Purchase History */}
            <div>
              <h4 className="text-sm font-semibold text-slate-800 mb-3">Purchase History</h4>
              {customerHistory.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-6">No purchase history</p>
              ) : (
                <div className="space-y-2">
                  {customerHistory.map((h) => {
                    const PayIcon = paymentIcons[h.paymentMethod];
                    return (
                      <div key={h.id} className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
                        <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                          <PayIcon className="w-4 h-4 text-slate-500" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span className="text-xs text-slate-500">{h.date}</span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">{h.items} items &middot; {h.paymentMethod}</p>
                        </div>
                        <p className="text-sm font-semibold text-slate-800">${h.total.toFixed(2)}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CustomersPage;
