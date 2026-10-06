import express from 'express'

const router = express.Router()

// Edit this list to change which airports show on the homepage
const STATIONS = ['PANC', 'PAFA', 'PAJN', 'PABR', 'PAOM', 'PADQ', 'PADK', 'PAKT']

let cache = null
let cacheTime = 0
const CACHE_DURATION = 5 * 60 * 1000

// Public - no login needed
router.get('/', async (req, res) => {
  const now = Date.now()
  if (cache && now - cacheTime < CACHE_DURATION) {
    return res.json(cache)
  }

  try {
    const response = await fetch(
      `https://aviationweather.gov/api/data/metar?ids=${STATIONS.join(',')}&format=json`
    )
    if (!response.ok && response.status !== 204) {
      throw new Error(`Aviation Weather Center responded ${response.status}`)
    }

    // 204 means "no data", which has an empty body, so don't call .json() blindly
    const text = await response.text()
    const raw = text ? JSON.parse(text) : []

    const byStation = Object.fromEntries(raw.map((m) => [m.icaoId, m]))

    // Keep our own ordering, and skip any station with no recent report
    const reports = STATIONS.filter((id) => byStation[id]).map((id) => {
      const m = byStation[id]
      return {
        icaoId: m.icaoId,
        name: m.name,
        fltCat: m.fltCat,
        temp: m.temp,
        dewp: m.dewp,
        wdir: m.wdir,
        wspd: m.wspd,
        wgst: m.wgst,
        visib: m.visib,
        altim: m.altim,
        wxString: m.wxString,
        clouds: m.clouds,
        obsTime: m.obsTime,
        rawOb: m.rawOb,
      }
    })

    cache = reports
    cacheTime = now
    res.json(reports)
  } catch (err) {
    console.error('Weather fetch error:', err)
    // Slightly old weather is better than a broken homepage section
    if (cache) return res.json(cache)
    res.status(502).json({ error: 'Could not fetch weather' })
  }
})

export default router