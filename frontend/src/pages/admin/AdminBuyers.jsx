import useApi from '../../hooks/useApi'
import { PageHeader, Card, Skeleton, ErrorCard, Tag, NothingYet, inr } from '../../components/app/Cards'
import Avatar from '../../components/ui/Avatar'
import { Store, BadgeCheck } from 'lucide-react'

export default function AdminBuyers() {
  const { data, error, loading, reload } = useApi('/admin/buyers')
  const buyers = data?.buyers || []

  return (
    <>
      <PageHeader eyebrow="Demand side" title="Buyers" desc="Businesses sourcing through AgriConnect, their requirement load and order volume." />
      {loading && <Skeleton className="h-[300px] w-full" />}
      {error && <ErrorCard onRetry={reload} />}
      {!loading && !error && buyers.length === 0 && <NothingYet icon={Store} title="No buyers yet" desc="Procurement accounts appear here once they publish a requirement." />}
      {!loading && !error && buyers.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {buyers.map((b) => (
            <Card key={b.id} className="p-6">
              <div className="flex items-center gap-4">
                <Avatar initials={b.company.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()} size={44} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-[0.95rem] font-semibold text-ink">{b.company}</p>
                    {b.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-agri" strokeWidth={1.75} />}
                  </div>
                  <p className="text-[0.72rem] text-sage">{b.businessType || 'Business'} · {b.name}</p>
                </div>
                <Tag status={b.status} />
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3 rounded-2xl bg-white/60 p-4">
                {[['Requirements', b.requirements], ['Orders', b.orders], ['Rating', `★ ${b.rating}`]].map(([k, v]) => (
                  <div key={k}><p className="text-[0.6rem] uppercase tracking-[0.18em] text-sage">{k}</p><p className="mt-1 text-[0.8rem] font-semibold text-ink">{v}</p></div>
                ))}
              </div>
              <p className="mt-4 text-[0.7rem] text-sage">Based in {b.location || 'Karnataka'}</p>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}