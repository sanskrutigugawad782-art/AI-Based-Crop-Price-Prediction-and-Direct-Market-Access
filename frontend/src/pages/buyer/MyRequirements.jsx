import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import useApi from '../../hooks/useApi'
import { useAuth } from '../../context/AuthContext'
import { buyerAPI } from '../../services/api'
import { PageHeader, Card, Skeleton, ErrorCard, Tag, NothingYet, inr } from '../../components/app/Cards'
import { ArrowRight, Plus, FileText, MapPin } from 'lucide-react'

const EMPTY = { crop: '', variety: '', quantityKg: '', minPrice: '', maxPrice: '', deliveryLocation: '', requiredBy: '', notes: '' }

export default function MyRequirements() {
  const { token } = useAuth()
  const { data, error, loading, reload } = useApi('/buyer/requirements')
  const [params, setParams] = useSearchParams()
  const [open, setOpen] = useState(() => params.get('new') === '1')
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  const toggle = () => {
    const next = !open
    setOpen(next)
    if (!next && params.get('new')) setParams({}, { replace: true })
  }

  const submit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await buyerAPI.createRequirement(token, {
        crop: form.crop,
        variety: form.variety || undefined,
        quantityKg: parseFloat(form.quantityKg),
        minPrice: parseFloat(form.minPrice),
        maxPrice: parseFloat(form.maxPrice),
        deliveryLocation: form.deliveryLocation || undefined,
        requiredBy: form.requiredBy || undefined,
        notes: form.notes || undefined,
      })
      setForm(EMPTY); setOpen(false); reload()
    } finally { setSaving(false) }
  }

  const input = 'w-full rounded-xl border border-ink/[0.1] bg-white/80 px-4 py-3 text-[0.86rem] text-ink placeholder:text-sage/50 focus:border-agri/50 focus:outline-none'
  const label = 'mb-1.5 block text-[0.66rem] font-medium uppercase tracking-[0.2em] text-charcoal'

  return (
    <>
      <PageHeader eyebrow="Sourcing" title="My Requirements" desc="What you need to buy, when, and at what price band — published for matching against live listings.">
        <button
          onClick={toggle}
          className={`inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] transition-colors ${open ? 'border border-ink/15 text-ink' : 'bg-agri text-ivory hover:bg-agri-deep'}`}
        >
          {open ? 'Close' : <><Plus className="h-4 w-4" strokeWidth={2} /> New requirement</>}
        </button>
      </PageHeader>

      {open && (
        <Card className="mb-6 p-6 md:p-8">
          <form onSubmit={submit} className="grid gap-x-5 gap-y-4 md:grid-cols-3">
            <div className="md:col-span-1">
              <label className={label}>Crop</label>
              <input required value={form.crop} onChange={(e) => setForm({ ...form, crop: e.target.value })} placeholder="Tomato" className={input} />
            </div>
            <div>
              <label className={label}>Variety (optional)</label>
              <input value={form.variety} onChange={(e) => setForm({ ...form, variety: e.target.value })} placeholder="Hybrid" className={input} />
            </div>
            <div>
              <label className={label}>Quantity (kg)</label>
              <input required type="number" min="1" value={form.quantityKg} onChange={(e) => setForm({ ...form, quantityKg: e.target.value })} placeholder="5000" className={input} />
            </div>
            <div>
              <label className={label}>Min price (₹/kg)</label>
              <input required type="number" min="0" step="0.5" value={form.minPrice} onChange={(e) => setForm({ ...form, minPrice: e.target.value })} placeholder="28" className={input} />
            </div>
            <div>
              <label className={label}>Max price (₹/kg)</label>
              <input required type="number" min="0" step="0.5" value={form.maxPrice} onChange={(e) => setForm({ ...form, maxPrice: e.target.value })} placeholder="32" className={input} />
            </div>
            <div>
              <label className={label}>Delivery location</label>
              <input value={form.deliveryLocation} onChange={(e) => setForm({ ...form, deliveryLocation: e.target.value })} placeholder="Bengaluru" className={input} />
            </div>
            <div>
              <label className={label}>Required by</label>
              <input type="date" value={form.requiredBy} onChange={(e) => setForm({ ...form, requiredBy: e.target.value })} className={input} />
            </div>
            <div className="md:col-span-2">
              <label className={label}>Notes (optional)</label>
              <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Grading, packing, lot size…" className={input} />
            </div>
            <div className="flex items-end">
              <button type="submit" disabled={saving} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-agri px-6 py-3.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-ivory transition-colors hover:bg-agri-deep disabled:opacity-50">
                {saving ? 'Publishing…' : 'Publish requirement'}
              </button>
            </div>
          </form>
        </Card>
      )}

      {loading && <Skeleton className="h-[320px] w-full" />}
      {error && <ErrorCard onRetry={reload} />}
      {!loading && !error && (data?.requirements || []).length === 0 && (
        <NothingYet icon={FileText} title="No requirements yet" desc="Publish your first requirement to start receiving matched farmers." />
      )}

      {!loading && !error && (data?.requirements || []).length > 0 && (
        <div className="space-y-4">
          {(data.requirements || []).map((r) => (
            <Card key={r.id}>
              <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5 md:px-8">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <p className="text-[1rem] font-semibold text-ink">{r.crop}{r.variety ? ` · ${r.variety}` : ''}</p>
                    <Tag status={r.status} />
                  </div>
                  <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.76rem] text-sage">
                    <span>{inr(r.quantityKg)} kg</span>
                    <span>₹{inr(r.minPrice)}–{inr(r.maxPrice)}/kg</span>
                    {r.deliveryLocation && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" strokeWidth={1.5} />{r.deliveryLocation}</span>}
                    {r.requiredBy && <span>by {r.requiredBy}</span>}
                  </p>
                </div>
                <Link to="/app/buyer/matches" className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-lime px-5 py-2.5 text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-ink transition-colors hover:bg-lime-soft">
                  {r.matchesCount} match{r.matchesCount !== 1 ? 'es' : ''}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={1.75} />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}