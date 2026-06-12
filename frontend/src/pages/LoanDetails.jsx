import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getLoan } from '../services/api';

const LoanDetails = () => {
  const { id } = useParams();
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getLoan(id)
      .then(({ data }) => setLoan(data))
      .catch(err => setError(err.response?.data?.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, [id]);

  const fmt = (v) => `₹${Number(v).toLocaleString('en-IN')}`;

  if (loading) return <div className="page-container"><div className="loading-spinner"><div className="spinner"></div></div></div>;
  if (error) return <div className="page-container"><div className="alert alert-error">{error}</div></div>;
  if (!loan) return null;

  const isRejected = loan.status === 'REJECTED';

  return (
    <div className="page-container">
      <div style={{ marginBottom: '1rem' }}>
        <Link to="/my-applications" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>← Back to Applications</Link>
      </div>

      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ textTransform: 'capitalize' }}>{loan.purpose} Loan</h1>
          <p>Application #{loan._id.slice(-8).toUpperCase()}</p>
        </div>
        <span className={`badge badge-${loan.status.toLowerCase().replace('_','-')}`} style={{ fontSize: '0.85rem', padding: '6px 16px' }}>
          {loan.status.replace('_', ' ')}
        </span>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon purple">💰</div>
          <div className="stat-value">{fmt(loan.loanAmount)}</div>
          <div className="stat-label">Loan Amount</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">📊</div>
          <div className="stat-value">{fmt(Math.round(loan.monthlyEMI))}</div>
          <div className="stat-label">Monthly EMI</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon yellow">📈</div>
          <div className="stat-value">{loan.interestRate}%</div>
          <div className="stat-label">Interest Rate</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">📅</div>
          <div className="stat-value">{loan.tenure} mo</div>
          <div className="stat-label">Tenure</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header"><h2>📋 Loan Details</h2></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              ['Purpose', loan.purpose],
              ['Total Interest', fmt(Math.round(loan.totalInterest))],
              ['Total Payable', fmt(Math.round(loan.totalPayable))],
              ['FOIR', `${(loan.foir * 100).toFixed(1)}%`],
              ['Eligibility', loan.eligibilityStatus?.replace('_', ' ')],
              ['Applied On', new Date(loan.createdAt).toLocaleString('en-IN')],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(99,102,241,0.08)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{label}</span>
                <span style={{ fontWeight: 600, fontSize: '0.9rem', textTransform: 'capitalize' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h2>📍 Status Timeline</h2></div>
          <div className="timeline">
            {loan.statusHistory?.map((entry, i) => (
              <div key={i} className={`timeline-item ${i === loan.statusHistory.length - 1 ? (isRejected ? 'rejected' : 'active') : 'completed'}`}>
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <h4>{entry.status.replace('_', ' ')}</h4>
                  <p>{entry.note || 'Status updated'}</p>
                  <p style={{ fontSize: '0.7rem', marginTop: '0.25rem' }}>{new Date(entry.date).toLocaleString('en-IN')}</p>
                </div>
              </div>
            ))}
          </div>

          {loan.rejectionReasons?.length > 0 && (
            <div style={{ marginTop: '1.5rem' }}>
              <h4 style={{ color: 'var(--danger)', marginBottom: '0.5rem' }}>Rejection Reasons</h4>
              {loan.rejectionReasons.map((r, i) => (
                <div key={i} className="alert alert-error" style={{ marginBottom: '0.5rem' }}>❌ {r}</div>
              ))}
            </div>
          )}

          {loan.adminNote && (
            <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Admin Note</div>
              <div style={{ fontSize: '0.85rem' }}>{loan.adminNote}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoanDetails;
