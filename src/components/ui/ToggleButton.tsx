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
          : 'border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-500'
      }`}
    >
      {children}
    </button>
  )
}
