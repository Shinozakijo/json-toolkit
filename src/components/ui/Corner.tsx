export function Corner({ className }: { className: string }) {
  return (
    <span className={`pointer-events-none absolute select-none text-gray-400 dark:text-gray-600 ${className}`}>
      +
    </span>
  )
}
