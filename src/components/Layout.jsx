import { NavLink, Outlet } from 'react-router-dom';
import {
  ClipboardList,
  Truck,
  PackageCheck,
  BarChart3,
  Database,
  Home,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: Home, label: 'Dashboard' },
  { to: '/purchase-orders', icon: ClipboardList, label: 'Purchase Orders' },
  { to: '/vendor-portal', icon: Truck, label: 'Vendor Portal' },
  { to: '/receiving', icon: PackageCheck, label: 'Receiving' },
  { to: '/reconciliation', icon: BarChart3, label: 'Reconciliation' },
  { to: '/data', icon: Database, label: 'Data Management' },
];

export default function Layout() {
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
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
