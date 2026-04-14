import { useEffect, useState } from 'react'
import {
  fetchSummary,
  fetchIndicators,
  fetchSpikes,
  fetchSignals,
} from './services/api'
import TickerCards      from './components/ui/TickerCards'
import SpikeTable       from './components/ui/SpikeTable'
import SignalTable      from './components/ui/SignalTable'
import PriceChart       from './components/charts/PriceChart'
import RSIChart         from './components/charts/RSIChart'
import CandlestickChart from './components/charts/CandlestickChart'
import './styles/App.css'

export default function App() {
  const [summary,        setSummary]        = useState([])
  const [spikes,         setSpikes]         = useState([])
  const [signals,        setSignals]        = useState([])
  const [indicatorCache, setIndicatorCache] = useState({})
  const [chartData,      setChartData]      = useState([])
  const [selected,       setSelected]       = useState('AAPL')
  const [loading,        setLoading]        = useState(true)
  const [chartLoading,   setChartLoading]   = useState(false)
  const [error,          setError]          = useState('')
  const [retryCount,     setRetryCount]     = useState(0)

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true)
        setError('')
        const [summaryData, spikesData, signalsData] = await Promise.all([
          fetchSummary(),
          fetchSpikes(),
          fetchSignals(),
        ])

        if (!summaryData.length && !spikesData.length && !signalsData.length) {
          throw new Error('No data returned')
        }

        setSummary(summaryData)
        setSpikes(spikesData)
        setSignals(signalsData)

        const initialSymbol = summaryData[0]?.symbol || 'AAPL'
        setSelected(initialSymbol)

        const indicatorData = await fetchIndicators(initialSymbol)
        setIndicatorCache({ [initialSymbol]: indicatorData })
        setChartData(Array.isArray(indicatorData) ? indicatorData : [])
      } catch (err) {
        setError('Cannot reach API at localhost:5000')
      } finally {
        setLoading(false)
      }
    }
    loadDashboard()
  }, [retryCount])

  const handleSelect = async (symbol) => {
    setSelected(symbol)
    setError('')

    const cached = indicatorCache[symbol]
    if (Array.isArray(cached) && cached.length > 0) {
      setChartData(cached)
      return
    }

    try {
      setChartLoading(true)
      const indicatorData = await fetchIndicators(symbol)
      const safeData = Array.isArray(indicatorData) ? indicatorData : []
      setIndicatorCache(prev => ({ ...prev, [symbol]: safeData }))
      setChartData(safeData)
    } catch {
      setError(`Could not load indicators for ${symbol}.`)
    } finally {
      setChartLoading(false)
    }
  }

  const selectedData    = Array.isArray(chartData) ? chartData : []
  const latest          = selectedData.at(-1)
  const latestRSISig    = latest?.rsi_signal
  const latestBBSig     = latest?.bb_signal
  const latestRSI       = latest?.rsi_14?.toFixed(1)

  if (loading) return (
    <div className="fullscreen">
      <div className="fs-label">Initializing pipeline</div>
      <div className="fs-sub">connecting to localhost:5000</div>
    </div>
  )

  if (error && !summary.length) return (
    <div className="fullscreen">
      <div className="fs-label err">Connection failed</div>
      <div className="fs-sub">{error}</div>
      <code className="fs-cmd">python -m api.server</code>
      <button className="retry-btn" onClick={() => setRetryCount(c => c + 1)}>
        Retry connection
      </button>
    </div>
  )

  return (
    <div className="app">

      {/* ── Top bar ── */}
      <div className="topbar">
        <div className="topbar-brand">
          <div className="brand-mark" />
          <span className="brand-name">Market Pipeline</span>
        </div>
      </div>

      {/* ── Body grid ── */}
      <div className="main">

        {/* ──── LEFT COLUMN ──── */}
        <div className="main-left">

          {/* Ticker cards */}
          <div className="section">
            <div className="section-head">
              <span className="section-label">Tickers</span>
              <span className="section-meta">{summary.length} symbols loaded</span>
            </div>
            <TickerCards summary={summary} selected={selected} onSelect={handleSelect} />
          </div>

          {/* Active signals */}
          <div className="section">
            <div className="section-head">
              <span className="section-label">Signal · {selected}</span>
            </div>
            <div className="signal-row">
              {latestRSI && (
                <div className={`sig-tag ${latestRSISig || 'neutral'}`}>
                  <span className="sig-tag-label">RSI</span>
                  {latestRSI} · {latestRSISig || 'neutral'}
                </div>
              )}
              {latestBBSig && latestBBSig !== 'neutral' && (
                <div className={`sig-tag ${latestBBSig}`}>
                  <span className="sig-tag-label">BB</span>
                  {latestBBSig}
                </div>
              )}
              {(!latestRSI && (!latestBBSig || latestBBSig === 'neutral')) && (
                <div className="sig-tag none">No active signals</div>
              )}
            </div>
          </div>

          {/* Charts */}
          {chartLoading ? (
            <div className="chart-loading">Loading {selected}…</div>
          ) : (
            <>
              <div className="chart-section">
                <div className="chart-section-head">
                  <span className="chart-title">Candlestick + Bollinger Bands · {selected}</span>
                  <div className="chart-legend">
                    <span className="leg"><span className="leg-swatch" style={{background:'#00d97e'}}/>Bull</span>
                    <span className="leg"><span className="leg-swatch" style={{background:'#ff4d6a'}}/>Bear</span>
                    <span className="leg"><span className="leg-swatch" style={{background:'#9b7fff',opacity:0.5}}/>BB</span>
                    <span className="leg"><span className="leg-swatch" style={{background:'#f0a500',opacity:0.7}}/>SMA20</span>
                  </div>
                </div>
                <CandlestickChart data={selectedData} />
              </div>

              <div className="chart-section">
                <div className="chart-section-head">
                  <span className="chart-title">Price · {selected}</span>
                  <div className="chart-legend">
                    <span className="leg"><span className="leg-swatch" style={{background:'#4d9fff'}}/>Close</span>
                    <span className="leg"><span className="leg-swatch" style={{background:'#f0a500',opacity:0.7}}/>SMA20</span>
                  </div>
                </div>
                <PriceChart data={selectedData} />
              </div>

              <div className="chart-section">
                <div className="chart-section-head">
                  <span className="chart-title">RSI (14) · {selected}</span>
                  <div className="chart-legend">
                    <span className="leg"><span className="leg-swatch" style={{background:'#ff4d6a',opacity:0.5}}/>Overbought &gt;70</span>
                    <span className="leg"><span className="leg-swatch" style={{background:'#00d97e',opacity:0.5}}/>Oversold &lt;30</span>
                  </div>
                </div>
                <RSIChart data={selectedData} />
              </div>
            </>
          )}

        </div>

        {/* ──── RIGHT COLUMN ──── */}
        <div className="main-right">
          <div className="right-section">
            <div className="section-head">
              <span className="section-label">Volume Spikes</span>
              <span className="section-meta">{spikes.length} events</span>
            </div>
            <SpikeTable spikes={spikes} />
          </div>

          <div className="right-section">
            <div className="section-head">
              <span className="section-label">Recent Signals</span>
              <span className="section-meta">{signals.length} rows</span>
            </div>
            <SignalTable signals={signals} selected={selected} />
          </div>
        </div>

      </div>
    </div>
  )
}