import { useState } from 'react'
import { FormatterPanel } from './components/FormatterPanel'
import { Header, type Tab } from './components/Header'
import { HistorySidebar } from './components/HistorySidebar'
import { useHistory, type HistoryEntry } from './hooks/useHistory'
import { useTheme } from './hooks/useTheme'

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('formatter')
  const { theme, toggleTheme } = useTheme()
  const { entries, addEntry, clear } = useHistory()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [restoreEntry, setRestoreEntry] = useState<HistoryEntry | null>(null)

  return (
    <div className="flex h-screen flex-col bg-white font-mono text-gray-900 dark:bg-[#0b0b0d] dark:text-gray-200">
      <Header activeTab={activeTab} onTabChange={setActiveTab} theme={theme} onToggleTheme={toggleTheme} />
      <div className="flex min-h-0 min-w-0 flex-1">
        <HistorySidebar
          entries={entries}
          open={sidebarOpen}
          onToggle={() => setSidebarOpen((v) => !v)}
          onClear={clear}
          onSelect={setRestoreEntry}
        />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          {activeTab === 'formatter' ? (
            <FormatterPanel onRecordHistory={addEntry} restoreEntry={restoreEntry} />
          ) : (
            <div className="flex flex-1 items-center justify-center text-sm text-gray-400 dark:text-gray-600">
              Compare — coming soon
            </div>
          )}
        </div>
      </div>
      <footer className="border-t border-gray-200 px-6 py-2 text-center text-[11px] tracking-wide text-gray-400 dark:border-gray-800 dark:text-gray-600">
        Everything runs in this tab. Nothing is sent anywhere.
      </footer>
    </div>
  )
}

export default App
