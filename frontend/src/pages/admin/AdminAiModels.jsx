import useApi from '../../hooks/useApi'
import { PageHeader, Card, Skeleton, ErrorCard, Tag } from '../../components/app/Cards'
import { BrainCircuit, Cpu, RefreshCw, Activity } from 'lucide-react'

export default function AdminAiModels() {
  const { data, error, loading, reload } = useApi('/admin/ai-models')

  if (loading) return <Skeleton className="h-[320px] w-full" />
  if (error) return <ErrorCard onRetry={reload} />

  const models = data?.models || []

  return (
    <>
      <PageHeader eyebrow="Intelligence" title="AI & Models" desc="The inference services behind forecasts, crop recommendations and match scoring.">
        <button onClick={reload} className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-6 py-3.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-ink transition-colors hover:border-agri/40 hover:text-agri">
          <RefreshCw className="h-4 w-4" strokeWidth={1.75} /> Re-check
        </button>
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-2">
        {models.map((md) => (
          <Card key={md.name} className="p-6 md:p-7">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-agri text-ivory"><BrainCircuit className="h-5 w-5" strokeWidth={1.5} /></span>
                <div>
                  <p className="text-[0.95rem] font-semibold text-ink">{md.name}</p>
                  <p className="text-[0.7rem] text-sage">{md.method} · v{md.version} · trained {md.lastTrained}</p>
                </div>
              </div>
              <Tag status={md.status} />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[['MAE', md.mae != null ? `₹${md.mae.toLocaleString('en-IN')}` : '—'], ['MAPE', md.mape != null ? `${md.mape}%` : '—'], ['Requests', md.requests], ['Crops', md.crops], ['Errors', md.errors], ['SLA', md.sla]].map(([k, v]) => (
                <div key={k} className="rounded-2xl bg-white/60 p-4">
                  <p className="text-[0.6rem] uppercase tracking-[0.18em] text-sage">{k}</p>
                  <p className="mt-1 text-[0.86rem] font-semibold text-ink">{v}</p>
                </div>
              ))}
            </div>

            <p className="mt-5 flex items-center gap-2 border-t border-ink/[0.06] pt-4 text-[0.7rem] text-sage">
              <Activity className="h-3.5 w-3.5" strokeWidth={1.5} /> {md.status === 'active' ? 'Accepting inference requests with the forecast dataset loaded.' : 'Check dependencies before enabling.'}
            </p>
          </Card>
        ))}
      </div>

      <div className="mt-6 flex items-start gap-3 rounded-2xl bg-ink/[0.03] p-5">
        <Cpu className="mt-0.5 h-4 w-4 shrink-0 text-agri" strokeWidth={1.5} />
        <p className="text-[0.74rem] leading-relaxed text-smoke">{data?.note}</p>
      </div>
    </>
  )
}