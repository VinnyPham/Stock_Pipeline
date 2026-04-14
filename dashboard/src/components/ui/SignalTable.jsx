import './SignalTable.css'

export default function SignalTable({ signals = [], selected }) {
  if (!signals.length) {
    return <div className="signal-empty-panel">No active signals.</div>
  }

  return (
    <div className="signal-table">
      <div className="signal-row signal-header">
        <span>Symbol</span>
        <span>Date</span>
        <span>RSI</span>
        <span>BB</span>
      </div>
      {signals.slice(0, 10).map((sig) => (
        <div
          key={`${sig.symbol}-${sig.date}`}
          className={`signal-row ${sig.symbol === selected ? 'selected' : ''}`}
        >
          <span className="symbol">{sig.symbol}</span>
          <span className="signal-date">{sig.date.slice(5)}</span>
          <span className={`signal-pill ${sig.rsi_signal}`}>
            {sig.rsi_signal?.toUpperCase()}
          </span>
          <span className={`signal-pill ${sig.bb_signal}`}>
            {sig.bb_signal?.toUpperCase()}
          </span>
        </div>
      ))}
    </div>
  )
}