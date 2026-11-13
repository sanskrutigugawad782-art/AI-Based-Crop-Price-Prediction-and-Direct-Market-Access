import { useState } from 'react'
import useApi from '../../hooks/useApi'
import { useAuth } from '../../context/AuthContext'
import { buyerAPI, ordersAPI } from '../../services/api'
import { PageHeader, Card, Skeleton, ErrorCard, NothingYet, Tag, inr } from '../../components/app/Cards'
import { Package, Truck, MapPin, X, Star } from 'lucide-react'

export default function BuyerOrders() {
  const { token } = useAuth()
  const { data, error, loading, reload } = useApi('/buyer/orders')
  const [open, setOpen] = useState(false)
  const [detail, setDetail] = useState(null)
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState('')
  const orders = data?.orders || []

  const view = async (id) => {
    setDetail(null); setNote(''); setOpen(true)
    const d = await buyerAPI.order(token, id)
    setDetail(d)
  }
  const close = () => setOpen(false)

  const advance = async (status) => {
    setBusy(true); setNote('')
    try {
      await ordersAPI.updateStatus(token, detail.order.id, status)
      setNote(`Order moved to ${status}.`)
      const d = await buyerAPI.order(token, detail.order.id)
      setDetail(d); reload()
    } catch (e) {
      setNote(e.error || 'Could not update the order.')
    } finally { setBusy(false) }
  }

  const rate = async (rating) => {
    setBusy(true); setNote('')
    try {
      await ordersAPI.rate(token, detail.order.id, rating)
      setNote(`Thanks — you rated this supplier ${rating}★.`)
      const d = await buyerAPI.order(token, detail.order.id)
      setDetail(d)
    } catch (e) {
      setNote(e.error || 'Could not submit rating.')
    } finally { setBusy(false) }
  }

  const order = detail?.order
  const timeline = detail?.timeline || []

  return (
    <>
      <PageHeader eyebrow="Fulfilment" title="Orders" desc="Purchase orders created from accepted offers, tracked through to delivery." accent="" />
      {loading && <Skeleton className="h-[300px] w-full" />}
      {error && <ErrorCard onRetry={reload} />}
      {!loading && !error && orders.length === 0 && (
        <NothingYet icon={Package} title="No orders yet" desc="Accept an offer and a purchase order is created automatically." actionTo="/app/buyer/offers" actionText="Review offers" />
      )}
      {!loading && !error && orders.length > 0 && (
        <Card className="divide-y divide-ink/[0.06]">
          {orders.map((o) => (
            <button key={o.id} onClick={() => view(o.id)} className="flex w-full flex-wrap items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-ivory/60 md:px-8">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <p className="text-[0.92rem] font-semibold text-ink">{o.crop} · {o.supplier}</p>
                  <Tag status={o.status} />
                </div>
                <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.72rem] text-sage">
                  <span className="font-mono">{o.orderCode}</span>
                  <span>{inr(o.quantityKg)} kg</span>
                  <span>₹{inr(o.pricePerKg)}/kg</span>
                  <span>total ₹{inr(o.total)}</span>
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-agri">Track<Truck className="h-3.5 w-3.5" strokeWidth={1.75} /></span>
            </button>
          ))}
        </Card>
      )}

      {open && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-ink/40 p-4 backdrop-blur-sm" onClick={close}>
          <div className="w-full max-w-lg rounded-3xl bg-ivory p-7 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[1rem] font-semibold text-ink">{order?.crop}</p>
                <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.74rem] text-sage">
                  {order?.orderCode && <span className="font-mono">{order.orderCode}</span>}
                  {order?.supplier && <span>{order.supplier}</span>}
                  {order?.supplierRating ? <span>★ {order.supplierRating}</span> : null}
                  <Tag status={order?.status} />
                </p>
              </div>
              <button onClick={close} className="grid h-9 w-9 place-items-center rounded-full border border-ink/10 text-ink"><X className="h-4 w-4" strokeWidth={1.5} /></button>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3 rounded-2xl bg-white/70 p-4">
              {[['Quantity', `${inr(order?.quantityKg)} kg`], ['Price', `₹${inr(order?.pricePerKg)}/kg`], ['Total', `₹${inr(order?.total)}`]].map(([k, v]) => (
                <div key={k}><p className="text-[0.62rem] uppercase tracking-[0.18em] text-sage">{k}</p><p className="mt-1 text-[0.86rem] font-semibold text-ink">{v}</p></div>
              ))}
            </div>

            <p className="mt-6 mb-3 text-[0.66rem] font-medium uppercase tracking-[0.2em] text-sage">Timeline</p>
            <div className="space-y-0">
              {(timeline.length ? timeline : []).map((t, i) => (
                <div key={t.stage} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className={`h-2.5 w-2.5 rounded-full ${t.state === 'next' ? 'bg-ink/[0.15]' : 'bg-agri'}`} />
                    {i < timeline.length - 1 && <span className="w-px flex-1 bg-ink/[0.1]" />}
                  </div>
                  <p className={`pb-5 text-[0.82rem] ${t.state === 'next' ? 'text-smoke' : 'font-medium text-ink'}`}>{t.stage}</p>
                </div>
              ))}
            </div>

            {order?.status === 'delivered' && (
              <button onClick={() => advance('completed')} disabled={busy} className="w-full rounded-full bg-agri py-3.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-ivory hover:bg-agri-deep disabled:opacity-60">
                {busy ? 'Updating…' : 'Confirm delivery · Mark completed'}
              </button>
            )}

            {order?.status === 'completed' && (
              <div className="rounded-2xl bg-white/70 p-4">
                <p className="text-[0.66rem] font-medium uppercase tracking-[0.2em] text-sage">Rate this supplier</p>
                <div className="mt-2 flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((r) => (
                    <button key={r} disabled={busy} onClick={() => rate(r)} className="p-1 text-amber-500 transition-transform hover:scale-125 disabled:opacity-50">
                      <Star className="h-5 w-5" fill={detail?.rateChip >= r ? 'currentColor' : 'none'} strokeWidth={1.5} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {note && <p className="mt-3 text-[0.72rem] font-medium text-agri-deep">{note}</p>}
            <p className="mt-4 flex items-center gap-2 text-[0.7rem] text-sage"><MapPin className="h-3.5 w-3.5" strokeWidth={1.5} /> Delivery tracking updates appear here as the order moves.</p>
            <button onClick={close} className="mt-4 w-full rounded-full border border-ink/10 bg-white/60 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-smoke hover:bg-white">Close</button>
          </div>
        </div>
      )}
    </>
  )
}