import './PriceChart.css'

export default function PriceChart({ data = [] }) {
  if (!Array.isArray(data) || !data.length) return <div className="chart-empty">awaiting data</div>

  const W = 680, H = 140
  const PL = 54, PR = 12, PT = 8, PB = 24
  const cw = W - PL - PR
  const ch = H - PT - PB
  const n  = data.length

  const closes = data.map(d => d.close)
  const smas   = data.map(d => d.sma_20).filter(v => v != null && !isNaN(v))
  const allV   = [...closes, ...smas]
  const minV   = Math.min(...allV) * 0.998
  const maxV   = Math.max(...allV) * 1.002

  const px = i => PL + (i / (n - 1)) * cw
  const py = v => PT + ch - ((v - minV) / (maxV - minV)) * ch

  const pricePath = data.map((d, i) => `${i===0?'M':'L'}${px(i)},${py(d.close)}`).join(' ')
  const areaPath  = pricePath + ` L${px(n-1)},${PT+ch} L${PL},${PT+ch} Z`
  const smaPath   = data
    .filter(d => d.sma_20 != null && !isNaN(d.sma_20))
    .map((d, i) => `${i===0?'M':'L'}${px(data.indexOf(d))},${py(d.sma_20)}`)
    .join(' ')

  const gridVals = [minV + (maxV-minV)*0.33, minV + (maxV-minV)*0.66]
  const ticks = [0, Math.floor(n/4), Math.floor(n/2), Math.floor(3*n/4), n-1]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="price-svg">
      <defs>
        <linearGradient id="priceGradP" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#4d9fff" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#4d9fff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {gridVals.map((v, i) => (
        <line key={i} x1={PL} y1={py(v)} x2={PL+cw} y2={py(v)}
          stroke="#141420" strokeWidth={1} />
      ))}

      <path d={areaPath}  fill="url(#priceGradP)" />
      <path d={smaPath}   className="p-sma-line" />
      <path d={pricePath} className="p-price-line" />

      {gridVals.map((v, i) => (
        <text key={i} x={PL-6} y={py(v)+3} className="p-axis" textAnchor="end">
          {Math.round(v)}
        </text>
      ))}
      <text x={PL-6} y={py(maxV)+3} className="p-axis" textAnchor="end">${Math.round(maxV)}</text>
      <text x={PL-6} y={py(minV)+3} className="p-axis" textAnchor="end">${Math.round(minV)}</text>

      {ticks.map(i => (
        <text key={i} x={px(i)} y={H-5} className="p-axis" textAnchor="middle">
          {data[i]?.date?.slice(5)}
        </text>
      ))}
    </svg>
  )
}