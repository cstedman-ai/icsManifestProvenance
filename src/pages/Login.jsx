import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Building2, Truck, LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const [activePanel, setActivePanel] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    login(activePanel, email.trim());
  };

  const handleCardClick = (role) => {
    setActivePanel(role);
    setEmail('');
    setPassword('');
    setError('');
  };

  const handleBack = () => {
    setActivePanel(null);
    setEmail('');
    setPassword('');
    setError('');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-brand">
          <h1>ICS Supreme</h1>
          <p>Purchase Reconciliation Platform</p>
        </div>

        {!activePanel ? (
          <>
            <h2 className="login-title">Sign in to continue</h2>
            <p className="login-subtitle">Select your portal to get started</p>
            <div className="login-cards">
              <button
                className="login-card"
                onClick={() => handleCardClick('coreweave')}
              >
                <div className="login-card-icon login-card-icon--coreweave">
                  <Building2 size={28} />
                </div>
                <h3>Coreweave</h3>
                <p>Internal team access to purchase orders, receiving, reconciliation, and data management.</p>
                <span className="login-card-action">
                  <LogIn size={16} /> Sign in
                </span>
              </button>

              <button
                className="login-card"
                onClick={() => handleCardClick('vendor')}
              >
                <div className="login-card-icon login-card-icon--vendor">
                  <Truck size={28} />
                </div>
                <h3>Vendor</h3>
                <p>Vendor portal for submitting shipment manifests and tracking delivery status.</p>
                <span className="login-card-action">
                  <LogIn size={16} /> Sign in
                </span>
              </button>
            </div>
          </>
        ) : (
          <div className="login-form-panel">
            <button className="login-back" onClick={handleBack}>
              &larr; Back
            </button>
            <div className={`login-form-header login-form-header--${activePanel}`}>
              {activePanel === 'coreweave' ? (
                <Building2 size={24} />
              ) : (
                <Truck size={24} />
              )}
              <h2>{activePanel === 'coreweave' ? 'Coreweave' : 'Vendor'} Login</h2>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <div className="login-input-wrap">
                  <Mail size={16} className="login-input-icon" />
                  <input
                    id="email"
                    type="text"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="login-input-wrap">
                  <Lock size={16} className="login-input-icon" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="login-toggle-pw"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn btn-primary login-submit">
                <LogIn size={16} /> Sign in
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
