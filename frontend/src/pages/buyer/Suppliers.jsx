import useApi from '../../hooks/useApi'
import { PageHeader, Card, Skeleton, ErrorCard, NothingYet, Meter, inr } from '../../components/app/Cards'
import Avatar from '../../components/ui/Avatar'
import { Building2, BadgeCheck, CheckCircle2, Leaf } from 'lucide-react'

export default function Suppliers() {
  const { data, error, loading, reload } = useApi('/buyer/suppliers')
  const suppliers = data?.suppliers || []

  return (
    <>
      <PageHeader eyebrow="Vendor base" title="Suppliers" desc="Farmers you've sourced from or matched with — every one is a direct farm, no middlemen." />
      {loading && <Skeleton className="h-[300px] w-full" />}
      {error && <ErrorCard onRetry={reload} />}
      {!loading && !error && suppliers.length === 0 && (
        <NothingYet icon={Building2} title="No suppliers yet" desc="Farmers will appear here once you send offers or place orders." />
      )}
      {!loading && !error && suppliers.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {suppliers.map((s) => (
            <Card key={s.id} className="p-6">
              <div className="flex items-center gap-4">
                <Avatar initials={s.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()} size={44} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-[0.95rem] font-semibold text-ink">{s.name}</p>
                    {s.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-agri" strokeWidth={1.75} />}
                  </div>
                  <p className="text-[0.72rem] text-sage">{s.location} · ★ {s.rating}</p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 rounded-2xl bg-white/60 p-4">
                {[['Reliability', `${Math.round(s.reliability)}%`], ['Completed orders', s.completedOrders], ['Crops', s.crops?.length || 0]].map(([k, v]) => (
                  <div key={k}><p className="text-[0.6rem] uppercase tracking-[0.18em] text-sage">{k}</p><p className="mt-1 text-[0.8rem] font-semibold text-ink">{v}</p></div>
                ))}
              </div>

              <div className="mt-5">
                <Meter label="Sourcing reliability" value={Math.round(s.reliability)} />
              </div>

              {s.crops?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {s.crops.map((c) => (
                    <span key={c} className="inline-flex items-center gap-1 rounded-full bg-lime-soft px-3 py-1 text-[0.64rem] font-medium text-agri">
                      <Leaf className="h-3 w-3" strokeWidth={1.75} />{c}
                    </span>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </>
  )
}