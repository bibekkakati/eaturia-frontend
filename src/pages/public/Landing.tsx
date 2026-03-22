import React from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ArrowRight, Utensils, Zap, BarChart3, ShieldCheck, Smartphone, ClipboardList } from 'lucide-react';

/** Public landing page showcasing the Eaturia platform's features and benefits. */
export const Landing: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Zap className="w-5 h-5" />,
      title: 'Real-time Ordering',
      description: 'Accept and process customer orders instantaneously with live updates across your kitchen and staff.',
    },
    {
      icon: <Utensils className="w-5 h-5" />,
      title: 'Dynamic Menus',
      description: 'Create, update, and activate menus with a few clicks. Change pricing and availability on the fly.',
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      title: 'Business Analytics',
      description: 'Track daily revenue, monitor order volumes, and make data-driven decisions for your restaurant.',
    },
    {
      icon: <ShieldCheck className="w-5 h-5" />,
      title: 'Role-based Access',
      description: 'Granular control across super-admins and restaurant admins with secure authentication.',
    },
    {
      icon: <ClipboardList className="w-5 h-5" />,
      title: 'Order Management',
      description: 'Accept, track, and complete orders with a streamlined interface built for busy kitchens.',
    },
    {
      icon: <Smartphone className="w-5 h-5" />,
      title: 'Mobile Friendly',
      description: 'Manage operations seamlessly across all devices — desktop, tablet, or mobile.',
    },
  ];

  return (
    <div className="flex flex-col">
      {/* ── Hero ────────────────────────────────────── */}
      <section className="flex flex-col items-center justify-center text-center px-4 pt-28 pb-20 bg-white border-b border-gray-100">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 mb-8 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold tracking-wide uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          Platform Active
        </span>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-6 max-w-4xl leading-tight">
          The modern way to run your restaurant.
        </h1>

        <p className="text-xl text-gray-500 mb-10 max-w-2xl leading-relaxed">
          Eaturia is the all-in-one menu and order management system — from digital menus to live kitchen tracking.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Button size="lg" onClick={() => navigate('/login')} className="group">
            Login to Dashboard
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Button>
          <Button size="lg" variant="ghost" onClick={() => {
            document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
          }}>
            See Features
          </Button>
        </div>
      </section>

      {/* ── Features ────────────────────────────────── */}
      <section id="features" className="px-4 py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Everything you need to succeed
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Built to handle real restaurant operations, not just demos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <Card key={i} padding="lg" className="hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default">
                <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center text-gray-700 mb-5">
                  {f.icon}
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────── */}
      <section className="px-4 py-24 bg-black text-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to transform your operations?
          </h2>
          <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
            Join the Eaturia network and give your restaurant the digital infrastructure it deserves.
          </p>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate('/login')}
            className="!bg-white !text-gray-900 hover:!bg-gray-100 border-transparent"
          >
            Access Dashboard
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </section>
    </div>
  );
};
