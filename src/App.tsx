import { useState } from 'react'
import { ComparePanel } from './components/ComparePanel'
import { FormatterPanel } from './components/FormatterPanel'
import { Header, type Tab } from './components/Header'
import { HistorySidebar } from './components/HistorySidebar'
import { useCompareHistory, type CompareHistoryEntry } from './hooks/useCompareHistory'
import { useFormatterHistory, type FormatterHistoryEntry } from './hooks/useFormatterHistory'
import { useTheme } from './hooks/useTheme'

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('formatter')
  const { theme, toggleTheme } = useTheme()
  const formatterHistory = useFormatterHistory()
  const compareHistory = useCompareHistory()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [restoreFormatterEntry, setRestoreFormatterEntry] = useState<FormatterHistoryEntry | null>(null)
  const [restoreCompareEntry, setRestoreCompareEntry] = useState<CompareHistoryEntry | null>(null)

  function handleTabChange(tab: Tab) {
    setActiveTab(tab)
    setRestoreFormatterEntry(null)
    setRestoreCompareEntry(null)
  }

  return (
    <div className="flex h-screen flex-col bg-white font-mono text-gray-900 dark:bg-[#0b0b0d] dark:text-gray-200">
      <Header activeTab={activeTab} onTabChange={handleTabChange} theme={theme} onToggleTheme={toggleTheme} />
      <div className="flex min-h-0 min-w-0 flex-1">
        {activeTab === 'formatter' ? (
          <HistorySidebar
            kind="formatter"
            entries={formatterHistory.entries}
            open={sidebarOpen}
            onToggle={() => setSidebarOpen((v) => !v)}
            onClear={formatterHistory.clear}
            onSelect={setRestoreFormatterEntry}
          />
        ) : (
          <HistorySidebar
            kind="compare"
            entries={compareHistory.entries}
            open={sidebarOpen}
            onToggle={() => setSidebarOpen((v) => !v)}
            onClear={compareHistory.clear}
            onSelect={setRestoreCompareEntry}
          />
        )}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          {activeTab === 'formatter' ? (
            <FormatterPanel onRecordHistory={formatterHistory.addEntry} restoreEntry={restoreFormatterEntry} />
          ) : (
            <ComparePanel onRecordHistory={compareHistory.addEntry} restoreEntry={restoreCompareEntry} />
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
