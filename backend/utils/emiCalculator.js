/**
 * EMI Calculator Utility
 * Formula: EMI = (P × r × (1+r)^n) / ((1+r)^n - 1)
 * Where:
 *   P = Principal loan amount
 *   r = Monthly interest rate (annual rate / 12 / 100)
 *   n = Number of monthly installments (tenure in months)
 */

const calculateEMI = (principal, annualRate, tenureMonths) => {
  const r = annualRate / 12 / 100; // Monthly interest rate
  const n = tenureMonths;

  if (r === 0) {
    // If interest rate is 0, simple division
    return principal / n;
  }

  const emi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  return Math.round(emi * 100) / 100;
};

const calculateTotalInterest = (emi, tenureMonths, principal) => {
  const totalPayable = emi * tenureMonths;
  return Math.round((totalPayable - principal) * 100) / 100;
};

const calculateTotalPayable = (emi, tenureMonths) => {
  return Math.round(emi * tenureMonths * 100) / 100;
};

/**
 * Generate amortization schedule
 * Returns monthly breakdown of principal, interest, and remaining balance
 */
const generateAmortizationTable = (principal, annualRate, tenureMonths) => {
  const r = annualRate / 12 / 100;
  const emi = calculateEMI(principal, annualRate, tenureMonths);
  const schedule = [];
  let balance = principal;

  for (let month = 1; month <= tenureMonths; month++) {
    const interestComponent = Math.round(balance * r * 100) / 100;
    const principalComponent = Math.round((emi - interestComponent) * 100) / 100;
    balance = Math.round((balance - principalComponent) * 100) / 100;

    // Fix floating point issues for the last month
    if (month === tenureMonths) {
      balance = 0;
    }

    schedule.push({
      month,
      emi: Math.round(emi * 100) / 100,
      principal: principalComponent,
      interest: interestComponent,
      balance: Math.max(0, balance),
    });
  }

  return schedule;
};

/**
 * Get interest rate based on loan purpose and CIBIL score
 */
const getInterestRate = (purpose, cibilScore) => {
  const baseRates = {
    home: 8.5,
    car: 9.0,
    education: 9.5,
    personal: 10.5,
    business: 11.0,
    medical: 10.0,
    wedding: 11.5,
    travel: 12.0,
    other: 12.5,
  };

  let rate = baseRates[purpose] || 10.5;

  // Adjust rate based on CIBIL score
  if (cibilScore >= 800) {
    rate -= 1.0;
  } else if (cibilScore >= 750) {
    rate -= 0.5;
  } else if (cibilScore < 650) {
    rate += 1.5;
  }

  return Math.round(rate * 100) / 100;
};

module.exports = {
  calculateEMI,
  calculateTotalInterest,
  calculateTotalPayable,
  generateAmortizationTable,
  getInterestRate,
};
