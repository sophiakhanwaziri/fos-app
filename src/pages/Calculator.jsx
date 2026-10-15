import { useState } from 'react'
import FileUpload from '../components/FileUpload'
import ScoreInput from '../components/ScoreInput'
import ScoreResult from '../components/ScoreResult'
import { calculateFHS } from '../utils/scoring'

export default function CalculatorPage() {
  const [result, setResult] = useState(null)
  const [userData, setUserData] = useState(null)
  const [prefill, setPrefill] = useState(null)

  function handleFileParsed(analysis) {
    setPrefill({
      monthlyIncome: String(analysis.monthlyIncome),
      monthlyExpenses: String(analysis.monthlyExpenses),
      totalEMI: String(analysis.totalEMI),
      emiToIncomeRatio: String(analysis.emiToIncomeRatio),
      monthlySavings: String(analysis.monthlySavings),
      sipAmount: String(analysis.sipAmount),
    })
  }

  function handleSubmit(data) {
    const fhs = calculateFHS(data)
    setUserData(data)
    setResult(fhs)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleReset() {
    setResult(null)
    setUserData(null)
    setPrefill(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <section className="py-16 px-6 min-h-screen bg-gray-50/50">
      {!result ? (
        <div>
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Financial Health Score Calculator
            </h1>
            <p className="text-gray-500 max-w-lg mx-auto">
              Upload your statements to auto-fill, or enter details manually.
              Your data stays in your browser &mdash; nothing is stored or sent anywhere.
            </p>
          </div>
          <div className="max-w-xl mx-auto">
            <FileUpload onDataParsed={handleFileParsed} />
          </div>
          <ScoreInput onSubmit={handleSubmit} prefill={prefill} />
        </div>
      ) : (
        <ScoreResult result={result} data={userData} onReset={handleReset} />
      )}
    </section>
  )
}
