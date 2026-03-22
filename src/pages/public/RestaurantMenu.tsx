import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router';
import { api } from '../../../api';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Loader } from '../../components/ui/Loader';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Plus, Minus, ArrowRight } from 'lucide-react';

/** Public-facing menu for customers to browse items and place digital orders. */
export const RestaurantMenu: React.FC = () => {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { cart, addToCart, updateQuantity, getTotalItems, clearCart } = useCart();
  const { showToast } = useToast();

  const [menu, setMenu] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Checkout modal state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Fetches the active menu for the given restaurant
    const fetchMenu = async () => {
      if (!restaurantId) return;
      try {
        const res = await api.public.getRestaurantMenu(restaurantId);
        setMenu(res.data);
      } catch (err) {
        showToast('Failed to load menu. It might not be active.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, [restaurantId, showToast]);

  useEffect(() => {
    if (searchParams.get('checkout') === 'true' && !loading && menu) {
      if (getTotalItems() > 0) {
        setIsCheckoutOpen(true);
      }
      // Remove the parameter from URL without page reload
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('checkout');
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, loading, menu, getTotalItems, setSearchParams]);

  // Submits the customer's cart as a new order
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      showToast('Please enter your name.', 'error');
      return;
    }
    if (!restaurantId || !menu?._id) return;

    setSubmitting(true);
    try {
      const res = await api.public.createOrder({
        customerName,
        customerPhone,
        tableNumber,
        restaurantId,
        menuId: menu._id,
        cart
      });
      showToast('Order placed successfully!', 'success');
      clearCart();
      setIsCheckoutOpen(false);
      navigate(`/order/${res.data?._id}`);
    } catch (err: any) {
      showToast(err.message || 'Failed to place order.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Calculates the current subtotal of all items in the cart
  const calculateTotal = () => {
    if (!menu?.menuItems) return 0;
    let total = 0;
    Object.entries(cart).forEach(([itemId, qty]) => {
      const item = menu.menuItems.find((i: any) => i._id === itemId);
      if (item) {
        total += parseFloat(item.price) * qty;
      }
    });
    return total;
  };

  if (loading) return <Loader fullScreen />;
  if (!menu) return <div className="text-center py-20 text-gray-500">Menu not found or not active.</div>;

  const total = calculateTotal();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 relative">
      {/* Restaurant Header */}
      <div className="mb-10 text-center animate-fade-in">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{menu.name}</h1>
        <p className="text-gray-500">Order from our exquisite selection.</p>
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
        {menu.menuItems?.map((item: any) => {
          const qty = cart[item._id] || 0;
          return (
            <Card key={item._id} className="flex flex-col">
              <div className="flex-1 mb-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-base font-semibold text-gray-900">{item.name}</h3>
                  <span className="text-gray-900 font-bold">₹{parseFloat(item.price).toFixed(2)}</span>
                </div>
                {item.description && <p className="text-gray-500 text-sm line-clamp-2">{item.description}</p>}
              </div>

              <div className="mt-auto border-t border-gray-100 pt-4">
                {qty === 0 ? (
                  <Button 
                    fullWidth 
                    variant="outline" 
                    onClick={() => {
                        if (restaurantId && menu._id) {
                            addToCart(restaurantId, menu._id, item._id, 1);
                        }
                    }}
                  >
                    <Plus className="w-4 h-4" /> Add to Order
                  </Button>
                ) : (
                  <div className="flex items-center justify-between bg-gray-100 rounded-xl p-1">
                    <button 
                      className="p-2 text-gray-900 hover:bg-white rounded-lg transition-colors"
                      onClick={() => updateQuantity(item._id, qty - 1)}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-bold w-8 text-center text-gray-900">{qty}</span>
                    <button 
                      className="p-2 text-gray-900 hover:bg-white rounded-lg transition-colors"
                      onClick={() => updateQuantity(item._id, qty + 1)}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Floating Checkout Bar */}
      {getTotalItems() > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 z-40">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white border border-gray-200 rounded-2xl flex items-center justify-between p-4 shadow-xl">
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">{getTotalItems()} items in cart</span>
                <span className="text-xl font-bold text-gray-900">₹{total.toFixed(2)}</span>
              </div>
              <Button size="lg" onClick={() => setIsCheckoutOpen(true)}>
                Checkout <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      <Modal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} title="Complete Order">
        <form onSubmit={handlePlaceOrder} className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 pb-2 border-b border-gray-100">Order Summary</h3>
            {Object.entries(cart).map(([itemId, qty]) => {
              const item = menu.menuItems?.find((i: any) => i._id === itemId);
              if (!item) return null;
              return (
                <div key={itemId} className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">{qty}x {item.name}</span>
                  <span className="text-gray-900 font-medium">₹{(parseFloat(item.price) * qty).toFixed(2)}</span>
                </div>
              );
            })}
            <div className="flex justify-between items-center text-base font-bold border-t border-gray-100 pt-3 mt-3">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <Input 
              label="Your Name" 
              placeholder="John Doe" 
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
            />
            <Input 
              label="Phone Number (Optional)" 
              placeholder="+1 234 567 8900" 
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
            />
            <Input 
              label="Table Number (Optional)" 
              placeholder="e.g. 12" 
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
            />
          </div>

          <Button type="submit" fullWidth size="lg" isLoading={submitting}>
            Place Order
          </Button>
        </form>
      </Modal>
    </div>
  );
};
