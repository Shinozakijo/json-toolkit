import { useEffect, useMemo, useState } from 'react'
import { beautify, fixDoubledQuotes, minify, validate } from '../lib/jsonFormatter'
import type { HistoryEntry } from '../hooks/useHistory'
import { JsonEditor } from './ui/JsonEditor'
import { ToggleButton } from './ui/ToggleButton'

type Mode = 'beautify' | 'minify'

export function FormatterPanel({
  onRecordHistory,
  restoreEntry,
}: {
  onRecordHistory?: (mode: Mode, output: string) => void
  restoreEntry?: HistoryEntry | null
}) {
  const [content, setContent] = useState('')
  const [mode, setMode] = useState<Mode>('beautify')

  useEffect(() => {
    if (restoreEntry) {
      setContent(restoreEntry.output)
      setMode(restoreEntry.mode)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restoreEntry?.id])

  const result = useMemo(() => validate(content), [content])
  const doubledQuotesFix = useMemo(
    () => (result.valid ? null : fixDoubledQuotes(content)),
    [content, result.valid],
  )
  const stats = useMemo(() => {
    const lines = content.length === 0 ? 0 : content.split('\n').length
    const chars = content.length
    const bytes = new TextEncoder().encode(content).length
    return { lines, chars, bytes }
  }, [content])
  function applyBeautify() {
    try {
      const output = beautify(content)
      setContent(output)
      setMode('beautify')
      onRecordHistory?.('beautify', output)
    } catch {
      // invalid JSON — error panel below already explains why
    }
  }

  function applyMinify() {
    try {
      const output = minify(content)
      setContent(output)
      setMode('minify')
    } catch {
      // invalid JSON — error panel below already explains why
    }
  }

  function handleCopy() {
    void navigator.clipboard.writeText(content)
  }

  function handleClear() {
    setContent('')
  }

  function handleFixQuotes() {
    if (doubledQuotesFix) setContent(doubledQuotesFix)
  }

  const errorLineText = result.error ? content.split('\n')[result.error.line - 1] ?? '' : ''

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-3 dark:border-gray-800">
        <div className="flex items-center gap-6">
          <div className="flex">
            <ToggleButton active={mode === 'beautify'} onClick={applyBeautify}>
              BEAUTIFY
            </ToggleButton>
            <ToggleButton active={mode === 'minify'} onClick={applyMinify}>
              MINIFY
            </ToggleButton>
          </div>
        </div>
        <div className="flex gap-2">
          {doubledQuotesFix && (
            <button
              onClick={handleFixQuotes}
              className="border border-amber-400 px-3 py-1.5 text-xs font-bold tracking-wide text-amber-600 hover:text-amber-900 dark:border-amber-700 dark:text-amber-400 dark:hover:text-amber-200"
            >
              Fix Quotes
            </button>
          )}
          <button
            onClick={handleCopy}
            className="border border-gray-300 px-3 py-1.5 text-xs font-bold tracking-wide text-gray-500 hover:text-gray-900 dark:border-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Copy
          </button>
          <button
            onClick={handleClear}
            className="border border-gray-300 px-3 py-1.5 text-xs font-bold tracking-wide text-gray-500 hover:text-gray-900 dark:border-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Clear
          </button>
        </div>
      </div>

      <JsonEditor value={content} onChange={setContent} />

      <div className="flex items-center justify-between border-y border-gray-200 px-6 py-2 text-xs text-gray-500 dark:border-gray-800">
        <span>
          {stats.lines} lines &nbsp; {stats.chars} chars &nbsp; {stats.bytes} B
        </span>
        <span className={result.valid ? 'text-green-500' : 'text-red-500'}>
          {content.length === 0 ? '' : result.valid ? 'valid JSON' : 'invalid JSON'}
        </span>
      </div>

      {content.length > 0 && result.error && (
        <div className="m-4 min-w-0 overflow-hidden border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/20">
          <div className="flex items-baseline gap-3">
            <span className="text-sm font-bold tracking-wide text-red-600 dark:text-red-400">PARSE ERROR</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              line {result.error.line}, column {result.error.column}
            </span>
          </div>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{result.error.message}</p>
          <pre className="scrollbar-thin mt-3 overflow-x-auto bg-black/5 p-3 text-sm text-gray-700 dark:bg-black/30 dark:text-gray-300">
            <code>
              {String(result.error.line).padStart(2, ' ')} | {errorLineText}
              {'\n'}
              {'   |'} {' '.repeat(result.error.column - 1)}^
            </code>
          </pre>
        </div>
      )}
    </div>
  )
}
