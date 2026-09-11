import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'json-toolkit-history-compare'
const MAX_ENTRIES = 20

export type CompareHistorySummary = {
  added: number
  removed: number
  changed: number
  unchanged: number
}

export type CompareHistoryEntry = {
  id: string
  a: string
  b: string
  summary: CompareHistorySummary
  timestamp: number
}

function loadInitial(): CompareHistoryEntry[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as CompareHistoryEntry[]) : []
  } catch {
    return []
  }
}

export function useCompareHistory() {
  const [entries, setEntries] = useState<CompareHistoryEntry[]>(loadInitial)

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  }, [entries])

  const addEntry = useCallback((a: string, b: string, summary: CompareHistorySummary) => {
    setEntries((prev) => {
      const next: CompareHistoryEntry = { id: crypto.randomUUID(), a, b, summary, timestamp: Date.now() }
      return [next, ...prev].slice(0, MAX_ENTRIES)
    })
  }, [])

  const clear = useCallback(() => setEntries([]), [])

  return { entries, addEntry, clear }
}
