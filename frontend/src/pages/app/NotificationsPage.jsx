import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ErrorPanel, SkeletonBlock, EmptyState } from '../../components/app/Status'
import useApi from '../../hooks/useApi'
import { useAuth } from '../../context/AuthContext'
import { notificationsAPI } from '../../services/api'
import { EASE } from '../../lib/motion'
import { ArrowRight, BellRing, Handshake, TrendingUp, Brain, Layers, Sparkles, ArrowLeftRight, Package, ShieldCheck, Flag } from 'lucide-react'

const ICONS = {
  deal:     { icon: Handshake, cls: 'bg-lime-soft text-agri' },
  price:    { icon: TrendingUp, cls: 'bg-ink/[0.05] text-ink' },
  advisory: { icon: Brain, cls: 'bg-agri text-ivory' },
  market:   { icon: Layers, cls: 'bg-wood/25 text-charcoal' },
  match:    { icon: Sparkles, cls: 'bg-lime-soft text-agri' },
  offer:    { icon: ArrowLeftRight, cls: 'bg-ink/[0.05] text-ink' },
  counter:  { icon: ArrowLeftRight, cls: 'bg-wood/25 text-charcoal' },
  order:    { icon: Package, cls: 'bg-agri text-ivory' },
  requirement: { icon: Layers, cls: 'bg-wood/25 text-charcoal' },
  system:   { icon: ShieldCheck, cls: 'bg-ink/[0.05] text-ink' },
  moderation: { icon: Flag, cls: 'bg-red-50 text-red-700' },
}

function timeAgo(ts) {
  if (!ts) return ''
  const t = new Date((ts || '').replace(' ', 'T') + 'Z').getTime()
  const mins = Math.max(1, Math.round((Date.now() - t) / 60000))
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.round(hrs / 24)
  if (days < 30) return `${days}d ago`
  return new Date(t).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export default function NotificationsPage() {
  const { token, user } = useAuth()
  const { data, loading, error, reload } = useApi('/notifications')
  const [busy, setBusy] = useState(false)

  const items = data?.items || []
  const unread = data?.unread || 0

  const ctaFor = (cta) => {
    if (!cta) return cta
    if (user?.role === 'farmer' && cta.startsWith('/app/')) return `/app/farmer${cta.slice(4)}`
    return cta
  }

  const markAll = async () => {
    if (busy) return
    setBusy(true)
    try {
      await notificationsAPI.read(token)
      reload()
    } finally {
      setBusy(false)
    }
  }

  const markOne = async (id) => {
    await notificationsAPI.read(token, [id])
    reload()
  }

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: EASE }} className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="max-w-[640px]">
          <p className="u-eyebrow mb-5 text-sage">Inbox</p>
          <h1 className="u-display text-[clamp(1.9rem,3.2vw,3rem)] text-ink">Notifications.</h1>
          <p className="mt-4 text-[0.95rem] leading-relaxed text-smoke">
            A live feed of what matters in your workspace — deals, prices, matches and platform updates.
          </p>
        </div>
        {unread > 0 && (
          <button
            onClick={markAll} disabled={busy}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-agri px-6 py-3.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-ivory transition-colors hover:bg-agri-deep disabled:opacity-50"
          >
            <BellRing className="h-4 w-4" strokeWidth={1.75} /> Mark all read
          </button>
        )}
      </motion.div>

      {unread > 0 && !loading && (
        <p className="mb-6 text-[0.74rem] font-medium text-agri">{unread} unread {unread === 1 ? 'update' : 'updates'} · marked from new messages, not stored per-interaction</p>
      )}

      {loading && <SkeletonBlock className="h-[420px] w-full" />}
      {error && <ErrorPanel onRetry={reload} />}

      {!loading && !error && items.length === 0 && (
        <EmptyState
          title="Nothing here yet"
          desc="Alerts from the market and your deals will show up here."
        />
      )}

      {!loading && !error && items.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6, ease: EASE }} className="overflow-hidden rounded-3xl border border-ink/[0.07] bg-white/80">
          {items.map((n) => {
            const meta = ICONS[n.kind] || ICONS.advisory
            const Icon = meta.icon
            return (
              <div key={n.id} className={`group flex items-start gap-4 border-b border-ink/[0.06] px-6 py-6 transition-colors last:border-0 hover:bg-ivory/60 md:px-8 ${n.read ? '' : 'bg-lime-soft/40'}`}>
                <span className={`mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${meta.cls}`}>
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.6} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <p className="text-[0.92rem] font-medium text-ink">{n.title}</p>
                    <span className="text-[0.66rem] text-sage">{timeAgo(n.created_at)}</span>
                    {!n.read && <span className="h-2 w-2 rounded-full bg-agri" title="Unread" />}
                  </div>
                  <p className="mt-1.5 text-[0.82rem] leading-relaxed text-smoke">{n.body}</p>
                  {n.cta && (
                    <Link to={ctaFor(n.cta)} onClick={() => !n.read && markOne(n.id)} className="mt-3 inline-flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-agri transition-colors hover:text-agri-deep">
                      View
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={1.75} />
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </motion.div>
      )}
    </>
  )
}