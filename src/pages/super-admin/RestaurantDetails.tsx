import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { api } from '../../../api';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Loader } from '../../components/ui/Loader';
import { Modal } from '../../components/ui/Modal';
import { Store, ArrowLeft, Users, Shield, UserPlus, Power } from 'lucide-react';

/** Detailed view and management for a specific restaurant. */
export const RestaurantDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [adminData, setAdminData] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  // Loads restaurant profile and admin user list
  const loadData = async () => {
    if (!id) return;
    try {
      const [restRes, adminRes] = await Promise.all([
        api.admin.getRestaurantDetails(id),
        api.admin.getRestaurantAdminList(id)
      ]);
      setRestaurant(restRes.data);
      setEditData(restRes.data);
      setAdmins(adminRes.data || []);
    } catch (err) {
      showToast('Failed to load restaurant details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  // Updates restaurant profile information
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSubmitting(true);
    try {
      await api.admin.updateRestaurant(id, {
        name: editData.name,
        address: editData.address,
        phone: editData.phone,
        description: editData.description
      });
      showToast('Restaurant updated', 'success');
      setIsEditOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Provisions a new administrator account for this restaurant
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSubmitting(true);
    try {
      await api.admin.createRestaurantAdmin(id, adminData.email, adminData.password);
      showToast('Admin user created successfully', 'success');
      setAdminData({ email: '', password: '' });
      setIsAdminModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to create admin', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Toggles the restaurant's operational status (Active/Inactive)
  const handleToggleStatus = async () => {
    if (!id || !restaurant) return;
    try {
      await api.admin.markRestaurantStatus(id, !restaurant.isActive);
      showToast(`Restaurant marked as ${!restaurant.isActive ? 'Active' : 'Inactive'}`, 'success');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  if (loading) return <Loader fullScreen />;
  if (!restaurant) return <div className="text-center text-slate-500 py-12">Restaurant not found.</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <Link to="/super-admin" className="inline-flex items-center text-slate-500 hover:text-slate-900 transition-colors mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
      </Link>
      
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center text-purple-700">
            <Store className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              {restaurant.name} 
              <span className={`text-xs px-2 py-0.5 rounded font-bold border ${restaurant.isActive ? 'text-emerald-700 border-emerald-400/20 bg-emerald-400/10' : 'text-slate-500 border-gray-400/20 bg-gray-400/10'}`}>
                {restaurant.isActive ? 'ACTIVE' : 'INACTIVE'}
              </span>
            </h1>
            <p className="text-slate-500 mt-1">{restaurant.address}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant={restaurant.isActive ? 'danger' : 'secondary'} size="sm" onClick={handleToggleStatus}>
            <Power className="w-4 h-4 mr-2" /> {restaurant.isActive ? 'Deactivate' : 'Activate'}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setIsEditOpen(true)}>Edit Profile</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2 space-y-6">
          <Card padding="lg">
            <h2 className="text-xl font-bold mb-4">Profile Details</h2>
            <div className="grid grid-cols-2 gap-y-4 gap-x-6">
              <div>
                <p className="text-sm text-slate-500">Phone</p>
                <p className="font-medium text-slate-900">{restaurant.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Created At</p>
                <p className="font-medium text-slate-900">{new Date(restaurant.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-slate-500">Description</p>
                <p className="font-medium text-slate-900">{restaurant.description || 'N/A'}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card padding="lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-700" /> Admins
              </h2>
              <button 
                className="text-slate-900 hover:text-blue-700 bg-white border-slate-200 shadow-sm hover:bg-slate-50 border-slate-200 p-2 rounded-lg transition-colors"
                onClick={() => setIsAdminModalOpen(true)}
              >
                <UserPlus className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-3">
              {admins.map((adm) => (
                <div key={adm._id} className="flex items-center gap-3 p-3 bg-white border-slate-200 shadow-sm border border-slate-200 rounded-lg">
                  <Shield className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">{adm.email}</p>
                    <p className="text-xs text-emerald-700">Active</p>
                  </div>
                </div>
              ))}
              {admins.length === 0 && (
                <p className="text-sm text-slate-400 py-2">No admins assigned.</p>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Restaurant Profile">
        <form onSubmit={handleUpdate} className="space-y-4">
          <Input label="Name" value={editData.name || ''} onChange={(e) => setEditData({...editData, name: e.target.value})} required />
          <Input label="Address" value={editData.address || ''} onChange={(e) => setEditData({...editData, address: e.target.value})} required />
          <Input label="Phone" value={editData.phone || ''} onChange={(e) => setEditData({...editData, phone: e.target.value})} />
          <div>
            <label className="text-sm font-medium text-slate-600 mb-1.5 block">Description</label>
            <textarea 
              className="w-full bg-white border-slate-200 border border-slate-300 rounded-lg px-4 py-2 text-slate-900 placeholder-gray-500 focus:border-[#8b5cf6] focus:outline-none min-h-[100px]"
              value={editData.description || ''}
              onChange={(e) => setEditData({...editData, description: e.target.value})}
            />
          </div>
          <Button type="submit" fullWidth isLoading={submitting} className="mt-4">Update Details</Button>
        </form>
      </Modal>

      {/* Create Admin Modal */}
      <Modal isOpen={isAdminModalOpen} onClose={() => setIsAdminModalOpen(false)} title="Create Admin User">
        <form onSubmit={handleCreateAdmin} className="space-y-4">
          <p className="text-sm text-slate-500 mb-4">This user will be able to log in and manage {restaurant.name}.</p>
          <Input 
            type="email"
            label="Email" 
            value={adminData.email} 
            onChange={(e) => setAdminData({...adminData, email: e.target.value})} 
            required 
          />
          <Input 
            type="password"
            label="Password" 
            value={adminData.password} 
            onChange={(e) => setAdminData({...adminData, password: e.target.value})} 
            required 
            minLength={6}
          />
          <Button type="submit" fullWidth isLoading={submitting} className="mt-4">Create User</Button>
        </form>
      </Modal>
    </div>
  );
};
