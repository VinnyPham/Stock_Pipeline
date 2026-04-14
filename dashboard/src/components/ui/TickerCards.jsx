import './TickerCards.css'

export default function TickerCards({ summary, selected, onSelect }) {
  return (
    <div className="cards">
      {summary.map(t => {
        const up = t.pct_above_sma >= 0
        return (
          <div
            key={t.symbol}
            className={`card ${selected === t.symbol ? 'active' : ''}`}
            onClick={() => onSelect(t.symbol)}
          >
            <div className="card-sym">{t.symbol}</div>
            <div className="card-price">${Number(t.last_close).toFixed(2)}</div>
            <div className={`card-delta ${up ? 'up' : 'down'}`}>
              {up ? '▲' : '▼'} {Math.abs(t.pct_above_sma).toFixed(2)}%
            </div>
          </div>
        )
      })}
    </div>
  )
}