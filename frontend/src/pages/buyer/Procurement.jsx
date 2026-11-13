import { useNavigate, Link } from 'react-router-dom'
import useApi from '../../hooks/useApi'
import { PageHeader, Card, Skeleton, ErrorCard } from '../../components/app/Cards'
import { ArrowRight, Store, FileText, Sparkles, ArrowLeftRight, Package, ShieldCheck, Clock, Truck, Wallet } from 'lucide-react'

export default function Procurement() {
  const navigate = useNavigate()
  const { data, error, loading, reload } = useApi('/buyer/dashboard')
  const m = data?.metrics || { activeRequirements: 0, matchedSuppliers: 0, pendingOffers: 0, activeOrders: 0 }

  const start = () => navigate('/app/buyer/requirements?new=1')

  const steps = [
    { n: '01', t: 'Define what you need', d: 'Crop, quantity and a realistic price band.', to: '/app/buyer/requirements', icon: FileText },
    { n: '02', t: 'Match with farmers', d: 'Live listings scored against your requirement.', to: '/app/buyer/matches', icon: Sparkles },
    { n: '03', t: 'Negotiate an offer', d: 'Counter until price and grade align.', to: '/app/buyer/offers', icon: ArrowLeftRight },
    { n: '04', t: 'Track the order', d: 'Purchase orders move to delivery.', to: '/app/buyer/orders', icon: Package },
  ]

  return (
    <>
      <PageHeader eyebrow="Sourcing workflow" title="Procurement" desc="A guided path from requirement to delivered order. Start with what you need, or jump straight into any stage." accent="">
        <button
          onClick={start}
          className="inline-flex items-center gap-2 rounded-full bg-agri px-6 py-3.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-ivory transition-colors hover:bg-agri-deep"
        >
          Start new procurement
        </button>
      </PageHeader>

      {loading && <Skeleton className="h-[280px] w-full" />}
      {error && <ErrorCard onRetry={reload} />}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { label: 'Active requirements', value: m.activeRequirements, icon: FileText },
              { label: 'Matched suppliers', value: m.matchedSuppliers, icon: Store },
              { label: 'Pending offers', value: m.pendingOffers, icon: ArrowLeftRight },
              { label: 'Active orders', value: m.activeOrders, icon: Package },
            ].map((s) => {
              const Icon = s.icon
              return (
                <Card key={s.label} className="p-6">
                  <div className="flex items-center justify-between">
                    <p className="text-[0.64rem] font-medium uppercase tracking-[0.2em] text-sage">{s.label}</p>
                    <Icon className="h-4 w-4 text-agri" strokeWidth={1.5} />
                  </div>
                  <p className="u-display mt-4 text-[2rem] text-ink">{s.value}</p>
                </Card>
              )
            })}
          </div>

          <Card title="The AgriConnect buying flow" sub="Every stage uses real listings and live scores" delay={0.16} className="mt-5">
            <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4 md:p-8">
              {steps.map((s) => {
                const Icon = s.icon
                return (
                  <Link key={s.n} to={s.to} className="group">
                    <div className="h-full rounded-2xl border border-ink/[0.07] bg-white/70 p-5 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-agri/25 group-hover:shadow-[0_18px_30px_-20px_rgba(31,58,42,0.25)]">
                      <div className="flex items-center justify-between">
                        <span className="grid h-10 w-10 place-items-center rounded-xl bg-lime-soft text-agri"><Icon className="h-[18px] w-[18px]" strokeWidth={1.5} /></span>
                        <span className="text-[0.62rem] font-bold tracking-[0.2em] text-sage">{s.n}</span>
                      </div>
                      <p className="mt-4 text-[0.76rem] font-semibold uppercase tracking-[0.08em] text-ink">{s.t}</p>
                      <p className="mt-1.5 text-[0.72rem] leading-relaxed text-sage">{s.d}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </Card>

          <Card title="Why source through AgriConnect" delay={0.24} className="mt-5">
            <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4 md:p-8">
              {[
                { icon: ShieldCheck, t: 'Verified farmers', d: 'Direct from the farm, quality grades attached.' },
                { icon: Clock, t: 'Faster negotiation', d: 'Counters and accepts in one thread.' },
                { icon: Truck, t: 'Delivery visibility', d: 'Orders track from acceptance to delivery.' },
                { icon: Wallet, t: 'Transparent pricing', d: 'Mandis-informed bands, no markups.' },
              ].map((b) => {
                const Icon = b.icon
                return (
                  <div key={b.t} className="flex gap-3.5">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ink/[0.04] text-agri"><Icon className="h-[18px] w-[18px]" strokeWidth={1.5} /></span>
                    <div><p className="text-[0.8rem] font-semibold text-ink">{b.t}</p><p className="mt-1 text-[0.72rem] leading-relaxed text-sage">{b.d}</p></div>
                  </div>
                )
              })}
            </div>
            <div className="border-t border-ink/[0.06] px-6 py-5 md:px-8">
              <Link to="/app/buyer/find-produce" className="group inline-flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-agri">
                Browse all produce now <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={1.75} />
              </Link>
            </div>
          </Card>
        </>
      )}
    </>
  )
}