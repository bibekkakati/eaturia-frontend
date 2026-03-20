import React, { useEffect, useState } from 'react';
import { api } from '../../../api';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Loader } from '../../components/ui/Loader';
import { Modal } from '../../components/ui/Modal';
import { Plus, Trash, CheckCircle, ListPlus } from 'lucide-react';
import { ManageItemsModal } from './ManageItemsModal';

export const Menus: React.FC = () => {
  const [menus, setMenus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMenuName, setNewMenuName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Manage items modal state
  const [manageItemsMenuId, setManageItemsMenuId] = useState<string | null>(null);

  const fetchMenus = async () => {
    try {
      const res = await api.restaurant.getMenusByRestaurant();
      setMenus(res.data || []);
    } catch (err) {
      console.error(err);
      showToast('Failed to load menus', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const handleCreateMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMenuName.trim()) return;

    setSubmitting(true);
    try {
      await api.restaurant.createMenu({ name: newMenuName, menuItems: [] });
      showToast('Menu created successfully', 'success');
      setNewMenuName('');
      setIsModalOpen(false);
      fetchMenus();
    } catch (err: any) {
      showToast(err.message || 'Failed to create menu', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.restaurant.deleteMenu(id);
      showToast('Menu deleted', 'success');
      fetchMenus();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete menu', 'error');
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await api.restaurant.liveMenu(id);
      showToast('Menu marked as live', 'success');
      fetchMenus();
    } catch (err: any) {
      showToast(err.message || 'Failed to activate menu', 'error');
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
            Menu Management
          </h1>
          <p className="text-slate-500 mt-1">Create and manage your restaurant menus.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-5 h-5 mr-2" /> New Menu
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menus.map((menu) => (
          <Card key={menu._id} className="flex flex-col relative overflow-hidden group">
            {menu.isActive && (
              <div className="absolute top-0 right-0 p-2">
                <span className="bg-emerald-500/20 text-emerald-700 text-xs px-2 py-1 rounded font-bold border border-emerald-500/20">LIVE</span>
              </div>
            )}
            
            <h3 className="text-xl font-bold mb-4">{menu.name}</h3>
            <p className="text-sm text-slate-500 mb-6">Create date: {new Date(menu.createdAt || Date.now()).toLocaleDateString()}</p>
            
            <div className="mt-auto grid grid-cols-2 gap-3 pt-4 border-t border-slate-300">
              <Button variant="outline" size="sm" onClick={() => setManageItemsMenuId(menu._id)} className="col-span-2">
                <ListPlus className="w-4 h-4 mr-2" /> Manage Items
              </Button>
              {!menu.isActive && (
                <Button variant="secondary" size="sm" onClick={() => handleActivate(menu._id)}>
                  <CheckCircle className="w-4 h-4 mr-2" /> Activate
                </Button>
              )}
              {menu.isActive && (
                 <Button disabled variant="secondary" size="sm" className="opacity-50">Active</Button>
              )}
              <Button variant="danger" size="sm" onClick={() => handleDelete(menu._id)}>
                <Trash className="w-4 h-4 mr-2" /> Delete
              </Button>
            </div>
          </Card>
        ))}
        {menus.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 border border-dashed border-slate-300 rounded-xl">
            No menus found. Create one to get started.
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Menu">
        <form onSubmit={handleCreateMenu} className="space-y-4">
          <Input 
            label="Menu Name" 
            placeholder="e.g. Summer Special" 
            value={newMenuName}
            onChange={(e) => setNewMenuName(e.target.value)}
            required
            autoFocus
          />
          <Button type="submit" fullWidth isLoading={submitting}>Create Menu</Button>
        </form>
      </Modal>

      <ManageItemsModal 
        isOpen={!!manageItemsMenuId} 
        onClose={() => setManageItemsMenuId(null)} 
        menuId={manageItemsMenuId} 
      />
    </div>
  );
};
