import { useState, useEffect } from 'react'
import { ArrowLeft, ArrowRight, Calculator, Sparkles } from 'lucide-react'

const steps = [
  {
    title: 'Cash Flow',
    subtitle: 'Your income and expenses',
    fields: [
      { key: 'monthlyIncome', label: 'Monthly Income (take-home)', prefix: '₹', placeholder: 'e.g. 75000' },
      { key: 'monthlyExpenses', label: 'Monthly Expenses (rent, food, bills, etc.)', prefix: '₹', placeholder: 'e.g. 45000' },
      { key: 'totalEMI', label: 'Total Monthly EMIs (home, car, personal loans)', prefix: '₹', placeholder: 'e.g. 15000' },
    ],
  },
  {
    title: 'Debt Burden',
    subtitle: 'How much debt pressure you carry',
    fields: [
      { key: 'emiToIncomeRatio', label: 'EMI-to-Income Ratio', suffix: '%', placeholder: 'e.g. 30', hint: 'Auto-calculated from your income and EMIs', readOnly: true },
      { key: 'creditUtilization', label: 'Credit Card Utilization', suffix: '%', placeholder: 'e.g. 40', hint: 'Outstanding balance / Total credit limit × 100' },
    ],
  },
  {
    title: 'Savings Rate',
    subtitle: 'How much you set aside each month',
    fields: [
      { key: 'monthlySavings', label: 'Monthly Savings (FD, RD, bank balance growth)', prefix: '₹', placeholder: 'e.g. 10000' },
      { key: 'emergencyFundMonths', label: 'Emergency Fund', suffix: 'months of expenses', placeholder: 'e.g. 4', hint: 'How many months could you survive without income?' },
      { key: 'sipAmount', label: 'Monthly SIP Amount', prefix: '₹', placeholder: 'e.g. 5000' },
    ],
  },
  {
    title: 'Insurance Coverage',
    subtitle: 'Your financial safety net',
    fields: [
      { key: 'healthCover', label: 'Health Insurance Sum Assured', prefix: '₹', placeholder: 'e.g. 500000', hint: 'Total health cover for you and family' },
      { key: 'lifeCover', label: 'Life Insurance Sum Assured', prefix: '₹', placeholder: 'e.g. 10000000', hint: 'Term insurance + any other life cover' },
    ],
  },
  {
    title: 'Investments',
    subtitle: 'How your money is allocated (approximate %)',
    fields: [
      { key: 'equityPct', label: 'Equity (stocks, equity MFs)', suffix: '%', placeholder: 'e.g. 40' },
      { key: 'debtPct', label: 'Debt (bonds, debt MFs, PPF)', suffix: '%', placeholder: 'e.g. 30' },
      { key: 'goldPct', label: 'Gold (physical, SGBs, gold MFs)', suffix: '%', placeholder: 'e.g. 10' },
      { key: 'cashPct', label: 'Cash / FDs / Savings Account', suffix: '%', placeholder: 'e.g. 20' },
    ],
  },
]

export default function ScoreInput({ onSubmit, prefill }) {
  const [step, setStep] = useState(0)
  const [data, setData] = useState({
    monthlyIncome: '',
    monthlyExpenses: '',
    totalEMI: '',
    emiToIncomeRatio: '',
    creditUtilization: '',
    monthlySavings: '',
    emergencyFundMonths: '',
    sipAmount: '',
    healthCover: '',
    lifeCover: '',
    equityPct: '',
    debtPct: '',
    goldPct: '',
    cashPct: '',
  })

  const [filledKeys, setFilledKeys] = useState(new Set())

  useEffect(() => {
    if (prefill) {
      const keys = new Set()
      setData((prev) => {
        const updated = { ...prev }
        for (const [key, val] of Object.entries(prefill)) {
          if (val && val !== '0') {
            updated[key] = val
            keys.add(key)
          }
        }
        return updated
      })
      setFilledKeys(keys)
    }
  }, [prefill])

  const current = steps[step]
  const stepHasPrefill = current.fields.some((f) => filledKeys.has(f.key))

  const autoEMIRatio = (() => {
    const income = parseFloat(data.monthlyIncome)
    const emi = parseFloat(data.totalEMI)
    if (!income || income <= 0 || isNaN(emi)) return ''
    return String(Math.round((emi / income) * 100))
  })()

  useEffect(() => {
    if (autoEMIRatio !== '') {
      setData((prev) => ({ ...prev, emiToIncomeRatio: autoEMIRatio }))
    }
  }, [autoEMIRatio])

  function handleChange(key, value) {
    if (key === 'emiToIncomeRatio') return
    const cleaned = value.replace(/[^0-9.]/g, '')
    setData((prev) => ({ ...prev, [key]: cleaned }))
  }

  function toNum(val) {
    const n = parseFloat(val)
    return isNaN(n) ? 0 : n
  }

  function handleNext() {
    if (step < steps.length - 1) {
      setStep(step + 1)
    } else {
      const numData = {}
      for (const key of Object.keys(data)) {
        numData[key] = toNum(data[key])
      }
      onSubmit(numData)
    }
  }

  function handleBack() {
    if (step > 0) setStep(step - 1)
  }

  const progress = ((step + 1) / steps.length) * 100

  return (
    <div className="max-w-xl mx-auto">
      {/* Step pills */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {steps.map((s, i) => (
          <button
            key={s.title}
            onClick={() => setStep(i)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              i === step
                ? 'bg-teal-600 text-white shadow-sm'
                : i < step
                  ? 'bg-teal-50 text-teal-600 hover:bg-teal-100'
                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
            }`}
          >
            {s.title}
          </button>
        ))}
      </div>

      {/* Step content */}
      <div className="bg-white rounded-2xl border border-gray-100 p-8">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-2xl font-bold text-gray-900">{current.title}</h2>
          {stepHasPrefill && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full">
              <Sparkles className="w-3 h-3" />
              Auto-filled from statement
            </span>
          )}
        </div>
        <p className="text-gray-400 mb-8">{current.subtitle}</p>

        <div className="space-y-5">
          {current.fields.map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {field.label}
              </label>
              <div className="relative">
                {field.prefix && (
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                    {field.prefix}
                  </span>
                )}
                <input
                  type="text"
                  inputMode="decimal"
                  value={data[field.key]}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  readOnly={field.readOnly}
                  placeholder={field.placeholder}
                  className={`w-full rounded-lg py-2.5 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors ${
                    field.readOnly
                      ? 'border border-gray-100 bg-gray-50 text-gray-500 cursor-not-allowed'
                      : filledKeys.has(field.key)
                        ? 'border-2 border-teal-400 bg-teal-50/30 text-gray-900'
                        : 'border border-gray-200 text-gray-900'
                  } ${
                    field.prefix ? 'pl-8 pr-3' : field.suffix ? 'pl-3 pr-20' : 'px-3'
                  }`}
                />
                {field.suffix && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                    {field.suffix}
                  </span>
                )}
              </div>
              {field.hint && (
                <p className="text-xs text-gray-400 mt-1">{field.hint}</p>
              )}
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={handleBack}
            disabled={step === 0}
            className="flex items-center gap-2 px-5 py-2.5 text-sm text-gray-500 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-2.5 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
          >
            {step === steps.length - 1 ? (
              <>
                Calculate Score
                <Calculator className="w-4 h-4" />
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
