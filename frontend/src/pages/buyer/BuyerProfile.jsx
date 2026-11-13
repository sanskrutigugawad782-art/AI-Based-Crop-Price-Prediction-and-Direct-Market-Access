import { useState } from 'react'
import useApi from '../../hooks/useApi'
import { useAuth } from '../../context/AuthContext'
import { buyerAPI } from '../../services/api'
import { PageHeader, Card, Skeleton, ErrorCard } from '../../components/app/Cards'
import { Building2, MapPin, Mail, Phone, BadgeCheck } from 'lucide-react'

const TYPES = ['Processor', 'Grocery Chain', 'Exporter', 'Restaurant Group', 'Distributor', 'Institutional']

export default function BuyerProfile() {
  const { token, user, updateUser } = useAuth()
  const { data, error, loading, reload } = useApi('/buyer/profile')
  const [form, setForm] = useState(null)
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState(false)

  const profile = data?.profile
  const f = form || profile || {}
  const [cropInput, setCropInput] = useState('')

  const addCrop = () => {
    const c = cropInput.trim()
    if (!c || (f.preferredCrops || []).includes(c)) return
    setForm({ ...f, preferredCrops: [...(f.preferredCrops || []), c] })
    setCropInput('')
  }

  const save = async () => {
    setBusy(true)
    try {
      await buyerAPI.updateProfile(token, {
        company: f.company,
        businessType: f.businessType,
        location: f.location,
        deliveryLocations: (f.deliveryLocations || []).filter(Boolean),
        preferredCrops: (f.preferredCrops || []).filter(Boolean),
      })
      if (f.company && f.company !== user?.name) updateUser({ ...user, name: f.company })
      setSaved(true); setTimeout(() => setSaved(false), 2000)
      setForm(null); reload()
    } finally { setBusy(false) }
  }

  if (loading) return <Skeleton className="h-[420px] w-full" />
  if (error) return <ErrorCard onRetry={reload} />

  const input = 'w-full rounded-xl border border-ink/[0.1] bg-white/80 px-4 py-3 text-[0.86rem] text-ink placeholder:text-sage/50 focus:border-agri/50 focus:outline-none'
  const label = 'mb-1.5 block text-[0.66rem] font-medium uppercase tracking-[0.2em] text-charcoal'
  const tag = 'inline-flex items-center gap-1.5 rounded-full bg-lime-soft px-3 py-1 text-[0.66rem] font-medium text-agri'

  return (
    <>
      <PageHeader eyebrow="Company" title="Buyer Profile" desc="How your business appears to farmers when they sell.">
        {profile?.verified && <span className={`${tag} !px-5 !py-2.5`}><BadgeCheck className="h-3.5 w-3.5" strokeWidth={1.75} /> Verified buyer</span>}
      </PageHeader>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="p-6 md:p-7 lg:col-span-2">
          <p className="text-[0.9rem] font-semibold text-ink">Business details</p>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div>
              <label className={label}>Company name</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-sage" strokeWidth={1.5} />
                <input className={`${input} pl-11`} value={f.company || ''} onChange={(e) => setForm({ ...f, company: e.target.value })} />
              </div>
            </div>
            <div>
              <label className={label}>Business type</label>
              <select className={input} value={f.businessType || ''} onChange={(e) => setForm({ ...f, businessType: e.target.value })}>
                <option value="">Select…</option>
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={label}>Headquarter location</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-sage" strokeWidth={1.5} />
                <input className={`${input} pl-11`} value={f.location || user?.location || ''} onChange={(e) => setForm({ ...f, location: e.target.value })} />
              </div>
            </div>
            <div>
              <label className={label}>Delivery locations</label>
              <input
                className={input} placeholder="Comma-separated, e.g. Bengaluru, Mysore"
                value={(f.deliveryLocations || []).join(', ')}
                onChange={(e) => setForm({ ...f, deliveryLocations: e.target.value.split(',').map((x) => x.trim()).filter(Boolean) })}
              />
            </div>
          </div>

          <p className="mt-7 text-[0.9rem] font-semibold text-ink">Preferred crops</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {(f.preferredCrops || []).map((c) => (
              <button
                key={c} onClick={() => setForm({ ...f, preferredCrops: (f.preferredCrops || []).filter((x) => x !== c) })}
                className={`${tag} transition-colors hover:bg-lime`}
              >
                {c} ✕
              </button>
            ))}
          </div>
          <div className="mt-4 flex max-w-sm gap-2">
            <input className={input} value={cropInput} onChange={(e) => setCropInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCrop())} placeholder="Add a crop (e.g. Onion)…" />
            <button onClick={addCrop} className="shrink-0 rounded-xl border border-ink/15 px-4 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-ink transition-colors hover:border-agri/40 hover:text-agri">Add</button>
          </div>

          <div className="mt-8 flex items-center gap-4">
            <button onClick={save} disabled={busy} className="inline-flex items-center gap-2 rounded-full bg-agri px-7 py-3.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-ivory transition-colors hover:bg-agri-deep disabled:opacity-50">
              {busy ? 'Saving…' : 'Save changes'}
            </button>
            {saved && <span className="text-[0.76rem] font-medium text-agri">Saved ✓</span>}
          </div>
        </Card>

        <Card className="p-6 md:p-7">
          <p className="text-[0.9rem] font-semibold text-ink">Account</p>
          <div className="mt-5 space-y-4">
            {[
              { icon: Mail, k: 'Email', v: profile?.email },
              { icon: Phone, k: 'Phone', v: profile?.phone },
            ].map((r) => {
              const Icon = r.icon
              return (
                <div key={r.k} className="flex items-center gap-3.5 rounded-2xl bg-white/60 p-4">
                  <Icon className="h-4 w-4 text-agri" strokeWidth={1.5} />
                  <div className="min-w-0"><p className="text-[0.62rem] uppercase tracking-[0.18em] text-sage">{r.k}</p><p className="truncate text-[0.84rem] font-medium text-ink">{r.v}</p></div>
                </div>
              )
            })}
          </div>
          <p className="mt-5 text-[0.7rem] leading-relaxed text-sage">Verified buyers receive priority placement in farmer match rankings.</p>
        </Card>
      </div>
    </>
  )
}