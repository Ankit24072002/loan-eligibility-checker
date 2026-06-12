import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-glow"></div>
        <div className="hero-content">
          <div className="hero-badge">🚀 Smart Loan Decisions, Instantly</div>
          <h1 className="hero-title">
            Your Journey to
            <span className="gradient-text"> Financial Freedom</span>
            <br />Starts Here
          </h1>
          <p className="hero-description">
            Check your loan eligibility in minutes with our AI-powered analysis engine.
            Get instant EMI calculations, CIBIL-based assessments, and real-time application tracking.
          </p>
          <div className="hero-actions">
            {user ? (
              <>
                <Link to="/dashboard" className="btn btn-primary btn-lg">Go to Dashboard</Link>
                <Link to="/emi-calculator" className="btn btn-secondary btn-lg">Calculate EMI</Link>
              </>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg">Get Started Free</Link>
                <Link to="/login" className="btn btn-secondary btn-lg">Sign In</Link>
              </>
            )}
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-value">₹50L+</div>
              <div className="hero-stat-label">Max Loan Amount</div>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat">
              <div className="hero-stat-value">10.5%</div>
              <div className="hero-stat-label">Starting Interest</div>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat">
              <div className="hero-stat-value">60 mo</div>
              <div className="hero-stat-label">Flexible Tenure</div>
            </div>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="section-header">
          <h2>Why Choose <span className="gradient-text">LoanWise</span>?</h2>
          <p>Smart features designed for modern borrowers</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Instant Eligibility</h3>
            <p>Know your eligibility in seconds based on FOIR, CIBIL score, and income analysis</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🧮</div>
            <h3>EMI Calculator</h3>
            <p>Advanced calculator with amortization schedule and multiple tenure comparison</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Real-time Tracking</h3>
            <p>Track your application status with live timeline updates and notifications</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Bank-Grade Security</h3>
            <p>Your data is protected with JWT authentication and encrypted storage</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🏦</div>
            <h3>Multiple Loan Types</h3>
            <p>Home, car, education, personal, business, medical, wedding, and more</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Responsive Design</h3>
            <p>Apply from any device — desktop, tablet, or mobile with full functionality</p>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-card">
          <h2>Ready to Check Your Eligibility?</h2>
          <p>Join thousands of users who trust LoanWise for smart financial decisions</p>
          {!user && (
            <Link to="/register" className="btn btn-primary btn-lg">Create Free Account</Link>
          )}
        </div>
      </section>

      <footer className="home-footer">
        <p>© 2026 LoanWise. Built with ❤️ for smart borrowers.</p>
      </footer>
    </div>
  );
};

export default Home;
