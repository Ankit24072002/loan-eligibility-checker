import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { submitLoan, calculateEMI } from '../services/api';

const PURPOSES = [
  { value: 'home', icon: '🏠', label: 'Home' },
  { value: 'car', icon: '🚗', label: 'Car' },
  { value: 'education', icon: '🎓', label: 'Education' },
  { value: 'personal', icon: '👤', label: 'Personal' },
  { value: 'business', icon: '💼', label: 'Business' },
  { value: 'medical', icon: '🏥', label: 'Medical' },
  { value: 'wedding', icon: '💒', label: 'Wedding' },
  { value: 'travel', icon: '✈️', label: 'Travel' },
];

const TENURES = [12, 24, 36, 48, 60];

const LoanApplication = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ loanAmount: 500000, purpose: '', tenure: 36 });
  const [emiPreview, setEmiPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const profileComplete = user?.employmentType && user?.monthlyIncome && user?.cibilScore;
  const fmt = (v) => `₹${Number(v).toLocaleString('en-IN')}`;

  const nextStep = async () => {
    if (step === 1 && !form.purpose) { setError('Please select a loan purpose'); return; }
    setError('');
    if (step === 2) {
      try {
        const { data } = await calculateEMI({ loanAmount: form.loanAmount, interestRate: 10.5, tenure: form.tenure });
        setEmiPreview(data);
      } catch { /* continue */ }
    }
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    setLoading(true); setError('');
    try {
      const { data } = await submitLoan(form);
      setResult(data); setStep(4);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit');
    } finally { setLoading(false); }
  };

  if (!profileComplete) {
    return (
      <div className="page-container">
        <div className="page-header"><h1>Apply for a Loan</h1></div>
        <div className="card" style={{ maxWidth: 600, textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h2>Complete Your Profile First</h2>
          <p style={{ color: 'var(--text-secondary)', margin: '1rem 0' }}>Provide employment, income, and CIBIL score before applying.</p>
          <button onClick={() => navigate('/profile')} className="btn btn-primary btn-lg">Complete Profile →</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header"><h1>Apply for a Loan</h1><p>Complete the form to check eligibility and apply</p></div>

      {step <= 3 && (
        <div className="stepper">
          {['Loan Details', 'Tenure', 'Review'].map((label, i) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center' }}>
              <div className={`stepper-step ${step === i+1 ? 'active' : step > i+1 ? 'completed' : ''}`}>
                <div className="stepper-circle">{step > i+1 ? '✓' : i+1}</div>
                <span className="stepper-label">{label}</span>
              </div>
              {i < 2 && <div className={`stepper-line ${step > i+1 ? 'completed' : ''}`}></div>}
            </div>
          ))}
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      <div style={{ maxWidth: 720 }}>
        {step === 1 && (
          <div className="card">
            <div className="card-header"><h2>💰 Amount & Purpose</h2></div>
            <div className="amount-display">
              <div className="amount-value">{fmt(form.loanAmount)}</div>
              <div className="amount-label">Loan Amount</div>
            </div>
            <input type="range" min="10000" max="5000000" step="10000" value={form.loanAmount} onChange={e => setForm({...form, loanAmount: +e.target.value})} />
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.75rem', color:'var(--text-muted)' }}><span>₹10K</span><span>₹50L</span></div>
            <div style={{ marginTop: '2rem' }}>
              <label style={{ display:'block', fontSize:'0.85rem', fontWeight:600, color:'var(--text-secondary)', marginBottom:'0.75rem' }}>Select Purpose</label>
              <div className="purpose-grid">
                {PURPOSES.map(p => (
                  <div key={p.value} className={`purpose-option ${form.purpose === p.value ? 'selected' : ''}`} onClick={() => { setForm({...form, purpose: p.value}); setError(''); }}>
                    <div className="purpose-icon">{p.icon}</div>
                    <div className="purpose-label">{p.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginTop:'2rem', display:'flex', justifyContent:'flex-end' }}>
              <button className="btn btn-primary" onClick={nextStep}>Continue →</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="card">
            <div className="card-header"><h2>📅 Select Tenure</h2></div>
            <div className="tenure-grid">
              {TENURES.map(m => (
                <div key={m} className={`tenure-option ${form.tenure === m ? 'selected' : ''}`} onClick={() => setForm({...form, tenure: m})}>
                  <div className="tenure-months">{m}</div>
                  <div className="tenure-label">{m/12} {m === 12 ? 'Year' : 'Years'}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop:'2rem', display:'flex', justifyContent:'space-between' }}>
              <button className="btn btn-secondary" onClick={() => setStep(1)}>← Back</button>
              <button className="btn btn-primary" onClick={nextStep}>Continue →</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="card">
            <div className="card-header"><h2>📋 Review</h2></div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', padding:'1.25rem', background:'var(--bg-glass)', borderRadius:'var(--radius-md)', border:'1px solid var(--border-color)' }}>
              <div><div style={{ fontSize:'0.75rem', color:'var(--text-muted)', textTransform:'uppercase' }}>Amount</div><div style={{ fontSize:'1.25rem', fontWeight:700, marginTop:'0.25rem' }}>{fmt(form.loanAmount)}</div></div>
              <div><div style={{ fontSize:'0.75rem', color:'var(--text-muted)', textTransform:'uppercase' }}>Purpose</div><div style={{ fontSize:'1.25rem', fontWeight:700, marginTop:'0.25rem', textTransform:'capitalize' }}>{form.purpose}</div></div>
              <div><div style={{ fontSize:'0.75rem', color:'var(--text-muted)', textTransform:'uppercase' }}>Tenure</div><div style={{ fontSize:'1.25rem', fontWeight:700, marginTop:'0.25rem' }}>{form.tenure} months</div></div>
              <div><div style={{ fontSize:'0.75rem', color:'var(--text-muted)', textTransform:'uppercase' }}>Income</div><div style={{ fontSize:'1.25rem', fontWeight:700, marginTop:'0.25rem' }}>{fmt(user.monthlyIncome)}/mo</div></div>
            </div>
            {emiPreview && (
              <div className="emi-result-grid" style={{ marginTop:'1rem' }}>
                <div className="emi-result-item"><div className="emi-label">Monthly EMI</div><div className="emi-value highlight">{fmt(Math.round(emiPreview.monthlyEMI))}</div></div>
                <div className="emi-result-item"><div className="emi-label">Total Interest</div><div className="emi-value">{fmt(Math.round(emiPreview.totalInterest))}</div></div>
                <div className="emi-result-item"><div className="emi-label">Total Payable</div><div className="emi-value">{fmt(Math.round(emiPreview.totalPayable))}</div></div>
              </div>
            )}
            <div style={{ marginTop:'2rem', display:'flex', justifyContent:'space-between' }}>
              <button className="btn btn-secondary" onClick={() => setStep(2)}>← Back</button>
              <button className="btn btn-primary btn-lg" onClick={handleSubmit} disabled={loading}>{loading ? 'Submitting...' : '🚀 Submit'}</button>
            </div>
          </div>
        )}

        {step === 4 && result && (
          <div className="card" style={{ textAlign:'center', padding:'3rem' }}>
            {result.eligibility?.isEligible ? (
              <><div style={{ fontSize:'4rem', marginBottom:'1rem' }}>🎉</div><h2>Application Submitted!</h2><span className="badge badge-eligible" style={{ fontSize:'0.85rem', padding:'6px 16px' }}>Eligible</span><p style={{ color:'var(--text-secondary)', margin:'1rem 0' }}>Your application is now under review.</p></>
            ) : (
              <><div style={{ fontSize:'4rem', marginBottom:'1rem' }}>😔</div><h2>Not Eligible</h2><span className="badge badge-not-eligible" style={{ fontSize:'0.85rem', padding:'6px 16px' }}>Not Eligible</span>
              <div style={{ margin:'1.5rem 0', textAlign:'left' }}>{result.eligibility?.reasons?.map((r,i) => <div key={i} className="alert alert-error">❌ {r}</div>)}</div></>
            )}
            <div style={{ marginTop:'2rem', display:'flex', gap:'1rem', justifyContent:'center' }}>
              <button className="btn btn-primary" onClick={() => navigate('/my-applications')}>View Applications</button>
              <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>Dashboard</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoanApplication;
