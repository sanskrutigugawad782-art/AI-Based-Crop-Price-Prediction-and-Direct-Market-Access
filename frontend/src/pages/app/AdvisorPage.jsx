import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import CountUp from '../../components/ui/CountUp'
import { ErrorPanel, SkeletonBlock } from '../../components/app/Status'
import useApi from '../../hooks/useApi'
import { useAuth } from '../../context/AuthContext'
import { farmAPI, advisorAPI } from '../../services/api'
import { EASE } from '../../lib/motion'
import { TrendingUp, TrendingDown, Brain, Gauge, LineChart, Shield, Sprout, Calendar, Droplets, Layers, Calculator, BadgeCheck, CircleHelp } from 'lucide-react'

const inr = (n) => (n == null ? '—' : n.toLocaleString('en-IN', { maximumFractionDigits: 0 }))

function HeroRecommendation({ data }) {
  const b = data?.best
  if (!b) return null
  const up = b.growthPct >= 0
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-agri-deep p-8 text-ivory md:p-10">
      <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-agri/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-lime/10 blur-3xl" />
      <div className="relative">
        <p className="u-eyebrow text-lime">{data.label}</p>
        <div className="mt-6 flex flex-wrap items-end gap-x-8 gap-y-4">
          <div>
            <p className="text-[0.68rem] uppercase tracking-[0.18em] text-ivory/60">Recommended crop</p>
            <p className="u-display mt-2 text-[clamp(2.2rem,4.5vw,3.6rem)] text-ivory">{b.name}</p>
          </div>
          <div className="mb-2 flex items-center gap-3">
            <span className="rounded-full bg-ivory/10 px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-ivory/85">{b.method}</span>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.14em] ${up ? 'bg-lime text-agri-deep' : 'bg-ivory/10 text-ivory'}`}>
              {up ? <TrendingUp className="h-3.5 w-3.5" strokeWidth={2} /> : <TrendingDown className="h-3.5 w-3.5" strokeWidth={2} />}
              {up ? '+' : ''}{b.growthPct}% / 90d
            </span>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-6">
          <div>
            <p className="text-[0.66rem] uppercase tracking-[0.16em] text-ivory/55">Current price</p>
            <p className="mt-1 text-[1.6rem] font-[300] text-ivory">₹{inr(b.current)}</p>
          </div>
          <div>
            <p className="text-[0.66rem] uppercase tracking-[0.16em] text-ivory/55">Projected · 90 days</p>
            <p className="mt-1 text-[1.6rem] font-[300] text-lime">₹<CountUp to={b.projected} duration={1.4} /></p>
          </div>
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between text-[0.68rem] uppercase tracking-[0.14em]">
            <span className="text-ivory/55">Forecast confidence</span>
            <span className="font-semibold text-lime">{b.confidence}%</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ivory/15">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${b.confidence}%` }}
              transition={{ duration: 1.1, ease: EASE }}
              className="h-full rounded-full bg-lime"
            />
          </div>
          <p className="mt-3 text-[0.68rem] leading-relaxed text-ivory/55">Based on the trained model's historical fit · prices in ₹/quintal · Karnataka</p>
        </div>
      </div>
    </div>
  )
}

function FitPanel({ data }) {
  if (!data?.suitability) return null
  return (
    <div className="flex h-full flex-col rounded-3xl border border-ink/[0.07] bg-white/80 p-8 md:p-10">
      <div className="flex items-center gap-2.5">
        <Gauge className="h-4 w-4 text-agri" strokeWidth={1.5} />
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-ink">Season fit score</p>
      </div>
      <div className="mt-7 space-y-6">
        {data.suitability.map((s, i) => (
          <div key={s.crop}>
            <div className="flex items-baseline justify-between">
              <span className="text-[0.92rem] font-[300] text-ink">{s.crop}</span>
              <span className="text-[0.82rem] text-smoke">{s.value}</span>
            </div>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-ink/[0.06]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${s.value}%` }}
                transition={{ delay: 0.35 + i * 0.12, duration: 0.9, ease: EASE }}
                className="h-full rounded-full bg-agri"
              />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-auto border-t border-ink/[0.07] pt-6 text-[0.7rem] leading-relaxed text-sage">
        Normalised model scores out of 100 — how well each crop tracks the current market direction.
      </p>
    </div>
  )
}

function FactorCard({ title, value, detail }) {
  return (
    <div className="flex flex-col gap-2 rounded-3xl border border-ink/[0.07] bg-white/80 p-7">
      <p className="text-[0.64rem] uppercase tracking-[0.16em] text-sage">{title}</p>
      <p className="u-display text-[1.9rem] text-agri">{value}</p>
      <p className="text-[0.78rem] leading-relaxed text-smoke">{detail}</p>
    </div>
  )
}

function CandidatesRow({ data }) {
  if (!data?.candidates?.length) return null
  const max = Math.max(...data.candidates.map(c => c.score))
  return (
    <div className="mt-6 rounded-3xl border border-ink/[0.07] bg-white/80 p-7 md:p-8">
      <div className="flex items-center justify-between">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-ink">Ranked candidates</p>
        <span className="text-[0.66rem] text-sage">model strength score</span>
      </div>
      <div className="mt-5 divide-y divide-ink/[0.05]">
        {data.candidates.map((c, i) => {
          const up = c.growthPct >= 0
          return (
            <div key={c.commodity} className="grid grid-cols-[auto_1fr_auto] items-center gap-4 py-4 sm:grid-cols-[auto_1fr_auto_auto_auto]">
              <span className={`grid h-8 w-8 place-items-center rounded-full text-[0.66rem] font-semibold ${i === 0 ? 'bg-agri text-lime' : 'bg-ink/[0.06] text-smoke'}`}>
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="truncate text-[0.95rem] font-medium text-ink">{c.commodity}</p>
                <p className="hidden text-[0.64rem] text-sage sm:block">{c.method}</p>
              </div>
              <span className="hidden text-[0.76rem] text-smoke sm:block">₹{inr(c.current)} → ₹{inr(c.projected)}</span>
              <span className={`hidden items-center gap-1 rounded-full px-3 py-1 text-[0.64rem] font-semibold sm:inline-flex ${up ? 'bg-lime-soft text-agri' : 'bg-ink/[0.05] text-smoke'}`}>
                {up ? <TrendingUp className="h-3 w-3" strokeWidth={2} /> : <TrendingDown className="h-3 w-3" strokeWidth={2} />}
                {up ? '+' : ''}{c.growthPct}%
              </span>
              <div className="flex w-24 items-center gap-2">
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-ink/[0.06]">
                  <div className="h-full rounded-full bg-agri" style={{ width: `${Math.max(4, (c.score / max) * 100)}%` }} />
                </div>
                <span className="w-7 text-right text-[0.7rem] font-medium text-smoke">{c.score}</span>
              </div>
            </div>
          )
        })}
      </div>
      <p className="mt-3 text-[0.66rem] text-sage">Scores from the trained forecast model's seasonal ranking for Karnataka.</p>
    </div>
  )
}

function YieldPredictor({ crops }) {
  const { token } = useAuth()
  const { data: uni } = useApi('/market/universe')
  const [crop, setCrop] = useState(crops?.[0] || 'Tomato')
  const [district, setDistrict] = useState('Bengaluru')
  const [acres, setAcres] = useState(1)
  const [sowDate, setSowDate] = useState('')
  const [soil, setSoil] = useState('Red soil')
  const [water, setWater] = useState('Medium')
  const [result, setResult] = useState(null)
  const [err, setErr] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!crop && crops?.length) setCrop(crops[0])
  }, [crops])

  useEffect(() => {
    let alive = true
    farmAPI.profile(token).then(({ profile }) => {
      if (!alive) return
      if (profile?.district) setDistrict((prev) => (districts.includes(profile.district) ? profile.district : prev))
      if (profile?.soilType) setSoil(profile.soilType)
      if (profile?.water) setWater(profile.water)
    }).catch(() => {})
    return () => { alive = false }
  }, [token])

  const districts = (uni?.districts || []).map(d => d.name)

  const run = async () => {
    setBusy(true); setResult(null); setErr(null)
    try {
      const res = await advisorAPI.yieldPrediction(token, {
        crop, district, acres: Number(acres) || 1, sowDate, soilType: soil, water,
      })
      setResult(res)
    } catch (e) {
      setErr(e?.error || 'Yield prediction failed')
    } finally {
      setBusy(false)
    }
  }

  const inputCls = 'w-full rounded-xl border border-ink/[0.1] bg-white/90 px-3.5 py-2.5 text-[0.84rem] font-medium text-ink outline-none focus:border-agri/40'

  return (
    <div className="mt-6 rounded-3xl border border-ink/[0.07] bg-white/80 p-7 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Sprout className="h-4 w-4 text-agri" strokeWidth={1.5} />
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-ink">Crop yield predictor</p>
        </div>
        <span className="text-[0.66rem] text-sage">district baseline · soil · water · season</span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <label className="block">
          <span className="mb-1.5 flex items-center gap-1 text-[0.64rem] uppercase tracking-[0.14em] text-sage"><Layers className="h-3 w-3" strokeWidth={2}/>Crop</span>
          <select value={crop} onChange={(e) => setCrop(e.target.value)} className={inputCls}>
            {(crops?.length ? crops : ['Tomato', 'Onion', 'Rice', 'Maize']).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 flex items-center gap-1 text-[0.64rem] uppercase tracking-[0.14em] text-sage"><CircleHelp className="h-3 w-3" strokeWidth={2}/>District</span>
          <select value={district} onChange={(e) => setDistrict(e.target.value)} className={inputCls}>
            {districts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 flex items-center gap-1 text-[0.64rem] uppercase tracking-[0.14em] text-sage"><Calculator className="h-3 w-3" strokeWidth={2}/>Acres</span>
          <input type="number" min="0.1" step="0.5" value={acres} onChange={(e) => setAcres(e.target.value)} className={inputCls} />
        </label>
        <label className="block">
          <span className="mb-1.5 flex items-center gap-1 text-[0.64rem] uppercase tracking-[0.14em] text-sage"><Calendar className="h-3 w-3" strokeWidth={2}/>Sow date</span>
          <input type="date" value={sowDate} onChange={(e) => setSowDate(e.target.value)} className={inputCls} />
        </label>
        <label className="block">
          <span className="mb-1.5 flex items-center gap-1 text-[0.64rem] uppercase tracking-[0.14em] text-sage"><Droplets className="h-3 w-3" strokeWidth={2}/>Soil · water</span>
          <div className="flex gap-2">
            <select value={soil} onChange={(e) => setSoil(e.target.value)} className={inputCls}>
              {['Red soil', 'Black soil', 'Alluvial', 'Laterite'].map(s => <option key={s}>{s}</option>)}
            </select>
            <select value={water} onChange={(e) => setWater(e.target.value)} className={inputCls}>
              {['High', 'Medium', 'Low'].map(w => <option key={w}>{w}</option>)}
            </select>
          </div>
        </label>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-4">
        <button onClick={run} disabled={busy}
          className="inline-flex items-center gap-2 rounded-full bg-agri px-6 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-ivory shadow-sm transition hover:bg-agri-deep disabled:opacity-50">
          {busy ? 'Estimating…' : 'Estimate yield'}
        </button>
        {err && <p className="text-[0.8rem] text-red-600">{err}</p>}
      </div>

      {result && (
        <div className="mt-6 grid gap-4 border-t border-ink/[0.07] pt-6 sm:grid-cols-3 lg:grid-cols-6">
          <div className="col-span-3 lg:col-span-2 rounded-2xl bg-agri-deep p-5 text-ivory">
            <p className="text-[0.62rem] uppercase tracking-[0.16em] text-ivory/55">Expected yield</p>
            <p className="mt-2 text-[1.7rem] font-[300] leading-none">{result.expectedYieldQPerAcre} <span className="text-[0.8rem] text-ivory/70">q/acre</span></p>
            <p className="mt-1 text-[0.8rem] text-lime">{result.expectedYieldKgPerAcre.toLocaleString('en-IN')} kg/acre</p>
            <p className="mt-3 flex items-center gap-1.5 text-[0.66rem] text-ivory/60"><BadgeCheck className="h-3.5 w-3.5 text-lime" strokeWidth={2}/>Model confidence {result.confidence}%</p>
          </div>
          <div className="rounded-2xl border border-ink/[0.07] p-5">
            <p className="text-[0.62rem] uppercase tracking-[0.16em] text-sage">Range</p>
            <p className="mt-2 text-[1.15rem] font-[300] text-ink">{result.minYieldQPerAcre} – {result.maxYieldQPerAcre} <span className="text-[0.72rem] text-sage">q/acre</span></p>
            <p className="mt-1 text-[0.72rem] text-sage">statistical p10–p90 band</p>
          </div>
          <div className="rounded-2xl border border-ink/[0.07] p-5">
            <p className="text-[0.62rem] uppercase tracking-[0.16em] text-sage">Total · {result.acres} acre{result.acres > 1 ? 's' : ''}</p>
            <p className="mt-2 text-[1.15rem] font-[300] text-ink">{result.totalYieldQ} <span className="text-[0.72rem] text-sage">q</span></p>
            <p className="mt-1 text-[0.72rem] text-sage">{result.totalYieldKg.toLocaleString('en-IN')} kg</p>
          </div>
          <div className="rounded-2xl border border-ink/[0.07] p-5">
            <p className="text-[0.62rem] uppercase tracking-[0.16em] text-sage">Harvest</p>
            <p className="mt-2 text-[1.05rem] font-[300] text-ink">{new Date(result.harvestAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            <p className="mt-1 text-[0.72rem] text-sage">{result.crop} · {result.seasonLengthMonths} month season</p>
          </div>
          <div className="rounded-2xl border border-ink/[0.07] p-5">
            <p className="text-[0.62rem] uppercase tracking-[0.16em] text-sage">District</p>
            <p className="mt-2 text-[1.05rem] font-[300] text-ink">{result.district}</p>
            <p className="mt-1 text-[0.72rem] text-sage">{result.factors[0].value} baseline</p>
          </div>
          <p className="col-span-full text-[0.66rem] leading-relaxed text-sage">{result.note}</p>
        </div>
      )}
    </div>
  )
}

export default function AdvisorPage() {
  const [selectedCrop, setSelectedCrop] = useState('')
  const url = selectedCrop ? `/advisor/recommendation?crop=${encodeURIComponent(selectedCrop)}` : '/advisor/recommendation'
  const { data, error, loading, reload } = useApi(url)
  const allCrops = data?.allCrops || []
  const crops = data ? [data.best.name, ...(data.candidates || []).map(c => c.commodity)] : null

  // When data loads with allCrops, set default if not already set
  useEffect(() => {
    if (allCrops.length && !selectedCrop) {
      setSelectedCrop(allCrops[0])
    }
  }, [allCrops]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleCropSelect = (crop) => {
    setSelectedCrop(crop)
  }

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: EASE }} className="mb-8 max-w-[640px]">
        <p className="u-eyebrow mb-5 text-sage">AI Advisor</p>
        <h1 className="u-display text-[clamp(1.9rem,3.2vw,3rem)] text-ink">AI Farm <span className="text-agri">Advisor.</span></h1>
        <p className="mt-4 text-[0.95rem] leading-relaxed text-smoke">
          Select any crop — vegetables, fruits, or field crops — for a detailed AI price forecast, trend analysis, and category ranking.
        </p>
      </motion.div>

      {/* Crop selector */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.5, ease: EASE }} className="mb-6 flex flex-wrap items-center gap-3">
        <label className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-sage">Select crop:</label>
        <select
          value={selectedCrop}
          onChange={(e) => handleCropSelect(e.target.value)}
          className="rounded-2xl border border-ink/[0.1] bg-white px-4 py-2.5 text-[0.84rem] font-medium text-ink outline-none focus:border-agri/40"
          style={{ minWidth: 220 }}
        >
          {allCrops.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        {data?.candidates?.find((c) => c.commodity === selectedCrop)?.category && (
          <span className="text-[0.66rem] text-sage">
            {data.candidates.find((c) => c.commodity === selectedCrop).category}
          </span>
        )}
      </motion.div>

      {loading && <div className="grid gap-6 lg:grid-cols-12"><SkeletonBlock className="h-[420px] lg:col-span-7" /><SkeletonBlock className="h-[420px] lg:col-span-5" /></div>}
      {error && <ErrorPanel onRetry={reload} />}

      {data && (
        <>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.65, ease: EASE }} className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-7"><HeroRecommendation data={data} /></div>
            <div className="lg:col-span-5"><FitPanel data={data} /></div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.65, ease: EASE }} className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {data.factors.map((f, i) => <FactorCard key={f.title} {...f} />)}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.7, ease: EASE }}>
            <CandidatesRow data={data} />
            <YieldPredictor crops={allCrops} />
          </motion.div>

          <div className="mt-8 flex flex-col items-center gap-3 border-t border-ink/[0.08] pt-8 text-center">
            <div className="flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.2em] text-sage">
              <Brain className="h-4 w-4 text-agri" strokeWidth={1.5} />
              <LineChart className="h-4 w-4 text-sage" strokeWidth={1.5} />
              <Shield className="h-4 w-4 text-wood" strokeWidth={1.5} />
            </div>
            <p className="max-w-[560px] text-[0.7rem] leading-relaxed text-sage">{data.disclaimer} · {data.demoNote}</p>
          </div>
        </>
      )}
    </>
  )
}