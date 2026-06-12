/**
 * Eligibility Engine
 * Rules:
 * 1. FOIR = (existing EMI + new EMI) / monthly income <= 0.5
 * 2. Minimum CIBIL score = 650
 * 3. Minimum monthly income = ₹25,000
 */

const MAX_FOIR = 0.5;

const calculateMaxEligibleAmount = (availableEmiCapacity, annualRate, tenureMonths) => {
  if (availableEmiCapacity <= 0) return 0;

  const monthlyRate = annualRate / 12 / 100;
  if (monthlyRate === 0) {
    return Math.round(availableEmiCapacity * tenureMonths);
  }

  const factor = Math.pow(1 + monthlyRate, tenureMonths);
  const principal = (availableEmiCapacity * (factor - 1)) / (monthlyRate * factor);
  return Math.max(0, Math.floor(principal / 1000) * 1000);
};

const checkEligibility = (user, newEMI, annualRate = 10.5, tenureMonths = 60) => {
  const reasons = [];
  let isEligible = true;

  // Rule 1: Check minimum monthly income
  if (user.monthlyIncome < 25000) {
    isEligible = false;
    reasons.push('Monthly income below ₹25,000 minimum requirement');
  }

  // Rule 2: Check CIBIL score
  if (user.cibilScore < 650) {
    isEligible = false;
    reasons.push('CIBIL score too low (minimum 650 required)');
  }

  // Rule 3: Check FOIR (Fixed Obligation to Income Ratio)
  const totalEMI = (user.existingEMIs || 0) + newEMI;
  const foir = user.monthlyIncome > 0 ? totalEMI / user.monthlyIncome : 1;

  if (foir > MAX_FOIR) {
    isEligible = false;
    reasons.push(
      `FOIR exceeds 50% (current: ${(foir * 100).toFixed(1)}%). Total EMI obligations too high relative to income`
    );
  }

  const availableEmiCapacity = (user.monthlyIncome * MAX_FOIR) - (user.existingEMIs || 0);
  const maxEligibleAmount = calculateMaxEligibleAmount(availableEmiCapacity, annualRate, tenureMonths);

  // Mock email notification
  if (isEligible) {
    console.log(`📧 [EMAIL NOTIFICATION] Dear ${user.name}, your loan application has been submitted and you are eligible! Your application is now under review.`);
  } else {
    console.log(`📧 [EMAIL NOTIFICATION] Dear ${user.name}, your loan application was submitted but eligibility check found issues: ${reasons.join('; ')}`);
  }

  return {
    isEligible,
    foir: Math.round(foir * 1000) / 1000,
    foirPercentage: `${(foir * 100).toFixed(1)}%`,
    maxEligibleAmount,
    reasons,
    details: {
      monthlyIncome: user.monthlyIncome,
      existingEMIs: user.existingEMIs,
      newEMI: Math.round(newEMI * 100) / 100,
      totalEMI: Math.round(totalEMI * 100) / 100,
      cibilScore: user.cibilScore,
    },
  };
};

module.exports = { checkEligibility };
