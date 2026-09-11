import { JsonParseError, scanJson } from './jsonScanner'
import type { ValidationResult } from './jsonFormatter.types'
export type { ValidationError, ValidationResult } from './jsonFormatter.types'

export function beautify(raw: string): string {
  const parsed = JSON.parse(raw)
  return JSON.stringify(deepParseJsonStrings(parsed), null, 2)
}

function deepParseJsonStrings(value: unknown, maxDepth: number = 20): unknown {
  if (maxDepth <= 0) return value

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) return value
    try {
      const nested = JSON.parse(value)
      if (nested !== null && typeof nested === 'object') {
        return deepParseJsonStrings(nested, maxDepth - 1)
      }
      return value
    } catch {
      return value
    }
  }

  if (Array.isArray(value)) {
    return value.map((item) => deepParseJsonStrings(item, maxDepth - 1))
  }

  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, val]) => [key, deepParseJsonStrings(val, maxDepth - 1)]),
    )
  }

  return value
}

export function fixDoubledQuotes(raw: string): string | null {
  const candidates = [raw.replaceAll('""', '"')]

  if (raw.length >= 2 && raw.startsWith('"') && raw.endsWith('"')) {
    candidates.push(raw.slice(1, -1).replaceAll('""', '"'))
  }

  for (const candidate of candidates) {
    if (candidate === raw) continue
    try {
      JSON.parse(candidate)
      return candidate
    } catch {
      // try the next candidate
    }
  }

  return null
}

export type PrepareForCompareResult =
  | { valid: true; text: string; parsed: unknown }
  | { valid: false; text: string; line: number }

export function prepareForCompare(raw: string): PrepareForCompareResult {
  let candidate = raw
  let result = validate(candidate)

  if (!result.valid) {
    const fixed = fixDoubledQuotes(raw)
    if (fixed !== null) {
      candidate = fixed
      result = validate(candidate)
    }
  }

  if (!result.valid) {
    return { valid: false, text: raw, line: result.error?.line ?? 1 }
  }

  return { valid: true, text: beautify(candidate), parsed: JSON.parse(candidate) }
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
