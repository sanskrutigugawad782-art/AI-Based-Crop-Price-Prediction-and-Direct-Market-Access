import { useState } from 'react'
import { motion } from 'framer-motion'
import { Container, Eyebrow } from '../ui/primitives'
import { TrendingUp, TrendingDown, Truck } from 'lucide-react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { stagger, item, EASE } from '../../lib/motion'

const SERIES = {
  '7D': [28.2, 29.1, 28.7, 29.8, 30.4, 30.9, 31.0],
  '30D': [24.2, 25.1, 24.8, 26.4, 27.2, 28.1, 27.8, 29.4, 30.1, 31.0],
  '90D': [20.5, 21.8, 22.4, 23.9, 24.2, 25.1, 24.8, 26.4, 27.2, 28.1, 27.8, 29.4, 30.1, 31.0],
  '1Y': [17.2, 18.0, 19.4, 23.1, 24.2, 23.6, 26.4, 27.2, 28.1, 27.8, 29.4, 30.1, 31.0, 29.6, 28.9, 30.3, 31.2, 31.0],
}

const FILTERS = ['7D', '30D', '90D', '1Y']

const MARKETS = [
  { market: 'Bengaluru APMC', price: 31.0, dist: '12 km', transport: 0.8, trend: +8.4, net: 30.2 },
  { market: 'Hoskote APMC', price: 28.5, dist: '31 km', transport: 2.1, trend: +4.2, net: 26.4 },
  { market: 'Devana Halli APMC', price: 32.4, dist: '48 km', transport: 7.5, trend: +5.6, net: 24.9 },
]

function useSeries(range) {
  const s = SERIES[range]
  return s.map((price, i) => {
    const unit = range === '1Y' ? 'M' : range === '30D' || range === '90D' ? 'W' : 'D'
    return { label: `${i + 1}${unit}`, price }
  })
}

export default function Market() {
  const [range, setRange] = useState('30D')

  return (
    <section className="bg-ivory-deep/50 py-[clamp(96px,14vw,190px)]">
      <Container>
        <div className="mb-[clamp(48px,8vw,88px)] flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div className="max-w-[680px]">
            <Eyebrow className="mb-8">Market Intelligence</Eyebrow>
            <h2 className="u-display text-[clamp(2.4rem,4.4vw,4.3rem)] text-ink">
              Know the Price.
              <span className="text-agri"> Sell at the Peak.</span>
            </h2>
          </div>
          <p className="max-w-[380px] text-[0.98rem] leading-relaxed text-smoke lg:pb-3">
            Live price trends across Karnataka's mandis — with the transport
            costs factored into every opportunity.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.35fr_1fr] lg:gap-12">
          {/* LEFT — chart */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8, ease: EASE }}
            className="border border-ink/[0.08] bg-ivory p-7 sm:p-9"
          >
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="text-[0.62rem] font-medium uppercase tracking-[0.28em] text-sage">
                  Tomato · Bengaluru APMC
                </p>
                <div className="mt-2 flex items-baseline gap-4">
                  <span className="text-[3.4rem] font-[300] leading-none text-ink">₹31</span>
                  <span className="text-[1rem] text-smoke">/ kg</span>
                  <span className="flex items-center gap-1.5 rounded-full bg-lime-soft px-3 py-1 text-[0.72rem] font-semibold text-agri">
                    <TrendingUp className="h-3.5 w-3.5" strokeWidth={2} />
                    +8.4% this week
                  </span>
                </div>
              </div>

              {/* Filters */}
              <div className="flex items-center rounded-full border border-ink/[0.1] bg-ivory p-1">
                {FILTERS.map((f) => (
                  <button
                    key={f}
                    onClick={() => setRange(f)}
                    className={`rounded-full px-5 py-2 text-[0.72rem] font-medium uppercase tracking-[0.14em] transition-all duration-300 ${
                      range === f
                        ? 'bg-agri text-lime'
                        : 'text-smoke hover:text-ink'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-9 h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={useSeries(range)} margin={{ top: 6, right: 6, left: -14, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(23,26,22,0.06)" vertical={false} />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#8A917F' }}
                    dy={8}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#8A917F' }}
                    domain={['dataMin - 2', 'dataMax + 2']}
                  />
                  <Tooltip
                    cursor={{ stroke: 'rgba(31,58,42,0.2)' }}
                    contentStyle={{
                      background: '#F5F3ED',
                      border: '1px solid rgba(23,26,22,0.08)',
                      borderRadius: 10,
                      fontSize: 12,
                      color: '#171A16',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#1F3A2A"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 4, fill: '#1F3A2A' }}
                    animationDuration={1200}
                    animationEasing="ease-out"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-5 text-[0.7rem] tracking-[0.04em] text-sage">
              Dashed line = forecast · Predictions are estimates, not guaranteed prices.
            </p>
          </motion.div>

          {/* RIGHT — market comparison with net opportunity */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="flex flex-col justify-between"
          >
            <div>
              <h3 className="mb-1 text-[0.74rem] font-semibold uppercase tracking-[0.22em] text-ink">
                Market Comparison
              </h3>
              <p className="mb-7 text-[0.84rem] text-smoke">
                Best selling opportunity, transport considered.
              </p>

              <div className="border-t border-ink/[0.08]">
                {MARKETS.map((m, i) => {
                  const Up = m.trend >= 0 ? TrendingUp : TrendingDown
                  const best = i === 0
                  return (
                    <motion.div
                      key={m.market}
                      variants={item}
                      className={`grid grid-cols-[1.2fr_auto] items-baseline gap-x-6 gap-y-1 border-b border-ink/[0.08] py-5 ${
                        best ? '' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`h-2 w-2 rounded-full ${best ? 'bg-agri' : 'bg-ink/[0.2]'}`}
                        />
                        <span className={`text-[0.9rem] ${best ? 'font-semibold text-ink' : 'text-charcoal'}`}>
                          {m.market}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[1.05rem] font-semibold text-ink">₹{m.net.toFixed(1)}</span>
                        <Up className="ml-1.5 inline h-3.5 w-3.5 text-agri" strokeWidth={2} />
                      </div>
                      <div className="col-start-1 flex items-center gap-2 text-[0.76rem] text-sage">
                        ₹{m.price}/kg · {m.dist}
                      </div>
                      <div className="col-start-2 text-right text-[0.76rem] text-sage">
                        ±{m.trend}%
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* Net opportunity explainer */}
            <div className="mt-8 border border-agri/15 bg-lime-soft/50 p-6">
              <div className="flex items-start gap-3.5">
                <Truck className="mt-0.5 h-[18px] w-[18px] text-agri" strokeWidth={1.5} />
                <div>
                  <p className="text-[0.74rem] font-semibold uppercase tracking-[0.16em] text-agri">
                    Net Opportunity
                  </p>
                  <p className="mt-2 text-[0.84rem] leading-relaxed text-charcoal/80">
                    Although Devana Halli pays ₹32.4/kg, the 48&nbsp;km haul costs
                    ₹7.5/kg — so Bengaluru APMC yields the best net return of
                    ₹30.2/kg.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  )
}