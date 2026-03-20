import React, { useEffect, useState } from 'react';
import { api } from '../../../api';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Loader } from '../../components/ui/Loader';
import { Modal } from '../../components/ui/Modal';
import { BadgeCheck, Clock, CheckCircle, X } from 'lucide-react';

export const Orders: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const fetchOrders = async () => {
    try {
      const res = await api.restaurant.getOrdersByRestaurant();
      // sort orders by date descending
      const sorted = (res.data || []).sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setOrders(sorted);
    } catch (err) {
      console.error(err);
      showToast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000); // 30s polling
    return () => clearInterval(interval);
  }, []);

  const fetchOrderDetails = async (id: string) => {
    try {
      const res = await api.restaurant.getOrderDetails(id);
      setSelectedOrder(res.data);
    } catch (err) {
      showToast('Failed to fetch order details', 'error');
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await api.restaurant.updateOrderStatus(id, status);
      showToast(`Order marked as ${status}`, 'success');
      fetchOrders();
      if (selectedOrder && selectedOrder._id === id) {
        setSelectedOrder({ ...selectedOrder, status }); // optimistic
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update order', 'error');
    }
  };

  if (loading) return <Loader fullScreen />;

  const getStatusBadge = (status: string) => {
    switch(status?.toUpperCase()) {
      case 'PENDING': return <span className="text-yellow-600 bg-yellow-100 px-2 py-1 rounded text-xs font-bold border border-yellow-400/20"><Clock className="w-3 h-3 inline mr-1"/>PENDING</span>;
      case 'ACCEPTED': return <span className="text-blue-700 bg-blue-400/10 px-2 py-1 rounded text-xs font-bold border border-blue-400/20"><BadgeCheck className="w-3 h-3 inline mr-1"/>ACCEPTED</span>;
      case 'COMPLETED': return <span className="text-emerald-700 bg-emerald-400/10 px-2 py-1 rounded text-xs font-bold border border-emerald-400/20"><CheckCircle className="w-3 h-3 inline mr-1"/>COMPLETED</span>;
      case 'CANCELLED': return <span className="text-red-600 bg-red-100 px-2 py-1 rounded text-xs font-bold border border-red-400/20"><X className="w-3 h-3 inline mr-1"/>CANCELLED</span>;
      default: return <span className="text-slate-500 bg-gray-400/10 px-2 py-1 rounded text-xs font-bold border border-gray-400/20">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
            Live Orders
          </h1>
          <p className="text-slate-500 mt-1">Manage and track incoming customer orders.</p>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block glass-card overflow-hidden border border-slate-200 shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 text-sm">
              <th className="p-4 font-semibold uppercase tracking-wider">Order ID</th>
              <th className="p-4 font-semibold uppercase tracking-wider">Customer</th>
              <th className="p-4 font-semibold uppercase tracking-wider">Total</th>
              <th className="p-4 font-semibold uppercase tracking-wider">Status</th>
              <th className="p-4 font-semibold uppercase tracking-wider text-center">Time</th>
              <th className="p-4 font-semibold uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors group">
                <td className="p-4 font-mono text-xs text-slate-500">#{o._id.slice(-6).toUpperCase()}</td>
                <td className="p-4">
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-900">{o.customerName}</span>
                    {o.tableNumber && (
                      <span className="text-[10px] w-fit bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold mt-1 uppercase border border-emerald-100">
                        Table {o.tableNumber}
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-4 text-emerald-600 font-bold">₹{parseFloat(o.total).toFixed(2)}</td>
                <td className="p-4">{getStatusBadge(o.status)}</td>
                <td className="p-4 text-sm text-slate-500 text-center">{new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                <td className="p-4 text-right">
                  <Button size="sm" variant="ghost" onClick={() => fetchOrderDetails(o._id)}>
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="grid grid-cols-1 gap-4 lg:hidden">
        {orders.map((o) => (
          <div key={o._id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="space-y-1">
                <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">#{o._id.slice(-6).toUpperCase()}</p>
                <h3 className="font-bold text-slate-900">{o.customerName}</h3>
                {o.tableNumber && (
                  <span className="inline-block text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold uppercase border border-emerald-100">
                    Table {o.tableNumber}
                  </span>
                )}
              </div>
              <div>{getStatusBadge(o.status)}</div>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="flex flex-col">
                <span className="text-xs text-slate-400 uppercase font-semibold tracking-tighter">Amount</span>
                <span className="text-emerald-600 font-black text-lg">₹{parseFloat(o.total).toFixed(0)}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs text-slate-400 font-medium mb-2">{new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <Button size="sm" onClick={() => fetchOrderDetails(o._id)} className="rounded-xl px-6 h-9">
                  View Order
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {orders.length === 0 && (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center text-slate-400 font-medium">
          No orders found yet.
        </div>
      )}

      {/* Order Details Modal */}
      <Modal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} title={`Order #${selectedOrder?._id?.slice(-6).toUpperCase()}`}>
        {selectedOrder && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white border-slate-200 shadow-sm p-4 rounded-lg">
              <div>
                <p className="text-slate-500 text-xs uppercase">Customer</p>
                <p className="font-bold text-lg text-slate-900">{selectedOrder.customerName}</p>
                {selectedOrder.customerPhone && <p className="text-slate-500 text-sm">{selectedOrder.customerPhone}</p>}
                {selectedOrder.tableNumber && <p className="text-emerald-600 text-sm font-bold mt-1">Table: {selectedOrder.tableNumber}</p>}
              </div>
              <div className="text-right">
                <p className="text-slate-500 text-xs uppercase mb-1">Status</p>
                {getStatusBadge(selectedOrder.status)}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-slate-500 uppercase">Items</h4>
              <div className="glass bg-white border-slate-200 shadow-sm rounded-lg p-4 space-y-3 border border-slate-200">
                {selectedOrder.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-slate-700">{item.quantity}x {item.name}</span>
                    <span className="text-slate-500">₹{(parseFloat(item.price) * parseFloat(item.quantity)).toFixed(2)}</span>
                  </div>
                ))}
                <div className="pt-3 border-t border-slate-300 flex justify-between font-bold text-slate-900">
                  <span>Total</span>
                  <span className="text-[#10b981]">₹{parseFloat(selectedOrder.total).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-300 flex gap-3 justify-end flex-wrap">
              {(!selectedOrder.status || selectedOrder.status === 'PENDING') && (
                <Button variant="secondary" onClick={() => handleUpdateStatus(selectedOrder._id, 'ACCEPTED')}>
                  Accept Order
                </Button>
              )}
              {selectedOrder.status === 'ACCEPTED' && (
                <Button variant="primary" onClick={() => handleUpdateStatus(selectedOrder._id, 'COMPLETED')}>
                  Mark Completed
                </Button>
              )}
              {selectedOrder.status !== 'CANCELLED' && selectedOrder.status !== 'COMPLETED' && (
                <Button variant="danger" onClick={() => handleUpdateStatus(selectedOrder._id, 'CANCELLED')}>
                  Cancel Order
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
