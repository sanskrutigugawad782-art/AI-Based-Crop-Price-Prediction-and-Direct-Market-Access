import { useState } from 'react'
import { motion } from 'framer-motion'
import CountUp from '../../components/ui/CountUp'
import { ErrorPanel } from '../../components/app/Status'
import useApi from '../../hooks/useApi'
import { EASE } from '../../lib/motion'
import { TrendingUp, TrendingDown, ArrowRight, ArrowRightLeft, Sprout, Scale } from 'lucide-react'

const inr = (n) => (n == null ? '—' : Math.round(n).toLocaleString('en-IN'))
const inr1 = (n) => (n == null ? '—' : n.toLocaleString('en-IN', { maximumFractionDigits: 1 }))
const SCENARIOS = [
  { id: 'conservative', label: 'Conservative' },
  { id: 'expected', label: 'Expected' },
  { id: 'strong', label: 'Strong' },
]

function CostBreakdown({ costs, total }) {
  const rows = Object.entries(costs || {}).sort((a, b) => b[1] - a[1])
  return (
    <div className="flex h-full flex-col rounded-3xl border border-ink/[0.07] bg-white/80 p-7 md:p-8">
      <div className="flex items-center gap-2.5">
        <Scale className="h-4 w-4 text-agri" strokeWidth={1.5} />
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-ink">Cost per acre</p>
      </div>
      <div className="mt-6 flex-1 space-y-5">
        {rows.map(([name, amt]) => {
          const pct = total ? (amt / total) * 100 : 0
          return (
            <div key={name}>
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-[0.82rem] font-[300] text-ink">{name}</span>
                <span className="text-[0.8rem] text-smoke">₹{inr1(amt)} · {pct.toFixed(0)}%</span>
              </div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-ink/[0.06]">
                <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.9, ease: EASE }} className="h-full rounded-full bg-agri" />
              </div>
            </div>
          )
        })}
      </div>
      <div className="mt-6 border-t border-ink/[0.07] pt-5">
        <div className="flex items-baseline justify-between">
          <span className="text-[0.72rem] uppercase tracking-[0.14em] text-sage">Total input cost</span>
          <span className="u-display text-[1.8rem] text-ink">₹{inr1(total)}</span>
        </div>
        <p className="mt-1 text-[0.64rem] text-sage">per acre · adjusted pro-rata for your acreage below</p>
      </div>
    </div>
  )
}

function RangeCard({ data }) {
  if (!data) return null
  const nets = data.scenarioNets
  const activeIdx = SCENARIOS.findIndex(s => s.id === data.scenario)

  const Markers = (
    <div className="relative mt-10">
      <div className="absolute top-1/2 h-2 w-full -translate-y-1/2 rounded-full bg-gradient-to-r from-wood/70 via-agri to-lime" />
      <div className="relative grid h-8 grid-cols-3 gap-3">
        {SCENARIOS.map((s, i) => {
          const active = i === activeIdx
          return (
            <div key={s.id} className="flex items-center justify-center">
              <div className={`z-10 rounded-full border-2 transition-all ${active ? 'h-4 w-4 border-agri-deep bg-lime' : 'h-3.5 w-3.5 border-ink/25 bg-white'}`} />
            </div>
          )
        })}
      </div>
    </div>
  )

  return (
    <div className="flex h-full flex-col rounded-3xl border border-ink/[0.07] bg-white/80 p-7 md:p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <ArrowRightLeft className="h-4 w-4 text-agri" strokeWidth={1.5} />
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-ink">Outcome range</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-[0.6rem] uppercase tracking-[0.12em] ${activeIdx === 1 ? 'bg-agri text-ivory' : 'bg-ink/[0.05] text-smoke'}`}>{data.scenario}</span>
      </div>

      {Markers}

      <div className="mt-5 grid grid-cols-[repeat(3,minmax(0,1fr))] gap-2 sm:gap-3">
        {SCENARIOS.map((s) => (
          <div key={s.id} className={`min-w-0 rounded-2xl px-2 py-3 text-center sm:px-3 sm:py-4 ${s.id === data.scenario ? 'bg-agri-deep text-ivory' : 'bg-ink/[0.04]'}`}>
            <p className={`text-[0.55rem] uppercase tracking-[0.12em] sm:text-[0.58rem] ${s.id === data.scenario ? 'text-lime' : 'text-sage'}`}>{s.label}</p>
            <p className={`mt-1.5 overflow-hidden whitespace-nowrap text-[clamp(0.7rem,1.6vw,0.95rem)] font-[300] ${s.id === data.scenario ? 'text-ivory' : 'text-ink'}`}>₹{inr(nets[s.id])}</p>
          </div>
        ))}
      </div>
      <p className="mt-auto pt-5 text-[0.64rem] text-sage">Net profit on {data.acres} acres as the price drifts within the model's {data.maePct}% historical error band.</p>
    </div>
  )
}

function BreakevenCard({ data }) {
  if (!data) return null
  const good = data.price >= data.breakEven
  return (
    <div className="flex h-full flex-col rounded-3xl border border-ink/[0.07] bg-white/80 p-7 md:p-8">
      <div className="flex items-center gap-2.5">
        <Sprout className="h-4 w-4 text-agri" strokeWidth={1.5} />
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-ink">Break-even read</p>
      </div>
      <div className="mt-6 space-y-4">
        <div className="flex items-baseline justify-between">
          <span className="text-[0.78rem] text-smoke">Covered cost at ₹/quintal</span>
          <span className="u-display text-[1.7rem] text-ink">₹{inr1(data.breakEven)}</span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-[0.78rem] text-smoke">Scenario selling price</span>
          <span className={`text-[1.3rem] font-[300] ${good ? 'text-agri' : 'text-wood'}`}>₹{inr1(data.price)}</span>
        </div>
        <div className="flex items-baseline justify-between border-t border-ink/[0.07] pt-4">
          <span className="text-[0.78rem] text-smoke">Margin over cost</span>
          <span className={`inline-flex items-center gap-1.5 text-[1rem] font-semibold ${good ? 'text-agri' : 'text-wood'}`}>
            {good ? <TrendingUp className="h-4 w-4" strokeWidth={2} /> : <TrendingDown className="h-4 w-4" strokeWidth={2} />}
            {data.margin > 0 ? '+' : ''}{data.margin}%
          </span>
        </div>
        <p className="text-[0.64rem] leading-relaxed text-sage">
          {good
            ? `A ${data.yieldQ} quintal/acre harvest clears cost at the modelled price with room to spare.`
            : 'The modelled price sits below cost recovery — consider a stronger price scenario or a different crop.'}
        </p>
      </div>
    </div>
  )
}

function OpportunityCard({ data }) {
  if (!data?.opportunity) return null
  const o = data.opportunity
  const positive = o.delta >= 0
  const kind = positive ? 'lime' : 'neutral'
  const CardWrap = positive ? 'bg-lime-soft' : 'bg-white/80'
  const Accent = positive ? 'text-agri' : 'text-smoke'
  return (
    <div className={`flex h-full flex-col rounded-3xl border p-7 md:p-8 ${positive ? 'border-agri/20' : 'border-ink/[0.07]'} ${CardWrap}`}>
      <div className="flex items-center gap-2.5">
        <ArrowRight className={`h-4 w-4 ${Accent}`} strokeWidth={1.75} />
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-ink">
          {positive ? 'Reallocation signal' : 'Current plan holds'}
        </p>
      </div>
      <p className="mt-5 text-[0.92rem] font-[300] leading-relaxed text-charcoal">
        {positive ? (
          <>Switching the same {data.acres} acres from <span className="font-medium">{data.crop}</span> to <span className="font-medium text-agri">{o.crop}</span> could add <span className="font-medium">₹{inr(o.delta)}</span> of profit.</>
        ) : (
          <>Your <span className="font-medium">{data.crop}</span> plan clears <span className="font-medium">₹{inr(data.net)}</span> — the model's top pick <span className="font-medium text-agri">{o.crop}</span> would net ₹{inr(o.net)}. Stick with the current rotation.</>
        )}
      </p>
      <div className="mt-5 flex flex-wrap gap-3 text-[0.7rem] text-smoke">
        {positive && <span className="rounded-full bg-white/80 px-3 py-1.5">{o.crop} · yield {o.yieldQ} q/ac · ₹{inr1(o.projected)}/q</span>}
        <span className="rounded-full bg-ink/[0.05] px-3 py-1.5">{data.crop} net ₹{inr(data.net)}</span>
        <span className="rounded-full bg-ink/[0.05] px-3 py-1.5">{o.crop} net ₹{inr(o.net)}</span>
      </div>
      <p className="mt-auto pt-5 text-[0.62rem] text-sage">Modelled outcome at the expected price band on {data.acres} acres — change the crop or acreage and re-run.</p>
    </div>
  )
}

export default function PlannerPage() {
  const [crop, setCrop] = useState('Groundnut')
  const [acres, setAcres] = useState(5)
  const [scenario, setScenario] = useState('expected')

  const { data: catalog } = useApi('/planner/crops')
  const { data: estimate, error, loading } = useApi(`/planner/estimate?crop=${crop}&acres=${acres}&scenario=${scenario}`)

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: EASE }} className="mb-8 max-w-[640px]">
        <p className="u-eyebrow mb-5 text-sage">Profit Planner</p>
        <h1 className="u-display text-[clamp(1.9rem,3.2vw,3rem)] text-ink">Plan your <span className="text-agri">profit.</span></h1>
        <p className="mt-4 text-[0.95rem] leading-relaxed text-smoke">
          Input costs, expected revenue and break-even — modelled against the forecast for your acreage.
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.6, ease: EASE }} className="rounded-3xl border border-ink/[0.07] bg-white/80 p-7 md:p-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <p className="text-[0.68rem] uppercase tracking-[0.16em] text-sage">Crop</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {(catalog?.crops || []).map((c) => (
                <button
                  key={c.key}
                  onClick={() => setCrop(c.key)}
                  className={`rounded-full border px-4 py-2 text-[0.72rem] font-medium transition-all ${
                    crop === c.key ? 'border-agri bg-agri-deep text-lime' : 'border-ink/[0.1] bg-white/70 text-smoke hover:border-agri/30'
                  }`}
                >{c.key}</button>
              ))}
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="flex items-baseline justify-between">
              <p className="text-[0.68rem] uppercase tracking-[0.16em] text-sage">Acreage</p>
              <p className="text-[0.8rem] font-semibold text-ink">{acres} {acres === 1 ? 'acre' : 'acres'}</p>
            </div>
            <input
              type="range" min="1" max="40" step="1" value={acres}
              onChange={(e) => setAcres(Number(e.target.value))}
              className="mt-5 w-full cursor-pointer accent-agri"
            />
            <div className="mt-1 flex justify-between text-[0.6rem] text-sage"><span>1</span><span>40</span></div>
          </div>
          <div className="lg:col-span-1">
            <p className="text-[0.68rem] uppercase tracking-[0.16em] text-sage">Price scenario</p>
            <div className="mt-4 flex gap-1 rounded-full bg-ink/[0.04] p-1">
              {SCENARIOS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setScenario(s.id)}
                  className={`flex-1 rounded-full px-3 py-2 text-[0.64rem] font-semibold uppercase tracking-[0.08em] transition-all ${
                    scenario === s.id ? 'bg-agri text-ivory shadow-sm' : 'text-smoke hover:bg-white/60'
                  }`}
                >{s.label}</button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18, duration: 0.65, ease: EASE }} className="mt-6 grid gap-6 lg:grid-cols-12">
        <div className={`relative rounded-3xl bg-agri-deep p-8 text-ivory lg:col-span-5 ${loading ? 'opacity-80' : ''}`}>
          {loading && <div className="absolute right-6 top-6 h-6 w-6 animate-spin rounded-full border-2 border-ivory/20 border-t-lime" />}
          <p className="u-eyebrow text-lime">Expected net profit</p>
          <p className="mt-5 text-[0.66rem] uppercase tracking-[0.16em] text-ivory/55">{crop} · {acres} {acres === 1 ? 'acre' : 'acres'} · {scenario} scenario</p>
          <p className="mt-2 u-display text-[clamp(2.6rem,5vw,4.2rem)] text-ivory">
            ₹<CountUp to={estimate?.net || 0} duration={1.1} />
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div>
              <p className="text-[0.62rem] uppercase tracking-[0.14em] text-ivory/55">Revenue</p>
              <p className="mt-0.5 text-[1.2rem] font-[300]">₹{inr(estimate?.revenue)}</p>
            </div>
            <div>
              <p className="text-[0.62rem] uppercase tracking-[0.14em] text-ivory/55">Input cost ({acres} ac)</p>
              <p className="mt-0.5 text-[1.2rem] font-[300]">₹{inr(estimate?.totalCost)}</p>
            </div>
          </div>
          <div className="mt-7 flex items-center gap-3 border-t border-ivory/15 pt-6">
            <span className={`rounded-full px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.12em] ${estimate?.roi >= 0 ? 'bg-lime text-agri-deep' : 'bg-wood/30 text-ivory'}`}>
              ROI {estimate?.roi > 0 ? '+' : ''}{estimate?.roi}%
            </span>
            <span className="text-[0.68rem] text-ivory/55">{estimate?.quantityQ}Q harvest · ₹{inr1(estimate?.price)}/Q</span>
          </div>
        </div>

        <div className="grid gap-6 lg:col-span-7">
          <RangeCard data={estimate} />
          <div className="grid gap-6 md:grid-cols-2">
            <BreakevenCard data={estimate} />
            <OpportunityCard data={estimate} />
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28, duration: 0.7, ease: EASE }} className="mt-6 grid gap-6 lg:grid-cols-2">
        <CostBreakdown costs={estimate?.costs} total={estimate?.costPerAcre} />
        {error ? <ErrorPanel onRetry={() => {}} compact /> : (
          <div className="flex flex-col items-start justify-center rounded-3xl border border-ink/[0.07] bg-white/80 p-8">
            <p className="u-eyebrow text-sage">How to read this</p>
            <p className="mt-4 max-w-[520px] text-[0.88rem] leading-relaxed text-smoke">
              Revenue uses the model's projected price at the chosen scenario — the historical error band prices the upside and downside. Break-even tells you the lowest mandi price that still covers inputs. The reallocation signal compares your plan against the model's top-ranked crop on the same acreage.
            </p>
            <ul className="mt-6 space-y-3 text-[0.78rem] text-smoke">
              <li className="flex gap-3"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-agri" />Yield assumptions come from smallholder Karnataka averages; adjust to your plot history.</li>
              <li className="flex gap-3"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-agri" />Prices are in ₹/quintal; harvest gate pricing affects the real outcome.</li>
              <li className="flex gap-3"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-agri" />Losses, disease pressure and input inflation are not modelled.</li>
            </ul>
          </div>
        )}
      </motion.div>

      <p className="mt-8 text-center text-[0.66rem] uppercase tracking-[0.22em] text-sage">{estimate?.disclaimer || 'Planning is illustrative — verify with local agronomy before committing a season.'}</p>
    </>
  )
}