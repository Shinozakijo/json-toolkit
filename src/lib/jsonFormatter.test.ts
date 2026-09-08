import { describe, expect, test } from 'vitest'
import { beautify, minify, validate } from './jsonFormatter'

describe('beautify', () => {
  test('formats a flat object with 2-space indent by default', () => {
    const result = beautify('{"a":1,"b":2}')

    expect(result).toBe('{\n  "a": 1,\n  "b": 2\n}')
  })

  test('respects a custom indent size', () => {
    const result = beautify('{"a":1}', 4)

    expect(result).toBe('{\n    "a": 1\n}')
  })
})

describe('minify', () => {
  test('collapses a pretty-printed object to one line', () => {
    const result = minify('{\n  "a": 1,\n  "b": 2\n}')

    expect(result).toBe('{"a":1,"b":2}')
  })
})

describe('beautify and minify with invalid input', () => {
  test('beautify throws SyntaxError on invalid JSON', () => {
    expect(() => beautify('{"a":}')).toThrow(SyntaxError)
  })

  test('minify throws SyntaxError on invalid JSON', () => {
    expect(() => minify('{"a":}')).toThrow(SyntaxError)
  })
})

describe('validate', () => {
  test('returns valid: true for well-formed JSON', () => {
    const result = validate('{"a": 1, "b": [1, 2, 3]}')

    expect(result).toEqual({ valid: true })
  })

  test('reports missing value after colon with exact position', () => {
    const input = '{"a": 1, "b": }'
    const result = validate(input)

    expect(result.valid).toBe(false)
    expect(result.error?.line).toBe(1)
    expect(result.error?.column).toBe(15)
    expect(result.error?.snippet).toBe(input + '\n' + ' '.repeat(14) + '^')
    expect(result.error?.message).toBe(
      "Unexpected '}' here. Values must be a string in double quotes, a number, true, false, null, an object or an array.",
    )
  })

  test('reports trailing comma in an object', () => {
    const input = '{"a": 1,}'
    const result = validate(input)

    expect(result.valid).toBe(false)
    expect(result.error?.line).toBe(1)
    expect(result.error?.column).toBe(9)
  })

  test('reports unterminated string', () => {
    const input = '{"a": "b}'
    const result = validate(input)

    expect(result.valid).toBe(false)
    expect(result.error?.line).toBe(1)
    expect(result.error?.column).toBe(10)
  })

  test('reports correct line for errors past the first line', () => {
    const input = '{\n  "a": 1,\n  "b": }'
    const result = validate(input)

    expect(result.valid).toBe(false)
    expect(result.error?.line).toBe(3)
    expect(result.error?.column).toBe(8)
  })

  test('reports trailing comma in an array', () => {
    const result = validate('[1, 2,]')

    expect(result.valid).toBe(false)
    expect(result.error?.column).toBe(7)
  })

  test('accepts true, false, null, and exponent numbers', () => {
    const result = validate('{"a": true, "b": false, "c": null, "d": 1.5e10}')

    expect(result).toEqual({ valid: true })
  })
})
