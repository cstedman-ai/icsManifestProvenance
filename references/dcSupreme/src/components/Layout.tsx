import { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutGrid, Cable, Package, Save } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navItems = [
    { path: '/datacenter', label: 'Datacenter', icon: LayoutGrid },
    { path: '/connections', label: 'Connections', icon: Cable },
    { path: '/inventory', label: 'Inventory', icon: Package },
    { path: '/save-restore', label: 'Save / Restore', icon: Save },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg border-r border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-primary-600">DC Supreme</h1>
          <p className="text-sm text-gray-600 mt-1">Datacenter Management</p>
        </div>
        
        <nav className="p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-primary-100 text-primary-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`
                    }
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-50 border-t border-gray-200 w-64">
          <div className="text-xs text-gray-600">
            <p className="font-semibold">Datacenter Specs:</p>
            <p>Area: 20,000 sq ft</p>
            <p>Cabinets: 80 (8 rows × 10)</p>
            <p>Pods: 4 (2 rows each)</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}

