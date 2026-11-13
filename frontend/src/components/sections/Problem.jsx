import { motion } from 'framer-motion'
import { Container, Eyebrow } from '../ui/primitives'
import { EASE, stagger, item } from '../../lib/motion'

const PROBLEMS = [
  {
    num: '01',
    title: 'Price Uncertainty',
    text: 'Crop prices move unpredictably, making profitability nearly impossible to plan for.',
  },
  {
    num: '02',
    title: 'Limited Market Access',
    text: 'Farmers rarely see comparative prices across markets before deciding where to sell.',
  },
  {
    num: '03',
    title: 'High Production Risk',
    text: 'Choosing what to plant is guesswork without soil, weather, and demand intelligence.',
  },
  {
    num: '04',
    title: 'Dependence on Intermediaries',
    text: 'Middlemen capture a large share of the margin, leaving growers with a fraction of the value.',
  },
]

export default function Problem() {
  return (
    <section className="bg-ivory py-[clamp(96px,14vw,190px)]">
      <Container>
        <div className="grid gap-20 lg:grid-cols-[1.05fr_1fr] lg:gap-24">
          {/* LEFT — editorial statement */}
          <div className="lg:sticky lg:top-40 lg:self-start">
            <Eyebrow className="mb-8">The Problem</Eyebrow>
            <h2 className="u-display text-[clamp(2.4rem,4.4vw,4.3rem)] text-ink">
              Farmers
              <br />
              Have Data.
              <br />
              <span className="text-agri">They Need</span>
              <br />
              <span className="text-agri">Decisions.</span>
            </h2>
            <div className="u-rule mt-10 h-px w-20 bg-ink" />
            <p className="mt-9 max-w-[460px] text-[1.05rem] leading-relaxed text-smoke">
              Agriculture feeds the world, yet those who grow our food make
              critical decisions without reliable forecasts, market visibility,
              or direct access to the buyers who need their crops. AgriConnect
              changes that.
            </p>
          </div>

          {/* RIGHT — numbered list, no cards */}
          <motion.ol
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="space-y-0"
          >
            {PROBLEMS.map((p, i) => (
              <motion.li
                key={p.num}
                variants={item}
                className="group grid grid-cols-[auto_1fr] items-baseline gap-7 border-t border-ink/[0.09] py-9 transition-colors duration-300 hover:border-agri/40 lg:gap-10"
              >
                <span className="text-[0.7rem] font-medium uppercase tracking-[0.2em] text-sage">
                  {p.num}
                </span>
                <div>
                  <h3 className="text-[1.05rem] font-medium uppercase tracking-[0.12em] text-ink transition-colors duration-300">
                    {p.title}
                  </h3>
                  <p className="mt-2.5 max-w-[420px] text-[0.92rem] leading-relaxed text-smoke">
                    {p.text}
                  </p>
                </div>
              </motion.li>
            ))}
            <motion.div
              variants={item}
              className="h-px w-full bg-ink/[0.09]"
              aria-hidden
            />
          </motion.ol>
        </div>
      </Container>
    </section>
  )
}