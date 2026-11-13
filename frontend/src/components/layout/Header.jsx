import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ArrowRight } from 'lucide-react'
import { Logo } from '../ui/Logo'
import Button from '../ui/Button'
import { EASE } from '../../lib/motion'
import { useAuth } from '../../context/AuthContext'
import { roleHome } from '../../utils/roles'

const NAV = [
  { label: 'About', href: '#about' },
  { label: 'Solutions', href: '#solutions' },
  { label: 'Technology', href: '#technology' },
  { label: 'Marketplace', href: '#marketplace' },
  { label: 'Contact', href: '#contact' },
]

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.header
      initial={{ opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: EASE }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-ivory/92 shadow-[0_1px_0_0_rgba(23,26,22,0.07)] backdrop-blur-xl'
          : 'bg-gradient-to-b from-ivory/80 to-transparent'
      }`}
    >
      <div className="mx-auto flex h-[78px] w-full max-w-[1340px] items-center justify-between px-6 md:px-12 lg:px-16">
        {/* Left — logo */}
        <Logo />

        {/* Center — navigation (desktop) */}
        <nav className="hidden items-center gap-11 lg:flex">
          {NAV.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="group relative text-[0.7rem] font-medium uppercase tracking-[0.22em] text-charcoal/80 transition-colors duration-300 hover:text-ink"
            >
              {item.label}
              <span className="absolute -bottom-2 left-0 h-[1.5px] w-0 bg-agri transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-full" />
            </a>
          ))}
        </nav>

        {/* Right — CTA + mobile toggle */}
        <div className="flex items-center gap-4">
          <div className="hidden lg:block">
            {user ? (
              <Button to={roleHome(user.role)} size="sm" variant="dark">
                My Dashboard
              </Button>
            ) : (
              <Button to="/register" size="sm" variant="dark">
                Get Started
              </Button>
            )}
          </div>
          <button
            className="grid h-11 w-11 place-items-center rounded-full border border-ink/10 bg-white/60 text-ink backdrop-blur-sm lg:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="overflow-hidden border-t border-ink/5 bg-ivory/95 backdrop-blur-xl lg:hidden"
          >
            <nav className="mx-auto flex w-full max-w-[1340px] flex-col gap-1 px-6 py-6 md:px-12">
              {NAV.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between rounded-xl px-4 py-3.5 text-[0.78rem] font-medium uppercase tracking-[0.22em] text-charcoal transition-colors hover:bg-lime-soft hover:text-ink"
                >
                  {item.label}
                  <ArrowRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" strokeWidth={1.5} />
                </a>
              ))}
              <div className="mt-5 px-4">
                {user ? (
                  <Button to={roleHome(user.role)} size="md" variant="dark" className="w-full justify-center">
                    My Dashboard
                  </Button>
                ) : (
                  <Button to="/register" size="md" variant="dark" className="w-full justify-center">
                    Get Started
                  </Button>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}