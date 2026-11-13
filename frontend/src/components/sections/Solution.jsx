import { motion } from 'framer-motion'
import { Container, Eyebrow } from '../ui/primitives'
import { Brain, TrendingUp, Calculator, ArrowRightLeft } from 'lucide-react'
import { stagger, item, EASE } from '../../lib/motion'

const CAPABILITIES = [
  {
    num: '01',
    icon: Brain,
    title: 'Crop Intelligence',
    desc: 'Soil, weather, market, and demand data analyzed together to recommend exactly what to grow next.',
    tag: 'AI Advisor',
  },
  {
    num: '02',
    icon: TrendingUp,
    title: 'Price Prediction',
    desc: 'ML-powered forecasts showing expected price trajectories across 7, 30, and 90-day horizons.',
    tag: 'Forecasting',
  },
  {
    num: '03',
    icon: Calculator,
    title: 'Profit Planning',
    desc: 'Full cost modeling with real-time ROI, break-even, and what-if pricing on every crop.',
    tag: 'Economics',
  },
  {
    num: '04',
    icon: ArrowRightLeft,
    title: 'Direct Market Access',
    desc: 'AI-matched connections between verified farmers and buyers — no middlemen, better margins.',
    tag: 'Marketplace',
  },
]

export default function Solution() {
  return (
    <section id="solutions" className="bg-ivory-deep/50 py-[clamp(96px,14vw,190px)]">
      <Container>
        {/* Heading */}
        <div className="mb-[clamp(56px,8vw,96px)] flex flex-col justify-between gap-10 lg:flex-row lg:items-end">
          <div className="max-w-[680px]">
            <Eyebrow className="mb-8">The Solution</Eyebrow>
            <h2 className="u-display text-[clamp(2.4rem,4.4vw,4.3rem)] text-ink">
              One Platform.
              <span className="text-agri"> Better</span>
              <br />
              Agricultural Decisions.
            </h2>
          </div>
          <p className="max-w-[400px] text-[0.98rem] leading-relaxed text-smoke lg:pb-3">
            Four intelligence layers working together to turn uncertainty into
            profitable, confident decisions — before you plant a single seed.
          </p>
        </div>

        {/* Cards — thin borders, restrained shadow */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="grid gap-5 md:grid-cols-2 lg:grid-cols-4"
        >
          {CAPABILITIES.map((cap) => {
            const Icon = cap.icon
            return (
              <motion.article
                key={cap.num}
                variants={item}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="group relative flex flex-col border border-ink/[0.08] bg-ivory p-8 transition-colors duration-500 hover:border-agri/30"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[0.66rem] font-medium uppercase tracking-[0.24em] text-sage">
                    {cap.tag}
                  </span>
                  <span className="text-[1.6rem] font-[200] leading-none text-agri/25 transition-colors duration-500 group-hover:text-agri/50">
                    {cap.num}
                  </span>
                </div>

                <div className="mt-12 grid h-11 w-11 place-items-center text-agri">
                  <Icon className="h-[22px] w-[22px]" strokeWidth={1.4} />
                </div>

                <h3 className="mt-5 text-[0.95rem] font-semibold uppercase tracking-[0.1em] text-ink">
                  {cap.title}
                </h3>
                <p className="mt-3 text-[0.86rem] leading-relaxed text-smoke">{cap.desc}</p>

                <div className="mt-auto flex items-center gap-2 pt-8 text-[0.62rem] font-medium uppercase tracking-[0.24em] text-agri opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  <span>Discover</span>
                  <span className="h-px w-6 bg-agri" />
                </div>
              </motion.article>
            )
          })}
        </motion.div>
      </Container>
    </section>
  )
}