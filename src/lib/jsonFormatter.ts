import { JsonParseError, scanJson } from './jsonScanner'
import type { ValidationResult } from './jsonFormatter.types'
export type { ValidationError, ValidationResult } from './jsonFormatter.types'

export function beautify(raw: string, indent: number = 2): string {
  const parsed = JSON.parse(raw)
  return JSON.stringify(parsed, null, indent)
}

export function minify(raw: string): string {
  const parsed = JSON.parse(raw)
  return JSON.stringify(parsed)
}

export function validate(raw: string): ValidationResult {
  try {
    scanJson(raw)
    return { valid: true }
  } catch (e) {
    if (e instanceof JsonParseError) {
      return {
        valid: false,
        error: {
          message: e.message,
          line: e.line,
          column: e.column,
          snippet: buildSnippet(raw, e.line, e.column),
        },
      }
    }
    throw e
  }

  function buildSnippet(raw: string, line: number, column: number): string {
    const lineText = raw.split('\n')[line - 1] ?? ''
    return lineText + '\n' + ' '.repeat(column - 1) + '^'
  }
}
