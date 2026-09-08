import { useMemo, useState } from 'react'
import { beautify, minify, validate } from '../lib/jsonFormatter'
import { Corner } from './ui/Corner'
import { ToggleButton } from './ui/ToggleButton'

const SAMPLE = '{\n  "name": "json-toolkit",\n  "version": 1,\n  "tags": ["fast", "local"],\n  "active": true\n}'

type Mode = 'beautify' | 'minify'

export function FormatterPanel() {
  const [content, setContent] = useState('')
  const [mode, setMode] = useState<Mode>('beautify')
  const [indent, setIndent] = useState(2)

  const result = useMemo(() => validate(content), [content])
  const stats = useMemo(() => {
    const lines = content.length === 0 ? 0 : content.split('\n').length
    const chars = content.length
    const bytes = new TextEncoder().encode(content).length
    return { lines, chars, bytes }
  }, [content])

  function applyBeautify() {
    try {
      setContent(beautify(content, indent))
      setMode('beautify')
    } catch {
      // invalid JSON — error panel below already explains why
    }
  }

  function applyMinify() {
    try {
      setContent(minify(content))
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

  function handleSample() {
    setContent(SAMPLE)
  }

  const errorLineText = result.error ? content.split('\n')[result.error.line - 1] ?? '' : ''

  return (
    <>
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
          <div className="flex items-center gap-2">
            <span className="text-[11px] tracking-widest text-gray-500">INDENT</span>
            <div className="flex">
              <ToggleButton active={indent === 2} onClick={() => setIndent(2)}>
                2
              </ToggleButton>
              <ToggleButton active={indent === 4} onClick={() => setIndent(4)}>
                4
              </ToggleButton>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
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
          <button
            onClick={handleSample}
            className="border border-gray-300 px-3 py-1.5 text-xs font-bold tracking-wide text-gray-500 hover:text-gray-900 dark:border-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Sample
          </button>
        </div>
      </div>

      <div className="relative m-4 flex-1 border border-gray-200 dark:border-gray-800">
        <Corner className="-left-1.5 -top-1.5" />
        <Corner className="-right-1.5 -top-1.5" />
        <Corner className="-bottom-1.5 -left-1.5" />
        <Corner className="-bottom-1.5 -right-1.5" />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          spellCheck={false}
          placeholder="Paste or type JSON here..."
          className="h-full min-h-[320px] w-full resize-none bg-transparent p-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-gray-200 dark:placeholder:text-gray-600"
        />
      </div>

      <div className="flex items-center justify-between border-y border-gray-200 px-6 py-2 text-xs text-gray-500 dark:border-gray-800">
        <span>
          {stats.lines} lines &nbsp; {stats.chars} chars &nbsp; {stats.bytes} B
        </span>
        <span className={result.valid ? 'text-green-500' : 'text-red-500'}>
          {content.length === 0 ? '' : result.valid ? 'valid JSON' : 'invalid JSON'}
        </span>
      </div>

      {content.length > 0 && result.error && (
        <div className="m-4 border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/20">
          <div className="flex items-baseline gap-3">
            <span className="text-sm font-bold tracking-wide text-red-600 dark:text-red-400">PARSE ERROR</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              line {result.error.line}, column {result.error.column}
            </span>
          </div>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{result.error.message}</p>
          <pre className="mt-3 overflow-x-auto bg-black/5 p-3 text-sm text-gray-700 dark:bg-black/30 dark:text-gray-300">
            <code>
              {String(result.error.line).padStart(2, ' ')} | {errorLineText}
              {'\n'}
              {'   |'} {' '.repeat(result.error.column - 1)}^
            </code>
          </pre>
        </div>
      )}
    </>
  )
}
