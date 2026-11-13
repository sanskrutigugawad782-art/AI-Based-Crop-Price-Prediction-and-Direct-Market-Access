import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  to = '#',
  arrow = true,
  className = '',
  ...props
}) {
  const base =
    'group inline-flex items-center justify-center gap-2.5 rounded-full font-medium tracking-wide transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink'

  const variants = {
    primary:
      'bg-lime text-ink hover:bg-lime-soft hover:-translate-y-0.5 shadow-[0_10px_30px_-12px_rgba(31,58,42,0.35)]',
    dark: 'bg-ink text-ivory hover:bg-agri hover:-translate-y-0.5 shadow-[0_10px_30px_-12px_rgba(23,26,22,0.4)]',
    ghost:
      'border border-ink/20 text-ink hover:border-ink/50 hover:bg-ink/[0.03]',
    light:
      'bg-white/85 text-ink backdrop-blur-sm hover:bg-white hover:-translate-y-0.5 shadow-[0_10px_30px_-14px_rgba(23,26,22,0.3)]',
  }

  const sizes = {
    sm: 'px-5 py-2.5 text-[0.72rem] uppercase tracking-[0.14em]',
    md: 'px-8 py-4 text-[0.75rem] uppercase tracking-[0.16em]',
    lg: 'px-9 py-[1.15rem] text-[0.78rem] uppercase tracking-[0.16em]',
  }

  const isButton = typeof props.type === 'string'
  const isRoute = typeof to === 'string' && to.startsWith('/') && !isButton
  const Tag = isButton ? 'button' : isRoute ? Link : 'a'
  return (
    <Tag
      {...(isButton ? { type: props.type } : isRoute ? { to } : { href: to })}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}>
      {children}
      {!isButton && arrow && (
        <ArrowRight
          className="h-4 w-4 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1"
          strokeWidth={1.75}
        />
      )}
    </Tag>
  )
}