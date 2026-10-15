import { Bell, TrendingUp, Radar, ShieldCheck } from 'lucide-react'

const features = [
  {
    icon: Bell,
    title: 'Subscription Sentinel',
    description:
      'Detects recurring debits, flags unused subscriptions, and benchmarks against peer spending patterns.',
  },
  {
    icon: TrendingUp,
    title: 'Cash Flow Forecaster',
    description:
      'Projects your cash position 30 days forward. Alerts you 7–10 days before a projected shortfall.',
  },
  {
    icon: Radar,
    title: 'Life Event Radar',
    description:
      'Detects salary jumps, new EMIs, or major life transitions and proactively adjusts your financial plan.',
  },
  {
    icon: ShieldCheck,
    title: 'Suitability Gate',
    description:
      'Runs a needs-alignment check before any product recommendation. No upsells — only what you actually need.',
  },
]

export default function Features() {
  return (
    <section className="py-20 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Intelligent Features, Not More Noise
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Every feature is designed to improve your financial outcomes &mdash; not to sell you another product.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-teal-200 transition-colors"
            >
              <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center mb-5">
                <f.icon className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-500 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
