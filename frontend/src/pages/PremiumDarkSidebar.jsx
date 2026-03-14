import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PremiumDarkSidebar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="glass-sidebar flex h-full w-[260px] flex-col border-r border-accent/10 relative z-50 bg-sidebar-dark">
        <div className="flex flex-col gap-6 p-6">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-lg bg-accent/20 transition-colors duration-200 group-hover:bg-accent/30 group-hover:shadow-glow-sm">
              <span className="material-symbols-outlined text-xl text-accent">eco</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold leading-tight tracking-tight text-white">PARIVESH 3.0</h1>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-accent/70">Environment Clearance</p>
            </div>
          </Link>

          <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-3">
            <div className="flex size-8 items-center justify-center overflow-hidden rounded-full bg-white p-1">
              <img
                alt="State Emblem of India"
                className="h-full w-full object-contain"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAOiAxlT367H8V6aiAwrRDlx52wPMHze3z8d9Mr1z06lTxxYRLnNfEscn4X-w9KDwVbDwSmtbNwfNATN1Tvud8RJ-LvS0qB-Lj2WljDhclH-_6jQGF0D_CZYPj6G4D-f1pFZ6ARWA4SmUPcF7Owc1jkodYLz5k1nqgaJ99givM1uRIuZlaAIrf2po5PabrQsuV2QXxj23lYQHoYjHravjBT3hlYACuIE6ngASvC0Nkgc2IbVPObpu8pnBx8ojUTS57_V0WgKUoy9w"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-semibold leading-none text-white/90">Ministry of Environment,</span>
              <span className="text-[10px] leading-tight text-white/60">Forest & Climate Change</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-scroll flex-1 space-y-1 overflow-y-auto px-4 py-2">
          <div className="relative group">
            <div className="active-nav-indicator" />
            <Link
              className="flex items-center gap-3 rounded-lg bg-primary px-4 py-3 font-medium text-white shadow-glow-sm transition-all duration-200 hover:bg-primary-light"
              to="/admin/sidebar"
            >
              <span className="material-symbols-outlined fill-1">dashboard</span>
              <span className="text-sm">Dashboard</span>
            </Link>
          </div>

          <Link
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-white/70 transition-all duration-200 hover:bg-white/5 hover:text-white"
            to="/admin/dashboard"
          >
            <span className="material-symbols-outlined text-accent">description</span>
            <span className="text-sm font-medium">Users</span>
            <span className="badge-active ml-auto rounded bg-accent/20 px-1.5 py-0.5 text-[10px] font-bold text-accent">12</span>
          </Link>

          <Link
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-white/70 transition-all duration-200 hover:bg-white/5 hover:text-white"
            to="/admin/sidebar"
          >
            <span className="material-symbols-outlined text-accent">verified</span>
            <span className="text-sm font-medium">System View</span>
          </Link>

          <Link
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-white/70 transition-all duration-200 hover:bg-white/5 hover:text-white"
            to="/admin/dashboard"
          >
            <span className="material-symbols-outlined text-accent">gavel</span>
            <span className="text-sm font-medium">Compliance</span>
          </Link>

          <Link
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-white/70 transition-all duration-200 hover:bg-white/5 hover:text-white"
            to="/admin/dashboard"
          >
            <span className="material-symbols-outlined text-accent">bar_chart_4_bars</span>
            <span className="text-sm font-medium">Reports</span>
          </Link>

          <Link
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-white/70 transition-all duration-200 hover:bg-white/5 hover:text-white"
            to="/admin/dashboard"
          >
            <span className="material-symbols-outlined text-accent">pie_chart</span>
            <span className="text-sm font-medium">Analytics</span>
          </Link>
        </nav>

        <div className="mt-auto flex flex-col gap-1 border-t border-accent/10 p-4">
          <Link
            to="/admin/dashboard"
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-light hover:shadow-glow-sm"
          >
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            Manage Users
          </Link>
          <a
            className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-white/50 transition-all duration-200 hover:bg-white/5 hover:text-white"
            href="#"
          >
            <span className="material-symbols-outlined text-lg">help</span>
            <span className="text-sm font-medium">Help Support</span>
          </a>
          <a
            className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-white/50 transition-all duration-200 hover:bg-white/5 hover:text-white"
            href="#"
          >
            <span className="material-symbols-outlined text-lg">settings</span>
            <span className="text-sm font-medium">Settings</span>
          </a>
          <button
            className="mt-2 flex items-center gap-3 rounded-lg px-4 py-2.5 text-white/50 transition-all duration-200 hover:bg-red-500/10 hover:text-red-400"
            onClick={handleLogout}
            type="button"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>

        <div className="px-4 pb-6">
          <div className="flex items-center gap-3 rounded-xl border border-accent/20 bg-accent/5 p-3">
            <div
              className="size-10 flex-shrink-0 rounded-full border-2 border-primary/30 bg-emerald-800"
              aria-hidden
            />
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-xs font-bold text-white">Dr. Rajesh Kumar</span>
              <span className="truncate text-[10px] font-medium text-accent/60">Nodal Officer</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-background-light p-8">
        <header className="mb-10 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-text-primary">Dashboard Overview</h2>
            <p className="font-medium text-text-secondary">Welcome back, Dr. Rajesh</p>
          </div>
          <div className="flex gap-4">
            <button
              className="rounded-lg border border-primary/10 bg-white p-2 text-text-secondary shadow-glass transition-all duration-200 hover:border-accent/20 hover:text-primary"
              type="button"
            >
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button
              className="rounded-lg border border-primary/10 bg-white p-2 text-text-secondary shadow-glass transition-all duration-200 hover:border-accent/20 hover:text-primary"
              type="button"
            >
              <span className="material-symbols-outlined">calendar_today</span>
            </button>
          </div>
        </header>

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Total Proposals', value: '1,284', sub: '+12.5% vs last month', icon: 'trending_up', color: 'text-primary' },
            { label: 'Pending Approval', value: '432', sub: 'Requires immediate action', icon: 'pending_actions', color: 'text-orange-500' },
            { label: 'Clearances Issued', value: '812', sub: '98% success rate', icon: 'verified', color: 'text-primary' },
            { label: 'Compliance Rate', value: '94%', sub: null, icon: null, color: 'text-accent' },
          ].map((card) => (
            <div
              key={card.label}
              className="hover-lift rounded-xl border border-primary/10 bg-white p-6 shadow-glass"
            >
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-text-secondary">{card.label}</p>
              <h3 className="text-3xl font-bold text-text-primary">{card.value}</h3>
              {card.sub && (
                <div className={`mt-4 flex items-center gap-1 text-xs font-bold ${card.color}`}>
                  {card.icon && <span className="material-symbols-outlined text-sm">{card.icon}</span>}
                  <span>{card.sub}</span>
                </div>
              )}
              {card.label === 'Compliance Rate' && (
                <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-primary/10">
                  <div className="h-full w-[94%] rounded-full bg-primary transition-all duration-200" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="relative flex min-h-[400px] items-center justify-center overflow-hidden rounded-xl border border-primary/10 bg-white shadow-glass">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent opacity-60" />
          <div className="relative z-10 text-center">
            <span className="material-symbols-outlined text-6xl text-primary mb-4">analytics</span>
            <h4 className="mb-2 text-xl font-bold text-text-primary">Environmental Impact Analysis</h4>
            <p className="max-w-md text-text-secondary">Regional analysis of forest diversion proposals and ecological compensation tracking.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PremiumDarkSidebar;
