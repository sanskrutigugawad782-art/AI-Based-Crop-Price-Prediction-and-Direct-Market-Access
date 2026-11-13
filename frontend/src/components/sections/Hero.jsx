import { motion } from 'framer-motion'
import { Container } from '../ui/primitives'
import Button from '../ui/Button'
import { EASE } from '../../lib/motion'
import heroImg from '../../assets/hero-hills.jpg'

const line = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.35 + i * 0.14, duration: 0.9, ease: EASE },
  }),
}

export default function Hero() {
  return (
    <section
      id="about"
      className="relative flex min-h-[100dvh] w-full items-center overflow-hidden bg-ivory"
    >
      {/* Cinematic background — slow subtle scale */}
      <motion.div
        initial={{ scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 2.4, ease: EASE }}
        className="absolute inset-0"
      >
        <img
          src={heroImg}
          alt="Modern farm buildings nestled in a rolling green valley under a wide blue sky"
          className="h-full w-full object-cover"
          style={{ objectPosition: '62% 14%' }}
        />
      </motion.div>

      {/* Ultra-light depth gradient — kept away from the type, no heavy overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-ink/[0.18]"
        aria-hidden
      />

      {/* Content — right-aligned, seated in the upper sky band where the
          architecture meets the horizon */}
      <Container className="relative z-10 pt-[26vh]">
        <motion.div
          initial="hidden"
          animate="visible"
          className="ml-auto flex max-w-[680px] flex-col items-start xl:mr-16"
        >
          <motion.span
            variants={line}
            custom={0}
            className="mb-7 inline-block border border-ink/15 bg-white/60 px-4 py-1.5 text-[0.64rem] font-medium uppercase tracking-[0.3em] text-ink/70 backdrop-blur-sm"
          >
            AI-Powered Agricultural Intelligence
          </motion.span>

          {/* Main display heading — large, thin, editorial, dark charcoal */}
          <h1 className="u-display text-[clamp(3.1rem,6.8vw,7rem)] text-ink">
            <motion.span variants={line} custom={1} className="block">
              Smarter
            </motion.span>
            <motion.span variants={line} custom={2} className="block">
              Farming.
            </motion.span>
            <motion.span variants={line} custom={3} className="block">
              Better
            </motion.span>
            <motion.span variants={line} custom={4} className="block">
              Decisions.
            </motion.span>
          </h1>

          <motion.p
            variants={line}
            custom={5}
            className="mt-9 max-w-[470px] text-[1.02rem] leading-relaxed text-charcoal/80"
          >
            Predict crop prices, discover profitable crops, understand market
            opportunities, and connect directly with buyers — all in one
            intelligent platform.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={line}
            custom={6}
            className="mt-11 flex flex-col gap-4 sm:flex-row sm:items-center"
          >
            <Button to="#solutions" size="lg" variant="primary">
              Explore AgriConnect
            </Button>
            <Button to="#technology" size="lg" variant="ghost" arrow={false}>
              See How It Works
            </Button>
          </motion.div>
        </motion.div>
      </Container>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 1 }}
        className="absolute bottom-9 left-8 hidden items-center gap-4 md:flex"
      >
        <div className="h-16 w-px bg-ink/20" />
        <span className="text-[0.6rem] font-medium uppercase tracking-[0.3em] text-ink/50">
          Scroll
        </span>
      </motion.div>
    </section>
  )
}