import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { api } from '../../../api';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Loader } from '../../components/ui/Loader';
import { Modal } from '../../components/ui/Modal';
import { Plus, Store, ChevronRight } from 'lucide-react';

/** Main dashboard for Super Admins to manage the entire restaurant network. */
export const SuperAdminDashboard: React.FC = () => {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRest, setNewRest] = useState({ name: '', address: '', phone: '', description: '', logo: '' });
  const [submitting, setSubmitting] = useState(false);

  // Fetches the list of all restaurants from the administrative API
  const fetchRestaurants = async () => {
    try {
      const res = await api.admin.getRestaurants();
      setRestaurants(res.data || []);
    } catch (err) {
      showToast('Failed to load restaurants', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  // Handles the submission of the new restaurant creation form
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRest.name || !newRest.address) return;

    setSubmitting(true);
    try {
      await api.admin.createRestaurant(newRest);
      showToast('Restaurant created successfully', 'success');
      setNewRest({ name: '', address: '', phone: '', description: '', logo: '' });
      setIsModalOpen(false);
      fetchRestaurants();
    } catch (err: any) {
      showToast(err.message || 'Failed to create restaurant', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader fullScreen />;

  // User-interface starts here
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
            Restaurants Network
          </h1>
          <p className="text-slate-500 mt-1">Manage all restaurants across the platform.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-5 h-5 mr-2" /> Add Restaurant
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {restaurants.map((r) => (
          <Card 
            key={r._id} 
            className="group cursor-pointer hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col"
            onClick={() => navigate(`/super-admin/restaurant/${r._id}`)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-700 group-hover:bg-purple-500/20 transition-colors">
                <Store className="w-6 h-6" />
              </div>
              <div className={`px-2 py-1 rounded text-xs font-bold border ${r.isActive ? 'text-emerald-700 bg-emerald-400/10 border-emerald-400/20' : 'text-slate-500 bg-gray-400/10 border-gray-400/20'}`}>
                {r.isActive ? 'ACTIVE' : 'INACTIVE'}
              </div>
            </div>
            
            <h3 className="text-xl font-bold mb-1">{r.name}</h3>
            <p className="text-sm text-slate-500 mb-4 line-clamp-1">{r.address}</p>
            
            <div className="mt-auto pt-4 border-t border-slate-200 flex items-center justify-between text-sm">
              <span className="text-slate-400">Created {new Date(r.createdAt).toLocaleDateString()}</span>
              <span className="text-[#8b5cf6] font-medium flex items-center group-hover:translate-x-1 transition-transform">
                Manage <ChevronRight className="w-4 h-4 ml-1" />
              </span>
            </div>
          </Card>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Restaurant">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input 
            label="Restaurant Name" 
            placeholder="e.g. The Golden Platter" 
            value={newRest.name}
            onChange={(e) => setNewRest({...newRest, name: e.target.value})}
            required
          />
          <Input 
            label="Address" 
            placeholder="123 Cuisine St" 
            value={newRest.address}
            onChange={(e) => setNewRest({...newRest, address: e.target.value})}
            required
          />
          <Input 
            label="Phone" 
            placeholder="+1 234 567 890" 
            value={newRest.phone}
            onChange={(e) => setNewRest({...newRest, phone: e.target.value})}
          />
          <div>
            <label className="text-sm font-medium text-slate-600 mb-1.5 block">Description</label>
            <textarea 
              className="w-full bg-white border-slate-200 border border-slate-300 rounded-lg px-4 py-2 text-slate-900 placeholder-gray-500 focus:border-[#8b5cf6] focus:outline-none min-h-[100px]"
              placeholder="Short description..."
              value={newRest.description}
              onChange={(e) => setNewRest({...newRest, description: e.target.value})}
            />
          </div>
          <Button type="submit" fullWidth isLoading={submitting} className="mt-4">Save Restaurant</Button>
        </form>
      </Modal>
    </div>
  );
};
