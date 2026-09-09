import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'json-toolkit-history'
const MAX_ENTRIES = 20

export type HistoryEntry = {
  id: string
  mode: 'beautify' | 'minify'
  output: string
  timestamp: number
}

function loadInitial(): HistoryEntry[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : []
  } catch {
    return []
  }
}

export function useHistory() {
  const [entries, setEntries] = useState<HistoryEntry[]>(loadInitial)

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  }, [entries])

  const addEntry = useCallback((mode: HistoryEntry['mode'], output: string) => {
    setEntries((prev) => {
      const next: HistoryEntry = { id: crypto.randomUUID(), mode, output, timestamp: Date.now() }
      return [next, ...prev].slice(0, MAX_ENTRIES)
    })
  }, [])

  const clear = useCallback(() => setEntries([]), [])

  return { entries, addEntry, clear }
}
