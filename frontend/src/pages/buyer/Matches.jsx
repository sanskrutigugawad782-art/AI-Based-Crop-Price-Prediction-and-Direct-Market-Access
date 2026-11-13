import { useState } from 'react'
import useApi from '../../hooks/useApi'
import { useAuth } from '../../context/AuthContext'
import { buyerAPI } from '../../services/api'
import { PageHeader, Card, Skeleton, ErrorCard, NothingYet, Meter, inr } from '../../components/app/Cards'
import { Sparkles, Send, MapPin } from 'lucide-react'

const METERS = [
  ['cropCompatibility', 'Crop'], ['quantityCompatibility', 'Quantity'], ['qualityCompatibility', 'Quality'],
  ['priceCompatibility', 'Price'], ['locationCompatibility', 'Distance'], ['availabilityCompatibility', 'Availability'],
]

function OfferForm({ match, req, token, refresh }) {
  const [price, setPrice] = useState(match.pricePerKg)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const submit = async (e) => {
    e.preventDefault(); setBusy(true)
    try {
      await buyerAPI.createOffer(token, { requirementId: req.id, listingId: match.listingId, pricePerKg: parseFloat(price) })
      setDone(true); refresh()
    } finally { setBusy(false) }
  }
  if (done) return <p className="mt-3 text-[0.72rem] font-semibold text-agri">Offer sent — track it in Offers</p>
  return (
    <form onSubmit={submit} className="mt-3 flex items-center gap-2">
      <div className="relative flex-1">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[0.74rem] font-semibold text-sage">₹</span>
        <input
          required type="number" min="1" step="0.5"
          value={price} onChange={(e) => setPrice(e.target.value)}
          aria-label="Offer price per kg"
          className="w-full rounded-xl border border-ink/[0.1] bg-white/80 py-2.5 pl-8 pr-3 text-[0.84rem] text-ink focus:border-agri/50 focus:outline-none"
        />
      </div>
      <button type="submit" disabled={busy} className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-agri px-4 py-2.5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-ivory transition-colors hover:bg-agri-deep disabled:opacity-50">
        <Send className="h-3.5 w-3.5" strokeWidth={1.75} /> Offer
      </button>
    </form>
  )
}

export default function Matches() {
  const { token } = useAuth()
  const { data, error, loading, reload } = useApi('/buyer/matches')
  const sections = data?.sections || []

  return (
    <>
      <PageHeader eyebrow="Sourcing" title="Matches" desc="Every requirement, scored against live farmer listings. Scores are explainable — see exactly what drives each match." />
      {loading && <Skeleton className="h-[360px] w-full" />}
      {error && <ErrorCard onRetry={reload} />}
      {!loading && !error && sections.length === 0 && (
        <NothingYet icon={Sparkles} title="No matches yet" desc="Publish a requirement and farmer listings will be scored against it." actionTo="/app/buyer/requirements" actionText="Create a requirement" />
      )}
      <div className="space-y-8">
        {sections.map((s) => (
          <div key={s.requirement.id}>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <p className="u-display text-[1.5rem] text-ink">{s.requirement.crop}</p>
                <span className="rounded-full bg-lime-soft px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-agri">
                  {s.requirement.matchesCount} match{s.requirement.matchesCount !== 1 ? 'es' : ''}
                </span>
              </div>
              <p className="text-[0.74rem] text-sage">
                {inr(s.requirement.quantityKg)} kg · ₹{inr(s.requirement.minPrice)}–{inr(s.requirement.maxPrice)}/kg{s.requirement.deliveryLocation ? ` · ${s.requirement.deliveryLocation}` : ''}
              </p>
            </div>
            {s.matches.length === 0 ? (
              <Card className="p-8"><p className="text-[0.84rem] text-smoke">No farmer listings currently match this requirement. Check back as new stock is listed.</p></Card>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {s.matches.map((m) => (
                  <Card key={m.listingId} className="p-6 md:p-7">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[1rem] font-semibold text-ink">{m.farmer}</p>
                        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.74rem] text-sage">
                          <span>{m.crop} · {inr(m.pricePerKg)}/kg</span>
                          <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" strokeWidth={1.5} />{inr(m.distanceKm)} km</span>
                          <span>Grade {m.grade}</span>
                          <span>★ {m.rating}</span>
                        </p>
                      </div>
                      <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-agri text-ivory">
                        <span className="text-[1rem] font-bold">{Math.round(m.overall)}</span>
                      </span>
                    </div>
                    <div className="mt-5 space-y-3">
                      {METERS.map(([k, label]) => m[k] != null && <Meter key={k} label={label} value={Math.round(m[k])} />)}
                    </div>
                    <OfferForm match={m} req={s.requirement} token={token} refresh={reload} />
                  </Card>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  )
}