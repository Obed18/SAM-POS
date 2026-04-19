import React from 'react';
import useAppContext from '@/hooks/useAppContext';
import Sidebar from './pos/Sidebar';
import Topbar from './pos/Topbar';
import ToastContainer from './pos/ToastContainer';
import ReceiptModal from './pos/ReceiptModal';
import LoginPage from './pos/LoginPage';
import DashboardPage from './pos/DashboardPage';
import POSPage from './pos/POSPage';
import ProductsPage from './pos/ProductsPage';
import InventoryPage from './pos/InventoryPage';
import CustomersPage from './pos/CustomersPage';
import ReportsPage from './pos/ReportsPage';
import SettingsPage from './pos/SettingsPage';

const AppLayout: React.FC = () => {
  const { isAuthenticated, currentPage, sidebarOpen } = useAppContext();

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <LoginPage />
        <ToastContainer />
      </>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'pos':
        return <POSPage />;
      case 'products':
        return <ProductsPage />;
      case 'inventory':
        return <InventoryPage />;
      case 'customers':
        return <CustomersPage />;
      case 'reports':
        return <ReportsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div
        className={`min-h-screen transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
        }`}
      >
        {/* Topbar */}
        <Topbar />

        {/* Page Content */}
        <main className="p-4 lg:p-6">
          {renderPage()}
        </main>
      </div>

      {/* Global Overlays */}
      <ToastContainer />
      <ReceiptModal />
    </div>
  );
};

export default AppLayout;
