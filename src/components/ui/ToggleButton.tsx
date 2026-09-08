export function ToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-bold tracking-wide border transition-colors ${
        active
          ? 'bg-blue-600 border-blue-600 text-white'
          : 'border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-900 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-500 dark:hover:text-gray-200'
      }`}
    >
      {children}
    </button>
  )
}
