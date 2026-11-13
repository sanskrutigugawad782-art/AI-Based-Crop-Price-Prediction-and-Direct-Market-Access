import useApi from '../../hooks/useApi'
import { PageHeader, Card, StatCard, Skeleton, ErrorCard, inr } from '../../components/app/Cards'
import CountUp from '../../components/ui/CountUp'
import { BarChart3, TrendingUp, Store, Package, Wallet, CheckCircle2 } from 'lucide-react'

export default function Analytics() {
  const { data, error, loading, reload } = useApi('/buyer/analytics')

  if (loading) return <Skeleton className="h-[360px] w-full" />
  if (error) return <ErrorCard onRetry={reload} />

  const a = data
  const stats = [
    { label: 'Total procurement', value: `₹${inr(a.totalProcurement)}`, icon: Wallet, accent: 'bg-agri text-ivory' },
    { label: 'Active suppliers',  value: a.activeSuppliers,  icon: Store },
    { label: 'Orders completed',  value: a.completedOrders,   icon: CheckCircle2, accent: 'bg-lime-soft text-agri' },
    { label: 'This month',        value: `₹${inr(a.thisMonth)}`, icon: TrendingUp },
  ]

  return (
    <>
      <PageHeader eyebrow="Insights" title="Procurement Analytics" desc="Your sourcing footprint: spend, supplier mix and commodity share — computed from live order data." />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card title="Activity by month" sub="Orders across your workspace" delay={0.16}>
          <div className="flex h-72 items-end gap-3 px-6 pb-6 pt-6 md:px-8">
            {a.months.map((m, i) => (
              <div key={m.m} className="group flex flex-1 flex-col items-center gap-2">
                <span className="text-[0.66rem] font-semibold text-agri opacity-0 transition-opacity group-hover:opacity-100">{m.v}</span>
                <div
                  style={{ height: `${Math.max(6, (m.v / (Math.max(...a.months.map((x) => x.v)) || 1)) * 100)}%` }}
                  className="w-full rounded-t-lg bg-gradient-to-t from-agri-deep to-lime transition-opacity"
                />
                <span className="text-[0.62rem] font-medium uppercase tracking-[0.1em] text-sage">{m.m}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Commodity share" sub="By quantity procured" delay={0.22}>
          <div className="space-y-4 p-6 md:p-8">
            {a.crops.map((c) => (
              <div key={c.crop}>
                <div className="flex items-center justify-between text-[0.82rem]">
                  <span className="font-medium text-ink">{c.crop}</span>
                  <span className="text-smoke">{inr(c.quantityKg)} kg · <b className="text-ink">₹{inr(c.value)}</b></span>
                </div>
                <div className="mt-2 h-[7px] overflow-hidden rounded-full bg-ink/[0.06]">
                  <div className="h-full rounded-full bg-agri" style={{ width: `${c.share}%` }} />
                </div>
                <p className="mt-1 text-right text-[0.64rem] text-sage">{Math.round(c.share)}% of volume</p>
              </div>
            ))}
            <p className="mt-4 border-t border-ink/[0.06] pt-4 text-[0.72rem] leading-relaxed text-sage">
              {a.totalOrders} total orders · {a.requirements} published requirements · average price ₹{inr(a.avgPurchasePrice)}/kg across your bureau.
            </p>
          </div>
        </Card>
      </div>
    </>
  )
}