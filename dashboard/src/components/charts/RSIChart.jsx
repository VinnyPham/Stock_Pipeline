import './RSIChart.css'

export default function RSIChart({ data = [] }) {
  if (!data.length) return <div className="rsi-empty">awaiting data</div>

  const filtered = data.filter(d => d.rsi_14 != null && !isNaN(d.rsi_14))
  if (!filtered.length) return null

  const W = 680, H = 90
  const PL = 54, PR = 12, PT = 6, PB = 22
  const cw = W - PL - PR
  const ch = H - PT - PB
  const n  = data.length

  const px = i => PL + (i / (n - 1)) * cw
  const py = v => PT + ch - (v / 100) * ch

  const rsiPath = filtered
    .map((d, i) => `${i===0?'M':'L'}${px(data.indexOf(d))},${py(d.rsi_14)}`)
    .join(' ')

  // Overbought area fill
  const obPoints = filtered.filter(d => d.rsi_14 > 70)
  const ticks = [0, Math.floor(n/4), Math.floor(n/2), Math.floor(3*n/4), n-1]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="rsi-svg">
      {/* Zone fills */}
      <rect x={PL} y={PT} width={cw} height={py(70)-PT}
        fill="#ff4d6a" opacity={0.04} />
      <rect x={PL} y={py(30)} width={cw} height={PT+ch-py(30)}
        fill="#00d97e" opacity={0.04} />

      {/* Reference lines */}
      <line x1={PL} y1={py(70)} x2={PL+cw} y2={py(70)}
        stroke="#ff4d6a" strokeWidth={0.6} strokeDasharray="2 5" opacity={0.5} />
      <line x1={PL} y1={py(50)} x2={PL+cw} y2={py(50)}
        stroke="#1e1e30" strokeWidth={1} />
      <line x1={PL} y1={py(30)} x2={PL+cw} y2={py(30)}
        stroke="#00d97e" strokeWidth={0.6} strokeDasharray="2 5" opacity={0.5} />

      {/* RSI line */}
      <path d={rsiPath} stroke="#9b7fff" strokeWidth={1.5} fill="none" />

      {/* Y labels */}
      <text x={PL-6} y={py(70)+3} className="r-axis" textAnchor="end">70</text>
      <text x={PL-6} y={py(50)+3} className="r-axis" textAnchor="end">50</text>
      <text x={PL-6} y={py(30)+3} className="r-axis" textAnchor="end">30</text>

      {/* X labels */}
      {ticks.map(i => (
        <text key={i} x={px(i)} y={H-5} className="r-axis" textAnchor="middle">
          {data[i]?.date?.slice(5)}
        </text>
      ))}
    </svg>
  )
}