import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { api } from '../../../api';
import { Card } from '../../components/ui/Card';
import { Loader } from '../../components/ui/Loader';
import { Button } from '../../components/ui/Button';
import { CheckCircle, Clock, PackageOpen, ArrowLeft } from 'lucide-react';

/** Real-time order status tracker for customers to monitor their meal progress. */
export const OrderStatus: React.FC = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Loads the current state of the customer's order
    const fetchOrder = async () => {
      if (!orderId) return;
      try {
        const res = await api.public.getOrderDetails(orderId);
        setOrder(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrder();
    
    // Simple polling for order updates
    const interval = setInterval(fetchOrder, 15000);
    return () => clearInterval(interval);
  }, [orderId]);

  if (loading) return <Loader fullScreen />;

  if (!order) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 text-center">
        <PackageOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
        <p className="text-slate-500 mb-6">We couldn't find the order details.</p>
        <Link to="/">
          <Button variant="secondary">Return Home</Button>
        </Link>
      </div>
    );
  }

  // Maps internal order status strings to user-friendly UI labels
  const getStatusDisplay = (status: string) => {
    switch(status.toUpperCase()) {
      case 'PENDING': return { text: 'Pending Confirmation', color: 'text-yellow-600', icon: <Clock className="w-6 h-6 text-yellow-600" /> };
      case 'ACCEPTED': return { text: 'Preparing Your Order', color: 'text-blue-700', icon: <Clock className="w-6 h-6 text-blue-700" /> };
      case 'COMPLETED': return { text: 'Ready', color: 'text-emerald-700', icon: <CheckCircle className="w-6 h-6 text-emerald-700" /> };
      case 'CANCELLED': return { text: 'Cancelled', color: 'text-red-600', icon: <PackageOpen className="w-6 h-6 text-red-600" /> };
      default: return { text: status, color: 'text-slate-500', icon: <Clock className="w-6 h-6 text-slate-500" /> };
    }
  };

  const statusDisplay = getStatusDisplay(order.status || 'PENDING');

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 animate-fade-in">
      <Link to={`/m/${order.restaurantId}`} className="inline-flex items-center text-slate-500 hover:text-slate-900 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Menu
      </Link>

      <Card padding="lg" className="relative overflow-hidden">
        {/* Decorative background glow based on status */}
        <div className={`absolute top-0 inset-x-0 h-1 ${statusDisplay.color.replace('text-', 'bg-')} shadow-[0_0_20px_currentColor] opacity-50`} />

        <div className="text-center mb-10">
          <div className="flex justify-center mb-4 animate-bounce" style={{ animationDuration: '2s' }}>
            {statusDisplay.icon}
          </div>
          <h1 className="text-3xl font-bold mb-2">Order #{order._id?.slice(-6).toUpperCase()}</h1>
          <p className={`text-xl font-medium ${statusDisplay.color}`}>
            {statusDisplay.text}
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Order Details</h3>
            <div className="glass bg-white border-slate-200 shadow-sm rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-600">Customer Name</span>
                <span className="font-medium">{order.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Table Number</span>
                <span className="font-medium">{order.tableNumber || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Order Time</span>
                <span className="font-medium">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Items</h3>
            <div className="glass bg-white border-slate-200 shadow-sm rounded-lg p-4 space-y-3">
              {order.items?.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-start text-sm gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="shrink-0 w-6 h-6 rounded bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs mt-0.5">
                      {item.quantity}
                    </span>
                    <span className="text-slate-700 font-medium py-1">
                      {item.name}
                    </span>
                  </div>
                  <span className="font-bold text-right shrink-0 py-1">
                    ₹{(parseFloat(item.price) * parseFloat(item.quantity)).toFixed(2)}
                  </span>
                </div>
              ))}
              
              <div className="pt-3 mt-3 border-t border-slate-300 flex justify-between items-center text-lg font-bold text-slate-900">
                <span>Total</span>
                <span className="text-[#10b981]">₹{parseFloat(order.total).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
