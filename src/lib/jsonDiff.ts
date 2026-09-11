import type { DiffEntry } from './jsonDiff.types'

export function diffJson(a: unknown, b: unknown): DiffEntry[] {
  const entries: DiffEntry[] = []
  walk('', a, b, entries)
  return entries
}

function walk(path: string, a: unknown, b: unknown, entries: DiffEntry[]): void {
  if (isPlainObject(a) && isPlainObject(b)) {
    for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
      walkChild(joinKey(path, key), a, b, key, entries)
    }
    return
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    const length = Math.max(a.length, b.length)
    for (let i = 0; i < length; i++) {
      walkChild(joinIndex(path, i), a, b, i, entries)
    }
    return
  }

  if (a === b) {
    entries.push({ path, type: 'unchanged', before: a, after: b })
    return
  }

  entries.push({ path, type: 'changed', before: a, after: b })
}

function walkChild(
  childPath: string,
  parentA: object,
  parentB: object,
  key: PropertyKey,
  entries: DiffEntry[],
): void {
  const container = parentA as Record<PropertyKey, unknown>
  const other = parentB as Record<PropertyKey, unknown>
  const inA = key in container
  const inB = key in other

  if (!inA) {
    entries.push({ path: childPath, type: 'added', after: other[key] })
  } else if (!inB) {
    entries.push({ path: childPath, type: 'removed', before: container[key] })
  } else {
    walk(childPath, container[key], other[key], entries)
  }
}

function isPlainObject(value: unknown): value is Record<PropertyKey, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function joinKey(path: string, key: string): string {
  return path ? `${path}.${key}` : key
}

function joinIndex(path: string, index: number): string {
  return `${path}[${index}]`
}
