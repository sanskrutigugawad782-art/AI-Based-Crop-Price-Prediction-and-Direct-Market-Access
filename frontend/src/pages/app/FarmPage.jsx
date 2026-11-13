import { useState } from 'react'
import { motion } from 'framer-motion'
import { ErrorPanel, SkeletonBlock } from '../../components/app/Status'
import useApi from '../../hooks/useApi'
import { useAuth } from '../../context/AuthContext'
import { farmAPI, inr0 } from '../../services/api'
import { EASE } from '../../lib/motion'
import { ArrowRight, MapPin, Droplets, Layers, Sprout, CheckCircle2, TrendingUp, TrendingDown, PenLine } from 'lucide-react'

const SOILS = ['Red soil', 'Black soil', 'Laterite', 'Sandy', 'Alluvial']
const WATERS = ['Low', 'Moderate', 'High']
const CROPS = ['Groundnut', 'Cotton', 'Maize', 'Ragi', 'Rice', 'Wheat']

function Field({ label, hint, children }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-[0.68rem] uppercase tracking-[0.16em] text-ink">{label}</p>
        {hint && <p className="text-[0.6rem] text-sage">{hint}</p>}
      </div>
      {children}
    </div>
  )
}

function ChipRow({ options, selected, onToggle }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {options.map((o) => {
        const on = selected.includes(o)
        return (
          <button
            key={o}
            type="button"
            onClick={() => onToggle(o)}
            className={`rounded-full border px-4 py-2 text-[0.72rem] font-medium transition-all ${
              on ? 'border-agri bg-agri-deep text-lime' : 'border-ink/[0.1] bg-white/70 text-smoke hover:border-agri/30'
            }`}
          >{o}</button>
        )
      })}
    </div>
  )
}

function FarmForm({ initial, onSaved, onCancel }) {
  const { token } = useAuth()
  const [farmSize, setFarmSize] = useState(String(initial.farmSize || ''))
  const [soil, setSoil] = useState(initial.soilType || '')
  const [water, setWater] = useState(initial.water || '')
  const [district, setDistrict] = useState(initial.district || '')
  const [crops, setCrops] = useState(initial.crops || [])
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)

  const toggleCrop = (c) => setCrops((prev) => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])
  const valid = Number(farmSize) > 0 && soil && water && crops.length > 0

  const submit = async (e) => {
    e.preventDefault()
    if (!valid || busy) return
    setBusy(true); setErr(null)
    try {
      await farmAPI.update(token, { farmSize: Number(farmSize), soilType: soil, water, district, crops })
      onSaved()
    } catch (e2) {
      setErr(e2.error || 'Could not save — check the API is running.')
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="rounded-3xl border border-ink/[0.07] bg-white/80 p-7 md:p-9">
      <div className="flex items-center justify-between gap-4">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-ink">Farm identity</p>
        {onCancel && <button type="button" onClick={onCancel} className="text-[0.66rem] uppercase tracking-[0.14em] text-sage hover:text-ink">Cancel</button>}
      </div>

      <div className="mt-7 grid gap-7 md:grid-cols-2">
        <Field label="Farm size" hint="acres">
          <input
            type="number" min="0.5" max="500" step="0.5" value={farmSize}
            onChange={(e) => setFarmSize(e.target.value)} placeholder="e.g. 6"
            className="mt-3 w-full rounded-2xl border border-ink/[0.08] bg-white px-4 py-3.5 text-[0.95rem] text-ink outline-none transition-colors placeholder:text-sage/60 focus:border-agri/40"
          />
        </Field>

        <Field label="Water availability">
          <ChipRow options={WATERS} selected={[water]} onToggle={(w) => setWater(water === w ? '' : w)} />
        </Field>

        <Field label="Soil type">
          <ChipRow options={SOILS} selected={[soil]} onToggle={(s) => setSoil(soil === s ? '' : s)} />
        </Field>

        <Field label="Home district" hint="Karnataka">
          <input
            type="text" value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="e.g. Mysuru"
            className="mt-3 w-full rounded-2xl border border-ink/[0.08] bg-white px-4 py-3.5 text-[0.95rem] text-ink outline-none transition-colors placeholder:text-sage/60 focus:border-agri/40"
          />
        </Field>
      </div>

      <div className="mt-8">
        <Field label="Crops you grow" hint="choose all that apply" />
        <ChipRow options={CROPS} selected={crops} onToggle={toggleCrop} />
      </div>

      {err && <p className="mt-6 rounded-2xl border border-wood/30 bg-wood/10 px-4 py-3 text-[0.8rem] text-charcoal">{err}</p>}

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button
          type="submit" disabled={!valid || busy}
          className="group inline-flex items-center gap-2 rounded-full bg-agri px-8 py-4 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-ivory transition-colors hover:bg-agri-deep disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy ? 'Saving…' : 'Save farm profile'}
          {!busy && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />}
        </button>
        <p className="text-[0.62rem] text-sage">Your crops and water setup tune what the advisor recommends.</p>
      </div>
    </form>
  )
}

function Summary({ profile, snap }) {
  const keyFor = new Map(CROPS.map((c, i) => [c, c === 'Ragi' ? 'Ragi (Finger Millet)' : c]))
  const cropStats = (profile.crops || []).map((c) => {
    const fk = keyFor.get(c) || c
    const com = snap?.commodities?.find((x) => x.key === fk)
    return { crop: c, current: com?.current, growth: com?.growthPct }
  }).filter((x) => x.current != null)

  return (
    <>
      <div className="relative overflow-hidden rounded-3xl bg-agri-deep p-8 text-ivory md:p-10">
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-agri/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-14 -left-14 h-48 w-48 rounded-full bg-lime/10 blur-3xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="u-eyebrow text-lime">Farm identity</p>
            <div className="mt-5 flex items-end gap-4">
              <p className="u-display text-[clamp(3rem,6vw,4.6rem)] text-ivory">{profile.farmSize}</p>
              <p className="pb-3 text-[0.8rem] uppercase tracking-[0.18em] text-ivory/60">acres</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {[profile.soilType, profile.water].filter(Boolean).map((c) => (
              <span key={c} className="rounded-full bg-ivory/10 px-4 py-2 text-[0.68rem] font-medium text-ivory/90">{c}</span>
            ))}
            {profile.district && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-ivory/10 px-4 py-2 text-[0.68rem] font-medium text-ivory/90">
                <MapPin className="h-3.5 w-3.5" strokeWidth={1.75} />{profile.district}
              </span>
            )}
          </div>
        </div>
        <div className="relative mt-8 h-px bg-ivory/15" />
        <div className="relative mt-7 flex flex-wrap gap-2">
          <span className="text-[0.62rem] uppercase tracking-[0.18em] text-ivory/50">Growing:</span>
          {(profile.crops || []).map((c) => (
            <span key={c} className="rounded-full bg-lime/15 px-3.5 py-1.5 text-[0.68rem] font-medium text-lime">{c}</span>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-ink/[0.07] bg-white/80 p-7 md:p-8">
          <div className="flex items-center gap-2.5">
            <Sprout className="h-4 w-4 text-agri" strokeWidth={1.5} />
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-ink">Monitored crops</p>
          </div>
          <p className="mt-4 text-[0.82rem] leading-relaxed text-smoke">Current mandi read for your tracked crops, pulled live from the forecast model.</p>
          <div className="mt-5 space-y-4">
            {cropStats.map((c) => (
              <div key={c.crop} className="flex items-center justify-between border-b border-ink/[0.06] pb-3 last:border-0 last:pb-0">
                <span className="text-[0.88rem] font-[300] text-ink">{c.crop}</span>
                <span className="flex items-center gap-3">
                  <span className="text-[0.82rem] text-smoke">₹{inr0(c.current)}/q</span>
                  <span className={`inline-flex items-center gap-1 text-[0.7rem] font-semibold ${c.growth >= 0 ? 'text-agri' : 'text-sage'}`}>
                    {c.growth >= 0 ? <TrendingUp className="h-3.5 w-3.5" strokeWidth={2} /> : <TrendingDown className="h-3.5 w-3.5" strokeWidth={2} />}
                    {c.growth >= 0 ? '+' : ''}{c.growth}%
                  </span>
                </span>
              </div>
            ))}
            {!cropStats.length && <p className="text-[0.8rem] text-sage">No tracked crops yet — edit your profile to add some.</p>}
          </div>
        </div>

        <div className="flex flex-col rounded-3xl border border-ink/[0.07] bg-white/80 p-7 md:p-8">
          <div className="flex items-center gap-2.5">
            <Layers className="h-4 w-4 text-agri" strokeWidth={1.5} />
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-ink">Inputs & water</p>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-ink/[0.04] p-5">
              <Droplets className="h-4 w-4 text-agri" strokeWidth={1.5} />
              <p className="mt-3 text-[0.62rem] uppercase tracking-[0.14em] text-sage">Water</p>
              <p className="mt-1 text-[1.1rem] font-[300] text-ink">{profile.water}</p>
            </div>
            <div className="rounded-2xl bg-ink/[0.04] p-5">
              <Layers className="h-4 w-4 text-agri" strokeWidth={1.5} />
              <p className="mt-3 text-[0.62rem] uppercase tracking-[0.14em] text-sage">Soil</p>
              <p className="mt-1 text-[1.1rem] font-[300] text-ink">{profile.soilType}</p>
            </div>
          </div>
          <p className="mt-auto pt-6 text-[0.7rem] leading-relaxed text-sage">
            Keep inputs current — the planner and advisor weight your water and crop mix when they model a season.
          </p>
        </div>
      </div>
    </>
  )
}

export default function FarmPage() {
  const { data, loading, error, reload } = useApi('/farm/profile')
  const { data: snap } = useApi('/market/snapshot')
  const [view, setView] = useState('summary')
  const [saved, setSaved] = useState(false)

  const profile = data?.profile || {}
  const hasProfile = data?.hasProfile

  const editNow = () => { setSaved(false); setView('form') }

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: EASE }} className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="max-w-[640px]">
          <p className="u-eyebrow mb-5 text-sage">My Farm</p>
          <h1 className="u-display text-[clamp(1.9rem,3.2vw,3rem)] text-ink">Farm <span className="text-agri">profile.</span></h1>
          <p className="mt-4 text-[0.95rem] leading-relaxed text-smoke">
            Your land, water and crop mix — the inputs that tune every recommendation.
          </p>
        </div>
        {hasProfile && !saved && (
          <button onClick={editNow} className="inline-flex items-center justify-center gap-2 rounded-full border border-ink/15 px-6 py-3.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-ink transition-colors hover:border-agri/40 hover:text-agri">
            <PenLine className="h-4 w-4" strokeWidth={1.75} /> Edit profile
          </button>
        )}
      </motion.div>

      {saved && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center gap-3 rounded-3xl border border-agri/20 bg-lime-soft px-6 py-4">
          <CheckCircle2 className="h-5 w-5 text-agri" strokeWidth={2} />
          <p className="text-[0.84rem] font-medium text-agri">Farm profile saved — the advisor will use this crop and water mix.</p>
        </motion.div>
      )}

      {loading && <SkeletonBlock className="h-[380px] w-full" />}
      {error && <ErrorPanel onRetry={reload} />}

      {data && hasProfile && view === 'summary' && (
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6, ease: EASE }}>
          <Summary profile={profile} snap={snap} />
        </motion.div>
      )}

      {(view === 'form' || (data && !hasProfile)) && (
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6, ease: EASE }}>
          {!hasProfile && (
            <div className="mb-6 rounded-3xl border border-agri/20 bg-agri-deep p-8 text-ivory">
              <p className="u-eyebrow text-lime">Welcome to your farm</p>
              <p className="mt-3 max-w-[620px] text-[0.92rem] leading-relaxed text-ivory/85">
                Tell us about your land in under a minute — then the model can ground its recommendations in your real water and crop situation.
              </p>
            </div>
          )}
          <FarmForm
            initial={hasProfile ? profile : {}}
            onCancel={hasProfile ? () => setView('summary') : null}
            onSaved={() => { setSaved(true); setView('summary'); reload() }}
          />
        </motion.div>
      )}
    </>
  )
}