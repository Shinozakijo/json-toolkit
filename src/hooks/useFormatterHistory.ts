import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'json-toolkit-history-formatter'
const MAX_ENTRIES = 20

export type FormatterHistoryEntry = {
  id: string
  mode: 'beautify' | 'minify'
  output: string
  timestamp: number
}

function loadInitial(): FormatterHistoryEntry[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as FormatterHistoryEntry[]) : []
  } catch {
    return []
  }
}

export function useFormatterHistory() {
  const [entries, setEntries] = useState<FormatterHistoryEntry[]>(loadInitial)

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  }, [entries])

  const addEntry = useCallback((mode: FormatterHistoryEntry['mode'], output: string) => {
    setEntries((prev) => {
      const next: FormatterHistoryEntry = { id: crypto.randomUUID(), mode, output, timestamp: Date.now() }
      return [next, ...prev].slice(0, MAX_ENTRIES)
    })
  }, [])

  const clear = useCallback(() => setEntries([]), [])

  return { entries, addEntry, clear }
}
