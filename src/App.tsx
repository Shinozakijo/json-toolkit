import { useState } from 'react'
import { FormatterPanel } from './components/FormatterPanel'
import { Header, type Tab } from './components/Header'
import { useTheme } from './hooks/useTheme'

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('formatter')
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="flex min-h-screen flex-col bg-white font-mono text-gray-900 dark:bg-[#0b0b0d] dark:text-gray-200">
      <Header activeTab={activeTab} onTabChange={setActiveTab} theme={theme} onToggleTheme={toggleTheme} />
      {activeTab === 'formatter' ? (
        <FormatterPanel />
      ) : (
        <div className="flex flex-1 items-center justify-center text-sm text-gray-400 dark:text-gray-600">
          Compare — coming soon
        </div>
      )}
    </div>
  )
}

export default App
