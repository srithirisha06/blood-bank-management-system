import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate, Link } from 'react-router-dom';
import { FaTint, FaLock, FaEnvelope } from 'react-icons/fa';

const Login = () => {
  const { loginUser } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      addToast('Please enter both email and password', 'warning');
      return;
    }

    try {
      setLoading(true);
      const data = await loginUser(email, password);
      addToast(`Welcome back, ${data.user.name}!`, 'success');

      if (data.user.role === 'donor') navigate('/donor/dashboard');
      else if (data.user.role === 'hospital') navigate('/hospital/dashboard');
      else if (data.user.role === 'staff') navigate('/staff/dashboard');
      else navigate('/admin/dashboard');
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed. Invalid credentials.';
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card card-healthcare p-4 p-md-5 shadow-lg border-0">
              <div className="text-center mb-4">
                <span className="fs-1 text-danger"><FaTint /></span>
                <h3 className="fw-bold brand-font text-dark mt-2">Sign In to LifeFlow</h3>
                <p className="text-muted small">Enter your portal credentials</p>
              </div>

              {/* Quick Admin Credential Fill */}
              <div className="mb-4 p-3 bg-light rounded border text-center">
                <small className="fw-bold text-uppercase d-block mb-2 text-muted" style={{ fontSize: '0.7rem' }}>
                  Admin Login Shortcut:
                </small>
                <button type="button" className="btn btn-sm btn-outline-danger w-100" onClick={() => handleQuickLogin('admin@bloodbank.com', 'Admin@123')}>
                  Autofill Admin Credentials
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-semibold small">Email Address</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light text-muted"><FaEnvelope /></span>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold small">Password</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light text-muted"><FaLock /></span>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-blood-danger w-100 py-2 shadow-sm"
                  disabled={loading}
                >
                  {loading ? 'Authenticating...' : 'Sign In'}
                </button>
              </form>

              <div className="mt-4 text-center">
                <p className="text-muted small mb-0">
                  Don't have an account? <Link to="/register" className="text-danger fw-semibold">Register Here</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
