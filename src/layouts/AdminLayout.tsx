import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Menu, LayoutDashboard, Utensils, ClipboardList, Store, LogOut, X, BarChart3 } from 'lucide-react';

interface AdminLayoutProps {
  role: 'super-admin' | 'admin';
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ role }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const superAdminLinks = [
    { name: 'Restaurants', path: '/super-admin', icon: <Store className="w-5 h-5" /> },
  ];

  const adminLinks = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Menus',     path: '/admin/menus', icon: <Utensils className="w-5 h-5" /> },
    { name: 'Orders',    path: '/admin/orders', icon: <ClipboardList className="w-5 h-5" /> },
    { name: 'Analytics', path: '/admin/analytics', icon: <BarChart3 className="w-5 h-5" /> },
  ];

  const links = role === 'super-admin' ? superAdminLinks : adminLinks;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === '/admin' || path === '/super-admin') return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 flex flex-col h-full
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-black flex items-center justify-center text-white font-bold text-sm">E</div>
            <span className="text-lg font-bold text-gray-900 tracking-tight">Eaturia</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full uppercase tracking-wide">
              {role === 'super-admin' ? 'Super' : 'Admin'}
            </span>
            <button className="lg:hidden p-1 text-gray-400 hover:text-gray-900" onClick={() => setSidebarOpen(false)}>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setSidebarOpen(false)}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                ${isActive(link.path)
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}
              `}
            >
              {link.icon}
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Mobile top bar */}
        <header className="h-14 bg-white border-b border-gray-100 flex items-center px-4 sticky top-0 z-30 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="ml-3 font-semibold text-gray-900">Eaturia</span>
        </header>

        <div className="flex-1 overflow-y-auto p-5 md:p-8">
          <div className="max-w-6xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};
