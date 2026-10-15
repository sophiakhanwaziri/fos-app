import { Activity } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100 py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-teal-700 font-bold text-lg">
            <Activity className="w-5 h-5" />
            FinPulse
          </div>
          <p className="text-sm text-gray-400">
            Built by Sophia Khan &middot; SPJIMR &middot; June 2025
          </p>
        </div>
      </div>
    </footer>
  )
}
