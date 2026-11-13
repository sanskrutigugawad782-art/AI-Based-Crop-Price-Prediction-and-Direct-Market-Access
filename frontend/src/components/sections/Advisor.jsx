import { motion } from 'framer-motion'
import { Container, Eyebrow, Rule } from '../ui/primitives'
import { Shield, TrendingUp, Droplets, Sun, MapPin } from 'lucide-react'
import advisorImg from '../../assets/tech-glass.jpg'
import CountUp from '../ui/CountUp'
import { stagger, item, EASE } from '../../lib/motion'

const SCORES = [
  { label: 'Soil Suitability', value: 92 },
  { label: 'Price Outlook', value: 84 },
  { label: 'Market Demand', value: 90 },
  { label: 'Weather Fit', value: 88 },
  { label: 'Water Match', value: 72 },
]

const FACTORS = [
  { icon: Shield, label: 'Risk', value: 'Medium' },
  { icon: TrendingUp, label: 'Trend', value: '+8.4%' },
  { icon: Sun, label: 'Weather', value: 'Favorable' },
  { icon: MapPin, label: 'Region', value: 'Bengaluru' },
]

function Bar({ label, value, delay }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-[0.74rem] font-medium uppercase tracking-[0.16em] text-charcoal">
          {label}
        </span>
        <span className="text-[0.82rem] font-semibold text-ink">{value}%</span>
      </div>
      <div className="mt-2.5 h-[4px] w-full overflow-hidden rounded-full bg-ink/[0.07]">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${value}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, delay: delay, ease: EASE }}
          className="h-full rounded-full bg-agri"
        />
      </div>
    </div>
  )
}

export default function Advisor() {
  return (
    <section
      id="technology"
      className="bg-ivory py-[clamp(96px,14vw,190px)]"
    >
      <Container>
        {/* Section intro */}
        <div className="mb-[clamp(48px,8vw,88px)] max-w-[640px]">
          <Eyebrow className="mb-8">AI Farm Advisor</Eyebrow>
          <h2 className="u-display text-[clamp(2.4rem,4.4vw,4.3rem)] text-ink">
            Your Best Opportunity.
            <span className="text-agri"> Computed.</span>
          </h2>
        </div>

        <div className="grid items-start gap-12 lg:grid-cols-[0.9fr_1fr] lg:gap-16">
          {/* LEFT — visual with recommendation hero card */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8, ease: EASE }}
            className="relative overflow-hidden bg-ivory-deep"
          >
            <img
              src={advisorImg}
              alt="Modern greenhouse with organized glass ceiling and growing plants"
              className="aspect-[4/3.2] w-full object-cover"
            />

            {/* Overlay card — large, premium */}
            <div className="absolute bottom-0 left-0 right-0 border-t border-white/30 bg-white/95 px-8 py-8 backdrop-blur-md sm:px-10">
              <p className="text-[0.62rem] font-medium uppercase tracking-[0.28em] text-sage">
                Recommended Crop
              </p>
              <div className="mt-4 flex items-end justify-between gap-6">
                <div>
                  <p className="text-[2.8rem] font-[300] leading-none uppercase text-ink">
                    Tomato
                  </p>
                  <p className="mt-3 text-[0.86rem] text-smoke">
                    Best match for your conditions and current market
                  </p>
                </div>
                <div className="grid h-[82px] w-[82px] shrink-0 place-items-center rounded-[18px] bg-agri text-center">
                  <CountUp to={91} suffix="%" className="text-[1.8rem] font-[300] leading-none text-lime" />
                  <span className="mt-0.5 text-[0.54rem] font-medium uppercase tracking-[0.12em] text-lime/80">
                    Suitability
                  </span>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-4 text-[0.78rem]">
                <div className="flex items-center gap-2.5">
                  <span className="text-sage">Expected Profit</span>
                  <span className="font-semibold text-ink">₹48,500 / acre</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-sage">Demand</span>
                  <span className="inline-flex rounded-full bg-lime-soft px-2.5 py-0.5 text-[0.66rem] font-semibold uppercase text-agri">
                    High
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* RIGHT — explanation + scores + factor chips */}
          <div className="mt-2 lg:mt-0">
            <div className="flex flex-wrap items-center gap-3">
              {FACTORS.map((f) => {
                const Icon = f.icon
                return (
                  <div
                    key={f.label}
                    className="flex items-center gap-2.5 border border-ink/[0.09] bg-ivory px-5 py-3"
                  >
                    <Icon className="h-[15px] w-[15px] text-agri" strokeWidth={1.5} />
                    <span className="text-[0.66rem] font-medium uppercase tracking-[0.18em] text-sage">
                      {f.label}
                    </span>
                    <span className="text-[0.84rem] font-medium text-ink">{f.value}</span>
                  </div>
                )
              })}
            </div>

            {/* Suitability scores */}
            <div className="mt-10 space-y-6">
              {SCORES.map((s, i) => (
                <Bar key={s.label} label={s.label} value={s.value} delay={0.15 * i} />
              ))}
            </div>

            <Rule className="mt-10" />

            {/* Human-readable explanation */}
            <div className="mt-10">
              <h3 className="mb-3 text-[0.74rem] font-semibold uppercase tracking-[0.22em] text-ink">
                Why this recommendation?
              </h3>
              <p className="max-w-[440px] text-[0.92rem] leading-relaxed text-smoke">
                Tomato is recommended because your soil and weather conditions
                are favorable, nearby market demand is strong, and the predicted
                price trend is positive over the next 30–90 days.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}