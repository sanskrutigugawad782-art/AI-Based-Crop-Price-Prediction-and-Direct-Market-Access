import useApi from '../../hooks/useApi'
import { PageHeader, Card, Skeleton, ErrorCard, Tag, NothingYet, inr } from '../../components/app/Cards'
import Avatar from '../../components/ui/Avatar'
import { Sprout, BadgeCheck, Leaf } from 'lucide-react'

export default function AdminFarmers() {
  const { data, error, loading, reload } = useApi('/admin/farmers')
  const farmers = data?.farmers || []

  return (
    <>
      <PageHeader eyebrow="Supply side" title="Farmers" desc="Verified growers, their crop base, listing activity and order history." />
      {loading && <Skeleton className="h-[300px] w-full" />}
      {error && <ErrorCard onRetry={reload} />}
      {!loading && !error && farmers.length === 0 && <NothingYet icon={Sprout} title="No farmers yet" desc="Farmers appear here once they complete a profile." />}
      {!loading && !error && farmers.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {farmers.map((f) => (
            <Card key={f.id} className="p-6">
              <div className="flex items-center gap-4">
                <Avatar initials={f.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()} size={44} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-[0.95rem] font-semibold text-ink">{f.name}</p>
                    {f.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-agri" strokeWidth={1.75} />}
                  </div>
                  <p className="text-[0.72rem] text-sage">{f.location} · ★ {f.rating}</p>
                </div>
                <Tag status={f.status} />
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3 rounded-2xl bg-white/60 p-4">
                {[['Farm size', `${f.farmSize} ac`], ['Listings', f.listings], ['Orders', f.orders]].map(([k, v]) => (
                  <div key={k}><p className="text-[0.6rem] uppercase tracking-[0.18em] text-sage">{k}</p><p className="mt-1 text-[0.8rem] font-semibold text-ink">{v}</p></div>
                ))}
              </div>

              {f.crops?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {f.crops.map((c) => (
                    <span key={c} className="inline-flex items-center gap-1 rounded-full bg-lime-soft px-3 py-1 text-[0.64rem] font-medium text-agri"><Leaf className="h-3 w-3" strokeWidth={1.75} />{c}</span>
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