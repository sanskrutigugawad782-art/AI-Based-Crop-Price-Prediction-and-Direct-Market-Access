import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { EASE } from '../../lib/motion'
import { BellRing, ArrowRightLeft, Brain, RotateCcw, Database, Gauge } from 'lucide-react'

const KEY = 'agriconnect_settings'

const DEFAULTS = {
  priceAlerts: true,
  dealOffers: true,
  advisoryDigest: false,
  previewFeatures: false,
  threshold: '5',
}

function load() {
  try {
    return { ...DEFAULTS, ...(JSON.parse(localStorage.getItem(KEY) || '{}')) }
  } catch {
    return DEFAULTS
  }
}

function Toggle({ on, onClick, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={onClick}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-300 disabled:opacity-40 ${on ? 'bg-agri' : 'bg-ink/[0.14]'}`}
    >
      <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-all duration-300 ${on ? 'left-6' : 'left-1'}`} />
    </button>
  )
}

function Row({ icon: Icon, title, desc, children }) {
  return (
    <div className="flex items-start justify-between gap-6 border-b border-ink/[0.06] py-6 last:border-0">
      <div className="flex items-start gap-4">
        <span className="mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-ink/[0.04]">
          <Icon className="h-[18px] w-[18px] text-agri" strokeWidth={1.6} />
        </span>
        <div>
          <p className="text-[0.92rem] font-medium text-ink">{title}</p>
          <p className="mt-1 max-w-[420px] text-[0.78rem] leading-relaxed text-smoke">{desc}</p>
        </div>
      </div>
      {children}
    </div>
  )
}

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const [prefs, setPrefs] = useState(load)
  const [hint, setHint] = useState(false)

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(prefs))
  }, [prefs])

  const set = (patch) => {
    setPrefs((p) => ({ ...p, ...patch }))
    setHint(true)
    clearTimeout(window.__acHintTimer)
    window.__acHintTimer = setTimeout(() => setHint(false), 2200)
  }

  const chipCls = (active) =>
    `rounded-full border px-4 py-2 text-[0.72rem] font-medium transition-all ${
      active ? 'border-agri bg-agri-deep text-lime' : 'border-ink/[0.1] bg-white/70 text-smoke hover:border-agri/30'
    }`

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: EASE }} className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="max-w-[640px]">
          <p className="u-eyebrow mb-5 text-sage">Preferences</p>
          <h1 className="u-display text-[clamp(1.9rem,3.2vw,3rem)] text-ink">Settings.</h1>
          <p className="mt-4 text-[0.95rem] leading-relaxed text-smoke">
            Tune the signals this account sends you. Preferences are saved on this device.
          </p>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6, ease: EASE }} className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-ink/[0.07] bg-white/80 px-7 md:px-9">
          <div className="flex items-center gap-2.5 py-6">
            <BellRing className="h-4 w-4 text-agri" strokeWidth={1.5} />
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-ink">Notifications</p>
          </div>

          <Row icon={BellRing} title="Price alerts" desc="A push when your tracked crops move past the set swing, plus the 90-day outlook read.">
            <Toggle on={prefs.priceAlerts} onClick={() => set({ priceAlerts: !prefs.priceAlerts })} />
          </Row>

          <Row icon={Gauge} title="Alert threshold" desc="How big a price move triggers an alert, in percent.">
            <div className="flex flex-wrap justify-end gap-2">
              {['2', '5', '10'].map((t) => (
                <button key={t} onClick={() => set({ threshold: t })} className={chipCls(prefs.threshold === t)}>{t}%</button>
              ))}
            </div>
          </Row>

          <Row icon={ArrowRightLeft} title="Marketplace deal offers" desc="Notify when a buyer posts fresh demand that matches the crops you grow.">
            <Toggle on={prefs.dealOffers} onClick={() => set({ dealOffers: !prefs.dealOffers })} />
          </Row>

          <Row icon={Brain} title="Weekly advisory digest" desc="A short monthly read from AI Advisor on what your score watches are doing.">
            <Toggle on={prefs.advisoryDigest} onClick={() => set({ advisoryDigest: !prefs.advisoryDigest })} />
          </Row>

          <div className="py-6">
            <button
              onClick={() => { setPrefs(load()); setHint(true); clearTimeout(window.__acHintTimer); window.__acHintTimer = setTimeout(() => setHint(false), 2200) }}
              className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-5 py-2.5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-sage transition-colors hover:border-agri/40 hover:text-agri"
            >
              <RotateCcw className="h-4 w-4" strokeWidth={1.5} /> Reset to defaults
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-ink/[0.07] bg-white/80 p-7">
            <div className="flex items-center gap-2.5">
              <Database className="h-4 w-4 text-agri" strokeWidth={1.5} />
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-ink">Region & account</p>
            </div>
            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between border-b border-ink/[0.06] pb-4">
                <p className="text-[0.88rem] text-ink">Market region</p>
                <span className="rounded-full bg-ink/[0.05] px-3.5 py-1.5 text-[0.7rem] font-medium text-charcoal">Karnataka</span>
              </div>
              <div className="flex items-center justify-between border-b border-ink/[0.06] pb-4">
                <p className="text-[0.88rem] text-ink">Account role</p>
                <span className="rounded-full bg-ink/[0.05] px-3.5 py-1.5 text-[0.7rem] font-medium text-charcoal capitalize">{user?.role}</span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[0.88rem] text-ink">Email</p>
                <span className="truncate text-[0.8rem] text-sage">{user?.email}</span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-wood/25 bg-wood/10 p-7">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-charcoal">Prefs saved here</p>
            <p className="mt-3 text-[0.8rem] leading-relaxed text-smoke">
              This demo stores notification preferences locally — a production build would sync them to your
              account and push via email or SMS.
            </p>
            <button onClick={logout} className="mt-5 rounded-full border border-ink/15 px-5 py-2.5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-sage transition-colors hover:border-red-300 hover:text-red-600">
              Sign out on this device
            </button>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: hint ? 1 : 0, y: hint ? 0 : 8 }}
        transition={{ duration: 0.25 }}
        className="pointer-events-none fixed bottom-24 left-1/2 z-[70] -translate-x-1/2 lg:bottom-10"
      >
        <div className={`rounded-full bg-agri-deep px-5 py-3 text-[0.72rem] font-medium text-lime shadow-xl transition-opacity ${hint ? 'opacity-100' : ''}`}>
          {hint ? 'Settings saved on this device' : ''}
        </div>
      </motion.div>
    </>
  )
}