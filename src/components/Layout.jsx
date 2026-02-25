import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  Truck,
  PackageCheck,
  BarChart3,
  Database,
  Home,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const coreweaveNav = [
  { to: '/', icon: Home, label: 'Dashboard' },
  { to: '/purchase-orders', icon: ClipboardList, label: 'Purchase Orders' },
  { to: '/vendor-portal', icon: Truck, label: 'Vendor Portal' },
  { to: '/receiving', icon: PackageCheck, label: 'Receiving' },
  { to: '/reconciliation', icon: BarChart3, label: 'Reconciliation' },
  { to: '/data', icon: Database, label: 'Data Management' },
];

const vendorNav = [
  { to: '/', icon: Truck, label: 'Vendor Portal' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = user?.role === 'vendor' ? vendorNav : coreweaveNav;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>ICS Supreme</h1>
          <p>Purchase Reconciliation</p>
        </div>
        <nav>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
              end={to === '/'}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        {user && (
          <div className="sidebar-user">
            <div className="sidebar-user-info">
              <span className="sidebar-user-role">{user.role}</span>
              <span className="sidebar-user-email">{user.email}</span>
            </div>
            <button
              className="sidebar-logout"
              onClick={handleLogout}
              title="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
