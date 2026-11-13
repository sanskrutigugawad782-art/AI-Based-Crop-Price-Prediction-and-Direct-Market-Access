export { Reveal } from '../../lib/motion.jsx'

export function Container({ children, className = '', as: Tag = 'div' }) {
  return (
    <Tag className={`mx-auto w-full max-w-[1200px] px-6 md:px-10 ${className}`}>
      {children}
    </Tag>
  )
}

export function Eyebrow({ children, className = '' }) {
  return <span className={`u-eyebrow block ${className}`}>{children}</span>
}

export function Rule({ className = '' }) {
  return <div className={`u-rule h-px w-16 ${className}`} />
}