import { describe, expect, test } from 'vitest'
import { diffJson } from './jsonDiff'

describe('diffJson', () => {
  test('reports unchanged for identical flat objects', () => {
    const result = diffJson({ a: 1 }, { a: 1 })

    expect(result).toEqual([{ path: 'a', type: 'unchanged', before: 1, after: 1 }])
  })

  test('reports changed when a primitive value differs', () => {
    const result = diffJson({ version: 3 }, { version: 4 })

    expect(result).toEqual([{ path: 'version', type: 'changed', before: 3, after: 4 }])
  })

  test('reports added for a key only present in b', () => {
    const result = diffJson({}, { country: 'TH' })

    expect(result).toEqual([{ path: 'country', type: 'added', after: 'TH' }])
  })

  test('reports removed for a key only present in a', () => {
    const result = diffJson({ region: 'ap-southeast-1' }, {})

    expect(result).toEqual([{ path: 'region', type: 'removed', before: 'ap-southeast-1' }])
  })

  test('recurses into nested objects with dot-separated paths', () => {
    const result = diffJson(
      { user: { address: { city: 'Bangkok' } } },
      { user: { address: { city: 'Chiang Mai' } } },
    )

    expect(result).toEqual([
      { path: 'user.address.city', type: 'changed', before: 'Bangkok', after: 'Chiang Mai' },
    ])
  })

  test('compares arrays by index with bracket paths', () => {
    const result = diffJson({ hosts: ['a.internal', 'b.internal'] }, { hosts: ['a.internal', 'c.internal'] })

    expect(result).toEqual([
      { path: 'hosts[0]', type: 'unchanged', before: 'a.internal', after: 'a.internal' },
      { path: 'hosts[1]', type: 'changed', before: 'b.internal', after: 'c.internal' },
    ])
  })

  test('reports added and removed for array elements when length differs', () => {
    const result = diffJson({ hosts: ['a.internal'] }, { hosts: ['a.internal', 'b.internal'] })

    expect(result).toEqual([
      { path: 'hosts[0]', type: 'unchanged', before: 'a.internal', after: 'a.internal' },
      { path: 'hosts[1]', type: 'added', after: 'b.internal' },
    ])
  })

  test('treats a type change (object to primitive) as changed without recursing', () => {
    const result = diffJson({ flags: { beta: true } }, { flags: 'disabled' })

    expect(result).toEqual([
      { path: 'flags', type: 'changed', before: { beta: true }, after: 'disabled' },
    ])
  })

  test('treats null specially instead of as an object', () => {
    const result = diffJson({ a: null }, { a: { b: 1 } })

    expect(result).toEqual([{ path: 'a', type: 'changed', before: null, after: { b: 1 } }])
  })

  test('treats an array-vs-object type mismatch as changed without recursing', () => {
    const result = diffJson({ tags: ['a', 'b'] }, { tags: { a: true } })

    expect(result).toEqual([{ path: 'tags', type: 'changed', before: ['a', 'b'], after: { a: true } }])
  })

  test('diffs top-level primitives directly, using an empty root path', () => {
    const result = diffJson(1, 2)

    expect(result).toEqual([{ path: '', type: 'changed', before: 1, after: 2 }])
  })
})
