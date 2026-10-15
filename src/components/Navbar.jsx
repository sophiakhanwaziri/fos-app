import { Link, useLocation } from 'react-router-dom'
import { Activity } from 'lucide-react'

export default function Navbar() {
  const location = useLocation()

  return (
    <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-teal-700 font-bold text-xl no-underline">
          <Activity className="w-6 h-6" />
          FinPulse
        </Link>

        <div className="flex items-center gap-8">
          <Link
            to="/"
            className={`text-sm no-underline transition-colors ${
              location.pathname === '/' ? 'text-teal-700 font-medium' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Home
          </Link>
          <Link
            to="/calculator"
            className={`text-sm no-underline transition-colors ${
              location.pathname === '/calculator' ? 'text-teal-700 font-medium' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Calculator
          </Link>
          <Link
            to="/calculator"
            className="bg-teal-600 text-white text-sm px-4 py-2 rounded-lg no-underline hover:bg-teal-700 transition-colors"
          >
            Check Your Score
          </Link>
        </div>
      </div>
    </nav>
  )
}
