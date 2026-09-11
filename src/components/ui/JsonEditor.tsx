import { useRef } from 'react'

export function JsonEditor({
  value,
  onChange,
  placeholder = 'Paste or type JSON here...',
  sizeClassName = 'min-h-70 flex-1',
  showGutter = true,
  header,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  sizeClassName?: string
  showGutter?: boolean
  header?: React.ReactNode
}) {
  const gutterRef = useRef<HTMLDivElement>(null)
  const lineCount = value.split('\n').length

  function handleScroll(e: React.UIEvent<HTMLTextAreaElement>) {
    if (gutterRef.current) {
      gutterRef.current.scrollTop = e.currentTarget.scrollTop
    }
  }

  return (
    <div
      className={`relative m-4 flex min-w-80 flex-col overflow-hidden border border-gray-200 dark:border-gray-800 ${sizeClassName}`}
    >
      {header && <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-800">{header}</div>}
      <div className="flex min-h-0 min-w-0 flex-1">
        {showGutter && (
          <div
            ref={gutterRef}
            aria-hidden="true"
            className="select-none overflow-hidden bg-gray-50 p-4 text-right font-mono text-sm leading-normal text-gray-400 dark:bg-gray-900/40 dark:text-gray-600"
          >
            {Array.from({ length: lineCount }, (_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
        )}
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          spellCheck={false}
          wrap="off"
          placeholder={placeholder}
          className="scrollbar-thin w-full flex-1 resize-none overflow-x-auto whitespace-pre bg-transparent p-4 font-mono text-sm leading-normal text-gray-900 outline-none placeholder:text-gray-400 dark:text-gray-200 dark:placeholder:text-gray-600"
        />
      </div>
    </div>
  )
}
