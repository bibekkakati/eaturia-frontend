import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { api } from '../../../api';
import { Card } from '../../components/ui/Card';
import { Loader } from '../../components/ui/Loader';
import { useToast } from '../../context/ToastContext';
import { Store, Utensils, ClipboardList, Users, QrCode, Copy, Check, Download } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

export const AdminDashboard: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [menus, setMenus] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const [profileRes, menusRes, ordersRes, adminsRes] = await Promise.allSettled([
          api.restaurant.getRestaurantDetails(),
          api.restaurant.getMenusByRestaurant(),
          api.restaurant.getOrdersByRestaurant(),
          api.restaurant.getRestaurantAdminList(),
        ]);

        if (profileRes.status === 'fulfilled') setProfile(profileRes.value.data);
        if (menusRes.status === 'fulfilled') setMenus(menusRes.value.data || []);
        if (ordersRes.status === 'fulfilled') setOrders(ordersRes.value.data || []);
        if (adminsRes.status === 'fulfilled') setAdmins(adminsRes.value.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Loader fullScreen />;

  if (!profile) {
    return <div className="text-center py-20 text-gray-500">Failed to load restaurant profile.</div>;
  }

  const publicMenuUrl = `${window.location.origin}/m/${profile._id}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(publicMenuUrl);
    setCopied(true);
    showToast('Menu URL copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQR = () => {
    const canvas = document.getElementById('menu-qr') as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `${profile.name.replace(/\s+/g, '-').toLowerCase()}-menu-qr.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('QR Code downloaded!', 'success');
    }
  };

  const activeMenus = menus.filter((m) => m.isActive).length;
  const validOrders = orders.filter(o => o.status !== 'CANCELLED');
  const todayOrders = validOrders.filter((o) => {
    const d = new Date(o.createdAt);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  }).length;

  const stats = [
    { icon: <ClipboardList className="w-5 h-5" />, value: todayOrders, label: "Today's Orders" },
    { icon: <Utensils className="w-5 h-5" />, value: activeMenus, label: 'Active Menus' },
    { icon: <ClipboardList className="w-5 h-5" />, value: validOrders.length, label: 'Total Orders' },
    { icon: <Users className="w-5 h-5" />, value: admins.length, label: 'Admins' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back — {profile.name}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <Card key={i} padding="md" className="flex items-center gap-4">
            <div className="p-2.5 bg-gray-100 text-gray-700 rounded-lg shrink-0">
              {s.icon}
            </div>
            <div>
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile */}
        <div className="lg:col-span-2">
          <Card padding="lg">
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Store className="w-4 h-4 text-gray-500" /> Restaurant Profile
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Name', value: profile.name },
                { label: 'Phone', value: profile.phone || '—' },
                { label: 'Address', value: profile.address || '—', full: true },
                { label: 'Description', value: profile.description || '—', full: true },
              ].map((f, i) => (
                <div key={i} className={f.full ? 'sm:col-span-2' : ''}>
                  <p className="text-xs text-gray-500 mb-1">{f.label}</p>
                  <p className="text-sm font-medium text-gray-900 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                    {f.value}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Quick links */}
        <div>
          <Card padding="lg">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link
                to="/admin/orders"
                className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors text-sm font-medium text-gray-900"
              >
                Manage Orders <span className="text-gray-400">→</span>
              </Link>
              <Link
                to="/admin/menus"
                className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors text-sm font-medium text-gray-900"
              >
                Edit Menus <span className="text-gray-400">→</span>
              </Link>
            </div>
          </Card>

          {/* Public Menu Link */}
          <Card padding="lg" className="mt-6 border border-emerald-500/20 bg-emerald-50/50 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-emerald-500"></div>
            <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <QrCode className="w-4 h-4 text-emerald-600" /> Public Menu & QR Code
            </h2>
            <p className="text-xs text-gray-600 mb-4">
              Share this exact link with your customers or generate a QR code from it so they can order.
            </p>
            
            <div className="flex flex-col gap-4">
              <div className="flex bg-white border border-emerald-200 rounded-lg overflow-hidden relative">
                <div className="px-3 py-2 flex-1 text-xs text-gray-600 truncate bg-white select-all items-center flex">
                  {publicMenuUrl}
                </div>
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium text-xs border-l border-emerald-200 transition-colors flex items-center justify-center shrink-0 w-24"
                >
                  {copied ? <Check className="w-3.5 h-3.5 mr-1.5" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>

              <div className="flex flex-col items-center bg-white p-6 rounded-xl border border-emerald-100 shadow-sm gap-4">
                <div className="p-3 bg-white border-4 border-emerald-50 rounded-2xl shadow-inner">
                  <QRCodeCanvas 
                    id="menu-qr"
                    value={publicMenuUrl}
                    size={160}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <button
                  onClick={downloadQR}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-black transition-all shadow-lg hover:shadow-black/20"
                >
                  <Download className="w-4 h-4" />
                  Download QR Code
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
