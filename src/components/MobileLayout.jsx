import { Outlet, useNavigate } from 'react-router-dom';
import { LogOut, ScanLine } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function MobileLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="mobile-layout">
      <header className="mobile-header">
        <div className="mobile-header-brand">
          <ScanLine size={18} />
          <span>ICS Supreme</span>
        </div>
        {user && (
          <div className="mobile-header-user">
            <span className="mobile-header-email">{user.email}</span>
            <button
              className="mobile-header-logout"
              onClick={handleLogout}
              title="Sign out"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
      </header>
      <main className="mobile-content">
        <Outlet />
      </main>
    </div>
  );
}
