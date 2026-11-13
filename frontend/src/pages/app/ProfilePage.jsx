import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { authAPI } from '../../services/api'
import { EASE } from '../../lib/motion'
import Avatar from '../../components/ui/Avatar'
import { ArrowRight, Mail, Phone, MapPin, CalendarDays, ShieldCheck, BadgeCheck, PenLine } from 'lucide-react'

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-4 border-b border-ink/[0.06] py-5 last:border-0">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-ink/[0.04]">
        <Icon className="h-[18px] w-[18px] text-agri" strokeWidth={1.6} />
      </span>
      <div className="min-w-0">
        <p className="text-[0.62rem] uppercase tracking-[0.16em] text-sage">{label}</p>
        <p className="mt-1 truncate text-[0.95rem] text-ink">{value || 'Not set'}</p>
      </div>
    </div>
  )
}

function formatJoined(ts) {
  if (!ts) return 'Recently'
  try {
    return new Date((ts || '').replace(' ', 'T') + 'Z').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
  } catch {
    return 'Recently'
  }
}

function EditForm({ user, onSaved, onCancel }) {
  const { token, updateUser } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [location, setLocation] = useState(user?.location || '')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    if (busy) return
    setBusy(true); setErr(null)
    try {
      const { user: next } = await authAPI.updateProfile(token, { name, phone, location })
      updateUser(next)
      onSaved()
    } catch (e2) {
      setErr(e2.error || 'Could not save — check the API is running.')
      setBusy(false)
    }
  }

  const inputCls = "mt-3 w-full rounded-2xl border border-ink/[0.08] bg-white px-4 py-3.5 text-[0.95rem] text-ink outline-none transition-colors placeholder:text-sage/60 focus:border-agri/40"

  return (
    <form onSubmit={submit} className="rounded-3xl border border-ink/[0.07] bg-white/80 p-7 md:p-9">
      <div className="flex items-center justify-between gap-4">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-ink">Account details</p>
        <button type="button" onClick={onCancel} className="text-[0.66rem] uppercase tracking-[0.14em] text-sage hover:text-ink">Cancel</button>
      </div>

      <div className="mt-7 grid gap-7 md:grid-cols-2">
        <div>
          <p className="text-[0.68rem] uppercase tracking-[0.16em] text-ink">Full name</p>
          <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Anil Kumar" />
        </div>
        <div>
          <p className="text-[0.68rem] uppercase tracking-[0.16em] text-ink">Phone</p>
          <input className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" />
        </div>
        <div className="md:col-span-2">
          <p className="text-[0.68rem] uppercase tracking-[0.16em] text-ink">Location</p>
          <input className={inputCls} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Mysuru, Karnataka" />
        </div>
      </div>

      {err && <p className="mt-6 rounded-2xl border border-wood/30 bg-wood/10 px-4 py-3 text-[0.8rem] text-charcoal">{err}</p>}

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button
          type="submit" disabled={busy}
          className="group inline-flex items-center gap-2 rounded-full bg-agri px-8 py-4 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-ivory transition-colors hover:bg-agri-deep disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy ? 'Saving…' : 'Save changes'}
          {!busy && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />}
        </button>
        <p className="text-[0.62rem] text-sage">Email is fixed once the account is created.</p>
      </div>
    </form>
  )
}

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const [view, setView] = useState('summary')
  const [saved, setSaved] = useState(false)

  const savedNow = () => { setSaved(true); setView('summary') }

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: EASE }} className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="max-w-[640px]">
          <p className="u-eyebrow mb-5 text-sage">Account</p>
          <h1 className="u-display text-[clamp(1.9rem,3.2vw,3rem)] text-ink">Your <span className="text-agri">profile.</span></h1>
          <p className="mt-4 text-[0.95rem] leading-relaxed text-smoke">
            Identity and contact details for the network, plus how you signed up.
          </p>
        </div>
        {view === 'summary' && (
          <button onClick={() => { setSaved(false); setView('form') }} className="inline-flex items-center justify-center gap-2 rounded-full border border-ink/15 px-6 py-3.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-ink transition-colors hover:border-agri/40 hover:text-agri">
            <PenLine className="h-4 w-4" strokeWidth={1.75} /> Edit profile
          </button>
        )}
      </motion.div>

      {saved && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center gap-3 rounded-3xl border border-agri/20 bg-lime-soft px-6 py-4">
          <BadgeCheck className="h-5 w-5 text-agri" strokeWidth={2} />
          <p className="text-[0.84rem] font-medium text-agri">Profile updated — this flows through the whole network.</p>
        </motion.div>
      )}

      {view === 'summary' && (
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6, ease: EASE }} className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative overflow-hidden rounded-3xl bg-agri-deep p-8 text-ivory md:p-10">
            <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-agri/40 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-14 -left-14 h-48 w-48 rounded-full bg-lime/10 blur-3xl" />
            <div className="relative flex items-center gap-5">
              <div className="rounded-full bg-ivory/10 p-1.5">
                <Avatar initials={user?.initials || 'AC'} size={72} />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <p className="u-display text-[clamp(1.5rem,3vw,2.2rem)] leading-none text-ivory">{user?.name}</p>
                  <ShieldCheck className="h-5 w-5 text-lime" strokeWidth={1.5} />
                </div>
                <p className="mt-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-lime">{user?.role} account</p>
              </div>
            </div>
            <div className="relative mt-8 flex flex-wrap gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-ivory/10 px-4 py-2 text-[0.68rem] font-medium text-ivory/90">
                <BadgeCheck className="h-3.5 w-3.5" strokeWidth={1.75} /> Verified demo account
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-ivory/10 px-4 py-2 text-[0.68rem] font-medium text-ivory/90">
                <CalendarDays className="h-3.5 w-3.5" strokeWidth={1.75} /> Joined {formatJoined(user?.createdAt)}
              </span>
              {user?.location && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-ivory/10 px-4 py-2 text-[0.68rem] font-medium text-ivory/90">
                  <MapPin className="h-3.5 w-3.5" strokeWidth={1.75} /> {user?.location}
                </span>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-ink/[0.07] bg-white/80 px-7 py-4 md:px-8">
            <DetailRow icon={Mail} label="Email" value={user?.email} />
            <DetailRow icon={Phone} label="Phone" value={user?.phone} />
            <DetailRow icon={MapPin} label="Location" value={user?.location} />
            <DetailRow icon={ShieldCheck} label="Role" value={user?.role === 'farmer' ? 'Farmer' : user?.role} />
            <div className="flex items-center gap-3 border-t border-ink/[0.06] pt-5 pb-2">
              <button onClick={logout} className="rounded-full border border-ink/15 px-5 py-2.5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-sage transition-colors hover:border-red-300 hover:text-red-600">
                Sign out
              </button>
              <p className="text-[0.62rem] text-sage">Clears this device. Your data stays on the farm service.</p>
            </div>
          </div>
        </motion.div>
      )}

      {view === 'form' && (
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6, ease: EASE }}>
          <EditForm user={user} onSaved={savedNow} onCancel={() => setView('summary')} />
        </motion.div>
      )}
    </>
  )
}