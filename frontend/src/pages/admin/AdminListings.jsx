import { useState } from 'react'
import useApi from '../../hooks/useApi'
import { useAuth } from '../../context/AuthContext'
import { adminAPI } from '../../services/api'
import { PageHeader, Card, Skeleton, ErrorCard, Tag, NothingYet, inr } from '../../components/app/Cards'
import { ClipboardList, Search, Flag, Check } from 'lucide-react'

export default function AdminListings() {
  const { token } = useAuth()
  const { data, error, loading, reload } = useApi('/admin/listings')
  const [query, setQuery] = useState('')
  const [busy, setBusy] = useState(null)
  const listings = (data?.listings || []).filter(
    (l) => `${l.crop} ${l.farmer} ${l.kind}`.toLowerCase().includes(query.toLowerCase())
  )

  const act = async (id, action) => {
    setBusy(id)
    try { await adminAPI.moderateListing(token, id, { action }); reload() }
    finally { setBusy(null) }
  }

  return (
    <>
      <PageHeader eyebrow="Moderation" title="Listings" desc={`${data?.count || 0} listings across farmer marketplace and supply offers. Flag or remove anything out of policy.`}>
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-sage" strokeWidth={1.5} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search crop, farmer…"
            className="w-full rounded-2xl border border-ink/[0.1] bg-white/80 py-3.5 pl-11 pr-4 text-[0.86rem] text-ink placeholder:text-sage/50 focus:border-agri/50 focus:outline-none" />
        </div>
      </PageHeader>
      {loading && <Skeleton className="h-[320px] w-full" />}
      {error && <ErrorCard onRetry={reload} />}
      {!loading && !error && listings.length === 0 && <NothingYet icon={ClipboardList} title="No listings" desc="Nothing matches your search right now." />}
      {!loading && !error && listings.length > 0 && (
        <Card className="overflow-hidden">
          {listings.map((l) => (
            <div key={l.id} className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/[0.06] px-6 py-5 last:border-0 md:px-8">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <p className="text-[0.92rem] font-semibold text-ink">{l.crop} · {l.farmer}</p>
                  <Tag status={l.kind} />
                  {l.flagged && <Tag status="flagged" />}
                </div>
                <p className="mt-1 text-[0.72rem] text-sage">{l.location} · {inr(l.quantityKg)} kg · ₹{inr(l.pricePerKg)}/kg · {l.createdAt}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button onClick={() => act(l.id, l.flagged ? 'unflag' : 'flag')} disabled={busy === l.id}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[0.64rem] font-semibold uppercase tracking-[0.12em] transition-colors disabled:opacity-50 ${l.flagged ? 'border border-ink/15 text-ink hover:border-agri/40 hover:text-agri' : 'border border-red-200 bg-red-50 text-red-700 hover:bg-red-100'}`}>
                  {l.flagged ? <><Check className="h-3.5 w-3.5" strokeWidth={1.75} /> Clear</> : <><Flag className="h-3.5 w-3.5" strokeWidth={1.75} /> Flag</>}
                </button>
                <button onClick={() => act(l.id, 'remove')} disabled={busy === l.id}
                  className="inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2 text-[0.64rem] font-semibold uppercase tracking-[0.12em] text-ivory transition-colors hover:bg-red-700 disabled:opacity-50">
                  Remove
                </button>
              </div>
            </div>
          ))}
        </Card>
      )}
      {!loading && !error && <p className="mt-4 text-[0.68rem] text-sage">{data?.listings?.length ? `${data.listings.length} total listing rows` : ''}</p>}
    </>
  )
}