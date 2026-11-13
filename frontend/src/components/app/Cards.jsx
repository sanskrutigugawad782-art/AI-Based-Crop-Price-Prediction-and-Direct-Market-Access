import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { EASE } from '../../lib/motion'
import { ArrowRight, AlertTriangle } from 'lucide-react'
import { inr } from '../../services/api'

export function PageHeader({ eyebrow, title, accent = null, desc, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: EASE }}
      className="mb-9 flex flex-col justify-between gap-6 md:flex-row md:items-end"
    >
      <div className="max-w-[620px]">
        {eyebrow && <p className="u-eyebrow mb-5 text-sage">{eyebrow}</p>}
        <h1 className="u-display text-[clamp(1.9rem,3.2vw,3rem)] text-ink">
          {title} {accent && <span className="text-agri">{accent}</span>}
        </h1>
        {desc && <p className="mt-4 text-[0.95rem] leading-relaxed text-smoke">{desc}</p>}
      </div>
      {children}
    </motion.div>
  )
}

export function StatCard({ label, value, sub, icon: Icon, accent = 'bg-lime-soft text-agri' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="rounded-3xl border border-ink/[0.07] bg-white/80 p-6"
    >
      <div className="flex items-center justify-between">
        <p className="text-[0.64rem] font-medium uppercase tracking-[0.2em] text-sage">{label}</p>
        {Icon && <span className={`grid h-9 w-9 place-items-center rounded-xl ${accent}`}><Icon className="h-4 w-4" strokeWidth={1.6} /></span>}
      </div>
      <p className="u-display mt-4 text-[2rem] text-ink">{value}</p>
      {sub && <p className="mt-1.5 text-[0.74rem] text-smoke">{sub}</p>}
    </motion.div>
  )
}

export function Card({ title, sub, action, children, className = '', delay = 0.12 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.55, ease: EASE }}
      className={`rounded-3xl border border-ink/[0.07] bg-white/80 ${className}`}
    >
      {(title || action) && (
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-ink/[0.06] px-6 py-5 md:px-7">
          <div>
            {title && <p className="text-[0.9rem] font-semibold text-ink">{title}</p>}
            {sub && <p className="mt-1 text-[0.74rem] text-smoke">{sub}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </motion.div>
  )
}

const STATUS_STYLES = {
  active:     'bg-lime-soft text-agri',
  accepted:   'bg-lime-soft text-agri',
  available:  'bg-lime-soft text-agri',
  operational:'bg-lime-soft text-agri',
  healthy:    'bg-lime-soft text-agri',
  sent:       'bg-ink/[0.05] text-charcoal',
  negotiating:'bg-wood/25 text-charcoal',
  pending:    'bg-wood/25 text-charcoal',
  open:       'bg-wood/25 text-charcoal',
  fulfilled:  'bg-agri text-ivory',
  completed:  'bg-agri text-ivory',
  resolved:   'bg-agri text-ivory',
  delivered:  'bg-agri text-ivory',
  degraded:   'bg-wood/25 text-charcoal',
  error:      'bg-red-50 text-red-700',
  flagged:    'bg-red-50 text-red-700',
  suspended:  'bg-red-50 text-red-700',
  inactive:   'bg-ink/[0.05] text-sage',
}

export function Tag({ status }) {
  const key = String((status || 'active').toLowerCase())
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.1em] ${STATUS_STYLES[key] || 'bg-ink/[0.05] text-sage'}`}>
      {status}
    </span>
  )
}

export function Meter({ label, value, accent = 'bg-lime' }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 truncate text-[0.74rem] text-smoke">{label}</span>
      <div className="h-[6px] flex-1 overflow-hidden rounded-full bg-ink/[0.06]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: EASE, delay: 0.2 }}
          className={`h-full rounded-full ${accent}`}
        />
      </div>
      <span className="w-10 text-right text-[0.72rem] font-semibold text-ink">{value}</span>
    </div>
  )
}

export function NothingYet({ icon: Icon, title, desc, actionTo, actionText }) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-3xl border border-dashed border-ink/[0.15] bg-white/50 px-8 text-center">
      {Icon && <Icon className="h-7 w-7 text-sage" strokeWidth={1.4} />}
      <p className="mt-5 text-[1.05rem] font-medium uppercase tracking-[0.14em] text-ink">{title}</p>
      {desc && <p className="mt-3 max-w-[380px] text-[0.86rem] text-smoke">{desc}</p>}
      {actionTo && (
        <Link to={actionTo} className="group mt-8 inline-flex items-center gap-2 text-[0.74rem] font-semibold uppercase tracking-[0.2em] text-agri">
          {actionText}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={1.75} />
        </Link>
      )}
    </div>
  )
}

export function ErrorCard({ onRetry }) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-3xl border border-ink/[0.08] bg-white/60 px-8 text-center">
      <AlertTriangle className="h-7 w-7 text-wood" strokeWidth={1.4} />
      <p className="mt-5 text-[1rem] font-medium uppercase tracking-[0.14em] text-ink">Couldn't load this data</p>
      <p className="mt-2 max-w-[380px] text-[0.84rem] text-smoke">Check that the API is running on port 8080, then try again.</p>
      <button onClick={onRetry} className="mt-6 rounded-full border border-ink/15 px-6 py-3 text-[0.7rem] font-medium uppercase tracking-[0.18em] text-ink transition-all hover:border-agri/40 hover:text-agri">
        Retry
      </button>
    </div>
  )
}

export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-2xl bg-ink/[0.05] ${className}`} />
}

export function RowViz({ rows }) {
  return (
    <div className="divide-y divide-ink/[0.06]">
      {rows.map((r, i) => (
        <div key={i} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 md:px-7">
          <div className="min-w-0">
            <p className="truncate text-[0.88rem] font-medium text-ink">{r.primary}</p>
            {r.secondary && <p className="mt-0.5 text-[0.72rem] text-sage">{r.secondary}</p>}
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {r.meta && <span className="text-[0.76rem] text-smoke">{r.meta}</span>}
            {r.value && <span className="text-[0.86rem] font-semibold text-ink">{r.value}</span>}
            {r.tag}
          </div>
        </div>
      ))}
    </div>
  )
}

export { inr }