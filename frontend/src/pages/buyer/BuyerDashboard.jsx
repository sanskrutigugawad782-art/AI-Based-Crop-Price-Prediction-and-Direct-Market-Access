import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { EASE } from '../../lib/motion'
import useApi from '../../hooks/useApi'
import { buyerAPI } from '../../services/api'
import { PageHeader, StatCard, Card, Tag, Meter, Skeleton, ErrorCard, inr } from '../../components/app/Cards'
import CountUp from '../../components/ui/CountUp'
import { ArrowRight, Package, FileText, Store, ArrowLeftRight, MapPin, Sparkles, ChefHat } from 'lucide-react'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function BuyerDashboard() {
  const { user } = useAuth()
  const { data, error, loading, reload } = useApi('/buyer/dashboard')
  if (loading) return <Skeleton className="h-[420px] w-full" />
  if (error) return <ErrorCard onRetry={reload} />

  const m = data.metrics
  const stats = [
    { label: 'Active requirements', value: m.activeRequirements, icon: FileText },
    { label: 'Matched suppliers',   value: m.matchedSuppliers,  icon: Store },
    { label: 'Pending offers',      value: m.pendingOffers,     icon: ArrowLeftRight },
    { label: 'Active orders',       value: m.activeOrders,      icon: Package },
  ]

  return (
    <>
      <PageHeader eyebrow="Procurement Desk" title={`${greeting()}, ${(user?.name || 'ABC Foods').split(' ')[0]}.`} desc="Source quality produce from verified farmers across your delivery network.">
        <div className="flex items-center gap-2.5 rounded-full border border-ink/[0.08] bg-white/70 px-5 py-3">
          <MapPin className="h-4 w-4 text-agri" strokeWidth={1.5} />
          <span className="text-[0.84rem] font-medium text-ink">{data.location || user?.location || 'Bengaluru, Karnataka'}</span>
        </div>
      </PageHeader>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s, i) => <StatCard key={s.label} {...s} />)}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16, duration: 0.55, ease: EASE }} className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card title="Active requirements" sub="Closed requirements appear in your order pipeline" className="lg:col-span-2" delay={0.16}
          action={<Link to="/app/buyer/requirements" className="inline-flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-agri">Manage<ArrowRight className="h-3.5 w-3.5" /></Link>}>
          <div className="divide-y divide-ink/[0.06]">
            {data.activeRequirements.length === 0 && <p className="px-7 py-8 text-[0.84rem] text-smoke">No active requirements yet.</p>}
            {data.activeRequirements.map((r) => (
              <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 md:px-7">
                <div className="min-w-0">
                  <p className="text-[0.9rem] font-medium text-ink">{r.crop}{r.variety ? ` · ${r.variety}` : ''}</p>
                  <p className="mt-0.5 text-[0.72rem] text-sage">{inr(r.quantityKg)} kg · ₹{inr(r.minPrice)}–{inr(r.maxPrice)}/kg{r.deliveryLocation ? ` · ${r.deliveryLocation}` : ''}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[0.76rem] text-smoke">{r.matches} supplier{r.matches !== 1 ? 's' : ''} match</span>
                  <Tag status={r.status} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Best matches" sub="Scored on crop, quantity, grade, price band, distance" delay={0.22}>
          <div className="space-y-3 p-6 md:p-7">
            {data.topMatches.map((t) => (
              <div key={t.listingId} className="rounded-2xl border border-ink/[0.07] bg-white/60 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[0.86rem] font-medium text-ink">{t.farmer}</p>
                    <p className="text-[0.7rem] text-sage">{t.crop} · ₹{inr(t.pricePerKg)}/kg · {inr(t.distanceKm)} km</p>
                  </div>
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-lime-soft text-agri">
                    <span className="text-[0.8rem] font-bold">{Math.round(t.overall)}</span>
                  </span>
                </div>
                {t.overall >= 90 && (
                  <p className="mt-2.5 flex items-center gap-1.5 text-[0.64rem] font-medium text-agri"><Sparkles className="h-3 w-3" strokeWidth={1.75} /> Strong match</p>
                )}
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.55, ease: EASE }} className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card title="Order pipeline" sub={data.activeOrders.length ? `${data.activeOrders.length} orders currently active` : 'No active orders'} delay={0.3}
          action={<Link to="/app/buyer/orders" className="inline-flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-agri">All orders<ArrowRight className="h-3.5 w-3.5" /></Link>}>
          <div className="divide-y divide-ink/[0.06]">
            {data.activeOrders.length === 0 && <p className="px-7 py-8 text-[0.84rem] text-smoke">No live purchase orders.</p>}
            {data.activeOrders.map((o) => (
              <div key={o.id} className="flex items-center justify-between gap-3 px-6 py-4 md:px-7">
                <div className="min-w-0">
                  <p className="text-[0.88rem] font-medium text-ink">{o.crop} · {o.supplier}</p>
                  <p className="mt-0.5 text-[0.72rem] text-sage">₹{inr(o.pricePerKg)}/kg · {inr(o.quantityKg)} kg</p>
                </div>
                <Tag status={o.status} />
              </div>
            ))}
          </div>
        </Card>
        <div className="lg:col-span-2">
          <Card title="Procurement actions" sub="Move produce from requirement to delivery" delay={0.36}>
            <div className="grid gap-3 p-6 sm:grid-cols-3 md:p-7">
              {[
                { to: '/app/buyer/find-produce', icon: Store, t: 'Find produce', d: 'Browse live farmer listings' },
                { to: '/app/buyer/requirements', icon: FileText, t: 'New requirement', d: 'Publish what you need' },
                { to: '/app/buyer/matches', icon: Sparkles, t: 'Review matches', d: 'Score-driven shortlists' },
              ].map((a) => {
                const Icon = a.icon
                return (
                  <Link key={a.to} to={a.to} className="group">
                    <div className="h-full rounded-2xl border border-ink/[0.07] bg-white/70 p-5 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-agri/25 group-hover:shadow-[0_18px_30px_-20px_rgba(31,58,42,0.25)]">
                      <Icon className="h-[18px] w-[18px] text-agri" strokeWidth={1.5} />
                      <p className="mt-4 text-[0.7rem] font-semibold uppercase tracking-[0.1em] leading-snug text-ink">{a.t}</p>
                      <p className="mt-1 text-[0.7rem] leading-relaxed text-sage">{a.d}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </Card>
        </div>
      </motion.div>

      <p className="mt-8 text-center text-[0.66rem] uppercase tracking-[0.22em] text-sage">
        {data.disclaimer || 'Match scores compare listings against your requirements — always verify quality at delivery.'}
      </p>
    </>
  )
}