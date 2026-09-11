import type { CompareHistoryEntry } from '../hooks/useCompareHistory'
import type { FormatterHistoryEntry } from '../hooks/useFormatterHistory'

type Props =
  | {
      kind: 'formatter'
      entries: FormatterHistoryEntry[]
      open: boolean
      onToggle: () => void
      onClear: () => void
      onSelect: (entry: FormatterHistoryEntry) => void
    }
  | {
      kind: 'compare'
      entries: CompareHistoryEntry[]
      open: boolean
      onToggle: () => void
      onClear: () => void
      onSelect: (entry: CompareHistoryEntry) => void
    }

export function HistorySidebar(props: Props) {
  const { kind, entries, open, onToggle, onClear } = props

  if (!open) {
    return (
      <button
        onClick={onToggle}
        title="Show history"
        className="flex w-8 shrink-0 items-start justify-center border-r border-gray-200 py-4 text-xs text-gray-500 hover:text-gray-900 dark:border-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
      >
        &gt;
      </button>
    )
  }

  return (
    <aside className="flex h-full min-h-0 w-72 shrink-0 flex-col border-r border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-800">
        <div className="flex items-baseline gap-2">
          <span className="text-xs font-bold tracking-widest">HISTORY</span>
          <span className="text-[11px] tracking-widest text-gray-500">{kind}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggle}
            title="Hide history"
            className="border border-gray-300 px-2 py-1 text-xs text-gray-500 hover:text-gray-900 dark:border-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            &lt;
          </button>
          <button
            onClick={onClear}
            className="border border-gray-300 px-2 py-1 text-[11px] font-bold tracking-wide text-gray-500 hover:text-gray-900 dark:border-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            CLEAR
          </button>
        </div>
      </div>
      <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto p-4">
        {entries.length === 0 ? (
          <p className="text-xs leading-relaxed text-gray-400 dark:text-gray-600">
            {kind === 'formatter'
              ? 'Runs of Beautify land here. Click one to bring that output back.'
              : 'Comparisons land here. Click one to restore both JSON inputs.'}
          </p>
        ) : kind === 'formatter' ? (
          <ul className="flex flex-col gap-2">
            {props.entries.map((entry) => (
              <li key={entry.id}>
                <button
                  onClick={() => props.onSelect(entry)}
                  className="w-full border border-gray-200 p-2 text-left hover:border-gray-400 dark:border-gray-800 dark:hover:border-gray-600"
                >
                  <div className="flex items-center justify-between text-[10px] tracking-widest text-gray-500">
                    <span>{entry.mode.toUpperCase()}</span>
                    <span>{new Date(entry.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="mt-1 truncate text-xs text-gray-700 dark:text-gray-300">
                    {entry.output.slice(0, 60)}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="flex flex-col gap-2">
            {props.entries.map((entry) => (
              <li key={entry.id}>
                <button
                  onClick={() => props.onSelect(entry)}
                  className="w-full border border-gray-200 p-2 text-left hover:border-gray-400 dark:border-gray-800 dark:hover:border-gray-600"
                >
                  <div className="flex items-center justify-between text-[10px] tracking-widest text-gray-500">
                    <span>DIFF</span>
                    <span>{new Date(entry.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="mt-1 flex gap-2 text-xs">
                    <span className="text-green-500">+{entry.summary.added}</span>
                    <span className="text-red-500">-{entry.summary.removed}</span>
                    <span className="text-gray-400 dark:text-gray-500">~{entry.summary.changed}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  )
}
