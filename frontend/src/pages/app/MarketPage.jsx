import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Area, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, ReferenceLine } from 'recharts'
import { EASE } from '../../lib/motion'
import useApi from '../../hooks/useApi'
import { ErrorPanel, SkeletonBlock } from '../../components/app/Status'
import {
  TrendingUp, TrendingDown, MapPin, Radio, Cpu, Trophy, Navigation,
  ChevronDown, ChevronUp, Loader2, BadgeCheck, Truck, Warehouse, Calendar, LocateFixed,
} from 'lucide-react'

const RANGES = [
  { id: '7D', days: 7 },
  { id: '30D', days: 30 },
  { id: '3M', days: 90 },
  { id: '6M', days: 180 },
  { id: '1Y', days: 365 },
]

const CATS = [
  { id: 'All', label: 'All crops', cats: null },
  { id: 'field', label: 'Field crops', cats: ['cereals', 'oilseeds', 'pulses', 'fibre', 'sugarcane'] },
  { id: 'vegetables', label: 'Vegetables', cats: ['vegetables'] },
  { id: 'fruits', label: 'Fruits', cats: ['fruits'] },
  { id: 'spices', label: 'Spices', cats: ['spices'] },
]

const inr = (n) => (n == null ? '—' : n.toLocaleString('en-IN', { maximumFractionDigits: 1 }))
const inr0 = (n) => (n == null ? '—' : n.toLocaleString('en-IN', { maximumFractionDigits: 0 }))
const fmtDate = (s) => { if (!s) return null; try { return new Date(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) } catch { return s } }
const qs = (params) => Object.entries(params || {})
  .filter(([, v]) => v !== undefined && v !== null && v !== '')
  .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
  .join('&')

function SourceBadge({ source }) {
  const live = source && source !== 'model'
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.1em] ${live ? 'bg-green-100 text-green-800' : 'bg-ink/[0.06] text-sage'}`}>
      {live ? <Radio className="h-3.5 w-3.5" strokeWidth={2}/> : <Cpu className="h-3.5 w-3.5" strokeWidth={2}/>}
      {live ? 'Live mandi feed' : 'Model estimate'}
    </span>
  )
}

function TrendChip({ pct }) {
  if (pct == null) return null
  const up = pct > 1, down = pct < -1
  return (
    <span className={`inline-flex items-center gap-1 text-[0.62rem] font-semibold uppercase tracking-[0.06em] ${up ? 'text-agri' : down ? 'text-sage' : 'text-smoke'}`}>
      {up ? <TrendingUp className="h-3 w-3" strokeWidth={2}/> : down ? <TrendingDown className="h-3 w-3" strokeWidth={2}/> : null}
      {up ? '+' : ''}{inr(pct)}%
    </span>
  )
}

function Fcpill({ label, fc }) {
  const exp = fc?.expected
  return (
    <div className="rounded-xl bg-ivory px-3 py-2">
      <p className="text-[0.56rem] uppercase tracking-[0.14em] text-sage">{label}</p>
      <p className="mt-1 text-[0.88rem] font-medium text-ink">{exp == null ? '—' : `₹${inr0(exp)}`}</p>
      {fc?.lower != null && fc?.upper != null && (
        <p className="mt-0.5 text-[0.58rem] text-sage">₹{inr0(fc.lower)} – ₹{inr0(fc.upper)}</p>
      )}
    </div>
  )
}

function SelectionPanel({ uni, crop, onCrop, district, onDistrict, variety, onVariety, storage, onStorage, geo, locating, onLocate }) {
  const [cat, setCat] = useState(CATS[0])
  const list = (uni?.crops || []).filter((c) => !cat.cats || cat.cats.includes(c.category))
  const varieties = uni?.varieties?.[crop] || []
  return (
    <div className="rounded-3xl border border-ink/[0.07] bg-white/80 p-6 md:p-8">
      {/* Location */}
      <div className="flex flex-col gap-5 md:flex-row md:items-end">
        <div className="min-w-[190px]">
          <p className="u-eyebrow text-sage">Location</p>
          <div className="mt-3 flex items-center gap-2.5 rounded-2xl border border-ink/[0.08] bg-ivory px-4 py-3">
            <MapPin className="h-4 w-4 text-agri" strokeWidth={1.5} />
            <span className="text-[0.84rem] font-medium text-ink">Karnataka</span>
          </div>
        </div>
        <div className="min-w-[190px]">
          <p className="u-eyebrow text-sage">District</p>
          <select
            value={district}
            onChange={(e) => onDistrict(e.target.value)}
            className="mt-3 w-full rounded-2xl border border-ink/[0.1] bg-ivory px-4 py-3 text-[0.84rem] font-medium text-ink outline-none focus:border-agri/40"
          >
            {(uni?.districts || []).map((d) => <option key={d.name} value={d.name}>{d.name}</option>)}
          </select>
        </div>
        <div className="min-w-[190px]">
          <p className="u-eyebrow text-sage">Variety</p>
          <select
            value={variety}
            onChange={(e) => onVariety(e.target.value)}
            className="mt-3 w-full rounded-2xl border border-ink/[0.1] bg-ivory px-4 py-3 text-[0.84rem] font-medium text-ink outline-none focus:border-agri/40"
          >
            {varieties.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div className="md:ml-auto">
          <button
            onClick={onLocate}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-[0.68rem] font-semibold uppercase tracking-[0.14em] transition-all ${
              geo ? 'bg-agri-deep text-lime' : 'border border-ink/[0.12] bg-white text-ink hover:border-agri/40 hover:text-agri'
            }`}
          >
            {locating ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} /> : geo ? <LocateFixed className="h-4 w-4" strokeWidth={1.5} /> : <Navigation className="h-4 w-4" strokeWidth={1.5} />}
            {geo ? `${geo.lat.toFixed(2)}, ${geo.lng.toFixed(2)}` : locating ? 'Locating…' : 'Use my location'}
          </button>
          <label className="mt-3 flex cursor-pointer items-center justify-end gap-2.5 text-[0.72rem] text-smoke">
            <input
              type="checkbox"
              checked={storage}
              onChange={(e) => onStorage(e.target.checked)}
              className="h-4 w-4 accent-[var(--color-agri)]"
            />
            Include storage cost (₹20/q)
          </label>
        </div>
      </div>

      {/* Crop pills */}
      <div className="mt-8">
        <p className="u-eyebrow text-sage">Crop</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {CATS.map((c) => (
            <button
              key={c.id}
              onClick={() => setCat(c)}
              className={`rounded-full px-4 py-1.5 text-[0.66rem] font-semibold uppercase tracking-[0.12em] transition-all ${cat.id === c.id ? 'bg-agri text-ivory shadow-sm' : 'border border-ink/[0.08] bg-white/70 text-smoke hover:border-agri/25'}`}
            >{c.label}</button>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7">
          {list.map((c) => (
            <button
              key={c.key}
              onClick={() => onCrop(c.key)}
              className={`flex flex-col items-start rounded-2xl border p-3 text-left transition-all duration-300 ${
                crop === c.key
                  ? 'border-agri/40 bg-agri-deep text-ivory shadow-[0_12px_28px_-14px_rgba(31,58,42,0.3)]'
                  : 'border-ink/[0.08] bg-white/80 hover:border-agri/25'
              }`}
            >
              <span className="flex w-full items-center justify-between gap-2">
                <span className={`truncate text-[0.7rem] font-semibold uppercase tracking-[0.06em] ${crop === c.key ? 'text-lime' : 'text-ink'}`}>{c.name}</span>
                {c.live
                  ? <span className={`shrink-0 rounded px-1.5 py-0.5 text-[0.5rem] font-bold uppercase tracking-wider ${crop === c.key ? 'bg-lime text-agri-deep' : 'bg-green-100 text-green-700'}`}>Live</span>
                  : null}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function NetBreakdown({ row }) {
  return (
    <div className="flex flex-wrap gap-x-7 gap-y-4">
      <div className="flex items-center gap-2.5">
        <Truck className="h-4 w-4 text-moss" strokeWidth={1.5} />
        <div>
          <p className="text-[0.56rem] uppercase tracking-[0.14em] text-sage">Transport</p>
          <p className="text-[0.84rem] font-medium text-ink">₹{inr0(row.transportQ)}/q</p>
        </div>
      </div>
      <div className="flex items-center gap-2.5">
        <BadgeCheck className="h-4 w-4 text-moss" strokeWidth={1.5} />
        <div>
          <p className="text-[0.56rem] uppercase tracking-[0.14em] text-sage">Mandi handling</p>
          <p className="text-[0.84rem] font-medium text-ink">₹{inr0(row.handlingQ)}/q</p>
        </div>
      </div>
      <div className="flex items-center gap-2.5">
        <Warehouse className="h-4 w-4 text-moss" strokeWidth={1.5} />
        <div>
          <p className="text-[0.56rem] uppercase tracking-[0.14em] text-sage">Storage</p>
          <p className="text-[0.84rem] font-medium text-ink">₹{inr0(row.storageQ)}/q</p>
        </div>
      </div>
      <div className="ml-auto text-right">
        <p className="text-[0.56rem] uppercase tracking-[0.14em] text-sage">Net at market</p>
        <p className="text-[1.4rem] font-[300] leading-none text-agri">₹{inr0(row.netQ)}<span className="text-[0.66rem] text-sage">/q</span></p>
      </div>
    </div>
  )
}

function BestMarketCard({ best, reasons, unit }) {
  if (!best) return null
  const fc30 = best.fc30?.expected
  const pct = fc30 && best.modalPrice ? Math.round(((fc30 - best.modalPrice) / best.modalPrice) * 1000) / 10 : null
  return (
    <div className="relative overflow-hidden rounded-3xl border border-agri/25 bg-agri-deep p-7 text-ivory md:p-9">
      <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-lime/[0.08]" />
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="relative min-w-[240px]">
          <p className="flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-lime">
            <Trophy className="h-4 w-4" strokeWidth={1.75} /> Best market for you
          </p>
          <h2 className="mt-3 text-[clamp(1.5rem,2.6vw,2.2rem)] font-[300] leading-none">{best.name}</h2>
          <p className="mt-2 flex items-center gap-1.5 text-[0.8rem] text-lime-soft">
            <MapPin className="h-3.5 w-3.5" strokeWidth={1.5} />
            {best.district} · {best.distanceLabel}
          </p>
        </div>
        <div className="relative text-right">
          <p className="text-[0.62rem] uppercase tracking-[0.16em] text-lime-soft">Expected modal</p>
          <p className="mt-1 text-[clamp(1.8rem,3.4vw,2.7rem)] font-[300] leading-none">₹{inr0(best.modalPrice)}<span className="text-[0.8rem] text-lime-soft">/q</span></p>
          <p className="mt-1.5 text-[0.7rem] text-lime-soft">{best.distanceKm} km · {best.source === 'live' ? 'live feed' : 'model estimate'}</p>
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-lime px-3.5 py-1.5 text-[0.66rem] font-bold uppercase tracking-[0.12em] text-agri-deep">
            Net ₹{inr0(best.netQ)}/q {best.storageQ ? 'after costs' : ''}
          </p>
        </div>
      </div>

      <div className="relative mt-7 border-t border-ivory/15 pt-6">
        <NetBreakdown row={best} />
      </div>

      {reasons?.length > 0 && (
        <div className="relative mt-6 grid gap-2.5 md:grid-cols-2">
          {reasons.map((r, i) => (
            <div key={i} className="flex items-start gap-3 rounded-2xl bg-ivory/[0.07] px-4 py-3">
              <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-lime" strokeWidth={1.75} />
              <div className="min-w-0">
                <p className="text-[0.8rem] font-semibold text-ivory">{r.title}</p>
                <p className="text-[0.82rem] text-lime-soft">{r.value}</p>
                {r.detail && <p className="mt-0.5 text-[0.64rem] text-lime-soft/70">{r.detail}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {pct != null && (
        <p className="relative mt-5 inline-flex items-center gap-1.5 text-[0.7rem] font-medium text-lime">
          {pct >= 0 ? <TrendingUp className="h-3.5 w-3.5" strokeWidth={2} /> : <TrendingDown className="h-3.5 w-3.5" strokeWidth={2} />}
          {pct >= 0 ? '+' : ''}{pct}% expected in the next 30 days at this market
          {best.fcConfidence != null ? ` · ${best.fcConfidence}% confidence` : ''}
        </p>
      )}
    </div>
  )
}

function NearestCard({ m }) {
  return (
    <button
      className="shrink-0 rounded-3xl border border-ink/[0.07] bg-white/80 p-5 text-left transition-all hover:border-agri/30 hover:shadow-[0_18px_34px_-22px_rgba(31,58,42,0.25)]"
    >
      <p className="flex items-center gap-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-agri">
        <MapPin className="h-3.5 w-3.5" strokeWidth={1.75} /> {m.name}
      </p>
      <p className="mt-0.5 text-[0.64rem] text-sage">{m.district} · {m.distanceLabel}</p>
      <p className="mt-3 text-[1.05rem] font-[300] text-ink">₹{inr0(m.modalPrice)}<span className="text-[0.62rem] text-sage">/q</span></p>
      <p className="mt-1.5 flex items-center justify-between gap-2">
        <span className="text-[0.6rem] text-sage">Net ₹{inr0(m.netQ)}/q</span>
        <TrendChip pct={m.trendPct} />
      </p>
    </button>
  )
}

function DetailPanel({ row, crop }) {
  const [range, setRange] = useState('3M')
  const daysMap = { '7D': 7, '30D': 30, '3M': 90, '6M': 180, '1Y': 365 }
  const days = daysMap[range] || 90
  const { data: detail, error, loading, reload } = useApi(
    `/market/market-detail?${qs({ crop, district: row.district, market: row.id, days })}`
  )
  const { data: fcMulti, error: fcErr, loading: fcLoad, reload: fcReload } = useApi(
    `/market/market-forecast-multi?${qs({ crop, district: row.district, market: row.id })}`
  )

  const points = useMemo(() => {
    const rows = (detail?.history?.points || []).slice()
    if (!rows.length) return []
    const histRows = rows.filter((p) => !p.f)
    const fcRows = rows.filter((p) => p.f)
    if (!histRows.length) return []
    const last = new Date(histRows[histRows.length - 1].d)
    const histStart = new Date(last); histStart.setDate(histStart.getDate() - days)
    const fcEnd = new Date(last); fcEnd.setDate(fcEnd.getDate() + Math.min(days, 90))
    const byDate = (a, b) => new Date(a.d) - new Date(b.d)
    return [...histRows.filter((p) => new Date(p.d) >= histStart), ...fcRows.filter((p) => { const d = new Date(p.d); return d > last && d <= fcEnd })]
      .sort(byDate)
      .map((p) => ({ ...p, histV: p.f ? null : p.v, fcV: p.f ? p.v : null }))
  }, [detail, days])

  const lastActual = points.filter((p) => !p.f).slice(-1)[0]
  const hasFc = points.some((p) => p.f)

  const fcHorizons = fcMulti?.horizons || row.fcAll?.horizons || []
  const fcTrend = fcMulti?.trend || row.fcTrend || { direction: 'stable', pct: 0 }
  const fcFactors = fcMulti?.factors || row.fcFactors || []
  const fcConfidence = fcMulti?.confidence || row.fcConfidence || 55
  const fcMethod = fcMulti?.method || row.fcMethod || '—'

  return (
    <div className="border-t border-ink/[0.07] p-5 md:p-6">
      <div className="grid gap-6 lg:grid-cols-5">
        {/* History chart */}
        <div className="lg:col-span-3">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="u-eyebrow text-sage">Price history · {detail?.history?.source === 'live' ? 'live mandi' : 'model series'}</p>
              <p className="mt-1 text-[0.72rem] text-sage">₹/quintal · {detail?.current?.variety || row.variety} · {row.district}</p>
            </div>
            <div className="flex gap-1 rounded-full bg-ink/[0.04] p-1">
              {RANGES.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRange(r.id)}
                  className={`rounded-full px-3 py-1.5 text-[0.58rem] font-semibold uppercase tracking-[0.1em] transition-all ${
                    range === r.id ? 'bg-agri text-ivory shadow-sm' : 'text-smoke hover:bg-white/60'
                  }`}
                >{r.id}</button>
              ))}
            </div>
          </div>

            {loading && <SkeletonBlock className="mt-5 h-[160px] w-full" />}
            {error && <div className="mt-5"><ErrorPanel onRetry={reload} compact /></div>}
            {!loading && !error && (
              <div className="mt-5 h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={points} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="mktFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1F3A2A" stopOpacity={0.12} />
                      <stop offset="100%" stopColor="#1F3A2A" stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 4" stroke="rgba(23,26,22,0.07)" vertical={false} />
                  <XAxis dataKey="d" tick={{ fontSize: 10, fill: '#5C6259' }} tickLine={false} axisLine={false} minTickGap={40} />
                  <YAxis tick={{ fontSize: 10, fill: '#5C6259' }} tickLine={false} axisLine={false} tickFormatter={(v) => '₹' + inr0(v)} />
                  <Tooltip
                    cursor={{ stroke: 'rgba(23,26,22,0.12)' }}
                    formatter={(v, _n, item) => ['₹' + inr(v), item?.payload?.f ? 'Forecast' : 'Actual']}
                    contentStyle={{ background: '#fff', border: '1px solid rgba(23,26,22,0.1)', borderRadius: 12, fontSize: 12, padding: '8px 12px' }}
                  />
                  {hasFc && lastActual ? <ReferenceLine x={lastActual.d} stroke="#8A917F" strokeDasharray="4 4" /> : null}
                  <Area type="monotone" dataKey="v" stroke="none" fill="url(#mktFill)" isAnimationActive={false} />
                  <Line type="monotone" dataKey="histV" stroke="#1F3A2A" strokeWidth={2} dot={false} isAnimationActive={false} />
                  {hasFc && <Line type="monotone" dataKey="fcV" stroke="#1F3A2A" strokeWidth={2} strokeDasharray="5 4" dot={false} isAnimationActive={false} />}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-x-7 gap-y-3 border-t border-ink/[0.07] pt-4">
            <div>
              <p className="text-[0.56rem] uppercase tracking-[0.14em] text-sage">Modal</p>
              <p className="text-[1rem] font-[300] text-ink">₹{inr0(detail?.current?.modalPrice)}</p>
            </div>
            <div>
              <p className="text-[0.56rem] uppercase tracking-[0.14em] text-sage">Range</p>
              <p className="text-[0.86rem] font-medium text-ink">₹{inr0(detail?.current?.minPrice)} – ₹{inr0(detail?.current?.maxPrice)}</p>
            </div>
            <div>
              <p className="text-[0.56rem] uppercase tracking-[0.14em] text-sage">Trend</p>
              <TrendChip pct={detail?.trend?.pct} />
            </div>
            <div className="ml-auto">
              <SourceBadge source={detail?.current?.source} />
            </div>
          </div>
          {detail?.current?.quantityNote && <p className="mt-3 text-[0.62rem] text-sage">{detail?.current?.quantityNote}</p>}
        </div>

        {/* AI Forecast */}
        <div className="lg:col-span-2">
          <div className="flex h-full flex-col rounded-2xl border border-agri/20 bg-ivory p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="u-eyebrow text-agri">AI price forecast</p>
                <p className="mt-1 flex items-center gap-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-agri">
                  <Cpu className="h-3.5 w-3.5" strokeWidth={1.75} /> {fcMethod}
                </p>
              </div>
              <div className="rounded-full bg-lime px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.1em] text-agri-deep">
                {fcConfidence}% conf
              </div>
            </div>

            {fcLoad && <div className="mt-4 grid flex-1 grid-cols-2 gap-2"><SkeletonBlock className="h-[64px]" /><SkeletonBlock className="h-[64px]" /><SkeletonBlock className="h-[64px]" /><SkeletonBlock className="h-[64px]" /></div>}
            {fcErr && <div className="mt-4"><ErrorPanel onRetry={fcReload} compact /></div>}
            {!fcLoad && !fcErr && (
              <>
                <div className="mt-4 grid grid-cols-1 gap-2">
                  {(fcHorizons || []).map((h) => {
                    const pctVal = h.expected != null && detail?.current?.modalPrice
                      ? ((h.expected - detail.current.modalPrice) / detail.current.modalPrice * 100)
                      : 0
                    const trendCls = pctVal > 1 ? 'text-agri' : pctVal < -1 ? 'text-sage' : 'text-smoke'
                    const sign = pctVal > 0 ? '+' : ''
                    return (
                      <div key={h.label} className="rounded-xl bg-white px-3 py-2.5 flex items-center justify-between">
                        <div>
                          <p className="text-[0.56rem] uppercase tracking-[0.12em] text-sage">{h.label}</p>
                          {h.expected != null && <p className="mt-0.5 text-[0.88rem] font-medium text-ink">₹{inr0(h.expected)}</p>}
                          {h.lower != null && h.upper != null && (
                            <p className="text-[0.58rem] text-sage">₹{inr0(h.lower)} – ₹{inr0(h.upper)}</p>
                          )}
                        </div>
                        {h.days <= 30 && (
                          <span className={`text-[0.6rem] font-semibold ${trendCls}`}>
                            {sign}{pctVal.toFixed(1)}%
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
                <div className="mt-4 space-y-2 border-t border-ink/[0.07] pt-4">
                  {(fcFactors || []).map((f, i) => (
                    <div key={i} className="flex justify-between gap-3 text-[0.7rem]">
                      <span className="shrink-0 text-sage">{f.title}</span>
                      <span className="text-right font-medium text-ink">{f.value}</span>
                    </div>
                  ))}
                </div>
                {fcTrend && (
                  <div className="mt-3 rounded-xl bg-agri-deep/[0.08] px-3 py-2.5">
                    <p className="text-[0.6rem] uppercase tracking-[0.12em] text-sage">30-day trend</p>
                    {(() => {
                      const trendCls = fcTrend.direction === 'increasing' ? 'text-agri' : fcTrend.direction === 'decreasing' ? 'text-sage' : 'text-smoke'
                      const arrow = fcTrend.direction === 'increasing' ? '📈' : fcTrend.direction === 'decreasing' ? '📉' : '➡️'
                      const pctStr = fcTrend.pct > 0 ? '+' : ''
                      return (
                        <p className={`mt-1 text-[0.9rem] font-semibold ${trendCls}`}>
                          {arrow} {pctStr}{fcTrend.pct}% ({fcTrend.direction})
                        </p>
                      )
                    })()}
                  </div>
                )}
                {fcMulti?.disclaimer && <p className="mt-3 text-[0.56rem] leading-relaxed text-sage">{fcMulti.disclaimer}</p>}
              </>
            )}
          </div>
        </div>
      </div>

      {detail?.scopeNote && <p className="mt-5 text-[0.62rem] text-sage">{detail.scopeNote}</p>}
    </div>
  )
}

function FcpillMulti({ fcAll }) {
  const horizons = fcAll?.horizons || []
  const d7 = horizons.find((h) => h.label === '7-Day')
  const d30 = horizons.find((h) => h.label === '30-Day')
  const d3m = horizons.find((h) => h.label === '3-Month')
  return (
    <>
      <div className="rounded-xl bg-ivory px-3 py-2">
        <p className="text-[0.5rem] uppercase tracking-[0.14em] text-sage">FC 7d</p>
        <p className="mt-0.5 text-[0.8rem] font-medium text-ink">{d7?.expected != null ? `₹${inr0(d7.expected)}` : '—'}</p>
        {d7?.lower != null && <p className="text-[0.5rem] text-sage">₹{inr0(d7.lower)}–{inr0(d7.upper)}</p>}
      </div>
      <div className="rounded-xl bg-ivory px-3 py-2">
        <p className="text-[0.5rem] uppercase tracking-[0.14em] text-sage">FC 30d</p>
        <p className="mt-0.5 text-[0.8rem] font-medium text-ink">{d30?.expected != null ? `₹${inr0(d30.expected)}` : '—'}</p>
        {d30?.lower != null && <p className="text-[0.5rem] text-sage">₹{inr0(d30.lower)}–{inr0(d30.upper)}</p>}
      </div>
      <div className="rounded-xl bg-ivory px-3 py-2">
        <p className="text-[0.5rem] uppercase tracking-[0.14em] text-sage">FC 3m</p>
        <p className="mt-0.5 text-[0.8rem] font-medium text-ink">{d3m?.expected != null ? `₹${inr0(d3m.expected)}` : '—'}</p>
        {d3m?.lower != null && <p className="text-[0.5rem] text-sage">₹{inr0(d3m.lower)}–{inr0(d3m.upper)}</p>}
      </div>
    </>
  )
}

function MarketCard({ row, crop, open, onToggle }) {
  return (
    <div className={`rounded-3xl border bg-white/80 transition-all ${open ? 'border-agri/30 shadow-[0_24px_44px_-30px_rgba(31,58,42,0.3)]' : 'border-ink/[0.07] hover:border-agri/25'}`}>
      <button onClick={onToggle} className="w-full p-5 text-left">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-1.5 text-[0.84rem] font-semibold text-ink">
              {row.name}
              <MapPin className="h-3.5 w-3.5 text-agri" strokeWidth={1.5} />
              <span className="text-[0.64rem] font-normal text-sage">{row.distanceLabel}</span>
            </p>
            <p className="mt-1 flex items-center gap-3 text-[0.62rem] text-sage">
              <SourceBadge source={row.source} />
              <TrendChip pct={row.trendPct} />
            </p>
          </div>
          <div className="flex items-center gap-5">
            <div className="text-right">
              <p className="text-[1.05rem] font-[300] text-ink">₹{inr0(row.modalPrice)}<span className="text-[0.6rem] text-sage">/q</span></p>
              <p className="text-[0.6rem] text-sage">₹{inr0(row.minPrice)} – ₹{inr0(row.maxPrice)}</p>
            </div>
            <div className="text-right">
              <p className="text-[0.9rem] font-semibold text-agri">₹{inr0(row.netQ)}</p>
              <p className="text-[0.56rem] text-sage">net/q</p>
            </div>
            <div className="grid h-9 w-9 place-items-center rounded-full bg-ink/[0.04] text-smoke">
              {open ? <ChevronUp className="h-4 w-4" strokeWidth={1.5} /> : <ChevronDown className="h-4 w-4" strokeWidth={1.5} />}
            </div>
          </div>
        </div>
        {row.arrivalDate && (
          <p className="mt-3 flex items-center gap-1.5 text-[0.6rem] text-sage">
            <Calendar className="h-3 w-3" strokeWidth={1.5} />
            Arrival {fmtDate(row.arrivalDate)}{row.arrivalQty != null ? ` · ${inr0(row.arrivalQty)} q` : ''}
          </p>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-ink/[0.06] pt-4">
          <FcpillMulti fcAll={row.fcAll} />
          <div className="ml-auto rounded-xl bg-ivory px-3 py-2">
            <p className="text-[0.56rem] uppercase tracking-[0.14em] text-sage">Net after costs</p>
            <p className="mt-1 text-[0.88rem] font-semibold text-agri">₹{inr0(row.netQ)}/q</p>
          </div>
        </div>
      </button>
      {open && <DetailPanel row={row} crop={crop} />}
    </div>
  )
}

function CompareTable({ rows, unit }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] text-left">
        <thead>
          <tr className="border-b border-ink/[0.08] text-[0.6rem] uppercase tracking-[0.14em] text-sage">
            <th className="py-3 pr-4 font-medium">#</th>
            <th className="px-4 py-3 font-medium">Market</th>
            <th className="px-4 py-3 font-medium">Distance</th>
            <th className="px-4 py-3 font-medium">Current</th>
            <th className="px-4 py-3 font-medium">Range</th>
            <th className="px-4 py-3 font-medium">Arrival</th>
            <th className="px-4 py-3 font-medium">Trend</th>
            <th className="px-4 py-3 font-medium">FC 7d</th>
            <th className="px-4 py-3 font-medium">FC 30d</th>
            <th className="px-4 py-3 font-medium">FC 3m</th>
            <th className="px-4 py-3 font-medium">Transport</th>
            <th className="px-4 py-3 font-medium">Net /q</th>
            <th className="px-4 py-3 font-medium">Confidence</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/[0.06]">
          {rows.map((m, i) => {
            const fc7 = m.fcAll?.horizons?.find((h) => h.label === '7-Day')
            const fc30 = m.fcAll?.horizons?.find((h) => h.label === '30-Day')
            const fc3m = m.fcAll?.horizons?.find((h) => h.label === '3-Month')
            return (
              <tr key={`${m.id}-${i}`} className={`text-[0.8rem] ${i === 0 ? 'bg-lime-soft/60' : ''}`}>
                <td className="py-3 pr-4">
                  <span className={`grid h-6 w-6 place-items-center rounded-full text-[0.56rem] font-semibold ${i === 0 ? 'bg-agri text-lime' : 'bg-ink/[0.05] text-sage'}`}>{i + 1}</span>
                </td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-ink">{m.name}</p>
                  <p className="text-[0.6rem] text-sage">{m.district} · {m.source === 'live' ? 'live' : 'model'}</p>
                </td>
                <td className="px-4 py-3 text-sage">{m.distanceLabel}</td>
                <td className="px-4 py-3 font-medium text-ink">₹{inr0(m.modalPrice)}</td>
                <td className="px-4 py-3 text-sage">₹{inr0(m.minPrice)}–{inr0(m.maxPrice)}</td>
                <td className="px-4 py-3 text-sage">{m.arrivalDate ? fmtDate(m.arrivalDate) : '—'}</td>
                <td className="px-4 py-3"><TrendChip pct={m.trendPct} /></td>
                <td className="px-4 py-3">{fc7?.expected != null ? `₹${inr0(fc7.expected)}` : '—'}</td>
                <td className="px-4 py-3">{fc30?.expected != null ? `₹${inr0(fc30.expected)}` : '—'}</td>
                <td className="px-4 py-3">{fc3m?.expected != null ? `₹${inr0(fc3m.expected)}` : '—'}</td>
                <td className="px-4 py-3 text-sage">₹{inr0(m.transportQ)}</td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-agri">₹{inr0(m.netQ)}</p>
                  <p className="text-[0.6rem] text-sage">{unit}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[0.6rem] font-semibold ${m.fcConfidence > 70 ? 'text-agri' : m.fcConfidence > 55 ? 'text-amber' : 'text-sage'}`}>
                    {m.fcConfidence != null ? `${m.fcConfidence}%` : '—'}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default function MarketPage() {
  const { data: uni } = useApi('/market/universe')
  const { data: profile } = useApi('/farm/profile')
  const farmDistrict = profile?.profile?.district

  const [district, setDistrict] = useState('Bengaluru')
  const [crop, setCrop] = useState('Tomato')
  const [variety, setVariety] = useState('Local')
  const [storage, setStorage] = useState(false)
  const [geo, setGeo] = useState(null)
  const [locating, setLocating] = useState(false)
  const [openId, setOpenId] = useState(null)

  useEffect(() => {
    if (farmDistrict && district === 'Bengaluru') setDistrict(farmDistrict)
  }, [farmDistrict]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const list = uni?.varieties?.[crop] || []
    if (list.length) setVariety(list[0])
  }, [crop, uni])

  const marketsPath = useMemo(() => {
    if (!crop || !district) return null
    return `/market/markets?${qs({
      crop, district,
      variety: variety || undefined,
      farmDistrict: farmDistrict || undefined,
      lat: geo?.lat,
      lng: geo?.lng,
      storage: storage ? '1' : undefined,
    })}`
  }, [crop, district, variety, farmDistrict, geo, storage])

  const { data: mk, error, loading, reload } = useApi(marketsPath)

  const onLocate = () => {
    if (geo) { setGeo(null); return }
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => { setGeo({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLocating(false) },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: EASE }}
        className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end"
      >
        <div className="max-w-[680px]">
          <p className="u-eyebrow mb-5 text-sage">Farmer · Market</p>
          <h1 className="u-display text-[clamp(1.9rem,3.2vw,3rem)] text-ink">
            Market <span className="text-agri">Intelligence.</span>
          </h1>
          <p className="mt-4 text-[0.95rem] leading-relaxed text-smoke">
            Pick your district, crop and variety to see every APMC and sub-market that matters — nearest options first,
            a per-market AI price forecast, transport &amp; net returns, and the single best market for you.
          </p>
        </div>
        {mk?.updatedAt && (
          <div className="shrink-0 text-right">
            <p className="text-[0.6rem] uppercase tracking-[0.16em] text-sage">Feed updated</p>
            <p className="mt-1 text-[0.82rem] font-medium text-ink">{fmtDate(mk.updatedAt)}</p>
          </div>
        )}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.5, ease: EASE }}>
        <SelectionPanel
          uni={uni}
          crop={crop}
          onCrop={setCrop}
          district={district}
          onDistrict={setDistrict}
          variety={variety}
          onVariety={setVariety}
          storage={storage}
          onStorage={setStorage}
          geo={geo}
          locating={locating}
          onLocate={onLocate}
        />
      </motion.div>

      {!uni && <div className="mt-6"><SkeletonBlock className="h-[120px] w-full rounded-3xl" /></div>}

      {loading && (
        <div className="mt-6 space-y-6">
          <SkeletonBlock className="h-[220px] w-full rounded-3xl" />
          <SkeletonBlock className="h-[120px] w-full rounded-3xl" />
        </div>
      )}

      {error && !loading && (
        <div className="mt-6"><ErrorPanel onRetry={reload} /></div>
      )}

      {!loading && !error && mk && (
        <>
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, duration: 0.55, ease: EASE }} className="mt-6">
            <BestMarketCard best={mk.inDistrictBest} reasons={mk.inDistrictBest?.bestReasons || mk.bestReasons} unit={mk.unit} />
          </motion.section>

          {mk.nearby?.length > 0 && (
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16, duration: 0.55, ease: EASE }} className="mt-8">
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <p className="u-eyebrow text-sage">Nearest to you</p>
                  <p className="mt-2 text-[1.05rem] font-medium text-ink">{mk.nearby.length} markets closest to your farm</p>
                </div>
                {geo && <p className="text-[0.66rem] text-sage">Measured from your shared location</p>}
              </div>
              <div className="flex snap-x gap-4 overflow-x-auto pb-2">
                {mk.nearby.map((m) => <NearestCard key={m.id} m={m} />)}
              </div>
            </motion.section>
          )}

          {mk.inDistrict?.length > 0 && (
            <motion.section initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6, ease: EASE }} className="mt-8">
              <div className="mb-4">
                <p className="u-eyebrow text-sage">APMC &amp; sub-markets</p>
                <p className="mt-2 text-[1.05rem] font-medium text-ink">{mk.inDistrict.length} markets in {mk.district} for {mk.crop}</p>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                {mk.inDistrict.map((m) => (
                  <MarketCard
                    key={m.id}
                    row={m}
                    crop={mk.crop}
                    open={openId === m.id}
                    onToggle={() => setOpenId(openId === m.id ? null : m.id)}
                  />
                ))}
              </div>
            </motion.section>
          )}

          {mk.byNet?.length > 0 && (
            <motion.section initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24, duration: 0.6, ease: EASE }} className="mt-8 rounded-3xl border border-ink/[0.07] bg-white/80 p-6 md:p-8">
              <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="u-eyebrow text-sage">Compare every market</p>
                  <p className="mt-2 text-[1.05rem] font-medium text-ink">{mk.byNet.length} APMCs ranked by net return</p>
                </div>
                <p className="text-[0.66rem] text-sage">{mk.storageIncluded ? 'Storage costs included' : 'Storage excluded (turn it on above)'}</p>
              </div>
              <CompareTable rows={mk.byNet} unit={mk.unit} />
            </motion.section>
          )}

          <p className="mt-8 text-center text-[0.66rem] uppercase tracking-[0.22em] text-sage">
            {mk.disclaimer}
          </p>
        </>
      )}
    </>
  )
}