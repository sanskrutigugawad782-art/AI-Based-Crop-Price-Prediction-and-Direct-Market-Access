import { Link } from 'react-router-dom'
import { AlertTriangle, RotateCcw, ArrowRight } from 'lucide-react'

export function SkeletonBlock({ className = '' }) {
  return <div className={`animate-pulse rounded-2xl bg-ink/[0.05] ${className}`} />
}

export function ErrorPanel({ onRetry, compact = false }) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-3xl border border-ink/[0.08] bg-white/60 px-8 text-center ${compact ? 'min-h-[180px]' : 'min-h-[220px]'}`}>
      <AlertTriangle className="h-7 w-7 text-wood" strokeWidth={1.4} />
      <p className="mt-5 text-[1rem] font-medium uppercase tracking-[0.14em] text-ink">Couldn't load this data</p>
      <p className="mt-2 max-w-[380px] text-[0.84rem] text-smoke">Check that the API is running on port 8080, then try again.</p>
      <button
        onClick={onRetry}
        className="group mt-7 inline-flex items-center gap-2 rounded-full border border-ink/15 px-6 py-3 text-[0.7rem] font-medium uppercase tracking-[0.18em] text-ink transition-all hover:border-agri/40 hover:text-agri"
      >
        <RotateCcw className="h-4 w-4 transition-transform duration-500 group-hover:-rotate-90" strokeWidth={1.5} />
        Retry
      </button>
    </div>
  )
}

export function EmptyState({ icon: Icon, title, desc, actionTo, actionText }) {
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