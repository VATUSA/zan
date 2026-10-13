import { useState, useEffect } from 'react'
import { API_URL } from '../config'

const CAT_STYLES = {
  VFR: 'bg-teal/15 text-teal',
  MVFR: 'bg-blue-500/15 text-blue-300',
  IFR: 'bg-red-500/15 text-red-300',
  LIFR: 'bg-purple/15 text-purple',
}

function formatWind(m) {
  if (m.wspd == null) return '—'
  if (m.wspd === 0) return 'Calm'
  const dir = m.wdir === 'VRB' ? 'VRB' : `${String(m.wdir).padStart(3, '0')}°`
  return `${dir} at ${m.wspd}${m.wgst ? `G${m.wgst}` : ''} kt`
}

// Ceiling = lowest broken or overcast layer
function formatCeiling(clouds) {
  const layer = [...(clouds || [])]
    .sort((a, b) => a.base - b.base)
    .find((c) => c.cover === 'BKN' || c.cover === 'OVC' || c.cover === 'OVX')
  return layer ? `${layer.cover} ${layer.base.toLocaleString()} ft` : 'No ceiling'
}

function formatTempDew(m) {
  if (m.temp == null || m.dewp == null) return '—'
  return `${Math.round(m.temp)}° / ${Math.round(m.dewp)}°C`
}

// The API gives pressure in hectopascals; US pilots expect inches of mercury
function formatAltimeter(altim) {
  if (altim == null) return '—'
  return `${(altim * 0.02953).toFixed(2)} inHg`
}

function formatAge(obsTime) {
  const mins = Math.max(0, Math.round((Date.now() / 1000 - obsTime) / 60))
  if (mins < 60) return `Observed ${mins} min ago`
  return `Observed ${Math.floor(mins / 60)} h ago`
}

function Weather() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const load = () =>
      fetch(`${API_URL}/api/weather`)
        .then((res) => {
          if (!res.ok) throw new Error('bad response')
          return res.json()
        })
        .then((data) => {
          setReports(data)
          setError(false)
        })
        .catch(() => setError(true))
        .finally(() => setLoading(false))

    load()
    const timer = setInterval(load, 5 * 60 * 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="px-6 sm:px-10 pb-28">
      <div className="max-w-[1180px] mx-auto">
        <div className="flex items-baseline gap-5 flex-wrap">
          <h2 className="font-extrabold leading-tight tracking-tight text-[clamp(28px,3.4vw,44px)]">
            Weather across the FIR
          </h2>
          <span className="ml-auto text-xs font-semibold text-muted3">Source: NOAA Aviation Weather Center</span>
        </div>
        <p className="max-w-[52ch] mt-4 text-muted leading-relaxed">
          Live METARs from the airports around Anchorage airspace.
        </p>

        {loading && <p className="text-muted2 mt-9">Loading weather...</p>}

        {!loading && reports.length === 0 && (
          <p className="text-muted2 mt-9">
            {error ? 'Weather is unavailable right now.' : 'No recent reports available.'}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-9">
          {reports.map((m) => (
            <div key={m.icaoId} className="rounded-2xl bg-white/[0.04] p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-mono font-bold text-lg">{m.icaoId}</div>
                  <div className="text-xs text-muted3 mt-0.5">{m.name.replace(/, AK, US$/, '')}</div>
                </div>
                {m.fltCat && (
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${CAT_STYLES[m.fltCat] || 'bg-white/10 text-muted2'}`}>
                    {m.fltCat}
                  </span>
                )}
              </div>

              <div className="mt-4 space-y-1.5 text-sm">
                <Row label="Wind" value={formatWind(m)} />
                <Row label="Vis" value={m.visib != null ? `${m.visib} SM` : '—'} />
                <Row label="Ceiling" value={formatCeiling(m.clouds)} />
                <Row label="Temp / Dew" value={formatTempDew(m)} />
                <Row label="Altimeter" value={formatAltimeter(m.altim)} />
              </div>

              {m.wxString && <div className="mt-3 text-xs font-bold text-gold">{m.wxString}</div>}

              <details className="mt-3">
                <summary className="cursor-pointer list-none text-xs font-bold text-muted2 hover:text-ink">
                  Raw METAR
                </summary>
                <p className="mt-2 font-mono text-[11px] leading-relaxed text-muted3 break-words">{m.rawOb}</p>
              </details>

              <div className="mt-3 text-[11px] text-muted3">{formatAge(m.obsTime)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted3">{label}</span>
      <span className="text-ink font-semibold text-right">{value}</span>
    </div>
  )
}

export default Weather