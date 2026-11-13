import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { EASE } from '../../lib/motion'
import { PageHeader } from './AppPage'
import { inr } from '../../services/api'
import useApi from '../../hooks/useApi'
import Sparkline from '../../components/app/Sparkline'
import { ErrorPanel, SkeletonBlock } from '../../components/app/Status'
import CountUp from '../../components/ui/CountUp'
import { ArrowRight, TrendingUp, TrendingDown, MapPin, Droplets, Layers, Sprout, CheckCircle2, Calculator, ArrowRightLeft, Package, Bell, Brain } from 'lucide-react'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function GrowthBadge({ pct }) {
  const up = pct >= 0
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.08em] ${up ? 'bg-lime-soft text-agri' : 'bg-ink/[0.05] text-sage'}`}>
      {up ? <TrendingUp className="h-3 w-3" strokeWidth={2}/> : <TrendingDown className="h-3 w-3" strokeWidth={2}/>}
      {up ? '+' : ''}{pct}%
    </span>
  )
}

// --- Market snapshot --------------------------------------------------------
function MarketPanel() {
  const { data, error, loading, reload } = useApi('/market/snapshot')

  if (loading) return (
    <div className="rounded-3xl border border-ink/[0.07] bg-white/80 p-7">
      <div className="flex items-center justify-between"><SkeletonBlock className="h-4 w-40" /><SkeletonBlock className="h-4 w-24" /></div>
      <div className="mt-6 space-y-4">{[0,1,2,3,4,5].map((i) => <SkeletonBlock key={i} className="h-12 w-full" />)}</div>
    </div>
  )
  if (error) return <ErrorPanel onRetry={reload} />

  return (
    <div className="flex h-full flex-col rounded-3xl border border-ink/[0.07] bg-white/80 p-7 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="u-eyebrow text-sage">Market Snapshot · {data.region}</p>
          <p className="mt-2 text-[0.72rem] text-sage">
            {data.unit} · updated {data.updatedAt}
          </p>
        </div>
        <Link to="/app/farmer/market" className="group inline-flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-agri">
          View full market
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={1.75}/>
        </Link>
      </div>

      <div className="mt-6 flex-1 divide-y divide-ink/[0.06]">
        {data.commodities.map((c) => (
          <div key={c.key} className="grid grid-cols-[1fr_auto_auto] items-center gap-x-3 gap-y-1 py-3.5 md:grid-cols-[1fr_120px_auto_auto]">
            <div className="min-w-0">
              <p className="truncate text-[0.9rem] font-medium text-ink">{c.name}</p>
              <p className="mt-0.5 hidden text-[0.7rem] text-sage sm:block">90d projected <span className="font-medium text-charcoal">₹{inr(c.projected)}</span></p>
            </div>
            <div className="hidden md:block">
              <Sparkline data={c.series} />
            </div>
            <div className="col-start-2 row-start-1 text-right md:col-start-3 md:row-start-1">
              <p className="text-[0.95rem] font-semibold text-ink">₹{inr(c.current)}</p>
            </div>
            <div className="col-start-3 row-start-1 mr-0 md:col-start-4 md:row-start-auto"><GrowthBadge pct={c.growthPct} /></div>
          </div>
        ))}
      </div>
      <p className="mt-4 border-t border-ink/[0.07] pt-4 text-[0.68rem] leading-relaxed text-sage">
        {data.disclaimer}
      </p>
    </div>
  )
}

// --- AI advisor ---------------------------------------------------------------
function AdvisorPanel() {
  const { data, error, loading, reload } = useApi('/advisor/recommendation')

  if (loading) return (
    <div className="flex flex-col rounded-3xl bg-agri-deep p-7 md:p-8">
      <SkeletonBlock className="h-4 w-28 bg-white/10" />
      <SkeletonBlock className="mt-5 h-10 w-44 bg-white/10" />
      <SkeletonBlock className="mt-2 h-3 w-32 bg-white/10" />
      <SkeletonBlock className="mt-8 h-24 w-full bg-white/10" />
      <SkeletonBlock className="mt-6 h-10 w-full bg-white/10" />
    </div>
  )
  if (error) return (
    <div className="flex h-full min-h-[320px] flex-col items-center justify-center rounded-3xl bg-agri-deep px-8 text-center">
      <p className="text-[0.84rem] text-ivory/70">Advisor data unavailable</p>
      <button onClick={reload} className="mt-4 text-[0.7rem] font-medium uppercase tracking-[0.18em] text-lime">Retry</button>
    </div>
  )

  const b = data.best
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-agri-deep p-7 md:p-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_100%_at_50%_115%,rgba(200,219,166,0.16),transparent_60%)]" aria-hidden />
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <p className="text-[0.62rem] font-medium uppercase tracking-[0.3em] text-lime-soft/70">AI Farm Advisor</p>
          <Brain className="h-4 w-4 text-lime-soft/60" strokeWidth={1.5}/>
        </div>

        <p className="mt-7 text-[0.68rem] font-medium uppercase tracking-[0.2em] text-ivory/55">Best opportunity</p>
        <h3 className="u-display mt-3 text-[2rem] leading-none text-ivory">
          {b.name.replace(' (Finger Millet)', '')}
        </h3>

        <p className="mt-6 text-[0.72rem] font-medium uppercase tracking-[0.18em] text-ivory/55">Projected 90-day price</p>
        <div className="mt-1 flex items-baseline gap-2.5">
          <span className="text-lime">₹</span><CountUp to={b.projected} className="u-display text-[2.6rem] leading-none text-lime" />
          <span className="text-[0.7rem] text-ivory/60">/quintal</span>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <GrowthBadge pct={b.growthPct} />
          <span className="text-[0.72rem] text-ivory/65">confidence {b.confidence}%</span>
        </div>

        <div className="mt-7 space-y-3">
          <p className="text-[0.62rem] font-medium uppercase tracking-[0.24em] text-ivory/55">Suitability</p>
          {data.suitability.map((s) => (
            <div key={s.crop} className="flex items-center gap-3">
              <span className="w-24 truncate text-[0.74rem] text-ivory/80">{s.crop.replace(' (Finger Millet)', '')}</span>
              <div className="h-[6px] flex-1 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${s.value}%` }}
                  transition={{ duration: 1.1, ease: EASE, delay: 0.3 }}
                  className="h-full rounded-full bg-lime"
                />
              </div>
              <span className="w-8 text-right text-[0.72rem] font-semibold text-lime">{Math.round(s.value)}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-2.5 border-t border-white/10 pt-5">
          {data.factors.slice(0, 2).map((f) => (
            <div key={f.title} className="flex items-center justify-between gap-3">
              <span className="text-[0.72rem] text-ivory/65">{f.title}</span>
              <span className="text-[0.74rem] font-semibold text-ivory">{f.value}</span>
            </div>
          ))}
        </div>

        <div className="mt-7 flex items-center justify-between gap-4">
          <p className="text-[0.6rem] leading-relaxed text-ivory/45">{data.demoNote}</p>
          <Link to="/app/farmer/advisor" className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-lime px-5 py-2.5 text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-ink transition-all duration-300 hover:bg-lime-soft hover:-translate-y-0.5">
            Analyze
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" strokeWidth={2}/>
          </Link>
        </div>
      </div>
    </div>
  )
}

// --- Orders preview ------------------------------------------------------------
function OrdersPanel() {
  const { data, error, loading, reload } = useApi('/orders')
  const orders = data?.orders || []

  if (loading) return (
    <div className="rounded-3xl border border-ink/[0.07] bg-white/80 p-7">
      <SkeletonBlock className="h-4 w-36" /><SkeletonBlock className="mt-6 h-14 w-full" />
    </div>
  )
  if (error) return <ErrorPanel onRetry={reload} />

  return (
    <div className="h-full rounded-3xl border border-ink/[0.07] bg-white/80 p-7 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="u-eyebrow text-sage">Orders</p>
          <p className="mt-2 text-[0.72rem] text-sage">{orders.length === 0 ? 'Track buyer offers here' : `${orders.length} order${orders.length > 1 ? 's' : ''}`}</p>
        </div>
        <Link to="/app/farmer/orders" className="group inline-flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-agri">
          All orders <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={1.75}/>
        </Link>
      </div>
      {orders.length === 0 ? (
        <div className="mt-5 flex flex-col items-start gap-5 rounded-2xl border border-dashed border-ink/[0.15] bg-white/50 p-6">
          <div className="flex items-center gap-4">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-ink/[0.04] text-sage"><Package className="h-5 w-5" strokeWidth={1.5}/></span>
            <div>
              <p className="text-[0.9rem] font-medium text-ink">No orders yet</p>
              <p className="mt-0.5 text-[0.78rem] text-smoke">{data.emptyHint}</p>
            </div>
          </div>
          <Link to="/app/farmer/marketplace" className="group inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-ivory transition-all duration-300 hover:bg-agri">
            List your crop
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" strokeWidth={2}/>
          </Link>
        </div>
      ) : (
        <div className="mt-5 divide-y divide-ink/[0.06]">
          {orders.map((o) => (
            <div key={o.id} className="flex items-center justify-between gap-3 py-3">
              <div>
                <p className="text-[0.9rem] font-medium text-ink">{o.crop}</p>
                <p className="text-[0.72rem] text-sage">{o.status} · {o.created_at}</p>
              </div>
              <p className="text-[0.85rem] font-semibold text-ink">₹{o.price_per_kg}/kg</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// --- Workspace quick tiles -----------------------------------------------------
const TOOLS = [
  { to: '/app/farmer/planner', icon: Calculator, label: 'Profit Planner' },
  { to: '/app/farmer/marketplace', icon: ArrowRightLeft, label: 'Marketplace' },
  { to: '/app/farmer/orders', icon: Package, label: 'Orders' },
  { to: '/app/farmer/notifications', icon: Bell, label: 'Notifications' },
]

function WorkspacePanel() {
  return (
    <div className="h-full rounded-3xl border border-ink/[0.07] bg-white/80 p-7 md:p-8">
      <p className="u-eyebrow text-sage">Workspace</p>
      <div className="mt-5 grid grid-cols-2 gap-3">
        {TOOLS.map((t) => {
          const Icon = t.icon
          return (
            <Link key={t.to} to={t.to} className="group">
              <div className="rounded-2xl border border-ink/[0.07] bg-white/70 p-5 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-agri/25 group-hover:shadow-[0_18px_30px_-20px_rgba(31,58,42,0.25)]">
                <Icon className="h-[18px] w-[18px] text-agri" strokeWidth={1.5} />
                <p className="mt-4 text-[0.7rem] font-semibold uppercase tracking-[0.1em] leading-snug text-ink">{t.label}</p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

// --- Farm identity strip --------------------------------------------------------
function FarmStrip() {
  const { data, error, loading } = useApi('/farm/profile')
  if (loading) return <SkeletonBlock className="h-[72px] w-full" />
  if (error) return null
  const p = data.profile

  const chips = [
    p.farmSize && { icon: Layers, label: `${p.farmSize} acres`, sub: 'Farm size' },
    p.soilType && { icon: Sprout, label: p.soilType, sub: 'Soil type' },
    p.water && { icon: Droplets, label: `${p.water} water`, sub: 'Availability' },
    p.crops.length && { icon: CheckCircle2, label: p.crops.join(', '), sub: 'Current crops' },
  ].filter(Boolean)

  return data.hasProfile && chips.length ? (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.5, ease: EASE }} className="flex flex-wrap items-center gap-x-8 gap-y-4 rounded-3xl border border-ink/[0.07] bg-white/70 px-7 py-5">
      {chips.map((c, i) => (
        <div key={i} className="flex items-center gap-3">
          <c.icon className="h-[16px] w-[16px] text-agri" strokeWidth={1.6} />
          <div>
            <p className="text-[0.84rem] font-semibold text-ink">{c.label}</p>
            <p className="text-[0.64rem] uppercase tracking-[0.14em] text-sage">{c.sub}</p>
          </div>
        </div>
      ))}
      <Link to="/app/farmer/farm" className="ml-auto inline-flex items-center gap-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-agri">
        Edit farm <ArrowRight className="h-3.5 w-3.5" strokeWidth={2}/>
      </Link>
    </motion.div>
  ) : (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.5, ease: EASE }} className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-ink/[0.07] bg-lime-soft/40 px-7 py-5">
      <div className="flex items-center gap-4">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-lime/70 text-agri"><Sprout className="h-5 w-5" strokeWidth={1.5}/></span>
        <div>
          <p className="text-[0.92rem] font-medium text-ink">Complete your farm profile</p>
          <p className="mt-0.5 text-[0.78rem] text-smoke">Add farm size, soil and crops to personalize your insights.</p>
        </div>
      </div>
      <Link to="/app/farmer/farm" className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-ivory hover:bg-agri">
        Set up <ArrowRight className="h-3.5 w-3.5" strokeWidth={2}/>
      </Link>
    </motion.div>
  )
}

// --- Page -----------------------------------------------------------------------
export default function DashboardPage() {
  const { user } = useAuth()
  return (
    <>
      <PageHeader eyebrow="Farmer App" title={`${greeting()}, ${(user?.name || '').split(' ')[0]}.`} desc="Here's what matters for your farm today.">
        <div className="flex items-center gap-2.5 rounded-full border border-ink/[0.08] bg-white/70 px-5 py-3">
          <MapPin className="h-4 w-4 text-agri" strokeWidth={1.5} />
          <span className="text-[0.84rem] font-medium text-ink">{user?.location || 'Bengaluru, Karnataka'}</span>
        </div>
      </PageHeader>

      <FarmStrip />

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18, duration: 0.6, ease: EASE }} className="mt-5 grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2"><MarketPanel /></div>
        <div><AdvisorPanel /></div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6, ease: EASE }} className="mt-5 grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2"><OrdersPanel /></div>
        <div><WorkspacePanel /></div>
      </motion.div>

      <p className="mt-8 text-center text-[0.66rem] uppercase tracking-[0.22em] text-sage">
        Price forecasts &amp; recommendations are estimates from the trained model — always cross-check local mandi prices.
      </p>
    </>
  )
}