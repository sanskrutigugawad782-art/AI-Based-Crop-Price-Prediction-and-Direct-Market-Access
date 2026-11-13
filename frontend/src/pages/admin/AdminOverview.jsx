import useApi from '../../hooks/useApi'
import { PageHeader, Card, StatCard, Skeleton, ErrorCard, Tag } from '../../components/app/Cards'
import { Store, Sprout, Package, ClipboardList, Users, Flag, ShieldCheck, AlertTriangle, Activity, ServerCog, Database, LineChart, CloudSun } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

const HEALTH_ICONS = { backend: ServerCog, database: Database, marketData: LineChart, mlService: Activity, weatherApi: CloudSun }

export default function AdminOverview() {
  const { data, error, loading, reload } = useApi('/admin/overview')

  if (loading) return <Skeleton className="h-[420px] w-full" />
  if (error) return <ErrorCard onRetry={reload} />

  const k = data.kpis
  const stats = [
    { label: 'Total users', value: k.totalUsers, icon: Users },
    { label: 'Farmers', value: k.farmers, icon: Sprout, accent: 'bg-lime-soft text-agri' },
    { label: 'Buyers', value: k.buyers, icon: Store },
    { label: 'Active listings', value: k.activeListings, icon: ClipboardList, accent: 'bg-lime-soft text-agri' },
    { label: 'Active orders', value: k.activeOrders, icon: Package },
    { label: 'Open reports', value: k.openReports, icon: Flag, accent: 'bg-wood/25 text-charcoal' },
  ]

  return (
    <>
      <PageHeader eyebrow="Platform console" title="Overview" accent="Admin" desc="Operational state of AgriConnect — users, marketplace liquidity and service health at a glance." />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card title="Platform health" sub="Live checks on the services that keep the marketplace running" className="lg:col-span-2" delay={0.16}>
          <div className="grid gap-3 p-6 sm:grid-cols-2 md:p-7">
            {Object.entries(data.health).map(([k, v]) => {
              const Icon = HEALTH_ICONS[k] || Activity
              return (
                <div key={k} className="flex items-center justify-between gap-3 rounded-2xl border border-ink/[0.07] bg-white/60 p-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <Icon className="h-4 w-4 shrink-0 text-agri" strokeWidth={1.5} />
                    <div className="min-w-0">
                      <p className="text-[0.78rem] font-medium capitalize text-ink">{k.replace(/([A-Z])/g, ' $1')}</p>
                      <p className="truncate text-[0.66rem] text-sage">{v.detail}</p>
                    </div>
                  </div>
                  <Tag status={v.state} />
                </div>
              )
            })}
          </div>
        </Card>

        <Card title="Attention needed" sub="Where an operator should look first" delay={0.22}>
          <div className="space-y-3 p-6 md:p-7">
            <Link to="/admin/reports" className="flex items-center justify-between gap-3 rounded-2xl border border-red-100 bg-red-50/70 p-4">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-red-100 text-red-700"><Flag className="h-4 w-4" strokeWidth={1.75} /></span>
                <div><p className="text-[0.8rem] font-semibold text-ink">{k.openReports} open reports</p><p className="text-[0.66rem] text-sage">Moderation queue active</p></div>
              </div>
              <ArrowRight className="h-4 w-4 text-sage" strokeWidth={1.5} />
            </Link>
            <Link to="/admin/users" className="flex items-center justify-between gap-3 rounded-2xl border border-ink/[0.07] bg-white/60 p-4">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-lime-soft text-agri"><ShieldCheck className="h-4 w-4" strokeWidth={1.75} /></span>
                <div><p className="text-[0.8rem] font-semibold text-ink">{k.pendingVerification} verification requests</p><p className="text-[0.66rem] text-sage">{k.suspended} accounts suspended</p></div>
              </div>
              <ArrowRight className="h-4 w-4 text-sage" strokeWidth={1.5} />
            </Link>
            <Link to="/admin/ai-models" className="flex items-center justify-between gap-3 rounded-2xl border border-ink/[0.07] bg-white/60 p-4">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink/[0.04] text-ink"><AlertTriangle className="h-4 w-4" strokeWidth={1.75} /></span>
                <div><p className="text-[0.8rem] font-semibold text-ink">Model status</p><p className="text-[0.66rem] text-sage">{data.health.mlService.detail}</p></div>
              </div>
              <ArrowRight className="h-4 w-4 text-sage" strokeWidth={1.5} />
            </Link>
          </div>
          <p className="px-6 pb-6 text-[0.68rem] leading-relaxed text-sage md:px-7">{data.liveNote}</p>
        </Card>
      </div>

      <Card title="User growth" sub="New farmers and buyers by month" delay={0.3} className="mt-5">
        <div className="flex h-64 items-end gap-3 px-6 pb-6 pt-6 md:px-8">
          {data.userGrowth.map((g, i) => {
            const total = Math.max(g.farmers + g.buyers, 1)
            return (
              <div key={g.m} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-full w-full items-end gap-1">
                  <div style={{ height: `${(g.farmers / total) * 100}%` }} className="w-1/2 rounded-t-md bg-agri/80" />
                  <div style={{ height: `${(g.buyers / total) * 100}%` }} className="w-1/2 rounded-t-md bg-lime" />
                </div>
                <span className="text-[0.62rem] font-medium uppercase tracking-[0.1em] text-sage">{g.m}</span>
              </div>
            )
          })}
        </div>
        <div className="flex items-center justify-center gap-6 border-t border-ink/[0.06] px-6 py-4 text-[0.66rem] text-sage">
          <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm bg-agri/80" /> Farmers</span>
          <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm bg-lime" /> Buyers</span>
        </div>
      </Card>
    </>
  )
}