import { motion } from 'framer-motion'
import { EASE } from '../../lib/motion'
import { ArrowRight } from 'lucide-react'

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

export function ModulePlaceholder({ title, desc, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.55, ease: EASE }}
      className="flex min-h-[360px] flex-col items-center justify-center rounded-3xl border border-dashed border-ink/[0.15] bg-white/50 px-8 text-center"
    >
      <span className="grid h-16 w-16 place-items-center rounded-2xl bg-lime-soft">
        <span className="text-[1.6rem] font-[300] text-agri">3</span>
      </span>
      <p className="mt-7 text-[1.15rem] font-medium uppercase tracking-[0.14em] text-ink">{title}</p>
      <p className="mt-3 max-w-[400px] text-[0.88rem] leading-relaxed text-smoke">{desc}</p>
      {action && (
        <button className="group mt-8 inline-flex items-center gap-2 text-[0.74rem] font-semibold uppercase tracking-[0.2em] text-agri">
          {action}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={1.75} />
        </button>
      )}
    </motion.div>
  )
}