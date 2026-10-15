import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function Hero() {
  return (
    <section className="py-24 md:py-32 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <div className="inline-block bg-teal-50 text-teal-700 text-xs font-medium px-3 py-1 rounded-full mb-6 tracking-wide uppercase">
          Financial Intelligence Platform
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 tracking-tight leading-tight mb-6">
          Your Personal CFO,
          <br />
          <span className="text-teal-600">Powered by Data</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          FinPulse monitors your finances, diagnoses your financial health, and coaches you
          toward resilience. Not another dashboard &mdash; a system that makes your money work better.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/calculator"
            className="inline-flex items-center justify-center gap-2 bg-teal-600 text-white px-8 py-3.5 rounded-xl text-base font-medium no-underline hover:bg-teal-700 transition-colors"
          >
            Check Your Financial Health
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 px-8 py-3.5 rounded-xl text-base font-medium no-underline border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Learn How It Works
          </a>
        </div>
      </div>
    </section>
  )
}
