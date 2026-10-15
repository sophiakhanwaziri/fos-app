import Papa from 'papaparse'
import * as XLSX from 'xlsx'

function normalizeHeaders(row) {
  const map = {}
  for (const key of Object.keys(row)) {
    const lower = key.toLowerCase().trim()
    if (lower.includes('date')) map.date = key
    else if (lower.includes('amount') || lower.includes('total')) map.amount = key
    else if (lower.includes('debit') && !lower.includes('credit')) map.debit = key
    else if (lower.includes('credit') && !lower.includes('debit')) map.credit = key
    else if (lower.includes('status')) map.status = key
    else if (lower.includes('type') || lower.includes('transaction')) map.type = key
    else if (lower.includes('description') || lower.includes('detail') || lower.includes('narration') || lower.includes('merchant') || lower.includes('comment'))
      map.description = key
  }
  return map
}

function parseAmount(val) {
  if (val === null || val === undefined || val === '') return 0
  const cleaned = String(val).replace(/[₹,\s]/g, '')
  const num = parseFloat(cleaned)
  return isNaN(num) ? 0 : Math.abs(num)
}

function isSuccessful(row, headers) {
  if (!headers.status) return true
  const status = String(row[headers.status] || '').toLowerCase()
  return status === '' || status.includes('success') || status.includes('completed') || status.includes('paid')
}

function classifyTransaction(row, headers) {
  const desc = String(row[headers.description] || '').toLowerCase()

  if (headers.debit && headers.credit) {
    const debit = parseAmount(row[headers.debit])
    const credit = parseAmount(row[headers.credit])
    if (credit > 0 && debit === 0) return { type: 'credit', amount: credit, desc }
    if (debit > 0) return { type: 'debit', amount: debit, desc }
    return null
  }

  if (headers.type) {
    const type = String(row[headers.type] || '').toLowerCase()
    const amount = parseAmount(row[headers.amount])
    if (amount === 0) return null
    if (type.includes('credit') || type.includes('received') || type.includes('refund') || type.includes('cashback'))
      return { type: 'credit', amount, desc }
    return { type: 'debit', amount, desc }
  }

  const amount = parseAmount(row[headers.amount])
  if (amount === 0) return null
  const rawAmount = String(row[headers.amount] || '')
  if (rawAmount.startsWith('-') || rawAmount.startsWith('('))
    return { type: 'debit', amount, desc }

  return { type: 'debit', amount, desc }
}

function detectRecurring(debits) {
  const merchantCounts = {}
  for (const tx of debits) {
    const key = tx.desc.slice(0, 30).trim()
    if (!key) continue
    if (!merchantCounts[key]) merchantCounts[key] = { count: 0, amounts: [] }
    merchantCounts[key].count++
    merchantCounts[key].amounts.push(tx.amount)
  }

  const recurring = []
  for (const [name, data] of Object.entries(merchantCounts)) {
    if (data.count >= 2) {
      const avg = data.amounts.reduce((a, b) => a + b, 0) / data.amounts.length
      const isEMI =
        name.includes('emi') || name.includes('loan') || name.includes('hdfc') ||
        name.includes('icici') || name.includes('bajaj') || name.includes('home credit')
      const isSIP =
        name.includes('sip') || name.includes('mutual') || name.includes('mf ') ||
        name.includes('groww') || name.includes('zerodha') || name.includes('kuvera') ||
        name.includes('coin') || name.includes('paytm money') || name.includes('smallcase')
      const isInsurance =
        name.includes('insurance') || name.includes('lic ') || name.includes('premium') ||
        name.includes('star health') || name.includes('max life') || name.includes('hdfc life') ||
        name.includes('icici pru') || name.includes('policy')
      recurring.push({ name, count: data.count, avgAmount: Math.round(avg), isEMI, isSIP, isInsurance })
    }
  }
  return recurring
}

function estimateMonths(rows, headers) {
  if (!headers.date) return Math.max(1, rows.length > 100 ? 3 : 1)
  const dates = []
  for (const row of rows) {
    const raw = row[headers.date]
    if (!raw) continue
    const d = new Date(raw)
    if (!isNaN(d.getTime())) dates.push(d)
  }
  if (dates.length < 2) return 1
  dates.sort((a, b) => a - b)
  const diffMs = dates[dates.length - 1] - dates[0]
  const diffMonths = diffMs / (1000 * 60 * 60 * 24 * 30)
  return Math.max(1, Math.round(diffMonths))
}

function analyzeTransactions(rows) {
  if (!rows.length) return null

  const headers = normalizeHeaders(rows[0])
  if (!headers.amount && !headers.debit) return null

  const credits = []
  const debits = []

  for (const row of rows) {
    if (!isSuccessful(row, headers)) continue
    const tx = classifyTransaction(row, headers)
    if (!tx) continue
    if (tx.type === 'credit') credits.push(tx)
    else debits.push(tx)
  }

  const totalCredits = credits.reduce((s, t) => s + t.amount, 0)
  const totalDebits = debits.reduce((s, t) => s + t.amount, 0)

  const months = estimateMonths(rows, headers)
  const monthlyIncome = Math.round(totalCredits / months)
  const monthlyExpenses = Math.round(totalDebits / months)

  const recurring = detectRecurring(debits)
  const totalEMI = recurring
    .filter((r) => r.isEMI)
    .reduce((s, r) => s + r.avgAmount, 0)

  const totalSIP = recurring
    .filter((r) => r.isSIP)
    .reduce((s, r) => s + r.avgAmount, 0)

  const totalInsurance = recurring
    .filter((r) => r.isInsurance)
    .reduce((s, r) => s + r.avgAmount, 0)

  const subscriptions = recurring.filter((r) => !r.isEMI && !r.isSIP && !r.isInsurance && r.avgAmount < 2000)

  const monthlySavings = Math.max(0, monthlyIncome - monthlyExpenses)
  const creditUtilization = 0

  return {
    monthlyIncome,
    monthlyExpenses,
    totalEMI,
    monthlySavings,
    sipAmount: totalSIP,
    insurancePremium: totalInsurance,
    creditUtilization,
    months,
    totalTransactions: rows.length,
    totalCredits: credits.length,
    totalDebits: debits.length,
    recurring,
    subscriptions,
    emiToIncomeRatio: monthlyIncome > 0 ? Math.round((totalEMI / monthlyIncome) * 100) : 0,
  }
}

function parseCSV(text) {
  return new Promise((resolve, reject) => {
    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
      error: (err) => reject(err),
    })
  })
}

function parseExcel(buffer) {
  const workbook = XLSX.read(buffer, { type: 'array' })
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  return XLSX.utils.sheet_to_json(sheet)
}

export async function parsePaytmFile(file) {
  const ext = file.name.split('.').pop().toLowerCase()

  let rows
  if (ext === 'csv') {
    const text = await file.text()
    rows = await parseCSV(text)
  } else if (ext === 'xlsx' || ext === 'xls') {
    const buffer = await file.arrayBuffer()
    rows = parseExcel(buffer)
  } else {
    throw new Error('Unsupported file format. Please upload a .csv or .xlsx file.')
  }

  if (!rows || rows.length === 0) {
    throw new Error('No transactions found in the file.')
  }

  const analysis = analyzeTransactions(rows)
  if (!analysis) {
    throw new Error('Could not identify transaction columns. Make sure the file has Amount, Date, and Description columns.')
  }

  return analysis
}
