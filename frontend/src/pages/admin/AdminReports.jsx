import { useState } from 'react'
import useApi from '../../hooks/useApi'
import { useAuth } from '../../context/AuthContext'
import { adminAPI } from '../../services/api'
import { PageHeader, Card, Skeleton, ErrorCard, NothingYet, Tag } from '../../components/app/Cards'
import { Flag, Check, AlertTriangle } from 'lucide-react'

const KIND = { fraudulent_buyer: 'Fraudulent buyer', suspicious_listing: 'Suspicious listing', incorrect_info: 'Incorrect info' }

export default function AdminReports() {
  const { token } = useAuth()
  const { data, error, loading, reload } = useApi('/admin/reports')
  const [busy, setBusy] = useState(null)
  const reports = data?.reports || []

  const update = async (id, status, disposition) => {
    setBusy(id)
    try { await adminAPI.updateReport(token, id, { status, disposition }); reload() }
    finally { setBusy(null) }
  }

  return (
    <>
      <PageHeader eyebrow="Moderation" title="Reports" desc="User-flagged listings and buyers. Review, take action, and close the loop." />
      {loading && <Skeleton className="h-[300px] w-full" />}
      {error && <ErrorCard onRetry={reload} />}
      {!loading && !error && reports.length === 0 && <NothingYet icon={Flag} title="No reports" desc="The moderation queue is clear." />}
      {!loading && !error && reports.length > 0 && (
        <Card className="overflow-hidden">
          {reports.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/[0.06] px-6 py-5 last:border-0 md:px-8">
              <div className="min-w-0 max-w-[560px]">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <p className="text-[0.92rem] font-semibold text-ink">{KIND[r.kind] || r.kind}</p>
                  <Tag status={r.status} />
                  <span className="rounded-full bg-ink/[0.05] px-3 py-1 text-[0.62rem] text-sage">{r.target_type} #{r.target_id}</span>
                </div>
                <p className="mt-1.5 text-[0.76rem] leading-relaxed text-smoke">{r.detail}</p>
                <p className="mt-1 text-[0.66rem] text-sage">{r.created_at}</p>
              </div>
              {r.status === 'open' && (
                <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                  <button onClick={() => update(r.id, 'resolved', 'action_taken')} disabled={busy === r.id}
                    className="inline-flex items-center gap-2 rounded-xl bg-agri px-4 py-2.5 text-[0.64rem] font-semibold uppercase tracking-[0.12em] text-ivory transition-colors hover:bg-agri-deep disabled:opacity-50">
                    <Check className="h-3.5 w-3.5" strokeWidth={1.75} /> Action taken
                  </button>
                  <button onClick={() => update(r.id, 'resolved', 'no_action')} disabled={busy === r.id}
                    className="inline-flex items-center gap-2 rounded-xl border border-ink/15 px-4 py-2.5 text-[0.64rem] font-semibold uppercase tracking-[0.12em] text-ink transition-colors hover:border-agri/40 hover:text-agri disabled:opacity-50">
                    <AlertTriangle className="h-3.5 w-3.5" strokeWidth={1.75} /> No action
                  </button>
                </div>
              )}
            </div>
          ))}
        </Card>
      )}
    </>
  )
}