import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import './pages.css';

const AdminLoginPage = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { adminLogin, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAdmin) {
      navigate('/admin/dashboard');
    }
  }, [isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await adminLogin(password);
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page adminLoginPage">
      <section className="authCard adminLoginCard">
        <span className="eyebrow">Admin Access</span>
        <h1>Enter the SVE Lights control room.</h1>
        <p>
          Use the admin password to manage products and collections inside the same visual system as
          the main site.
        </p>

        <form className="authForm" onSubmit={handleSubmit}>
          <label className="fieldGroup">
            <span>Admin password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              required
            />
          </label>

          {error ? <div className="stateCard errorCard compactCard">{error}</div> : null}

          <button className="primaryButton" type="submit" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login to Admin'}
          </button>
        </form>
      </section>
    </div>
  );
};

export default AdminLoginPage;
