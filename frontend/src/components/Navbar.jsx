import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/dashboard" className="navbar-brand">
          <div className="logo-icon">💰</div>
          LoanWise
        </Link>

        <div className="navbar-links">
          <Link to="/dashboard" className={isActive('/dashboard')}>Dashboard</Link>
          <Link to="/apply" className={isActive('/apply')}>Apply</Link>
          <Link to="/emi-calculator" className={isActive('/emi-calculator')}>EMI Calc</Link>
          <Link to="/my-applications" className={isActive('/my-applications')}>My Loans</Link>
          <Link to="/profile" className={isActive('/profile')}>Profile</Link>
          {user.role === 'admin' && (
            <Link to="/admin" className={isActive('/admin')}>Admin</Link>
          )}
          <div className="nav-user-badge">
            {user.name?.split(' ')[0]}
            {user.role === 'admin' && <span className="role-badge">Admin</span>}
          </div>
          <button onClick={handleLogout} className="nav-btn-logout">Logout</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
