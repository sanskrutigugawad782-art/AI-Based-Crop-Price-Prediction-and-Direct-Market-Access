import { motion } from 'framer-motion'
import { Container, Eyebrow } from '../ui/primitives'
import { ArrowDown, Sparkles } from 'lucide-react'
import CountUp from '../ui/CountUp'
import { stagger, item, EASE } from '../../lib/motion'

const FARMER = {
  tag: 'Farmer',
  name: 'Ravi Kumar',
  rows: [
    ['Crop', 'Tomato · Grade A'],
    ['Quantity', '2,000 KG'],
    ['Price', '₹30 / kg'],
    ['Location', '12 km · Bengaluru'],
  ],
}

const BUYER = {
  tag: 'Buyer',
  name: 'ABC Foods',
  rows: [
    ['Crop', 'Tomato · Grade A'],
    ['Quantity', '5,000 KG required'],
    ['Price', '₹28 – 32 / kg'],
    ['Deadline', '20 October'],
  ],
}

const MATCH_FACTORS = [
  ['Crop', '100%'],
  ['Quantity', '90%'],
  ['Quality', '100%'],
  ['Location', '85%'],
  ['Price', '95%'],
  ['Availability', '90%'],
]

export default function Marketplace() {
  return (
    <section
      id="marketplace"
      className="bg-white/80 py-[clamp(96px,14vw,190px)]"
    >
      <Container>
        <div className="grid items-start gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          {/* LEFT — headline + matching factors */}
          <div className="lg:sticky lg:top-40 lg:self-start">
            <Eyebrow className="mb-8">Direct Marketplace</Eyebrow>
            <h2 className="u-display text-[clamp(2.4rem,4.4vw,4.3rem)] text-ink">
              Farmers &amp; Buyers.
              <span className="text-agri"> Directly</span>
              <br />
              Connected.
            </h2>
            <div className="u-rule mt-10 h-px w-20 bg-ink" />
            <p className="mt-9 max-w-[440px] text-[1.0rem] leading-relaxed text-smoke">
              No middlemen. Our matching engine pairs the right crop with the
              right buyer — transparently scoring price, quality, quantity, and
              location.
            </p>

            {/* Explainable matching score */}
            <div className="mt-12">
              <h3 className="mb-6 text-[0.74rem] font-semibold uppercase tracking-[0.22em] text-ink">
                How the match scores
              </h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-3">
                {MATCH_FACTORS.map(([label, value]) => (
                  <div key={label} className="flex items-baseline justify-between gap-2 border-b border-ink/[0.08] pb-2.5">
                    <span className="text-[0.7rem] uppercase tracking-[0.14em] text-sage">
                      {label}
                    </span>
                    <span className="text-[0.82rem] font-semibold text-ink">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT — the connection visual */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="relative"
          >
            {/* Farmer */}
            <motion.div
              variants={item}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="border border-ink/[0.08] bg-white/70 p-8 backdrop-blur-[2px] sm:p-9"
            >
              <p className="text-[0.62rem] font-medium uppercase tracking-[0.28em] text-agri">
                {FARMER.tag}
              </p>
              <p className="mt-1.5 text-[1.25rem] font-medium tracking-[0.02em] text-ink">
                {FARMER.name}
              </p>
              <dl className="mt-6 space-y-3">
                {FARMER.rows.map(([k, v]) => (
                  <div key={k} className="flex items-baseline justify-between gap-4 border-b border-ink/[0.06] pb-3">
                    <dt className="text-[0.72rem] uppercase tracking-[0.14em] text-sage">{k}</dt>
                    <dd className="text-[0.9rem] font-medium text-ink">{v}</dd>
                  </div>
                ))}
              </dl>
            </motion.div>

            {/* Connector */}
            <motion.div variants={item} className="my-6 flex items-center gap-4 px-2">
              <div className="h-px flex-1 bg-ink/[0.12]" />
              <div className="flex flex-col items-center leading-none">
                <span className="text-[0.6rem] font-medium uppercase tracking-[0.24em] text-sage">
                  AI Match
                </span>
                <ArrowDown className="my-2 h-4 w-4 text-agri" strokeWidth={1.5} />
                <CountUp to={94} suffix="%" className="text-[2rem] font-[300] leading-none text-agri" />
              </div>
              <div className="h-px flex-1 bg-ink/[0.12]" />
            </motion.div>

            {/* AI engine line */}
            <motion.div variants={item} className="-mt-2 mb-6 flex items-center justify-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-agri" strokeWidth={1.5} />
              <p className="text-[0.66rem] font-medium uppercase tracking-[0.2em] text-sage">
                Matched by crop · quality · quantity · location · price
              </p>
            </motion.div>

            {/* Buyer */}
            <motion.div
              variants={item}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="border border-ink/[0.08] bg-white/70 p-8 backdrop-blur-[2px] sm:p-9"
            >
              <p className="text-[0.62rem] font-medium uppercase tracking-[0.28em] text-agri">
                {BUYER.tag}
              </p>
              <p className="mt-1.5 text-[1.25rem] font-medium tracking-[0.02em] text-ink">
                {BUYER.name}
              </p>
              <dl className="mt-6 space-y-3">
                {BUYER.rows.map(([k, v]) => (
                  <div key={k} className="flex items-baseline justify-between gap-4 border-b border-ink/[0.06] pb-3">
                    <dt className="text-[0.72rem] uppercase tracking-[0.14em] text-sage">{k}</dt>
                    <dd className="text-[0.9rem] font-medium text-ink">{v}</dd>
                  </div>
                ))}
              </dl>
            </motion.div>
          </motion.div>
        </div>
      </Container>
    </section>
  )
}