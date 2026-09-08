import { useState } from 'react'
import { FormatterPanel } from './components/FormatterPanel'
import { Header, type Tab } from './components/Header'

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('formatter')

  return (
    <div className="flex min-h-screen flex-col bg-[#0b0b0d] font-mono text-gray-200">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      {activeTab === 'formatter' ? (
        <FormatterPanel />
      ) : (
        <div className="flex flex-1 items-center justify-center text-sm text-gray-600">Compare — coming soon</div>
      )}
    </div>
  )
}

export default App
