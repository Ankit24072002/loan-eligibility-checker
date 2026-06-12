import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyLoans } from '../services/api';

const MyApplications = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    getMyLoans().then(({ data }) => setLoans(data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const fmt = (v) => `₹${Number(v).toLocaleString('en-IN')}`;
  const filtered = filter === 'ALL' ? loans : loans.filter(l => l.status === filter);

  const statusCounts = {
    ALL: loans.length,
    SUBMITTED: loans.filter(l => l.status === 'SUBMITTED').length,
    UNDER_REVIEW: loans.filter(l => l.status === 'UNDER_REVIEW').length,
    APPROVED: loans.filter(l => l.status === 'APPROVED').length,
    REJECTED: loans.filter(l => l.status === 'REJECTED').length,
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>My Applications</h1>
        <p>Track all your loan applications</p>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {Object.entries(statusCounts).map(([key, count]) => (
          <button key={key} className={`btn btn-sm ${filter === key ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter(key)}>
            {key.replace('_', ' ')} ({count})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner"></div></div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>No applications found</h3>
            <p>{filter === 'ALL' ? 'Start by applying for your first loan' : `No ${filter.replace('_', ' ').toLowerCase()} applications`}</p>
            {filter === 'ALL' && <Link to="/apply" className="btn btn-primary" style={{ marginTop: '1rem' }}>Apply Now</Link>}
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Purpose</th>
                  <th>Amount</th>
                  <th>EMI</th>
                  <th>Tenure</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(loan => (
                  <tr key={loan._id}>
                    <td style={{ textTransform: 'capitalize', fontWeight: 600 }}>{loan.purpose}</td>
                    <td>{fmt(loan.loanAmount)}</td>
                    <td>{fmt(Math.round(loan.monthlyEMI))}</td>
                    <td>{loan.tenure} mo</td>
                    <td><span className={`badge badge-${loan.status.toLowerCase().replace('_','-')}`}>{loan.status.replace('_',' ')}</span></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{new Date(loan.createdAt).toLocaleDateString('en-IN')}</td>
                    <td><Link to={`/my-applications/${loan._id}`} className="btn btn-sm btn-secondary">View</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyApplications;
