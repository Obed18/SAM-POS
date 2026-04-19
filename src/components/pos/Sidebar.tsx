import React from 'react';
import useAppContext from '@/hooks/useAppContext';
import { PageType } from '@/types';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Warehouse,
  Users,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Zap,
  X,
} from 'lucide-react';

interface NavItem {
  id: PageType;
  label: string;
  icon: React.ElementType;
  roles?: string[];
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'pos', label: 'Point of Sale', icon: ShoppingCart },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'inventory', label: 'Inventory', icon: Warehouse },
  // { id: 'customers', label: 'Customers', icon: Users },
  { id: 'reports', label: 'Reports', icon: BarChart3, roles: ['admin']},
];

const Sidebar: React.FC = () => {
  const { sidebarOpen, toggleSidebar, currentPage, setCurrentPage, logout } = useAppContext();
  const { userRole } = useAppContext();
  
  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles) return true; // visible to all
    return item.roles.includes(userRole);
  });
  const handleNavClick = (page: PageType) => {
    setCurrentPage(page);
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 1024) {
      toggleSidebar();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-slate-900 text-white z-40 transition-all duration-300 ease-in-out flex flex-col
          ${sidebarOpen ? 'w-64 translate-x-0' : 'lg:w-20 -translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/25">
              <Zap className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && (
              <div className="overflow-hidden">
                <h1 className="text-lg font-bold tracking-tight">Mr. Sam POS</h1>
                <p className="text-[11px] text-slate-400 -mt-0.5">Point of Sale</p>
              </div>
            )}
          </div>
          {/* Close button on mobile */}
          {sidebarOpen && (
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {sidebarOpen && (
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-3 mb-2">Menu</p>
          )}
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
              </button>
            );
          })}
          {/* Separator */}
          {sidebarOpen && (
            <div className="pt-3 pb-1">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-3 mb-2">System</p>
            </div>
          )}
          {!sidebarOpen && <div className="pt-2" />}

          {/* Settings */}
          <button
            onClick={() => handleNavClick('settings')}
            title={!sidebarOpen ? 'Settings' : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
              currentPage === 'settings'
                ? 'bg-emerald-500/15 text-emerald-400'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Settings className={`w-5 h-5 flex-shrink-0 ${currentPage === 'settings' ? 'text-emerald-400' : 'group-hover:text-white'}`} />
            {sidebarOpen && (
              <span className="text-sm font-medium truncate">Settings</span>
            )}
            {currentPage === 'settings' && sidebarOpen && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400" />
            )}
          </button>
        </nav>

        {/* Collapse Toggle - Desktop only */}
        <div className="hidden lg:block px-3 pb-2">
          <button
            onClick={toggleSidebar}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all duration-200"
          >
            {sidebarOpen ? (
              <>
                <ChevronLeft className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">Collapse</span>
              </>
            ) : (
              <ChevronRight className="w-5 h-5 flex-shrink-0" />
            )}
          </button>
        </div>

        {/* Logout */}
        <div className="px-3 pb-4">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
