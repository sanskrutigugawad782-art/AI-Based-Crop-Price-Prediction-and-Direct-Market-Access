import useApi from '../../hooks/useApi'
import { PageHeader, Card, Skeleton, ErrorCard, NothingYet, Tag } from '../../components/app/Cards'
import { Landmark, MapPin } from 'lucide-react'

export default function AdminMarkets() {
  const { data, error, loading, reload } = useApi('/admin/markets')
  const markets = data?.markets || []

  return (
    <>
      <PageHeader eyebrow="Mandis" title="Markets" desc="The APMC mandis feeding the price model and market pages." />
      {loading && <Skeleton className="h-[300px] w-full" />}
      {error && <ErrorCard onRetry={reload} />}
      {!loading && !error && markets.length === 0 && <NothingYet icon={Landmark} title="No markets configured" desc="Add mandis so traders can compare prices across the network." />}
      {!loading && !error && markets.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {markets.map((m, i) => (
            <Card key={i} className="p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[0.95rem] font-semibold text-ink">{m.name}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-[0.74rem] text-sage"><MapPin className="h-3 w-3" strokeWidth={1.5} /> {m.district}, {m.state}</p>
                </div>
                <Tag status={m.status} />
              </div>
              <div className="mt-5 flex items-center justify-between rounded-2xl bg-white/60 p-4">
                <span className="text-[0.64rem] uppercase tracking-[0.18em] text-sage">Distance to hub</span>
                <span className="text-[0.84rem] font-semibold text-ink">{m.distanceKm} km</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}