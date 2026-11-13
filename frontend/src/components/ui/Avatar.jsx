export default function Avatar({ initials, size = 40, className = '' }) {
  return (
    <span
      className={`inline-grid shrink-0 place-items-center rounded-full bg-agri font-medium uppercase text-lime ${
        size === 40 ? 'h-10 w-10 text-[0.82rem]' : size === 34 ? 'h-[34px] w-[34px] text-[0.7rem]' : `h-[${size}px] w-[${size}px]`
      } ${className}`}
    >
      {initials}
    </span>
  )
}