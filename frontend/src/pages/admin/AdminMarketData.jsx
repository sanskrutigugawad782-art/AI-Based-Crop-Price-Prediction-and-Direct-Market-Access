import useApi from '../../hooks/useApi'
import { PageHeader, Card, Skeleton, ErrorCard, NothingYet, Tag, inr } from '../../components/app/Cards'
import { LineChart, RefreshCw } from 'lucide-react'

export default function AdminMarketData() {
  const { data, error, loading, reload } = useApi('/admin/market-data')
  const sources = data?.sources || []

  return (
    <>
      <PageHeader eyebrow="Data pipeline" title="Market Data" desc="Karnataka price dataset health — coverage, freshness and missing records per feed.">
        <button onClick={reload} className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-6 py-3.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-ink transition-colors hover:border-agri/40 hover:text-agri">
          <RefreshCw className="h-4 w-4" strokeWidth={1.75} /> Refresh
        </button>
      </PageHeader>
      {loading && <Skeleton className="h-[260px] w-full" />}
      {error && <ErrorCard onRetry={reload} />}
      {!loading && !error && sources.length === 0 && <NothingYet icon={LineChart} title="No feeds configured" desc="Attach a feed and the pipeline will start ingesting daily prices." />}
      {!loading && !error && sources.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sources.map((s, i) => (
            <Card key={i} className="p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[0.95rem] font-semibold text-ink">{s.name}</p>
                  <p className="mt-0.5 text-[0.7rem] text-sage">{s.source} · last update {s.lastUpdated}</p>
                </div>
                <Tag status={s.status} />
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3 rounded-2xl bg-white/60 p-4">
                {[['Records', s.records], ['Crops', s.crops], ['Missing', s.missing]].map(([k, v]) => (
                  <div key={k}><p className="text-[0.6rem] uppercase tracking-[0.18em] text-sage">{k}</p><p className="mt-1 text-[0.84rem] font-semibold text-ink">{v}</p></div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
      {!loading && !error && data?.note && <p className="mt-6 text-[0.72rem] leading-relaxed text-sage">{data.note}</p>}
    </>
  )
}