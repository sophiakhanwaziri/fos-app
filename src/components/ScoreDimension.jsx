import { getScoreBand } from '../utils/scoring'

export default function ScoreDimension({ label, score, weight, tip }) {
  const band = getScoreBand(score)

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{label}</h3>
          <span className="text-xs text-gray-400">Weight: {weight}</span>
        </div>
        <div
          className="text-2xl font-bold px-3 py-1 rounded-lg"
          style={{ color: band.color, backgroundColor: band.bg }}
        >
          {score}
        </div>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full mb-3">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${score}%`, backgroundColor: band.color }}
        />
      </div>
      <p className="text-sm text-gray-500 leading-relaxed">{tip}</p>
    </div>
  )
}
