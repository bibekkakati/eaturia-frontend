import React, { useEffect, useState } from 'react';
import { api } from '../../../api';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Loader2, Plus, Trash2 } from 'lucide-react';

interface ManageItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  menuId: string | null;
}

export const ManageItemsModal: React.FC<ManageItemsModalProps> = ({ isOpen, onClose, menuId }) => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const { showToast } = useToast();

  // New item form state
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newDesc, setNewDesc] = useState('');

  useEffect(() => {
    if (isOpen && menuId) {
      fetchMenu();
    } else {
      // Reset state when closed
      setMenuItems([]);
      resetForm();
    }
  }, [isOpen, menuId]);

  const fetchMenu = async () => {
    setLoading(true);
    try {
      const res = await api.restaurant.getMenuById(menuId!);
      setMenuItems(res.data?.menuItems || []);
    } catch (err: any) {
      showToast('Failed to load menu details', 'error');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNewName('');
    setNewPrice('');
    setNewDesc('');
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPrice.trim()) return;
    
    // Validate price
    const priceNum = parseFloat(newPrice);
    if (isNaN(priceNum) || priceNum < 0) {
      showToast('Please enter a valid price', 'error');
      return;
    }

    const newItem = {
      name: newName.trim(),
      price: priceNum.toString(),
      description: newDesc.trim() || undefined,
    };

    setMenuItems([...menuItems, newItem]);
    resetForm();
  };

  const handleRemoveItem = (index: number) => {
    const updated = [...menuItems];
    updated.splice(index, 1);
    setMenuItems(updated);
  };

  const handleSave = async () => {
    if (!menuId) return;
    setSubmitting(true);
    try {
      await api.restaurant.updateMenu(menuId, { menuItems });
      showToast('Menu items saved successfully', 'success');
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to save menu items', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Manage Menu Items" maxWidth="800px">
      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* List of existing items */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Current Items ({menuItems.length})</h3>
            
            {menuItems.length === 0 ? (
              <div className="text-center py-8 text-sm text-gray-500 border border-dashed border-gray-200 rounded-xl bg-gray-50">
                No items in this menu yet. Add one below.
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                {menuItems.map((item, idx) => (
                  <div key={idx} className="flex items-start justify-between p-3 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{item.name}</span>
                        <span className="text-sm font-medium px-2 py-0.5 bg-gray-100 text-gray-900 rounded-md pt-0.5">
                          ₹{parseFloat(item.price).toFixed(2)}
                        </span>
                      </div>
                      {item.description && <p className="text-sm text-gray-500 mt-1">{item.description}</p>}
                    </div>
                    <button 
                      onClick={() => handleRemoveItem(idx)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <hr className="border-gray-100" />

          {/* Add new item form */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Add New Item</h3>
            <form onSubmit={handleAddItem} className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input 
                  label="Item Name" 
                  placeholder="e.g. Garlic Bread" 
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  required
                />
                <Input 
                  label="Price (₹)" 
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="e.g. 200" 
                  value={newPrice}
                  onChange={e => setNewPrice(e.target.value)}
                  required
                />
              </div>
              <Input 
                label="Description (Optional)" 
                placeholder="Brief description of the dish..." 
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
              />
              <div className="flex justify-end pt-2">
                <Button type="submit" variant="outline" size="sm">
                  <Plus className="w-4 h-4" /> Add to List
                </Button>
              </div>
            </form>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
            <Button variant="ghost" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSave} isLoading={submitting}>
              Save All Changes
            </Button>
          </div>

        </div>
      )}
    </Modal>
  );
};
