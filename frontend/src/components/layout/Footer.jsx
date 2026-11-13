import { Container } from '../ui/primitives'
import { Logo } from '../ui/Logo'

const COLUMNS = [
  {
    title: 'Platform',
    links: ['About', 'Solutions', 'Technology', 'Contact'],
  },
  {
    title: 'For Farmers',
    links: ['AI Advisor', 'Profit Planner', 'Market Intelligence', 'Marketplace'],
  },
  {
    title: 'For Buyers',
    links: ['Requirements', 'Matching', 'Offers', 'Orders'],
  },
]

export default function Footer() {
  return (
    <footer className="border-t border-ink/[0.07] bg-ivory">
      <Container>
        <div className="grid gap-14 py-20 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-7 max-w-[300px] text-[0.9rem] leading-relaxed text-smoke">
              AI-powered intelligence for better farming decisions.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="text-[0.66rem] font-semibold uppercase tracking-[0.28em] text-agri">
                {col.title}
              </p>
              <ul className="mt-6 space-y-3.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-[0.86rem] text-charcoal/80 transition-colors duration-200 hover:text-agri"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-ink/[0.07] py-7 md:flex-row">
          <p className="text-[0.7rem] tracking-[0.08em] text-sage">
            © {new Date().getFullYear()} AgriConnect · Bengaluru, Karnataka
          </p>
          <p className="text-[0.7rem] tracking-[0.08em] text-sage">
            Intelligence for better farming
          </p>
        </div>
      </Container>
    </footer>
  )
}