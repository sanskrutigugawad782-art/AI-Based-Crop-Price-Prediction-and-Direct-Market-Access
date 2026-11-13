import useApi from '../../hooks/useApi'
import { PageHeader, Card, Skeleton, ErrorCard, Tag, NothingYet, inr } from '../../components/app/Cards'
import { Calculator } from 'lucide-react'

export default function AdminCrops() {
  const { data, error, loading, reload } = useApi('/admin/crops')
  const crops = data?.crops || []

  return (
    <>
      <PageHeader eyebrow="Commodity registry" title="Crops" desc="Every commodity the platform prices, forecasts and matches for. Status comes from recent listing activity." />
      {loading && <Skeleton className="h-[300px] w-full" />}
      {error && <ErrorCard onRetry={reload} />}
      {!loading && !error && crops.length === 0 && <NothingYet icon={Calculator} title="No crops loaded" desc="The commodity registry is empty — check market data imports." />}
      {!loading && !error && crops.length > 0 && (
        <Card className="overflow-hidden">
          <div className="hidden grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1fr_auto] gap-4 border-b border-ink/[0.06] px-6 py-3 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-sage md:grid md:px-8">
            <span>Crop</span><span>Category</span><span>Season</span><span>Current</span><span>90d projected</span><span>Water</span><span>Status</span>
          </div>
          <div className="divide-y divide-ink/[0.06]">
            {crops.map((c) => (
              <div key={c.name} className="grid gap-2 px-6 py-5 md:grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1fr_auto] md:items-center md:gap-4 md:px-8">
                <div className="min-w-0">
                  <p className="text-[0.9rem] font-semibold text-ink">{c.name}</p>
                  <p className="text-[0.7rem] text-sage">{c.variety} · {c.status}</p>
                </div>
                <span className="text-[0.76rem] text-smoke">{c.category}</span>
                <span className="text-[0.76rem] text-smoke">{c.season} · {c.growingWeeks}w</span>
                <span className="text-[0.84rem] font-semibold text-ink">₹{inr(c.currentPrice)}</span>
                <span className="text-[0.84rem] font-semibold text-agri">₹{inr(c.projected)}</span>
                <span className="text-[0.76rem] text-smoke">{c.waterReq}</span>
                <Tag status={c.status} />
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 border-t border-ink/[0.06] px-6 py-4 md:px-8">
            {crops.some((c) => c.regions?.length) && <span className="text-[0.64rem] uppercase tracking-[0.18em] text-sage">Regions:</span>}
            {[...new Set(crops.flatMap((c) => c.regions || []))].map((r) => (
              <span key={r} className="rounded-full bg-lime-soft px-3 py-1 text-[0.64rem] font-medium text-agri">{r}</span>
            ))}
          </div>
        </Card>
      )}
    </>
  )
}