import { useState, useEffect } from 'react'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts'
import { RotateCcw } from 'lucide-react'
import { getScoreBand, generateNarrative, dimensionMeta } from '../utils/scoring'
import ScoreDimension from './ScoreDimension'

export default function ScoreResult({ result, data, onReset }) {
  const { overall, scores } = result
  const band = getScoreBand(overall)
  const narrative = generateNarrative(scores, data)
  const [animatedScore, setAnimatedScore] = useState(0)

  useEffect(() => {
    let start = 0
    const end = overall
    const duration = 1500
    const startTime = Date.now()

    function animate() {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      start = Math.round(eased * end)
      setAnimatedScore(start)
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [overall])

  const radarData = dimensionMeta.map((d) => ({
    dimension: d.label.replace(' ', '\n'),
    score: scores[d.key],
    fullMark: 100,
  }))

  return (
    <div className="max-w-4xl mx-auto">
      {/* Overall Score */}
      <div className="text-center mb-12">
        <p className="text-sm text-gray-400 uppercase tracking-wider mb-3">
          Your Financial Health Score
        </p>
        <div
          className="inline-flex items-center justify-center w-40 h-40 rounded-full border-4 mb-4"
          style={{ borderColor: band.color, backgroundColor: band.bg }}
        >
          <span className="text-5xl font-bold" style={{ color: band.color }}>
            {animatedScore}
          </span>
        </div>
        <div
          className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-6"
          style={{ color: band.color, backgroundColor: band.bg }}
        >
          {band.label}
        </div>
      </div>

      {/* Narrative */}
      <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-8">
        <h3 className="font-semibold text-gray-900 mb-3">Why Your Score is {overall}</h3>
        <p className="text-gray-500 leading-relaxed">{narrative}</p>
      </div>

      {/* Radar Chart */}
      <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-8">
        <h3 className="font-semibold text-gray-900 mb-6 text-center">Score Breakdown</h3>
        <ResponsiveContainer width="100%" height={350}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis
              dataKey="dimension"
              tick={{ fontSize: 11, fill: '#6b7280' }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: '#9ca3af' }}
            />
            <Radar
              dataKey="score"
              stroke="#0d9488"
              fill="#0d9488"
              fillOpacity={0.2}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Dimension Cards */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {dimensionMeta.map((d) => (
          <ScoreDimension
            key={d.key}
            label={d.label}
            score={scores[d.key]}
            weight={d.weight}
            tip={d.tip(scores[d.key])}
          />
        ))}
      </div>

      {/* Retake */}
      <div className="text-center">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 px-6 py-3 text-sm bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors font-medium"
        >
          <RotateCcw className="w-4 h-4" />
          Retake Assessment
        </button>
      </div>
    </div>
  )
}
