import type { Theme } from '../hooks/useTheme'
import { ToggleButton } from './ui/ToggleButton'

export type Tab = 'formatter' | 'compare'

export function Header({
  activeTab,
  onTabChange,
  theme,
  onToggleTheme,
}: {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
  theme: Theme
  onToggleTheme: () => void
}) {
  return (
    <header className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
      <div className="flex items-baseline gap-3">
        <h1 className="text-lg font-bold tracking-wide">JSON TOOLKIT</h1>
        <span className="text-[11px] tracking-widest text-gray-500">CLIENT-SIDE · NO UPLOAD</span>
      </div>
      <div className="flex items-center gap-2">
        <ToggleButton active={theme === 'dark'} onClick={onToggleTheme}>
          {theme === 'dark' ? 'DARK' : 'LIGHT'}
        </ToggleButton>
        <div className="flex">
          <ToggleButton active={activeTab === 'formatter'} onClick={() => onTabChange('formatter')}>
            FORMATTER
          </ToggleButton>
          <ToggleButton active={activeTab === 'compare'} onClick={() => onTabChange('compare')}>
            COMPARE
          </ToggleButton>
        </div>
      </div>
    </header>
  )
}
