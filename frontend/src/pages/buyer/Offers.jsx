import { useState } from 'react'
import useApi from '../../hooks/useApi'
import { useAuth } from '../../context/AuthContext'
import { buyerAPI } from '../../services/api'
import { PageHeader, Card, Skeleton, ErrorCard, NothingYet, Tag, inr } from '../../components/app/Cards'
import { ArrowLeftRight, Handshake, XCircle } from 'lucide-react'

function Thread({ o, token, refresh }) {
  const [price, setPrice] = useState(o.pricePerKg)
  const [busy, setBusy] = useState(false)
  const mine = o.side === 'buyer'

  const counter = async () => {
    setBusy(true)
    try { await buyerAPI.counterOffer(token, o.id, { pricePerKg: parseFloat(price) }); refresh() }
    finally { setBusy(false) }
  }
  const accept = async () => {
    setBusy(true)
    try { await buyerAPI.acceptOffer(token, o.id); refresh() }
    finally { setBusy(false) }
  }
  const withdraw = async () => {
    setBusy(true)
    try { await buyerAPI.withdrawOffer(token, o.id); refresh() }
    finally { setBusy(false) }
  }

  const live = ['sent', 'negotiating'].includes(o.status)
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <p className="text-[0.92rem] font-medium text-ink">{o.crop}{o.side === 'buyer' ? ` → ${o.farmer}` : ` ← ${o.farmer}`}</p>
          <Tag status={o.status} />
        </div>
        <p className="mt-1 text-[0.72rem] text-sage">{inr(o.quantityKg)} kg · last at ₹{inr(o.pricePerKg)}/kg{mine ? ' (yours)' : ' (theirs)'}</p>
        {o.message && <p className="mt-2 max-w-[520px] text-[0.76rem] leading-relaxed text-smoke">“{o.message}”</p>}
      </div>
      {live && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[0.72rem] font-semibold text-sage">₹</span>
            <input
              type="number" min="1" step="0.5" value={price} onChange={(e) => setPrice(e.target.value)}
              aria-label="Counter price per kg"
              className="w-28 rounded-xl border border-ink/[0.1] bg-white/80 py-2.5 pl-8 pr-3 text-[0.84rem] text-ink focus:border-agri/50 focus:outline-none"
            />
          </div>
          <button onClick={counter} disabled={busy} className="inline-flex items-center gap-2 rounded-xl border border-ink/15 px-4 py-2.5 text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-ink transition-colors hover:border-agri/40 hover:text-agri disabled:opacity-50">
            <ArrowLeftRight className="h-3.5 w-3.5" strokeWidth={1.75} /> Counter
          </button>
          {!mine ? (
            <button onClick={accept} disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-agri px-4 py-2.5 text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-ivory transition-colors hover:bg-agri-deep disabled:opacity-50">
              <Handshake className="h-3.5 w-3.5" strokeWidth={1.75} /> Accept
            </button>
          ) : (
            <button onClick={withdraw} disabled={busy} className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50">
              <XCircle className="h-3.5 w-3.5" strokeWidth={1.75} /> Withdraw
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default function Offers() {
  const { token } = useAuth()
  const { data, error, loading, reload } = useApi('/buyer/offers')
  const offers = data?.offers || []

  return (
    <>
      <PageHeader eyebrow="Negotiation" title="Offers" desc="Every offer and counter-offer on your requirements, in one thread. Accepting opens a purchase order." />
      {loading && <Skeleton className="h-[300px] w-full" />}
      {error && <ErrorCard onRetry={reload} />}
      {!loading && !error && offers.length === 0 && (
        <NothingYet icon={ArrowLeftRight} title="No offers yet" desc="Send your first offer from a match to start negotiating." actionTo="/app/buyer/matches" actionText="Review matches" />
      )}
      {!loading && !error && offers.length > 0 && (
        <Card className="divide-y divide-ink/[0.06]">
          {offers.map((o) => <div key={o.id} className="px-6 py-5 md:px-8"><Thread o={o} token={token} refresh={reload} /></div>)}
        </Card>
      )}
    </>
  )
}