import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ErrorPanel, SkeletonBlock } from '../../components/app/Status'
import useApi from '../../hooks/useApi'
import { useAuth } from '../../context/AuthContext'
import { marketplaceAPI, inr /* kgDisplay */ } from '../../services/api'
import { EASE } from '../../lib/motion'
import { BadgeCheck, MapPin, Package, ArrowRight, CheckCircle2, Handshake, Loader2 } from 'lucide-react'

const r2 = (n) => (n == null ? '—' : n.toFixed(2))
const kgToQ = (n) => (n == null ? null : n / 100)

function initials(name) {
  return String(name || '?').split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase()
}

function OfferCard({ offer, busy, onAccept }) {
  const open = offer.status === 'open'
  const q = kgToQ(offer.quantityKg)
  const total = offer.pricePerKg * offer.quantityKg
  return (
    <motion.div layout initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}
      className={`flex flex-col rounded-3xl border bg-white/80 p-6 transition-colors ${open ? 'border-ink/[0.07]' : 'border-ink/[0.05] opacity-70'}`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-agri text-[0.8rem] font-semibold text-lime">{initials(offer.buyer)}</span>
          <div>
            <p className="flex items-center gap-1.5 text-[0.9rem] font-medium text-ink">
              {offer.buyer}
              <BadgeCheck className="h-3.5 w-3.5 text-agri" strokeWidth={2} />
            </p>
            <p className="text-[0.62rem] text-sage">Verified buyer</p>
          </div>
        </div>
        <span className={`rounded-full px-3.5 py-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.12em] ${open ? 'bg-lime-soft text-agri' : 'bg-ink/[0.05] text-sage'}`}>
          {open ? 'Open offer' : 'Committed'}
        </span>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
        <div>
          <span className="rounded-full bg-agri-deep px-3.5 py-1.5 text-[0.68rem] font-semibold text-lime">{offer.crop}</span>
          <p className="mt-2 text-[0.68rem] uppercase tracking-[0.12em] text-sage">Volume</p>
          <p className="text-[1.1rem] font-[300] text-ink">{offer.quantityKg} kg{q != null ? ` · ${q.toLocaleString('en-IN')} q` : ''}</p>
        </div>
        <div>
          <p className="text-[0.68rem] uppercase tracking-[0.12em] text-sage">Offer price</p>
          <p className="text-[1.1rem] font-[300] text-ink">₹{r2(offer.pricePerKg)}/kg</p>
        </div>
        <div>
          <p className="text-[0.68rem] uppercase tracking-[0.12em] text-sage">Deal value</p>
          <p className="text-[1.1rem] font-[300] text-ink">₹{inr(total)}</p>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-ink/[0.06] pt-4">
        <p className="inline-flex items-center gap-1.5 text-[0.7rem] text-smoke">
          <MapPin className="h-3.5 w-3.5 text-agri" strokeWidth={1.5} />
          {offer.district} · {offer.distanceKm}km
        </p>
        <p className="text-[0.64rem] text-sage">listed {offer.listedAt?.replace('T', ' ').slice(0, 16) || ''}</p>
      </div>

      <div className="mt-4">
        {open ? (
          <button
            onClick={() => onAccept(offer)}
            disabled={busy}
            className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-agri px-6 py-3.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-ivory transition-colors hover:bg-agri-deep disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} /> : <Handshake className="h-4 w-4" strokeWidth={1.75} />}
            Accept offer
            {!busy && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />}
          </button>
        ) : (
          <span className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink/[0.04] px-6 py-3 text-[0.7rem] font-medium uppercase tracking-[0.16em] text-sage">
            <CheckCircle2 className="h-4 w-4" strokeWidth={1.75} />
            Deal committed
          </span>
        )}
      </div>
    </motion.div>
  )
}

export default function MarketplacePage() {
  const { token } = useAuth()
  const { data, error, loading, reload } = useApi('/marketplace/listings')
  const [filter, setFilter] = useState('All')
  const [busyId, setBusyId] = useState(null)
  const [toast, setToast] = useState(null)
  const [err, setErr] = useState(null)

  const crops = useMemo(() => [...new Set((data?.offers || []).map((o) => o.crop))], [data])
  const offers = useMemo(() => filter === 'All' ? (data?.offers || []) : (data?.offers || []).filter((o) => o.crop === filter), [data, filter])
  const openCount = data?.open ?? 0

  const accept = async (offer) => {
    setBusyId(offer.id); setErr(null)
    try {
      const res = await marketplaceAPI.accept(token, offer.id)
      setToast(`Deal committed with ${res.order.buyer} — ${res.order.crop}, now in Orders.`)
      await reload()
    } catch (e) {
      if (e.status === 409) { setErr('That offer was just taken by another farmer.'); await reload() }
      else setErr(e.error || 'Could not accept — check the API.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: EASE }} className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="max-w-[620px]">
          <p className="u-eyebrow mb-5 text-sage">Marketplace</p>
          <h1 className="u-display text-[clamp(1.9rem,3.2vw,3rem)] text-ink">Direct <span className="text-agri">demand.</span></h1>
          <p className="mt-4 text-[0.95rem] leading-relaxed text-smoke">
            Verified buyers posting open offers — commit your harvest and skip the middle chain.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="rounded-full bg-lime-soft px-4 py-2 text-[0.66rem] font-semibold uppercase tracking-[0.12em] text-agri">{openCount} open</span>
          <span className="rounded-full bg-ink/[0.05] px-4 py-2 text-[0.66rem] font-semibold uppercase tracking-[0.12em] text-smoke">{data?.filled ?? 0} filled</span>
        </div>
      </motion.div>

      {toast && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center gap-3 rounded-3xl border border-agri/20 bg-lime-soft px-6 py-4">
          <CheckCircle2 className="h-5 w-5 text-agri" strokeWidth={2} />
          <p className="text-[0.84rem] font-medium text-agri">{toast}</p>
        </motion.div>
      )}

      <div className="mb-6 flex flex-wrap gap-2">
        {['All', ...crops].map((c) => (
          <button key={c} onClick={() => setFilter(c)}
            className={`rounded-full border px-4 py-2 text-[0.72rem] font-medium transition-all ${
              filter === c ? 'border-agri bg-agri-deep text-lime' : 'border-ink/[0.1] bg-white/70 text-smoke hover:border-agri/30'
            }`}>{c}</button>
        ))}
      </div>

      {err && <p className="mb-6 rounded-2xl border border-wood/30 bg-wood/10 px-4 py-3 text-[0.8rem] text-charcoal">{err}</p>}

      {loading && <div className="grid gap-6 md:grid-cols-2"><SkeletonBlock className="h-[260px]" /><SkeletonBlock className="h-[260px]" /></div>}
      {error && <ErrorPanel onRetry={reload} />}

      {data && (
        offers.length > 0 ? (
          <motion.div layout className="grid gap-6 md:grid-cols-2">
            {offers.map((o) => (
              <OfferCard key={o.id} offer={o} busy={busyId === o.id} onAccept={accept} />
            ))}
          </motion.div>
        ) : (
          <div className="flex min-h-[240px] flex-col items-center justify-center rounded-3xl border border-dashed border-ink/[0.15] bg-white/50 px-8 text-center">
            <Package className="h-7 w-7 text-sage" strokeWidth={1.4} />
            <p className="mt-5 text-[1rem] font-medium uppercase tracking-[0.14em] text-ink">No open offers for {filter}</p>
            <p className="mt-3 max-w-[400px] text-[0.84rem] text-smoke">New buyer demand lands here as it is posted.</p>
          </div>
        )
      )}

      <p className="mt-8 text-center text-[0.66rem] uppercase tracking-[0.22em] text-sage">{data?.disclaimer || 'Offers are illustrative — verify before committing a delivery.'}</p>
    </>
  )
}