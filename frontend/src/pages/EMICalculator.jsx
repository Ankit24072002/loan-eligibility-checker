/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { calculateEMI } from '../services/api';

const EMICalculator = () => {
  const [form, setForm] = useState({ loanAmount: 500000, interestRate: 10.5, tenure: 36 });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);

  const fmt = (v) => `₹${Number(v).toLocaleString('en-IN')}`;

  const handleCalculate = async (nextForm = form) => {
    setLoading(true);
    try {
      const { data } = await calculateEMI(nextForm);
      setResult(data);
      setShowSchedule(false);
    } catch {
      // Fallback client-side calc
      const r = nextForm.interestRate / 12 / 100;
      const n = nextForm.tenure;
      const emi = (nextForm.loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      setResult({ monthlyEMI: emi, totalPayable: emi * n, totalInterest: emi * n - nextForm.loanAmount, amortizationTable: [] });
    } finally { setLoading(false); }
  };

  const generateSchedule = () => {
    if (!result) return [];
    if (result.amortizationTable?.length) return result.amortizationTable;

    const schedule = [];
    let balance = form.loanAmount;
    const r = form.interestRate / 12 / 100;
    const emi = result.monthlyEMI;
    for (let i = 1; i <= form.tenure; i++) {
      const interest = balance * r;
      const principal = emi - interest;
      balance -= principal;
      schedule.push({ month: i, emi, principal, interest, balance: Math.max(0, balance) });
    }
    return schedule;
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleCalculate(form);
    }, 250);

    return () => clearTimeout(timer);
  }, [form.loanAmount, form.interestRate, form.tenure]);

  return (
    <div className="page-container">
      <div className="page-header"><h1>EMI Calculator</h1><p>Calculate your monthly EMI and view amortization schedule</p></div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header"><h2>🧮 Calculate EMI</h2></div>

          <div className="amount-display">
            <div className="amount-value">{fmt(form.loanAmount)}</div>
            <div className="amount-label">Loan Amount</div>
          </div>
          <input type="range" min="10000" max="5000000" step="10000" value={form.loanAmount} onChange={e => setForm({...form, loanAmount: +e.target.value})} />
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.75rem', color:'var(--text-muted)' }}><span>₹10K</span><span>₹50L</span></div>

          <div className="form-row" style={{ marginTop: '1.5rem' }}>
            <div className="form-group">
              <label htmlFor="emi-rate">Interest Rate (%)</label>
              <input id="emi-rate" type="number" value={form.interestRate} onChange={e => setForm({...form, interestRate: +e.target.value})} min="1" max="30" step="0.1" />
            </div>
            <div className="form-group">
              <label htmlFor="emi-tenure">Tenure (months)</label>
              <select id="emi-tenure" value={form.tenure} onChange={e => setForm({...form, tenure: +e.target.value})}>
                {[12,24,36,48,60].map(m => <option key={m} value={m}>{m} months ({m/12} {m===12?'year':'years'})</option>)}
              </select>
            </div>
          </div>

          <button className="btn btn-primary btn-block" style={{ marginTop: '1rem' }} onClick={() => handleCalculate(form)} disabled={loading}>
            {loading ? 'Calculating...' : '🔢 Calculate EMI'}
          </button>
        </div>

        <div className="card">
          <div className="card-header"><h2>📊 Results</h2></div>
          {!result ? (
            <div className="empty-state">
              <div className="empty-icon">🧮</div>
              <h3>Enter details to calculate</h3>
              <p>Adjust the amount, rate, and tenure then click calculate</p>
            </div>
          ) : (
            <>
              <div className="emi-result-grid">
                <div className="emi-result-item"><div className="emi-label">Monthly EMI</div><div className="emi-value highlight">{fmt(Math.round(result.monthlyEMI))}</div></div>
                <div className="emi-result-item"><div className="emi-label">Total Interest</div><div className="emi-value">{fmt(Math.round(result.totalInterest))}</div></div>
                <div className="emi-result-item"><div className="emi-label">Total Payable</div><div className="emi-value">{fmt(Math.round(result.totalPayable))}</div></div>
              </div>

              <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Principal</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{fmt(form.loanAmount)}</span>
                </div>
                <div style={{ width: '100%', height: '8px', borderRadius: '4px', background: 'var(--bg-secondary)', overflow: 'hidden' }}>
                  <div style={{ width: `${(form.loanAmount / result.totalPayable * 100)}%`, height: '100%', background: 'var(--accent-gradient)', borderRadius: '4px' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem' }}>
                    <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-primary)', marginRight: 4 }}></span>
                    Principal ({(form.loanAmount / result.totalPayable * 100).toFixed(0)}%)
                  </span>
                  <span style={{ fontSize: '0.75rem' }}>
                    <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'var(--warning)', marginRight: 4 }}></span>
                    Interest ({(result.totalInterest / result.totalPayable * 100).toFixed(0)}%)
                  </span>
                </div>
              </div>

              <div className="amortization-toggle">
                <button className="btn btn-secondary btn-block btn-sm" onClick={() => setShowSchedule(!showSchedule)}>
                  {showSchedule ? 'Hide' : 'Show'} Amortization Schedule
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {showSchedule && result && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <div className="card-header"><h2>📅 Amortization Schedule</h2></div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Month</th><th>EMI</th><th>Principal</th><th>Interest</th><th>Balance</th></tr>
              </thead>
              <tbody>
                {generateSchedule().map(row => (
                  <tr key={row.month}>
                    <td>{row.month}</td>
                    <td>{fmt(Math.round(row.emi))}</td>
                    <td>{fmt(Math.round(row.principal))}</td>
                    <td>{fmt(Math.round(row.interest))}</td>
                    <td>{fmt(Math.round(row.balance))}</td>
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

export default EMICalculator;
