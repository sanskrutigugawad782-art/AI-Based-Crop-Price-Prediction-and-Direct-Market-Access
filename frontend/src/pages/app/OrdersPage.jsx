import { useState } from 'react'
import { motion } from 'framer-motion'
import { ErrorPanel, SkeletonBlock, EmptyState } from '../../components/app/Status'
import useApi from '../../hooks/useApi'
import { useAuth } from '../../context/AuthContext'
import { farmAPI, ordersAPI } from '../../services/api'
import { EASE } from '../../lib/motion'
import { Package, ArrowRightLeft, CheckCircle2, X, Star } from 'lucide-react'

const r2 = (n) => (n == null ? '—' : n.toFixed(2))
const qty = (kg) => `${Math.round(kg).toLocaleString('en-IN')} kg · ${(kg / 100).toLocaleString('en-IN')} q`

const STATUS_META = {
  accepted: { label: 'Accepted', cls: 'bg-lime-soft text-agri' },
  preparing: { label: 'Preparing', cls: 'bg-amber-100 text-amber-700' },
  dispatched: { label: 'Dispatched', cls: 'bg-sky-100 text-sky-700' },
  delivered: { label: 'Delivered', cls: 'bg-violet-100 text-violet-700' },
  completed: { label: 'Completed', cls: 'bg-agri-deep text-lime' },
  open: { label: 'Open', cls: 'bg-ink/[0.05] text-smoke' },
}

const NEXT_STEP = {
  accepted: { status: 'preparing', label: 'Start preparing' },
  preparing: { status: 'dispatched', label: 'Mark dispatched' },
  dispatched: { status: 'delivered', label: 'Mark delivered' },
}

const OFFER_META = {
  sent: { label: 'New offer', cls: 'bg-lime-soft text-agri' },
  negotiating: { label: 'Negotiating', cls: 'bg-amber-100 text-amber-700' },
  countered: { label: 'Your counter sent', cls: 'bg-sky-100 text-sky-700' },
  accepted: { label: 'Accepted', cls: 'bg-agri-deep text-lime' },
  withdrawn: { label: 'Withdrawn', cls: 'bg-ink/[0.05] text-smoke' },
  declined: { label: 'Declined', cls: 'bg-rose-100 text-rose-600' },
}

export default function OrdersPage() {
  const { token } = useAuth()
  const { data, error, loading, reload } = useApi('/orders')
  const offersQ = useApi('/farm/offers')
  const [counterOf, setCounterOf] = useState(null)
  const [counterPrice, setCounterPrice] = useState('')
  const [counterMsg, setCounterMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState('')

  const activeOffers = (offersQ.data?.offers || []).filter((o) => ['sent', 'negotiating', 'countered'].includes(o.status))

  const act = async (fn, okMsg) => {
    setBusy(true); setNote('')
    try { await fn(); setNote(okMsg); offersQ.reload(); reload() }
    catch (e) { setNote(e.error || 'Something went wrong.') }
    finally { setBusy(false); setCounterOf(null); setCounterPrice(''); setCounterMsg('') }
  }

  const advance = async (o) => act(() => ordersAPI.updateStatus(token, o.id, NEXT_STEP[o.status].status), `Order ${o.crop} updated to ${NEXT_STEP[o.status].status}.`)
  const rate = async (o, rating) => act(() => ordersAPI.rate(token, o.id, rating), `Thanks — you rated this buyer ${rating}★.`)
  const acceptOffer = (o) => act(() => farmAPI.acceptOffer(token, o.id), 'Offer accepted — a purchase order is now open.')
  const declineOffer = (o) => act(() => farmAPI.declineOffer(token, o.id), 'Offer declined.')
  const sendCounter = (o) => act(() => farmAPI.counterOffer(token, o.id, { pricePerKg: Number(counterPrice), message: counterMsg }), `Counter of ₹${Number(counterPrice).toFixed(2)}/kg sent to ${o.buyer}.`)

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: EASE }} className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="max-w-[620px]">
          <p className="u-eyebrow mb-5 text-sage">Orders</p>
          <h1 className="u-display text-[clamp(1.9rem,3.2vw,3rem)] text-ink">Your <span className="text-agri">deals.</span></h1>
          <p className="mt-4 text-[0.95rem] leading-relaxed text-smoke">
            Incoming buyer offers, and the deals you've committed to — tracked through to delivery.
          </p>
        </div>
        <span className="rounded-full bg-ink/[0.05] px-4 py-2 text-[0.66rem] font-semibold uppercase tracking-[0.12em] text-smoke">{data?.total ?? '—'} total</span>
      </motion.div>

      {note && <p className="mb-5 rounded-2xl bg-lime-soft/70 px-5 py-3 text-[0.82rem] font-medium text-agri-deep">{note}</p>}

      {!offersQ.loading && activeOffers.length > 0 && (
        <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.6, ease: EASE }} className="mb-10">
          <p className="mb-4 text-[0.66rem] font-medium uppercase tracking-[0.2em] text-sage">Incoming buyer offers</p>
          <div className="space-y-3">
            {activeOffers.map((o) => {
              const st = OFFER_META[o.status] || OFFER_META.sent
              const isMine = o.side === 'farmer'
              const open = counterOf === o.id
              return (
                <div key={o.id} className="rounded-3xl border border-ink/[0.07] bg-white/80 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2 text-[0.9rem] font-medium text-ink">
                        {o.buyer} <span className="text-sage">·</span> {o.crop}
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[0.58rem] font-semibold ${st.cls}`}>{st.label}</span>
                      </p>
                      <p className="mt-1 text-[0.72rem] text-sage">
                        {isMine ? 'Your counter' : 'Buyer offer'} · ₹{r2(o.pricePerKg)}/kg
                        {o.message ? ` · “${o.message}”` : ''} · {o.createdAt?.replace('T', ' ').slice(0, 16)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!isMine && o.status !== 'countered' && (
                        <>
                          <button disabled={busy} onClick={() => acceptOffer(o)} className="rounded-full bg-agri px-4 py-2 text-[0.66rem] font-semibold uppercase tracking-[0.12em] text-ivory hover:bg-agri-deep disabled:opacity-60">Accept</button>
                          <button disabled={busy} onClick={() => declineOffer(o)} className="grid h-8 w-8 place-items-center rounded-full border border-ink/10 text-smoke hover:text-rose-600"><X className="h-3.5 w-3.5" /></button>
                          <button disabled={busy} onClick={() => { setCounterOf(open ? null : o.id); setCounterPrice(o.pricePerKg); setCounterMsg('') }} className="rounded-full border border-ink/10 px-4 py-2 text-[0.66rem] font-semibold uppercase tracking-[0.12em] text-smoke hover:border-agri hover:text-agri">{open ? 'Cancel' : 'Counter'}</button>
                        </>
                      )}
                      {isMine && <CheckCircle2 className="h-4 w-4 text-sky-600" strokeWidth={2} />}
                    </div>
                  </div>
                  {open && (
                    <div className="mt-4 flex flex-wrap items-end gap-3 rounded-2xl bg-ivory p-4">
                      <label className="flex-1">
                        <span className="text-[0.6rem] uppercase tracking-[0.16em] text-sage">Your rate (₹/kg)</span>
                        <input value={counterPrice} onChange={(e) => setCounterPrice(e.target.value)} inputMode="decimal" className="mt-1 w-full rounded-xl border border-ink/10 bg-white px-3 py-2 text-[0.85rem] text-ink outline-none focus:border-agri" />
                      </label>
                      <label className="flex-[2]">
                        <span className="text-[0.6rem] uppercase tracking-[0.16em] text-sage">Message</span>
                        <input value={counterMsg} onChange={(e) => setCounterMsg(e.target.value)} className="mt-1 w-full rounded-xl border border-ink/10 bg-white px-3 py-2 text-[0.85rem] text-ink outline-none focus:border-agri" placeholder="Optional note" />
                      </label>
                      <button disabled={busy || !Number(counterPrice)} onClick={() => sendCounter(o)} className="rounded-full bg-agri px-5 py-2.5 text-[0.66rem] font-semibold uppercase tracking-[0.12em] text-ivory hover:bg-agri-deep disabled:opacity-50">Send</button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </motion.section>
      )}

      <p className="mb-4 text-[0.66rem] font-medium uppercase tracking-[0.2em] text-sage">Committed deals</p>
      {loading && <SkeletonBlock className="h-[320px] w-full" />}
      {error && <ErrorPanel onRetry={reload} />}

      {data && data.orders.length === 0 && (
        <EmptyState icon={Package} title="No deals yet" desc={data.emptyHint || 'Accept a buyer offer and it will appear here.'} />
      )}

      {data && data.orders.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6, ease: EASE }} className="overflow-hidden rounded-3xl border border-ink/[0.07] bg-white/80">
          <div className="hidden grid-cols-12 gap-4 border-b border-ink/[0.06] px-7 py-4 text-[0.62rem] uppercase tracking-[0.16em] text-sage md:grid">
            <span className="col-span-3">Crop & volume</span>
            <span className="col-span-2">Buyer</span>
            <span className="col-span-2">Rate</span>
            <span className="col-span-2">Committed</span>
            <span className="col-span-3 text-right">Status</span>
          </div>
          {data.orders.map((o) => {
            const st = STATUS_META[o.status] || STATUS_META.open
            const step = NEXT_STEP[o.status]
            return (
              <div key={o.id} className="grid grid-cols-2 gap-4 border-b border-ink/[0.05] px-7 py-5 last:border-0 md:grid-cols-12">
                <div className="col-span-2 md:col-span-3">
                  <p className="flex items-center gap-2 text-[0.9rem] font-medium text-ink">
                    {o.crop}
                    {o.incoming && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-ink/[0.05] px-2 py-0.5 text-[0.56rem] uppercase tracking-[0.1em] text-smoke">
                        <ArrowRightLeft className="h-3 w-3" strokeWidth={1.75} /> sold
                      </span>
                    )}
                  </p>
                  <p className="mt-1 text-[0.7rem] text-sage">{qty(o.quantityKg)}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-[0.82rem] text-ink">{o.buyer}</p>
                  <p className="text-[0.62rem] text-sage">buyer</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-[0.82rem] font-[300] text-ink">₹{r2(o.pricePerKg)}/kg</p>
                  <p className="text-[0.62rem] text-sage">₹{Math.round(o.pricePerKg * o.quantityKg).toLocaleString('en-IN')} value</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-[0.78rem] text-smoke">{o.createdAt?.replace('T', ' ').slice(0, 16) || '—'}</p>
                </div>
                <div className="flex flex-col items-start gap-2 md:items-end md:col-span-3">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.64rem] font-semibold ${st.cls}`}>
                    {o.status === 'accepted' && <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2} />}
                    {st.label}
                  </span>
                  {o.incoming && step && (
                    <button disabled={busy} onClick={() => advance(o)} className="rounded-full border border-agri/30 px-3.5 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-agri hover:bg-agri hover:text-ivory disabled:opacity-50">
                      {step.label}
                    </button>
                  )}
                  {o.incoming && o.status === 'completed' && (
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((r) => (
                        <button key={r} disabled={busy} onClick={() => rate(o, r)} className="text-amber-500 transition-transform hover:scale-125">
                          <Star className="h-4 w-4" fill="none" strokeWidth={1.75} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </motion.div>
      )}

      <p className="mt-8 text-center text-[0.66rem] uppercase tracking-[0.22em] text-sage">Deal records are illustrative — AgriConnect does not move money yet.</p>
    </>
  )
}