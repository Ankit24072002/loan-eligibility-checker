/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { getAdminDashboard, getAdminApplications, updateApplicationStatus } from '../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [apps, setApps] = useState([]);
  const [pagination, setPagination] = useState({});
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [approvedAmount, setApprovedAmount] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  const fmt = (v) => `₹${Number(v).toLocaleString('en-IN')}`;

  const loadData = async () => {
    try {
      const [dashRes, appRes] = await Promise.all([
        getAdminDashboard(),
        getAdminApplications({ status: filter || undefined, page, limit: 10 }),
      ]);
      setStats(dashRes.data);
      setApps(appRes.data.applications);
      setPagination(appRes.data.pagination);
    } catch {
      setMessage({ type: 'error', text: 'Failed to load admin data' });
    } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, [filter, page]);

  const handleStatusUpdate = async (id, status) => {
    setActionLoading(id);
    setMessage({ type: '', text: '' });
    try {
      // Client-side validation for reject
      if (status === 'REJECTED' && (!adminNote || adminNote.trim().length === 0)) {
        setMessage({ type: 'error', text: 'Please provide a rejection reason' });
        setActionLoading('');
        return;
      }

      const payload = { status, adminNote };
      if (status === 'APPROVED') payload.approvedAmount = approvedAmount ? Number(approvedAmount) : undefined;

      await updateApplicationStatus(id, payload);
      setMessage({ type: 'success', text: `Application ${status.toLowerCase()} successfully` });
      setSelectedApp(null);
      setAdminNote('');
      setApprovedAmount('');
      setSelectedAction('');
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update' });
    } finally { setActionLoading(''); }
  };

  if (loading) return <div className="page-container"><div className="loading-spinner"><div className="spinner"></div></div></div>;

  return (
    <div className="page-container">
      <div className="page-header"><h1>Admin Dashboard</h1><p>Manage loan applications and view analytics</p></div>

      {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      {stats && (
        <div className="stats-grid">
          <div className="stat-card"><div className="stat-icon purple">📊</div><div className="stat-value">{stats.totalApplications}</div><div className="stat-label">Total Applications</div></div>
          <div className="stat-card"><div className="stat-icon blue">📋</div><div className="stat-value">{stats.pendingApplications}</div><div className="stat-label">Pending</div></div>
          <div className="stat-card"><div className="stat-icon yellow">🔍</div><div className="stat-value">{stats.underReview}</div><div className="stat-label">Under Review</div></div>
          <div className="stat-card"><div className="stat-icon green">✅</div><div className="stat-value">{stats.approved}</div><div className="stat-label">Approved</div></div>
          <div className="stat-card"><div className="stat-icon red">❌</div><div className="stat-value">{stats.rejected}</div><div className="stat-label">Rejected</div></div>
          <div className="stat-card"><div className="stat-icon purple">👥</div><div className="stat-value">{stats.totalUsers}</div><div className="stat-label">Users</div></div>
          <div className="stat-card"><div className="stat-icon green">💰</div><div className="stat-value">{fmt(stats.totalDisbursed)}</div><div className="stat-label">Disbursed</div></div>
          <div className="stat-card"><div className="stat-icon blue">📈</div><div className="stat-value">{stats.approvalRate}%</div><div className="stat-label">Approval Rate</div></div>
        </div>
      )}

      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <h2>All Applications</h2>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'].map(s => (
              <button key={s} className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { setFilter(s); setPage(1); }}>
                {s ? s.replace('_', ' ') : 'ALL'}
              </button>
            ))}
          </div>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>Applicant</th><th>Purpose</th><th>Amount</th><th>Income</th><th>FOIR</th><th>EMI</th><th>CIBIL</th><th>Status</th><th>Date</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {apps.map(app => (
                <tr key={app._id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{app.user?.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{app.user?.email}</div>
                  </td>
                  <td style={{ textTransform: 'capitalize' }}>{app.purpose}</td>
                  <td>{fmt(app.loanAmount)}</td>
                  <td>{fmt(app.user?.monthlyIncome || 0)}</td>
                  <td>{(app.foir * 100).toFixed(1)}%</td>
                  <td>{fmt(Math.round(app.monthlyEMI))}</td>
                  <td>{app.user?.cibilScore}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <span className={`badge badge-${app.status.toLowerCase().replace('_','-')}`}>{app.status.replace('_',' ')}</span>
                      {app.status === 'REJECTED' && (app.rejectionReasons?.length > 0 || app.adminNote) && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{app.rejectionReasons?.[0] || app.adminNote}</div>
                      )}
                    </div>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(app.createdAt).toLocaleDateString('en-IN')}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      {app.status === 'SUBMITTED' && (
                        <button className="btn btn-sm btn-secondary" disabled={actionLoading === app._id} onClick={() => handleStatusUpdate(app._id, 'UNDER_REVIEW')}>Review</button>
                      )}
                      {(app.status === 'SUBMITTED' || app.status === 'UNDER_REVIEW') && (
                        <>
                          <button className="btn btn-sm btn-success" disabled={actionLoading === app._id} onClick={() => { setSelectedApp(app._id); setSelectedAction('APPROVE'); setApprovedAmount(app.loanAmount); }}>✓</button>
                          <button className="btn btn-sm btn-danger" disabled={actionLoading === app._id} onClick={() => { setSelectedApp(app._id); setSelectedAction('REJECT'); setAdminNote(''); }}>✗</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pagination.pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
            {Array.from({ length: pagination.pages }, (_, i) => (
              <button key={i} className={`btn btn-sm ${page === i+1 ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setPage(i+1)}>{i+1}</button>
            ))}
          </div>
        )}
      </div>

      {selectedApp && (
        <div style={{ position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:'2rem' }}>
          <div className="card" style={{ maxWidth:480, width:'100%' }}>
            <div className="card-header">
              <h2>{selectedAction === 'APPROVE' ? 'Approve Application' : 'Reject Application'}</h2>
              <p>{selectedAction === 'APPROVE' ? 'Set approved amount (optional)' : 'Provide a reason for rejection'}</p>
            </div>

            {selectedAction === 'APPROVE' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div className="form-group">
                  <label>Approved Amount (₹)</label>
                  <input type="number" value={approvedAmount} onChange={e => setApprovedAmount(e.target.value)} style={{ width: '100%', padding: '12px 16px' }} />
                </div>
                <div className="btn-group">
                  <button className="btn btn-success" onClick={() => handleStatusUpdate(selectedApp, 'APPROVED')} disabled={actionLoading === selectedApp}>Approve</button>
                  <button className="btn btn-secondary" onClick={() => { setSelectedApp(null); setSelectedAction(''); setApprovedAmount(''); }}>Cancel</button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div className="form-group">
                  <label htmlFor="admin-reject-note">Rejection Note</label>
                  <textarea id="admin-reject-note" value={adminNote} onChange={e => setAdminNote(e.target.value)} rows={3} placeholder="Enter reason for rejection..." style={{ width:'100%', padding:'12px 16px', background:'var(--bg-secondary)', border:'1px solid var(--border-color)', borderRadius:'var(--radius-sm)', color:'var(--text-primary)', fontFamily:'var(--font)', fontSize:'0.9rem', resize:'vertical' }}></textarea>
                </div>
                <div className="btn-group">
                  <button className="btn btn-danger" onClick={() => handleStatusUpdate(selectedApp, 'REJECTED')} disabled={actionLoading === selectedApp}>Reject</button>
                  <button className="btn btn-secondary" onClick={() => { setSelectedApp(null); setSelectedAction(''); setAdminNote(''); }}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
