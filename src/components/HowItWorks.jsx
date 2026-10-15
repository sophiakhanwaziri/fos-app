import { Monitor, Stethoscope, GraduationCap } from 'lucide-react'

const steps = [
  {
    icon: Monitor,
    step: '01',
    title: 'Monitor',
    description:
      'Aggregates data from all your financial accounts in real time — like a cockpit instrument panel for your money.',
  },
  {
    icon: Stethoscope,
    step: '02',
    title: 'Diagnose',
    description:
      'Scores your financial health across five dimensions and flags anomalies — like a periodic health check-up.',
  },
  {
    icon: GraduationCap,
    step: '03',
    title: 'Coach',
    description:
      'Delivers specific, prioritized actions you can take this week — like a personal CFO on call.',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How FinPulse Works
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Three simple steps from data chaos to financial clarity.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((s, i) => (
            <div key={s.title} className="text-center">
              <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <s.icon className="w-8 h-8 text-teal-600" />
              </div>
              <div className="text-xs font-bold text-teal-500 tracking-widest uppercase mb-2">
                Step {s.step}
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">{s.title}</h3>
              <p className="text-gray-500 leading-relaxed">{s.description}</p>
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 text-gray-300 text-2xl">
                  &rarr;
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
