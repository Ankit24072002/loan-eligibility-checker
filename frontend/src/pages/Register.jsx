import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerUser } from '../services/api';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    if (!/^[6-9]\d{9}$/.test(form.phone)) return setError('Enter a valid 10-digit Indian phone number');
    setLoading(true);
    try {
      const { data } = await registerUser(form);
      login(data);
      navigate('/profile');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-split">
        <div className="auth-side">
          <span className="auth-badge">LoanWise</span>
          <h2 className="auth-side-title">Start your borrowing journey</h2>
          <p className="auth-side-copy">
            Create an account to compare loan offers, preview EMI schedules, and receive tailored eligibility insights instantly.
          </p>
          <ul className="auth-features">
            <li>Personalized loan recommendations</li>
            <li>Secure digital profile</li>
            <li>Fast approval tracking</li>
          </ul>
        </div>

        <div className="auth-form">
          <div className="auth-header">
            <div className="auth-logo-icon">💰</div>
            <h1>Create Account</h1>
            <p>Join LoanWise to check your loan eligibility</p>
          </div>
          {error && <div className="alert alert-error">⚠️ {error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input id="name" placeholder="John Doe" value={form.name} onChange={update('name')} required />
            </div>
            <div className="form-group">
              <label htmlFor="reg-email">Email Address</label>
              <input id="reg-email" type="email" placeholder="you@example.com" value={form.email} onChange={update('email')} required />
            </div>
            <div className="form-group">
              <label htmlFor="reg-password">Password</label>
              <input id="reg-password" type="password" placeholder="Min 6 characters" value={form.password} onChange={update('password')} required />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input id="phone" placeholder="9876543210" value={form.phone} onChange={update('phone')} required />
              <p className="input-hint">10-digit Indian mobile number</p>
            </div>
            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <div className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
