import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProfile, updateProfile } from '../services/api';

const Profile = () => {
  const { updateUser } = useAuth();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    employmentType: '',
    monthlyIncome: '',
    existingEMIs: '',
    cibilScore: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    getProfile()
      .then(({ data }) => {
        setForm({
          name: data.name || '',
          phone: data.phone || '',
          employmentType: data.employmentType || '',
          monthlyIncome: data.monthlyIncome || '',
          existingEMIs: data.existingEMIs || '',
          cibilScore: data.cibilScore || '',
        });
      })
      .catch(() => {
        setMessage({ type: 'error', text: 'Failed to load profile' });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const payload = {
        ...form,
        monthlyIncome: Number(form.monthlyIncome),
        existingEMIs: Number(form.existingEMIs),
        cibilScore: Number(form.cibilScore),
      };
      const { data } = await updateProfile(payload);
      updateUser(data.user);
      setMessage({ type: 'success', text: '✅ Profile updated successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const profileComplete = form.employmentType && form.monthlyIncome && form.cibilScore;

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-spinner"><div className="spinner"></div></div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Financial Profile</h1>
        <p>Complete your profile to check loan eligibility</p>
      </div>

      {!profileComplete && (
        <div className="alert alert-warning">
          ⚠️ Please fill in your employment type, monthly income, and CIBIL score to apply for loans.
        </div>
      )}

      {message.text && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

      <div style={{ maxWidth: '720px' }}>
        <form onSubmit={handleSubmit}>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header">
              <h2>👤 Personal Information</h2>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="profile-name">Full Name</label>
                <input id="profile-name" name="name" value={form.name} onChange={handleChange} placeholder="Your name" />
              </div>
              <div className="form-group">
                <label htmlFor="profile-phone">Phone Number</label>
                <input id="profile-phone" name="phone" value={form.phone} onChange={handleChange} placeholder="10-digit number" />
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header">
              <h2>💼 Financial Details</h2>
              <p>This information is used for eligibility assessment</p>
            </div>
            <div className="form-group">
              <label htmlFor="profile-employment">Employment Type</label>
              <select id="profile-employment" name="employmentType" value={form.employmentType} onChange={handleChange}>
                <option value="">Select employment type</option>
                <option value="salaried">Salaried</option>
                <option value="self-employed">Self Employed</option>
                <option value="business">Business Owner</option>
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="profile-income">Monthly Income (₹)</label>
                <input id="profile-income" name="monthlyIncome" type="number" value={form.monthlyIncome} onChange={handleChange} placeholder="e.g. 50000" min="0" />
                <div className="input-hint">Net monthly income after taxes</div>
              </div>
              <div className="form-group">
                <label htmlFor="profile-emis">Existing EMIs (₹)</label>
                <input id="profile-emis" name="existingEMIs" type="number" value={form.existingEMIs} onChange={handleChange} placeholder="e.g. 5000" min="0" />
                <div className="input-hint">Total of all current EMI payments</div>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="profile-cibil">CIBIL Score</label>
              <input id="profile-cibil" name="cibilScore" type="number" value={form.cibilScore} onChange={handleChange} placeholder="300 - 900" min="300" max="900" />
              <div className="input-hint">Your credit score (300-900). Check on cibil.com if unknown.</div>
            </div>
          </div>

          {form.cibilScore && (
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <div className="card-header">
                <h2>📊 CIBIL Score Analysis</h2>
              </div>
              <div className="cibil-meter">
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'space-between',
                  padding: '1rem', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)'
                }}>
                  <div>
                    <div style={{ fontSize: '2rem', fontWeight: 800 }}>{form.cibilScore}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Your Score</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className={`badge ${Number(form.cibilScore) >= 750 ? 'badge-approved' : Number(form.cibilScore) >= 650 ? 'badge-under-review' : 'badge-rejected'}`}>
                      {Number(form.cibilScore) >= 750 ? 'Excellent' : Number(form.cibilScore) >= 650 ? 'Good' : Number(form.cibilScore) >= 550 ? 'Fair' : 'Poor'}
                    </span>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                      {Number(form.cibilScore) >= 750 ? 'Best interest rates available' : Number(form.cibilScore) >= 650 ? 'Good chance of approval' : 'May face higher rates'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={saving}>
            {saving ? 'Saving...' : '💾 Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
