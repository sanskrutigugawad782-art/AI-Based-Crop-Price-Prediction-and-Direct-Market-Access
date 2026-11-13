import { useState } from 'react'
import useApi from '../../hooks/useApi'
import { useAuth } from '../../context/AuthContext'
import { buyerAPI } from '../../services/api'
import { PageHeader, Card, Skeleton, ErrorCard, Tag, NothingYet, inr } from '../../components/app/Cards'
import { Search, MapPin, CheckCircle2, BadgeCheck } from 'lucide-react'

export default function FindProduce() {
  const { token } = useAuth()
  const { data, error, loading, reload } = useApi('/buyer/produce')
  const [query, setQuery] = useState('')

  const listings = (data?.listings || []).filter(
    (l) => `${l.crop} ${l.variety || ''} ${l.farmer} ${l.location}`.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <>
      <PageHeader eyebrow="Sourcing" title="Find Produce" desc="Live listings from verified farmers, pre-scored against your buying preferences." />
      <div className="relative mb-6 max-w-xl">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-sage" strokeWidth={1.5} />
        <input
          value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder="Search crop, variety, farmer or location…"
          className="w-full rounded-2xl border border-ink/[0.1] bg-white/80 py-3.5 pl-11 pr-4 text-[0.9rem] text-ink placeholder:text-sage/50 focus:border-agri/50 focus:outline-none"
        />
      </div>

      {loading && <Skeleton className="h-[360px] w-full" />}
      {error && <ErrorCard onRetry={reload} />}
      {!loading && !error && listings.length === 0 && <NothingYet icon={Search} title="No produce found" desc="Try widening the search, or publish a requirement so farmers can reach you." actionTo="/app/buyer/requirements" actionText="Publish a requirement" />}

      {!loading && !error && listings.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {listings.map((l) => (
            <Card key={l.listingId} className="p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[1rem] font-semibold text-ink">{l.crop}{l.variety ? ` · ${l.variety}` : ''}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-[0.74rem] text-sage">
                    <MapPin className="h-3 w-3" strokeWidth={1.5} /> {l.location} · {inr(l.distanceKm)} km
                  </p>
                </div>
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-lime-soft text-agri">
                  <span className="text-[0.84rem] font-bold">{Math.round(l.match)}</span>
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-[0.84rem] font-medium text-ink">{l.farmer}</span>
                  <BadgeCheck className="h-3.5 w-3.5 text-agri" strokeWidth={1.75} />
                  <span className="text-[0.64rem] text-sage">★ {l.rating}</span>
                </div>
                <Tag status="available" />
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-ink/[0.06] pt-4">
                <p className="text-[0.74rem] text-sage">{inr(l.quantityKg)} kg · Grade {l.grade}</p>
                <p className="text-[0.92rem] font-semibold text-ink">₹{inr(l.pricePerKg)}<span className="text-[0.68rem] font-normal text-sage">/kg</span></p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}