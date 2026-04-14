import './CandlestickChart.css'

export default function CandlestickChart({ data = [] }) {
  if (!data.length) return <div className="chart-empty">awaiting data</div>

  const W = 680, H = 220
  const PL = 54, PR = 12, PT = 12, PB = 26
  const cw = W - PL - PR
  const ch = H - PT - PB
  const n  = data.length

  const allVals = data.flatMap(d =>
    [d.high, d.low, d.bb_upper, d.bb_lower].filter(v => v != null && !isNaN(v))
  )
  const minV = Math.min(...allVals) * 0.998
  const maxV = Math.max(...allVals) * 1.002

  const px   = i => PL + (i / (n - 1)) * cw
  const py   = v => PT + ch - ((v - minV) / (maxV - minV)) * ch
  const barW = Math.max(1.5, (cw / n) * 0.55)

  const bbData = data.filter(d => d.bb_upper != null && d.bb_lower != null && !isNaN(d.bb_upper))

  const bbUpperPts = bbData.map(d => `${px(data.indexOf(d))},${py(d.bb_upper)}`)
  const bbLowerPts = bbData.map(d => `${px(data.indexOf(d))},${py(d.bb_lower)}`)
  const bbUpperPath = bbUpperPts.map((p, i) => `${i===0?'M':'L'}${p}`).join(' ')
  const bbLowerPath = bbLowerPts.map((p, i) => `${i===0?'M':'L'}${p}`).join(' ')
  const bbFill = bbUpperPath + ' ' + [...bbLowerPts].reverse().map((p, i) => `${i===0?'L':'L'}${p}`).join(' ') + ' Z'

  const smaPath = data
    .filter(d => d.sma_20 != null && !isNaN(d.sma_20))
    .map((d, i, arr) => `${i===0?'M':'L'}${px(data.indexOf(d))},${py(d.sma_20)}`)
    .join(' ')

  // Grid value lines
  const gridVals = [minV + (maxV-minV)*0.25, minV + (maxV-minV)*0.5, minV + (maxV-minV)*0.75]
  const ticks = [0, Math.floor(n/4), Math.floor(n/2), Math.floor(3*n/4), n-1]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="candle-svg">
      <defs>
        <linearGradient id="bbGradC" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#9b7fff" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#9b7fff" stopOpacity="0.01" />
        </linearGradient>
      </defs>

      {/* Grid */}
      {gridVals.map((v, i) => (
        <line key={i}
          x1={PL} y1={py(v)} x2={PL+cw} y2={py(v)}
          stroke="#141420" strokeWidth={1}
        />
      ))}

      <path d={bbFill} fill="url(#bbGradC)" />
      <path d={bbUpperPath} className="bb-line" />
      <path d={bbLowerPath} className="bb-line" />
      <path d={smaPath} className="sma-line" />

      {data.map((d, i) => {
        const bull   = d.close >= d.open
        const color  = bull ? '#00d97e' : '#ff4d6a'
        const x      = px(i)
        const bodyY  = Math.min(py(d.open), py(d.close))
        const bodyH  = Math.max(1, Math.abs(py(d.close) - py(d.open)))
        return (
          <g key={i}>
            <line x1={x} y1={py(d.high)} x2={x} y2={py(d.low)}
              stroke={color} strokeWidth={0.7} opacity={0.55} />
            <rect x={x - barW/2} y={bodyY} width={barW} height={bodyH}
              fill={color} opacity={0.85} />
          </g>
        )
      })}

      {/* Y axis price labels */}
      {gridVals.map((v, i) => (
        <text key={i} x={PL-6} y={py(v)+3} className="c-axis" textAnchor="end">
          {Math.round(v)}
        </text>
      ))}
      <text x={PL-6} y={py(maxV)+3} className="c-axis" textAnchor="end">${Math.round(maxV)}</text>
      <text x={PL-6} y={py(minV)+3} className="c-axis" textAnchor="end">${Math.round(minV)}</text>

      {/* X axis date labels */}
      {ticks.map(i => (
        <text key={i} x={px(i)} y={H-6} className="c-axis" textAnchor="middle">
          {data[i]?.date?.slice(5)}
        </text>
      ))}
    </svg>
  )
}