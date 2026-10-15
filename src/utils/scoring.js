function clamp(val, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(val)))
}

function lerp(value, low, high, scoreLow, scoreHigh) {
  if (value <= low) return scoreHigh
  if (value >= high) return scoreLow
  const t = (value - low) / (high - low)
  return scoreHigh - t * (scoreHigh - scoreLow)
}

export function scoreCashFlow({ monthlyIncome, monthlyExpenses, totalEMI }) {
  if (!monthlyIncome || monthlyIncome <= 0) return 0
  const bufferRatio = (monthlyIncome - monthlyExpenses) / monthlyIncome
  const emiRatio = totalEMI / monthlyIncome

  let bufferScore
  if (bufferRatio >= 0.3) bufferScore = 90 + (bufferRatio - 0.3) * 50
  else if (bufferRatio >= 0.2) bufferScore = 70 + ((bufferRatio - 0.2) / 0.1) * 20
  else if (bufferRatio >= 0.1) bufferScore = 50 + ((bufferRatio - 0.1) / 0.1) * 20
  else if (bufferRatio >= 0) bufferScore = 20 + (bufferRatio / 0.1) * 30
  else bufferScore = Math.max(0, 20 + bufferRatio * 100)

  const emiScore = lerp(emiRatio, 0, 0.6, 20, 100)

  return clamp(bufferScore * 0.6 + emiScore * 0.4)
}

export function scoreDebt({ emiToIncomeRatio, creditUtilization }) {
  const emiScore = lerp(emiToIncomeRatio / 100, 0, 0.6, 20, 100)
  const creditScore = lerp(creditUtilization / 100, 0, 1, 10, 100)
  return clamp(emiScore * 0.5 + creditScore * 0.5)
}

export function scoreSavings({ monthlyIncome, monthlySavings, emergencyFundMonths, sipAmount }) {
  if (!monthlyIncome || monthlyIncome <= 0) return 0
  const savingsRatio = (monthlySavings + sipAmount) / monthlyIncome

  let savingsScore
  if (savingsRatio >= 0.3) savingsScore = 90 + (savingsRatio - 0.3) * 50
  else if (savingsRatio >= 0.2) savingsScore = 70 + ((savingsRatio - 0.2) / 0.1) * 20
  else if (savingsRatio >= 0.1) savingsScore = 50 + ((savingsRatio - 0.1) / 0.1) * 20
  else savingsScore = savingsRatio * 500

  let efBonus = 0
  if (emergencyFundMonths >= 6) efBonus = 10
  else if (emergencyFundMonths >= 3) efBonus = 0
  else efBonus = -15

  return clamp(savingsScore + efBonus)
}

export function scoreInsurance({ monthlyExpenses, monthlyIncome, healthCover, lifeCover }) {
  const targetHealth = monthlyExpenses * 5
  const targetLife = monthlyIncome * 12 * 10

  const healthRatio = targetHealth > 0 ? Math.min(healthCover / targetHealth, 1) : 0
  const lifeRatio = targetLife > 0 ? Math.min(lifeCover / targetLife, 1) : 0

  return clamp(healthRatio * 50 + lifeRatio * 50)
}

export function scoreInvestments({ equityPct, debtPct, goldPct, cashPct }) {
  const total = equityPct + debtPct + goldPct + cashPct
  if (total === 0) return 0

  const eq = equityPct / total
  const de = debtPct / total
  const go = goldPct / total
  const ca = cashPct / total

  const maxConcentration = Math.max(eq, de, go, ca)
  const numClasses = [eq, de, go, ca].filter((v) => v > 0.05).length

  let score = 50
  if (numClasses >= 4) score += 30
  else if (numClasses === 3) score += 20
  else if (numClasses === 2) score += 10

  if (maxConcentration >= 0.9) score -= 30
  else if (maxConcentration >= 0.7) score -= 15

  if (ca > 0.5) score -= 10

  return clamp(score)
}

const WEIGHTS = {
  cashFlow: 0.25,
  debt: 0.2,
  savings: 0.2,
  insurance: 0.15,
  investments: 0.2,
}

export function calculateFHS(data) {
  const scores = {
    cashFlow: scoreCashFlow(data),
    debt: scoreDebt(data),
    savings: scoreSavings(data),
    insurance: scoreInsurance(data),
    investments: scoreInvestments(data),
  }

  const overall = clamp(
    scores.cashFlow * WEIGHTS.cashFlow +
      scores.debt * WEIGHTS.debt +
      scores.savings * WEIGHTS.savings +
      scores.insurance * WEIGHTS.insurance +
      scores.investments * WEIGHTS.investments
  )

  return { overall, scores }
}

export function getScoreBand(score) {
  if (score >= 80) return { label: 'Excellent', color: '#16a34a', bg: '#f0fdf4' }
  if (score >= 60) return { label: 'Good', color: '#0d9488', bg: '#f0fdfa' }
  if (score >= 40) return { label: 'Needs Attention', color: '#d97706', bg: '#fffbeb' }
  return { label: 'At Risk', color: '#dc2626', bg: '#fef2f2' }
}

export function generateNarrative(scores, data) {
  const parts = []
  const overall = Math.round(
    scores.cashFlow * 0.25 + scores.debt * 0.2 + scores.savings * 0.2 +
    scores.insurance * 0.15 + scores.investments * 0.2
  )

  if (overall >= 80) {
    parts.push("Your financial health is excellent. You're managing your money with discipline across most dimensions.")
  } else if (overall >= 60) {
    parts.push("Your financial health is good, but there's room to strengthen a few areas.")
  } else if (overall >= 40) {
    parts.push("Your financial health needs attention. There are some areas creating risk in your financial life.")
  } else {
    parts.push("Your financial health is at risk. Immediate action on a few key areas can significantly improve your position.")
  }

  if (scores.cashFlow < 50) {
    parts.push("Your cash flow is tight — your expenses and EMIs consume most of your income, leaving little buffer for unexpected costs.")
  } else if (scores.cashFlow >= 80) {
    parts.push("Strong cash flow management — you maintain a healthy buffer between income and expenses.")
  }

  if (scores.debt < 50) {
    parts.push("Your debt burden is high. Consider reducing credit utilization and avoiding new EMIs until the ratio improves.")
  }

  if (scores.savings < 50) {
    const efMonths = data.emergencyFundMonths || 0
    if (efMonths < 3) {
      parts.push(`Your emergency fund covers only ${efMonths} month(s) of expenses. Building it to 6 months should be your top priority.`)
    } else {
      parts.push("Your savings rate could be stronger. Even a small increase in your monthly SIP or savings can compound significantly over time.")
    }
  }

  if (scores.insurance < 50) {
    parts.push("Your insurance coverage has gaps. Adequate health and life cover is the foundation of financial resilience.")
  }

  if (scores.investments < 50) {
    parts.push("Your investments are concentrated in too few asset classes. Diversifying across equity, debt, and other instruments reduces risk.")
  }

  return parts.join(' ')
}

export const dimensionMeta = [
  {
    key: 'cashFlow',
    label: 'Cash Flow Stability',
    weight: '25%',
    tip: (s) =>
      s >= 70
        ? 'Your income comfortably covers your expenses. Keep it up.'
        : s >= 40
        ? 'Your buffer is thin. Try to widen the gap between income and spending.'
        : 'Your expenses are too close to your income. Cut non-essentials or explore ways to earn more.',
  },
  {
    key: 'debt',
    label: 'Debt Burden',
    weight: '20%',
    tip: (s) =>
      s >= 70
        ? 'Debt is well under control. You have room to breathe.'
        : s >= 40
        ? 'EMIs and credit card debt are eating into your finances. Prioritize paying down high-interest debt.'
        : 'Debt levels are critical. Freeze new borrowing and focus on clearing high-cost loans first.',
  },
  {
    key: 'savings',
    label: 'Savings Rate',
    weight: '20%',
    tip: (s) =>
      s >= 70
        ? 'Great savings discipline. Your future self will thank you.'
        : s >= 40
        ? 'You\'re saving, but not enough. Automate a higher SIP or recurring deposit.'
        : 'Your savings rate is dangerously low. Start with even ₹500/month — consistency beats amount.',
  },
  {
    key: 'insurance',
    label: 'Insurance Coverage',
    weight: '15%',
    tip: (s) =>
      s >= 70
        ? 'You have adequate protection in place. Review annually.'
        : s >= 40
        ? 'Some gaps in coverage. Check if your health cover meets 5x monthly expenses.'
        : 'Major insurance gaps. This is your biggest financial risk — address it this month.',
  },
  {
    key: 'investments',
    label: 'Investment Diversification',
    weight: '20%',
    tip: (s) =>
      s >= 70
        ? 'Well-diversified portfolio. You\'re spreading risk effectively.'
        : s >= 40
        ? 'Too concentrated. Consider adding an asset class you\'re missing.'
        : 'Almost all your money is in one basket. Diversify across equity, debt, and at least one more class.',
  },
]
