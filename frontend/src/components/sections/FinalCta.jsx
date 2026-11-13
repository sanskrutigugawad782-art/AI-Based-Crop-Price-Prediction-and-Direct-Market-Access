import { motion } from 'framer-motion'
import { Container } from '../ui/primitives'
import Button from '../ui/Button'
import { EASE } from '../../lib/motion'

export default function FinalCta() {
  return (
    <section
      id="contact"
      className="relative overflow-hidden bg-agri-deep py-[clamp(100px,14vw,200px)]"
    >
      {/* subtle radial light */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_100%_at_50%_120%,rgba(200,219,166,0.18),transparent_60%)]"
        aria-hidden
      />

      <Container className="relative z-10">
        <div className="mx-auto flex max-w-[840px] flex-col items-center text-center">
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: EASE }}
            className="text-[0.66rem] font-medium uppercase tracking-[0.34em] text-lime-soft/70"
          >
            Begin today
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.12, duration: 0.85, ease: EASE }}
            className="u-display mt-8 text-[clamp(2.6rem,5.4vw,5.4rem)] text-ivory"
          >
            Make the Next
            <br />
            Farming Decision
            <br />
            <span className="text-lime">a Smarter One.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.22, duration: 0.75, ease: EASE }}
            className="mt-9 max-w-[460px] text-[1rem] leading-relaxed text-ivory/70"
          >
            Join farmers and buyers building a more transparent, profitable
            agricultural economy.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.32, duration: 0.75, ease: EASE }}
            className="mt-12 flex flex-col items-center gap-4 sm:flex-row"
          >
            <Button to="/register" size="lg" variant="primary">
              Get Started
            </Button>
            <Button
              to="#about"
              size="lg"
              arrow={false}
              className="!border-white/25 !text-ivory hover:!border-white/50 hover:!bg-white/5"
            >
              See How It Works
            </Button>
          </motion.div>
        </div>
      </Container>
    </section>
  )
}