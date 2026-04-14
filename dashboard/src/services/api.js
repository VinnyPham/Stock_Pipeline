import axios from 'axios'

const API = 'http://127.0.0.1:5000/api'

export const fetchSummary = async () => {
  try {
    const res = await axios.get(`${API}/summary`)
    const payload = res.data
    if (Array.isArray(payload)) return payload
    if (payload && Array.isArray(payload.data)) return payload.data
    return []
  } catch (err) {
    console.error('Summary error:', err)
    throw err
  }
}

export const fetchIndicators = async (symbol) => {
  try {
    const res = await axios.get(`${API}/indicators/${symbol}`)
    const payload = res.data
    if (Array.isArray(payload)) return payload
    if (payload && Array.isArray(payload.data)) return payload.data
    return []
  } catch (err) {
    console.error('Indicators error:', err)
    throw err
  }
}

export const fetchSpikes = async () => {
  try {
    const res = await axios.get(`${API}/spikes`)
    const payload = res.data
    if (Array.isArray(payload)) return payload
    if (payload && Array.isArray(payload.data)) return payload.data
    return []
  } catch (err) {
    console.error('Spikes error:', err)
    throw err
  }
}

export const fetchSignals = async () => {
  try {
    const res = await axios.get(`${API}/signals`)
    const payload = res.data
    if (Array.isArray(payload)) return payload
    if (payload && Array.isArray(payload.data)) return payload.data
    return []
  } catch (err) {
    console.error('Signals error:', err)
    throw err
  }
}
