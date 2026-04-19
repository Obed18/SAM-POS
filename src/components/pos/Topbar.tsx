import React, { useState, useRef, useEffect } from 'react';
import useAppContext from '@/hooks/useAppContext';
import { Bell, Search, Menu, User, ChevronDown, Settings, HelpCircle, Database } from 'lucide-react';


const pageTitles: Record<string, string> = {
  dashboard: 'Dashboard',
  pos: 'Point of Sale',
  products: 'Products',
  inventory: 'Inventory',
  customers: 'Customers',
  reports: 'Reports',
  settings: 'Settings',
};

const pageDescriptions: Record<string, string> = {
  dashboard: 'Overview of your store performance',
  pos: 'Process sales and manage orders',
  products: 'Manage your product catalog',
  inventory: 'Monitor stock levels',
  customers: 'Manage customer relationships',
  reports: 'Analytics and insights',
  settings: 'Data persistence & preferences',
};

const Topbar: React.FC = () => {
  const { currentPage, sidebarOpen, toggleSidebar, userEmail, logout, setCurrentPage } = useAppContext();
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const { userRole } = useAppContext();
  

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-500 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-lg font-semibold text-slate-800">{pageTitles[currentPage] || 'Dashboard'}</h2>
          <p className="text-xs text-slate-400 hidden sm:block">{pageDescriptions[currentPage] || ''}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-slate-50 rounded-xl px-3.5 py-2 border border-slate-200/80 w-56 lg:w-64 focus-within:border-emerald-300 focus-within:ring-2 focus-within:ring-emerald-500/10 transition-all">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-sm text-slate-600 placeholder-slate-400 outline-none w-full"
          />
          <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-100 rounded border border-slate-200">
            /
          </kbd>
        </div>

        {/* Persistence indicator */}
        <button
          onClick={() => setCurrentPage('settings')}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors"
          title="Data is being persisted to localStorage"
        >
          <Database className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-[11px] font-medium text-emerald-700">Synced</span>
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setShowNotifs(!showNotifs); setShowProfile(false); }}
            className="relative p-2.5 rounded-xl hover:bg-slate-100 transition-colors text-slate-500"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
          </button>
          {showNotifs && (
            <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden animate-in slide-in-from-top-2">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-800">Notifications</h4>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-600">3 new</span>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {[
                  { text: 'Low stock alert: Almond Butter (8 units)', time: '2m ago', dot: 'bg-red-500' },
                  { text: 'New sale completed: $35.90', time: '15m ago', dot: 'bg-emerald-500' },
                  { text: 'New customer: Daniel Brown', time: '1h ago', dot: 'bg-blue-500' },
                  { text: 'Ribeye Steak stock below 20 units', time: '2h ago', dot: 'bg-amber-500' },
                ].map((n, i) => (
                  <div key={i} className="px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-50 last:border-0">
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.dot}`} />
                      <div>
                        <p className="text-sm text-slate-700">{n.text}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{n.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2.5 border-t border-slate-100">
                <button className="text-xs text-emerald-600 hover:text-emerald-700 font-medium transition-colors w-full text-center">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-slate-200 hidden sm:block" />

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => { setShowProfile(!showProfile); setShowNotifs(false); }}
            className="flex items-center gap-2.5 pl-2 pr-2 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center ring-2 ring-emerald-100">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-slate-700 leading-tight">{userRole.charAt(0).toUpperCase() + userRole.slice(1)}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>
          {showProfile && (
            <div className="absolute right-0 top-12 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden animate-in slide-in-from-top-2">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-800">{userRole.charAt(0).toUpperCase() + userRole.slice(1)}</p>
                <p className="text-xs text-slate-400 mt-0.5">{userEmail}</p>
              </div>
              <div className="py-1">
                <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                  <User className="w-4 h-4 text-slate-400" />
                  Profile
                </button>
                <button
                  onClick={() => { setCurrentPage('settings'); setShowProfile(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  Settings
                </button>
                <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                  <HelpCircle className="w-4 h-4 text-slate-400" />
                  Help Center
                </button>
              </div>
              <div className="border-t border-slate-100 py-1">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
