import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router';
import { api } from '../../../api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Mail, Lock } from 'lucide-react';
import { getDashboardForRole, getStoredUserRole } from '../../utils/auth';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, isAuthenticated, isInitialized } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Already logged in — bounce to their own dashboard
  if (isInitialized && isAuthenticated) {
    return <Navigate to={getDashboardForRole(getStoredUserRole())} replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);

    try {
      const res = await api.auth.login(email, password);
      const token = res.data?.token;
      if (!token) throw new Error('No token received');

      login(token);

      const route = getDashboardForRole(getStoredUserRole());
      localStorage.setItem('role', route === '/super-admin' ? 'super-admin' : 'admin');
      showToast('Logged in successfully', 'success');
      navigate(route);
    } catch (err: any) {
      showToast(err.message || 'Invalid credentials', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 bg-white">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mx-auto mb-5">
            <span className="text-white font-bold text-xl">E</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
          <p className="text-gray-500 text-sm mt-1.5">Sign in to your admin dashboard.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            icon={<Mail className="w-4 h-4" />}
            type="email"
            label="Email"
            placeholder="admin@eaturia.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            icon={<Lock className="w-4 h-4" />}
            type="password"
            label="Password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" fullWidth size="lg" isLoading={loading} className="mt-2">
            Sign In
          </Button>
        </form>
      </div>
    </div>
  );
};
