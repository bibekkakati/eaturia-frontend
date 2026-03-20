import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { ShoppingBag } from 'lucide-react';

export const PublicLayout: React.FC = () => {
  const { getTotalItems, restaurantId } = useCart();
  const cartItemCount = getTotalItems();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleCartClick = () => {
    if (cartItemCount > 0 && restaurantId) {
      navigate(`/m/${restaurantId}?checkout=true`);
    } else {
      showToast('Your cart is empty', 'info');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center text-white font-bold text-sm">
              E
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">Eaturia</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link 
              to="/login"
              className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100"
            >
              Restaurant Login
            </Link>

            <div className="relative">
              <button
                onClick={handleCartClick}
                className="p-2 text-gray-600 hover:text-gray-900 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-gray-900"
                aria-label="View cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-black text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {cartItemCount > 9 ? '9+' : cartItemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      <footer className="border-t border-gray-100 py-8 bg-white">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between text-sm text-gray-400">
          <span className="font-medium text-gray-900">Eaturia</span>
          <span>© {new Date().getFullYear()} All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
};
