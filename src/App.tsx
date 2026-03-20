import { Routes, Route } from 'react-router';
import { PublicLayout } from './layouts/PublicLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { Landing } from './pages/public/Landing';
import { RestaurantMenu } from './pages/public/RestaurantMenu';
import { OrderStatus } from './pages/public/OrderStatus';
import { Login } from './pages/admin/Login';
import { AdminDashboard } from './pages/admin/Dashboard';
import { Menus } from './pages/admin/Menus';
import { Orders } from './pages/admin/Orders';
import { Analytics } from './pages/admin/Analytics';
import { SuperAdminDashboard } from './pages/super-admin/Dashboard';
import { RestaurantDetails } from './pages/super-admin/RestaurantDetails';
import { ProtectedRoute } from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/m/:restaurantId" element={<RestaurantMenu />} />
        <Route path="/order/:orderId" element={<OrderStatus />} />
        <Route path="/login" element={<Login />} />
      </Route>

      {/* Restaurant Admin Routes — RESTAURANT_ADMIN only */}
      <Route element={<ProtectedRoute requiredRole="RESTAURANT_ADMIN"><AdminLayout role="admin" /></ProtectedRoute>}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/menus" element={<Menus />} />
        <Route path="/admin/orders" element={<Orders />} />
        <Route path="/admin/analytics" element={<Analytics />} />
      </Route>

      {/* Super Admin Routes — SUPER_ADMIN only */}
      <Route element={<ProtectedRoute requiredRole="SUPER_ADMIN"><AdminLayout role="super-admin" /></ProtectedRoute>}>
        <Route path="/super-admin" element={<SuperAdminDashboard />} />
        <Route path="/super-admin/restaurant/:id" element={<RestaurantDetails />} />
      </Route>
    </Routes>
  );
}

export default App;
