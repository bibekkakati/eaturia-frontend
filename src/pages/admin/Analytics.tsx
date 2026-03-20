import React, { useEffect, useState } from 'react';
import { api } from '../../../api';
import { Card } from '../../components/ui/Card';
import { Loader } from '../../components/ui/Loader';
import { useToast } from '../../context/ToastContext';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';
import { TrendingUp, Users, DollarSign, Package } from 'lucide-react';

export const Analytics: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [popularItems, setPopularItems] = useState<any[]>([]);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.restaurant.getOrdersByRestaurant();
        const allOrders = res.data || [];
        setOrders(allOrders);

        // For popular items: Fetch details for the most recent 20 orders
        // to get specific item counts (since getOrdersByRestaurant omits items)
        const recentOrders = allOrders.slice(0, 20);
        const detailPromises = recentOrders.map((o: any) => api.restaurant.getOrderDetails(o._id));
        const detailsRes = await Promise.allSettled(detailPromises);
        
        const itemCounts: Record<string, { name: string, count: number }> = {};
        detailsRes.forEach((r: any) => {
          if (r.status === 'fulfilled' && r.value.data?.items) {
            r.value.data.items.forEach((item: any) => {
              const qty = parseInt(item.quantity) || 1;
              if (itemCounts[item.name]) {
                itemCounts[item.name].count += qty;
              } else {
                itemCounts[item.name] = { name: item.name, count: qty };
              }
            });
          }
        });

        const sortedItems = Object.values(itemCounts)
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
        setPopularItems(sortedItems);

      } catch (err) {
        showToast('Failed to load analytics data', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [showToast]);

  if (loading) return <Loader fullScreen />;

  // Data processing: Daily Revenue
  const dailyDataMap: Record<string, { date: string, revenue: number, orders: number }> = {};
  orders.forEach((o: any) => {
    const date = new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    if (!dailyDataMap[date]) {
      dailyDataMap[date] = { date, revenue: 0, orders: 0 };
    }
    if (o.status !== 'CANCELLED') {
      dailyDataMap[date].revenue += parseFloat(o.total);
      dailyDataMap[date].orders += 1;
    }
  });
  const dailyData = Object.values(dailyDataMap).reverse();

  // Data processing: Peak Hours
  const hourlyDataMap: Record<number, number> = {};
  for (let i = 0; i < 24; i++) hourlyDataMap[i] = 0;
  orders.forEach((o: any) => {
    const hour = new Date(o.createdAt).getHours();
    hourlyDataMap[hour]++;
  });
  const hourlyData = Object.entries(hourlyDataMap).map(([hour, count]) => ({
    hour: `${hour}:00`,
    count
  }));

  const validOrders = orders.filter((o: any) => o.status !== 'CANCELLED');
  const totalRevenue = validOrders.reduce((sum: number, o: any) => sum + parseFloat(o.total), 0);
  const completedOrders = orders.filter((o: any) => o.status === 'COMPLETED').length;

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Analytics</h1>
        <p className="text-gray-500 mt-1">Deep dive into your restaurant performance.</p>
      </div>

      {/* Top Level KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: <DollarSign className="text-emerald-600" />, bg: 'bg-emerald-50' },
          { label: 'Total Orders', value: validOrders.length, icon: <Package className="text-blue-600" />, bg: 'bg-blue-50' },
          { label: 'Completed', value: completedOrders, icon: <TrendingUp className="text-purple-600" />, bg: 'bg-purple-50' },
          { label: 'Avg Order Value', value: `₹${validOrders.length ? (totalRevenue / validOrders.length).toFixed(0) : 0}`, icon: <Users className="text-orange-600" />, bg: 'bg-orange-50' },
        ].map((kpi, i) => (
          <Card key={i} padding="md" className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${kpi.bg}`}>
              {kpi.icon}
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{kpi.label}</p>
              <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card padding="lg">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Revenue Trend</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10b981" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#10b981' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Peak Hours */}
        <Card padding="lg">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Peak Ordering Hours</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Popular Items */}
        <Card padding="lg">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Top Bestsellers</h3>
          <div className="space-y-5">
            {popularItems.map((item, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-gray-700">{item.name}</span>
                  <span className="text-gray-900">{item.count} sold</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-black transition-all duration-500" 
                    style={{ width: `${(item.count / popularItems[0].count) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {popularItems.length === 0 && (
              <p className="text-center py-10 text-gray-400 text-sm italic">No sales data yet to calculate bestsellers.</p>
            )}
          </div>
        </Card>

        {/* Order Status mix */}
        <Card padding="lg">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Order Status Breakdown</h3>
          <div className="min-h-[350px] flex flex-col sm:flex-row items-center justify-center gap-8 py-4">
            {(() => {
              const chartData = [
                { name: 'Completed', value: orders.filter((o: any) => o.status === 'COMPLETED').length, color: '#10b981' },
                { name: 'Accepted', value: orders.filter((o: any) => o.status === 'ACCEPTED').length, color: '#3b82f6' },
                { name: 'Pending', value: orders.filter((o: any) => o.status === 'PENDING').length, color: '#f59e0b' },
                { name: 'Cancelled', value: orders.filter((o: any) => o.status === 'CANCELLED').length, color: '#ef4444' },
              ].filter(d => d.value > 0);

              if (chartData.length === 0) {
                return (
                  <div className="flex flex-col items-center text-gray-400">
                    <Package className="w-12 h-12 mb-2 opacity-20" />
                    <p className="text-sm italic">No order data yet</p>
                  </div>
                );
              }

              return (
                <>
                  <div className="w-full h-[250px] sm:flex-1 sm:h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 sm:flex sm:flex-col gap-3 min-w-[140px]">
                    {chartData.map((entry) => (
                      <div key={entry.name} className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900">{entry.name}</span>
                          <span className="text-gray-500">{entry.value} orders</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>
        </Card>
      </div>
    </div>
  );
};
