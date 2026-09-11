import { useEffect, useState } from 'react'
import { diffJson } from '../lib/jsonDiff'
import type { DiffEntry, DiffType } from '../lib/jsonDiff.types'
import { prepareForCompare } from '../lib/jsonFormatter'
import type { CompareHistoryEntry, CompareHistorySummary } from '../hooks/useCompareHistory'
import { JsonEditor } from './ui/JsonEditor'
import { ToggleButton } from './ui/ToggleButton'

type SideStatus = { valid: true } | { valid: false; line: number }
type Filter = 'all' | DiffType

export function ComparePanel({
  onRecordHistory,
  restoreEntry,
}: {
  onRecordHistory?: (a: string, b: string, summary: CompareHistorySummary) => void
  restoreEntry?: CompareHistoryEntry | null
} = {}) {
  const [rawA, setRawA] = useState('')
  const [rawB, setRawB] = useState('')
  const [statusA, setStatusA] = useState<SideStatus | null>(null)
  const [statusB, setStatusB] = useState<SideStatus | null>(null)
  const [diffEntries, setDiffEntries] = useState<DiffEntry[] | null>(null)
  const [filter, setFilter] = useState<Filter>('all')

  useEffect(() => {
    if (restoreEntry) {
      setRawA(restoreEntry.a)
      setRawB(restoreEntry.b)
      runCompare(restoreEntry.a, restoreEntry.b, { record: false })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restoreEntry?.id])

  function handleCompare() {
    runCompare(rawA, rawB, { record: true })
  }

  function runCompare(inputA: string, inputB: string, { record }: { record: boolean }) {
    const resultA = prepareForCompare(inputA)
    const resultB = prepareForCompare(inputB)

    setRawA(resultA.text)
    setRawB(resultB.text)
    setStatusA(resultA.valid ? { valid: true } : { valid: false, line: resultA.line })
    setStatusB(resultB.valid ? { valid: true } : { valid: false, line: resultB.line })
    setFilter('all')

    if (resultA.valid && resultB.valid) {
      const nextDiffEntries = diffJson(resultA.parsed, resultB.parsed)
      setDiffEntries(nextDiffEntries)
      if (record) onRecordHistory?.(resultA.text, resultB.text, countByType(nextDiffEntries))
    } else {
      setDiffEntries(null)
    }
  }

  function handleSwap() {
    setRawA(rawB)
    setRawB(rawA)
    setStatusA(statusB)
    setStatusB(statusA)
    setDiffEntries(null)
    setFilter('all')
  }

  function handleClear() {
    setRawA('')
    setRawB('')
    setStatusA(null)
    setStatusB(null)
    setDiffEntries(null)
    setFilter('all')
  }

  const counts = countByType(diffEntries ?? [])
  const changes = (diffEntries ?? []).filter((entry) => entry.type !== 'unchanged')
  const visibleChanges = filter === 'all' ? changes : changes.filter((entry) => entry.type === filter)

  return (
    <div className="scrollbar-thin flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
      <div className="flex items-center gap-2 border-b border-gray-200 px-6 py-3 dark:border-gray-800">
        <button
          onClick={handleCompare}
          className="border border-blue-600 bg-blue-600 px-3 py-1.5 text-xs font-bold tracking-wide text-white"
        >
          COMPARE
        </button>
        <button
          onClick={handleSwap}
          className="border border-gray-300 px-3 py-1.5 text-xs font-bold tracking-wide text-gray-500 hover:text-gray-900 dark:border-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Swap A⇄B
        </button>
        <button
          onClick={handleClear}
          className="border border-gray-300 px-3 py-1.5 text-xs font-bold tracking-wide text-gray-500 hover:text-gray-900 dark:border-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Clear
        </button>
      </div>

      <div className="grid shrink-0 grid-cols-2">
        <SidePanel label="JSON A" sublabel="baseline" value={rawA} onChange={setRawA} status={statusA} />
        <SidePanel label="JSON B" sublabel="candidate" value={rawB} onChange={setRawB} status={statusB} />
      </div>

      {diffEntries && (
        <>
          <div className="grid grid-cols-4 gap-4 border-y border-gray-200 px-6 py-4 dark:border-gray-800">
            <StatCard label="ADDED" value={counts.added} valueClassName="text-green-500" />
            <StatCard label="REMOVED" value={counts.removed} valueClassName="text-red-500" />
            <StatCard label="CHANGED" value={counts.changed} valueClassName="text-gray-900 dark:text-gray-100" />
            <StatCard label="UNCHANGED" value={counts.unchanged} valueClassName="text-gray-400 dark:text-gray-600" />
          </div>

          <div className="px-6 py-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] tracking-widest text-gray-500">
                DIFFERENCES {visibleChanges.length}
                {filter !== 'all' ? ` of ${changes.length}` : ''} total
              </span>
              <div className="flex">
                <ToggleButton active={filter === 'all'} onClick={() => setFilter('all')}>
                  ALL
                </ToggleButton>
                <ToggleButton active={filter === 'added'} onClick={() => setFilter('added')}>
                  +
                </ToggleButton>
                <ToggleButton active={filter === 'removed'} onClick={() => setFilter('removed')}>
                  -
                </ToggleButton>
                <ToggleButton active={filter === 'changed'} onClick={() => setFilter('changed')}>
                  ~
                </ToggleButton>
              </div>
            </div>
            <table className="w-full table-fixed border-collapse text-left text-sm">
              <colgroup>
                <col className="w-6" />
                <col className="w-2/5" />
                <col />
              </colgroup>
              <thead>
                <tr className="border-b border-gray-200 text-[11px] tracking-widest text-gray-500 dark:border-gray-800">
                  <th className="py-1.5 pl-2"></th>
                  <th className="py-1.5 pr-4">PATH</th>
                  <th className="py-1.5">VALUE</th>
                </tr>
              </thead>
              <tbody>
                {visibleChanges.map((entry) => (
                  <DiffRow key={entry.path} entry={entry} />
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

function SidePanel({
  label,
  sublabel,
  value,
  onChange,
  status,
}: {
  label: string
  sublabel: string
  value: string
  onChange: (value: string) => void
  status: SideStatus | null
}) {
  return (
    <JsonEditor
      value={value}
      onChange={onChange}
      sizeClassName="h-96 shrink-0"
      showGutter={false}
      header={
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold tracking-wide text-gray-900 dark:text-gray-200">
            {label} <span className="font-normal text-gray-400 dark:text-gray-600">{sublabel}</span>
          </span>
          {status && (
            <span className={status.valid ? 'text-green-500' : 'text-red-500'}>
              {status.valid ? 'valid' : `invalid · line ${status.line}`}
            </span>
          )}
        </div>
      }
    />
  )
}

function StatCard({
  label,
  value,
  valueClassName,
}: {
  label: string
  value: number
  valueClassName: string
}) {
  return (
    <div className="border border-gray-200 p-3 dark:border-gray-800">
      <div className="text-[11px] tracking-widest text-gray-500">{label}</div>
      <div className={`text-2xl font-bold ${valueClassName}`}>{value}</div>
    </div>
  )
}

function DiffRow({ entry }: { entry: DiffEntry }) {
  const accentClassName =
    entry.type === 'added'
      ? 'text-green-500'
      : entry.type === 'removed'
        ? 'text-red-500'
        : 'text-gray-400 dark:text-gray-500'

  return (
    <tr className="border-b border-gray-100 dark:border-gray-900">
      <td className={`py-1.5 pl-2 font-mono text-xs ${accentClassName}`}>{symbolFor(entry.type)}</td>
      <td className="truncate py-1.5 pr-4 font-mono text-xs font-bold text-gray-900 dark:text-gray-100">{entry.path || '(root)'}</td>
      <td className={`py-1.5 font-mono text-xs ${accentClassName}`}>{valueText(entry)}</td>
    </tr>
  )
}

function symbolFor(type: DiffType): string {
  if (type === 'added') return '+'
  if (type === 'removed') return '-'
  if (type === 'changed') return '~'
  return ''
}

function valueText(entry: DiffEntry): string {
  if (entry.type === 'added') return JSON.stringify(entry.after)
  if (entry.type === 'removed') return JSON.stringify(entry.before)
  return `${JSON.stringify(entry.before)} → ${JSON.stringify(entry.after)}`
}

function countByType(entries: DiffEntry[]): Record<DiffType, number> {
  const counts: Record<DiffType, number> = { added: 0, removed: 0, changed: 0, unchanged: 0 }
  for (const entry of entries) counts[entry.type]++
  return counts
}
