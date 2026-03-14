import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ClipboardList, LogOut, Settings, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../store';
import { clearAuthTokens } from '../api';

const Layout = () => {
  const logout = useAuthStore(state => state.logout);
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = useAuthStore(state => state.user);

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/assets', label: 'Assets', icon: Package },
    { to: '/tasks', label: 'Tasks', icon: ClipboardList },
  ];

  const pageTitle =
    location.pathname === '/'
      ? 'Dashboard'
      : location.pathname.startsWith('/assets')
        ? 'Assets'
        : location.pathname.startsWith('/tasks')
          ? 'Tasks'
          : 'Platform';

  const handleLogout = () => {
    clearAuthTokens();
    logout();
    navigate('/login');
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <aside
        className={`fixed left-0 top-0 h-screen w-60 bg-[#0f172a] flex flex-col z-50 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <button
          onClick={closeSidebar}
          className="absolute top-4 right-4 lg:hidden text-slate-400 hover:text-white"
        >
          <X size={20} />
        </button>

        <div className="px-6 py-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Settings size={16} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm tracking-wide">MAMP</p>
              <p className="text-slate-500 text-[11px]">Maintenance Platform</p>
            </div>
          </div>
        </div>


        <div className="px-6 pt-6 pb-2">
          <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest">Navigation</p>
        </div>

        <nav className="flex-1 px-3 space-y-0.5">
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
            return (
              <Link
                key={to}
                to={to}
                onClick={closeSidebar}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  active
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                }`}
              >
                <Icon size={17} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 w-full transition-all"
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      <main className="lg:ml-60 min-h-screen bg-slate-50">
        <header className="bg-white border-b border-slate-200 h-14 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-500 hover:text-slate-800 -ml-1"
            >
              <Menu size={20} />
            </button>
            <span className="text-slate-400 text-sm">MAMP</span>
            <span className="text-slate-300 text-sm">/</span>
            <span className="text-slate-800 text-sm font-semibold truncate">{pageTitle}</span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden sm:inline-flex text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
              {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">{user?.charAt(0)?.toUpperCase()}</span>
            </div>
            <button
              onClick={handleLogout}
              className="lg:hidden p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <div className="p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default Layout;