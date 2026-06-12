import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyLoans } from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyLoans().then(({ data }) => setLoans(data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const submitted = loans.filter(l => l.status === 'SUBMITTED').length;
  const underReview = loans.filter(l => l.status === 'UNDER_REVIEW').length;
  const approved = loans.filter(l => l.status === 'APPROVED').length;
  const rejected = loans.filter(l => l.status === 'REJECTED').length;
  const profileComplete = user?.employmentType && user?.monthlyIncome && user?.cibilScore;

  const formatCurrency = (v) => `₹${Number(v).toLocaleString('en-IN')}`;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Welcome, {user?.name?.split(' ')[0]} 👋</h1>
        <p>Here's an overview of your loan applications</p>
      </div>

      {!profileComplete && (
        <div className="alert alert-warning">
          ⚠️ Complete your <Link to="/profile" style={{color:'inherit',fontWeight:700,textDecoration:'underline'}}>financial profile</Link> before applying for a loan.
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon purple">📊</div>
          <div className="stat-value">{loans.length}</div>
          <div className="stat-label">Total Applications</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">📋</div>
          <div className="stat-value">{submitted + underReview}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">✅</div>
          <div className="stat-value">{approved}</div>
          <div className="stat-label">Approved</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red">❌</div>
          <div className="stat-value">{rejected}</div>
          <div className="stat-label">Rejected</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <h2>Quick Actions</h2>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
            <Link to="/apply" className="btn btn-primary btn-block">🚀 Apply for a Loan</Link>
            <Link to="/emi-calculator" className="btn btn-secondary btn-block">🧮 EMI Calculator</Link>
            <Link to="/profile" className="btn btn-secondary btn-block">👤 Update Profile</Link>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Recent Applications</h2>
          </div>
          {loading ? (
            <div className="loading-spinner"><div className="spinner"></div></div>
          ) : loans.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <h3>No applications yet</h3>
              <p>Start by applying for your first loan</p>
            </div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
              {loans.slice(0, 4).map((loan) => (
                <Link to={`/my-applications`} key={loan._id}
                  style={{display:'flex',justifyContent:'space-between',alignItems:'center',
                    padding:'0.75rem 1rem',background:'var(--bg-glass)',borderRadius:'var(--radius-sm)',
                    border:'1px solid var(--border-color)',color:'inherit'}}>
                  <div>
                    <div style={{fontWeight:600,fontSize:'0.9rem',textTransform:'capitalize'}}>{loan.purpose} Loan</div>
                    <div style={{fontSize:'0.75rem',color:'var(--text-muted)'}}>{formatCurrency(loan.loanAmount)}</div>
                  </div>
                  <span className={`badge badge-${loan.status.toLowerCase().replace('_','-')}`}>{loan.status.replace('_',' ')}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
