import { useState, useRef } from 'react'
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, X } from 'lucide-react'
import { parsePaytmFile } from '../utils/paytmParser'

export default function FileUpload({ onDataParsed }) {
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState(null)
  const [summary, setSummary] = useState(null)
  const [fileName, setFileName] = useState(null)
  const inputRef = useRef()

  async function handleFile(file) {
    if (!file) return
    setFileName(file.name)
    setStatus('parsing')
    setError(null)
    setSummary(null)

    try {
      const analysis = await parsePaytmFile(file)
      setSummary(analysis)
      setStatus('success')
      onDataParsed(analysis)
    } catch (err) {
      setError(err.message)
      setStatus('error')
    }
  }

  function handleDrop(e) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    handleFile(file)
  }

  function handleClear() {
    setStatus('idle')
    setError(null)
    setSummary(null)
    setFileName(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="mb-8">
      {status === 'idle' && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-teal-300 transition-colors cursor-pointer"
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={(e) => handleFile(e.target.files[0])}
          />
          <Upload className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-medium mb-1">
            Upload your statements
          </p>
          <p className="text-sm text-gray-400">
            Drop a .csv or .xlsx file here, or click to browse
          </p>
          <p className="text-xs text-gray-300 mt-3">
            Download your bank or UPI statement as .csv or .xlsx and upload here
          </p>
        </div>
      )}

      {status === 'parsing' && (
        <div className="border border-gray-100 rounded-2xl p-8 text-center bg-gray-50">
          <div className="animate-spin w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-gray-500">Analyzing {fileName}...</p>
        </div>
      )}

      {status === 'success' && summary && (
        <div className="border border-teal-100 rounded-2xl p-6 bg-teal-50/50">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-teal-600 shrink-0" />
              <div>
                <p className="font-medium text-gray-900 text-sm">{fileName}</p>
                <p className="text-xs text-gray-400">{summary.totalTransactions} transactions analyzed</p>
              </div>
            </div>
            <button onClick={handleClear} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-white rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-1">Monthly Income</p>
              <p className="font-semibold text-gray-900">₹{summary.monthlyIncome.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-1">Monthly Expenses</p>
              <p className="font-semibold text-gray-900">₹{summary.monthlyExpenses.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-1">Net Savings</p>
              <p className="font-semibold text-gray-900">₹{summary.monthlySavings.toLocaleString('en-IN')}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center mt-3">
            <div className="bg-white rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-1">EMIs Detected</p>
              <p className="font-semibold text-gray-900">₹{summary.totalEMI.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-1">SIPs Detected</p>
              <p className="font-semibold text-gray-900">₹{summary.sipAmount.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-1">Data Span</p>
              <p className="font-semibold text-gray-900">{summary.months} month{summary.months > 1 ? 's' : ''}</p>
            </div>
          </div>

          {summary.subscriptions.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-medium text-gray-500 mb-2">Recurring subscriptions detected:</p>
              <div className="flex flex-wrap gap-2">
                {summary.subscriptions.slice(0, 5).map((sub) => (
                  <span key={sub.name} className="text-xs bg-white px-2 py-1 rounded text-gray-600">
                    {sub.name} — ₹{sub.avgAmount}
                  </span>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-teal-600 mt-4">
            Values auto-filled in the form below. You can adjust them before calculating.
          </p>
        </div>
      )}

      {status === 'error' && (
        <div className="border border-red-100 rounded-2xl p-6 bg-red-50/50">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <div>
                <p className="font-medium text-gray-900 text-sm">Could not parse file</p>
                <p className="text-xs text-red-500 mt-1">{error}</p>
              </div>
            </div>
            <button onClick={handleClear} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
