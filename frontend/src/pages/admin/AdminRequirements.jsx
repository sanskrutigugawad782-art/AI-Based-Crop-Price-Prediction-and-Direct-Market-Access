import useApi from '../../hooks/useApi'
import { PageHeader, Card, Skeleton, ErrorCard, NothingYet, Tag, inr } from '../../components/app/Cards'
import { FileText } from 'lucide-react'

export default function AdminRequirements() {
  const { data, error, loading, reload } = useApi('/admin/requirements')
  const requirements = data?.requirements || []

  return (
    <>
      <PageHeader eyebrow="Demand signals" title="Requirements" desc="Every published buying requirement, with the number of farmer matches generated." />
      {loading && <Skeleton className="h-[300px] w-full" />}
      {error && <ErrorCard onRetry={reload} />}
      {!loading && !error && requirements.length === 0 && <NothingYet icon={FileText} title="No requirements yet" desc="Buyer requirements appear here once published." />}
      {!loading && !error && requirements.length > 0 && (
        <Card className="overflow-hidden">
          {requirements.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/[0.06] px-6 py-5 last:border-0 md:px-8">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <p className="text-[0.92rem] font-semibold text-ink">{r.crop}</p>
                  <Tag status={r.status} />
                </div>
                <p className="mt-1 text-[0.72rem] text-sage">{r.buyer} · {inr(r.quantityKg)} kg · ₹{inr(r.minPrice)}–{inr(r.maxPrice)}/kg{r.deliveryLocation ? ` · ${r.deliveryLocation}` : ''}{r.requiredBy ? ` · by ${r.requiredBy}` : ''}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="rounded-full bg-lime-soft px-4 py-1.5 text-[0.66rem] font-semibold text-agri">{r.matches} match{r.matches !== 1 ? 'es' : ''}</span>
              </div>
            </div>
          ))}
        </Card>
      )}
    </>
  )
}