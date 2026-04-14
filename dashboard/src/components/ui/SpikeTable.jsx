import './SpikeTable.css'

export default function SpikeTable({ spikes = [] }) {
  if (!spikes.length) return <div style={{fontSize:10,color:'var(--dim)',padding:'0.5rem 0'}}>No spike data</div>

  const maxVol = Math.max(...spikes.map(s => s.volume), 1)

  return (
    <div className="spike-table">
      <div className="spike-row spike-header">
        <span>Sym</span>
        <span>Date</span>
        <span>Volume</span>
        <span></span>
        <span>Gap</span>
      </div>
      {spikes.map((s, i) => {
        const ratio  = (s.volume / s.avg_volume_20).toFixed(1)
        const barPct = Math.round(s.volume / maxVol * 100)
        return (
          <div className="spike-row" key={i}>
            <span className="spike-sym">{s.symbol}</span>
            <span className="spike-date">{s.date.slice(5)}</span>
            <span className="spike-vol">
              {(s.volume / 1e6).toFixed(1)}M <span className="spike-ratio">{ratio}×</span>
            </span>
            <span>
              <div className="vol-bar-wrap">
                <div className="vol-bar" style={{ width: `${barPct}%` }} />
              </div>
            </span>
            <span className={`spike-gap ${s.gap_pct >= 0 ? 'up' : 'down'}`}>
              {s.gap_pct >= 0 ? '+' : ''}{s.gap_pct}%
            </span>
          </div>
        )
      })}
    </div>
  )
}