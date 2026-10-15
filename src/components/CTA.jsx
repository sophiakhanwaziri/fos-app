import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function CTA() {
  return (
    <section className="py-20 px-6 bg-teal-600">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Ready to Know Your Financial Health Score?
        </h2>
        <p className="text-teal-100 text-lg mb-8 max-w-xl mx-auto">
          It takes 2 minutes. No sign-up required. Get your personalized score with
          actionable insights — completely free.
        </p>
        <Link
          to="/calculator"
          className="inline-flex items-center gap-2 bg-white text-teal-700 px-8 py-3.5 rounded-xl text-base font-semibold no-underline hover:bg-teal-50 transition-colors"
        >
          Calculate Your Score
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  )
}
