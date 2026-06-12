# 🏦 LoanWise — Loan Eligibility Checker

A full-stack MERN application for checking loan eligibility, calculating EMIs, and managing loan applications with an admin dashboard.

## ✨ Features

- **JWT Authentication** — Secure registration & login with bcrypt password hashing
- **User Profile** — Update employment type, income, existing EMIs, and CIBIL score
- **Multi-Step Loan Application** — Loan amount, purpose, tenure selection with EMI preview
- **EMI Calculator** — Real-time EMI calculation with amortization schedule
- **Eligibility Engine** — Automated assessment using FOIR, CIBIL score, and income rules
- **Application Tracking** — Status timeline with rejection reasons
- **Admin Dashboard** — Statistics, approve/reject applications, analytics
- **Mock Email Notifications** — Console-based email simulation

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, React Router, Axios, Context API |
| Backend | Node.js, Express.js, JWT, express-validator |
| Database | MongoDB with Mongoose |
| Styling | Vanilla CSS (dark theme, glassmorphism) |

## 📁 Folder Structure

```
Loan Eligibility Checker/
├── backend/
│   ├── config/         # Database connection
│   ├── controllers/    # Route handlers
│   ├── middleware/      # Auth & admin middleware
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API route definitions
│   ├── seed/            # Admin user seeder
│   ├── utils/           # EMI calculator & eligibility engine
│   ├── server.js        # Express entry point
│   ├── .env             # Environment variables
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # Navbar, ProtectedRoute
│   │   ├── context/     # AuthContext (Context API)
│   │   ├── pages/       # All page components
│   │   ├── services/    # Axios API service
│   │   ├── index.css    # Design system
│   │   ├── main.jsx     # App entry point
│   │   └── App.jsx      # Router setup
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## 🚀 Setup Instructions

### Prerequisites

- Node.js v18+
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

### Step 1: Clone & Navigate

```bash
cd "Loan Eligibility Checker"
```

### Step 2: Configure Environment Variables

Edit `backend/.env` and set your MongoDB connection URI:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/loan-eligibility-checker
JWT_SECRET=loan_checker_jwt_secret_key_2024_super_secure
JWT_EXPIRE=7d
NODE_ENV=development
```

### Step 3: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 4: Seed Admin User

```bash
npm run seed
```

This creates an admin user:
- **Email:** `admin@loancheck.com`
- **Password:** `Admin@123`

### Step 5: Start Backend Server

```bash
npm run dev
```

Backend runs on `http://localhost:5000`

### Step 6: Install & Start Frontend (new terminal)

```bash
cd frontend
npm install    # (already done if node_modules exists)
npm run dev
```

Frontend runs on `http://localhost:3000`

## 📡 API Endpoints

### Authentication
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login user |
| GET | `/api/auth/me` | Private | Get current user |

### Profile
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/api/profile` | Private | Get user profile |
| PUT | `/api/profile` | Private | Update profile |

### Loan Applications
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/loans` | Private | Submit loan application |
| GET | `/api/loans` | Private | Get my applications |
| GET | `/api/loans/:id` | Private | Get single application |

### EMI Calculator
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/emi/calculate` | Public | Calculate EMI |

### Admin
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/api/admin/dashboard` | Admin | Dashboard statistics |
| GET | `/api/admin/applications` | Admin | All applications |
| PUT | `/api/admin/applications/:id` | Admin | Update status |

## 🔒 Eligibility Rules

| Rule | Criteria |
|------|---------|
| FOIR | (Existing EMIs + New EMI) / Monthly Income ≤ 50% |
| CIBIL Score | Minimum 650 |
| Monthly Income | Minimum ₹25,000 |

## 👤 Default Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@loancheck.com | Admin@123 |

## 🎯 Testing the Application

### Test User Credentials
- **Email:** testuser@example.com
- **Password:** Test@123

### Test Admin Credentials
- **Email:** admin@loancheck.com
- **Password:** Admin@123 (created via `npm run seed`)

### Sample Test Cases

#### 1. Check Eligibility - Should Pass
```
Employment: Salaried
Monthly Income: ₹1,00,000
Existing EMIs: ₹5,000
CIBIL Score: 750
Loan Amount: ₹5,00,000
Tenure: 36 months
```

#### 2. Check Eligibility - CIBIL Rejection
```
Employment: Salaried
Monthly Income: ₹50,000
Existing EMIs: ₹5,000
CIBIL Score: 600 (Below 650)
Loan Amount: ₹5,00,000
```

#### 3. Check Eligibility - FOIR Rejection
```
Employment: Salaried
Monthly Income: ₹50,000
Existing EMIs: ₹30,000 (Already high)
CIBIL Score: 750
Loan Amount: ₹10,00,000 (Will exceed FOIR)
```

#### 4. Check Eligibility - Income Rejection
```
Employment: Business
Monthly Income: ₹20,000 (Below ₹25,000)
CIBIL Score: 750
Loan Amount: ₹3,00,000
```

## 🧪 Running Backend Tests

### Health Check
```bash
curl http://localhost:5000/api/health
# Expected: { "status": "OK", "timestamp": "..." }
```

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Pass@123",
    "phone": "9876543210"
  }'
```

### Calculate EMI
```bash
curl -X POST http://localhost:5000/api/emi/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "loanAmount": 500000,
    "annualRate": 10.5,
    "tenure": 36,
    "purpose": "home",
    "cibilScore": 750
  }'
```

## 🛠 Troubleshooting

### MongoDB Connection Error
**Issue:** `MongoDB Connection Error: connect ECONNREFUSED`

**Solution:**
1. Ensure MongoDB Atlas is accessible or local MongoDB is running
2. Check `.env` file has correct `MONGODB_URI`
3. Check internet connectivity
4. Whitelist your IP in MongoDB Atlas security settings

### Port Already in Use
**Issue:** `EADDRINUSE: address already in use :::5000`

**Solution:**
```bash
# Kill process on port 5000
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -i :5000
kill -9 <PID>
```

### JWT Token Expired
**Issue:** `Not authorized, token failed`

**Solution:** Re-login to get a new token. Token expires in 7 days by default.

### CORS Errors in Frontend
**Issue:** `Access to XMLHttpRequest has been blocked by CORS policy`

**Solution:**
1. Ensure backend is running on `http://localhost:5000`
2. Check `vite.config.js` proxy configuration
3. Verify CORS is enabled in `server.js`

## 📊 Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  role: String (user|admin),
  employmentType: String (salaried|self-employed|business),
  monthlyIncome: Number,
  existingEMIs: Number,
  cibilScore: Number (0-900),
  createdAt: Date,
  updatedAt: Date
}
```

### LoanApplication Collection
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  loanAmount: Number,
  purpose: String,
  tenure: Number,
  interestRate: Number,
  monthlyEMI: Number,
  totalInterest: Number,
  totalPayable: Number,
  eligibilityStatus: String (eligible|not_eligible|pending),
  rejectionReasons: [String],
  foir: Number,
  status: String (SUBMITTED|UNDER_REVIEW|APPROVED|REJECTED),
  statusHistory: [{
    status: String,
    date: Date,
    note: String
  }],
  adminNote: String,
  reviewedBy: ObjectId (ref: User),
  reviewedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔐 Security Considerations

### Implemented Security Features
- ✅ **Password Hashing:** bcryptjs (salt rounds: 12)
- ✅ **JWT Authentication:** Expiry: 7 days
- ✅ **Input Validation:** express-validator on all routes
- ✅ **CORS Protection:** Enabled
- ✅ **Rate Limiting:** Recommended to add in production
- ✅ **Environment Variables:** Sensitive data in .env
- ✅ **Role-Based Access:** Admin middleware implemented

### Production Recommendations
1. Add Rate Limiting (express-rate-limit)
2. Implement API Key authentication for external services
3. Add request logging (morgan - already implemented)
4. Use HTTPS in production
5. Implement request size limits
6. Add security headers (helmet.js)
7. Regular security audits
8. Add 2FA for admin accounts
9. Implement audit logging
10. Database backup strategy

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [JWT Introduction](https://jwt.io/introduction)
- [Mongoose Documentation](https://mongoosejs.com/)

## 🎓 Learning Outcomes

This project covers:
- ✅ Full-stack MERN development
- ✅ RESTful API design
- ✅ Database modeling with MongoDB
- ✅ Authentication & Authorization
- ✅ Form validation & error handling
- ✅ State management with Context API
- ✅ Responsive UI design
- ✅ Business logic implementation (EMI, FOIR)
- ✅ Admin dashboard functionality
- ✅ Production-ready code practices

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 👨‍💻 Author

**Ankit Kumar Singh**
- GitHub: [https://github.com/Ankit24072002]
- Email: [kumaranikant24@gmail.com]
- Portfolio: [https://self-portfolio-if15.onrender.com/]

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## Acknowledgments

- Built with React, Node.js, Express, and MongoDB
- Designed with modern UI/UX principles
- Inspired by real-world lending systems


