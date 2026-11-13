import { Leaf } from 'lucide-react'

export function Logo({ className = '', wordmark = true }) {
  return (
    <a
      href="#"
      className={`group inline-flex items-center gap-3 ${className}`}
      aria-label="AgriConnect home"
    >
      <span className="grid h-10 w-10 place-items-center rounded-[12px] bg-agri text-lime transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-0.5">
        <Leaf className="h-[19px] w-[19px]" strokeWidth={1.6} />
      </span>
      {wordmark && (
        <span className="flex flex-col leading-none">
          <span className="text-[0.92rem] font-semibold uppercase tracking-[0.24em] text-ink">
            Agri
            <span className="text-agri">Connect</span>
          </span>
          <span className="mt-1.5 text-[0.56rem] font-medium uppercase tracking-[0.3em] text-sage">
            Intelligence for farming
          </span>
        </span>
      )}
    </a>
  )
}