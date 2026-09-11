import { describe, expect, test } from 'vitest'
import { beautify, fixDoubledQuotes, minify, validate } from './jsonFormatter'

describe('beautify', () => {
  test('formats a flat object with 2-space indent by default', () => {
    const result = beautify('{"a":1,"b":2}')

    expect(result).toBe('{\n  "a": 1,\n  "b": 2\n}')
  })

  test('expands a string field containing a nested JSON object', () => {
    const raw = JSON.stringify({ message: JSON.stringify({ a: 1 }) })

    const result = beautify(raw)

    expect(result).toBe('{\n  "message": {\n    "a": 1\n  }\n}')
  })

  test('expands JSON strings nested multiple levels deep', () => {
    const raw = JSON.stringify({ outer: JSON.stringify({ inner: JSON.stringify({ a: 1 }) }) })

    const result = beautify(raw)

    expect(result).toBe('{\n  "outer": {\n    "inner": {\n      "a": 1\n    }\n  }\n}')
  })

  test('leaves plain non-JSON strings untouched', () => {
    const result = beautify('{"a":"hello"}')

    expect(result).toBe('{\n  "a": "hello"\n}')
  })

  test('leaves strings that parse to a JSON primitive untouched', () => {
    const raw = JSON.stringify({ a: 'true', b: '42', c: 'null' })

    const result = beautify(raw)

    expect(result).toBe('{\n  "a": "true",\n  "b": "42",\n  "c": "null"\n}')
  })

  test('expands JSON strings found inside arrays', () => {
    const raw = JSON.stringify({ items: [JSON.stringify({ a: 1 }), 'plain'] })

    const result = beautify(raw)

    expect(result).toBe('{\n  "items": [\n    {\n      "a": 1\n    },\n    "plain"\n  ]\n}')
  })

  test('expands a real-world log payload nested in "message", leaving embedded JSON-like text in "stack" untouched', () => {
    const nestedMessage = {
      value: {
        header: {
          version: '5.0',
          timestamp: '2026-09-10T03:12:45.554Z',
          orgService: 'party',
          scope: 'global',
          from: 'common.party-role',
          channel: 'myAIS 3.0',
          broker: 'none',
          agent: 'myAIS 3.0',
          useCase: 'deleteAssetSMH',
          useCaseStep: '0',
          useCaseAge: 3,
          session: '1Cnf2i1qZ2Ts0dam9e1JTU',
          transaction: 'V7YfGqlLo4dl9jT2pfA3HMJ5',
          communication: 'unicast',
          groupTags: [],
          identity: [
            { user: '2UH0oX0agW7', public: '0983716082', device: ['985Tg08dvrse0B6WnhF1sNir'] },
          ],
          tmfSpec: 'TMF669',
          baseApiVersion: '4.1.0',
          schemaVersion: '1',
        },
        body: {
          name: 'DataNotFoundError',
          code: '40400',
          status: '404',
          message: 'Data not found',
          reason: '[common.party-role] Data not found',
          referenceError: {
            '@type': 'PartyRole',
            name: 'iotholder',
            status: 'terminate',
            characteristic: [
              { name: 'number', value: '8800119658' },
              { name: 'digitalIdentity', value: 'tJUySoeR08A' },
            ],
          },
        },
      },
    }
    const stackText =
      'Produce message to : esb.pty.partyRoleTerminateFailed error {"code":-188,"resultCode":"50000","name":"KafkaJSError","message":"Local: Unknown topic"} retry 3'
    const logEntry = {
      action: '[EXCEPTION]',
      level: 'error',
      appName: 'MFAF',
      componentName: 'common.party-role',
      actionDescription: 'Failed to producce to kafka after multiple attempts.',
      message: JSON.stringify(nestedMessage),
      recordName: 'esb.pty.terminatePartyRole',
      sessionId: '1Cnf2i1qZ2Ts0dam9e1JTU',
      transactionId: 'V7YfGqlLo4dl9jT2pfA3HMJ5',
      stack: stackText,
    }
    const raw = JSON.stringify(logEntry)

    const result = beautify(raw)

    const expected = JSON.stringify({ ...logEntry, message: nestedMessage }, null, 2)
    expect(result).toBe(expected)
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

  test('reports unterminated string at the line it breaks on, not a later line', () => {
    const input = '{\n  "name": "json-toolkit,\n  "version": 1\n}'
    const result = validate(input)

    expect(result.valid).toBe(false)
    expect(result.error?.line).toBe(2)
    expect(result.error?.column).toBe(25)
    expect(result.error?.message).toBe('Unterminated string')
  })

  test('hints at a missing closing bracket when an array is left open before a new object key', () => {
    const input = '{\n  "tags": [\n    "fast",\n    "local"\n  ,\n  "active": true\n}'
    const result = validate(input)

    expect(result.valid).toBe(false)
    expect(result.error?.line).toBe(6)
    expect(result.error?.message).toBe(
      "Expected ',' or ']' after array element, but found ':' (the array above may be missing its closing ']')",
    )
  })

  test('reports a missing comma between object properties', () => {
    const input = '{\n  "name": "json-toolkit"\n  "version": 1\n}'
    const result = validate(input)

    expect(result.valid).toBe(false)
    expect(result.error?.line).toBe(3)
    expect(result.error?.column).toBe(3)
    expect(result.error?.message).toBe("Expected ',' or '}' after property value, but found '\"'")
  })

  test('reports a missing comma between array elements', () => {
    const result = validate('[1 2]')

    expect(result.valid).toBe(false)
    expect(result.error?.column).toBe(4)
    expect(result.error?.message).toBe("Expected ',' or ']' after array element, but found '2'")
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

describe('fixDoubledQuotes', () => {
  test('un-doubles CSV-style escaped quotes into valid JSON', () => {
    const raw = '{""action"":""[EXCEPTION]"",""level"":""error""}'

    const result = fixDoubledQuotes(raw)

    expect(result).toBe('{"action":"[EXCEPTION]","level":"error"}')
  })

  test('correctly restores an empty string value', () => {
    const raw = '{""useCaseStartTime"":""""}'

    const result = fixDoubledQuotes(raw)

    expect(result).toBe('{"useCaseStartTime":""}')
  })

  test('restores doubled quotes inside an escaped nested JSON string', () => {
    const raw = '{""message"":""{\\""a\\"":1}""}'

    const result = fixDoubledQuotes(raw)

    expect(result).toBe('{"message":"{\\"a\\":1}"}')
  })

  test('returns null when the input is already valid JSON', () => {
    const result = fixDoubledQuotes('{"a": 1}')

    expect(result).toBeNull()
  })

  test('returns null when un-doubling still does not produce valid JSON', () => {
    const result = fixDoubledQuotes('not json at all')

    expect(result).toBeNull()
  })

  test('strips an extra outer quote wrapper on top of the doubled quoting', () => {
    const doubled = '{""action"":""[EXCEPTION]"",""level"":""error""}'
    const doubleWrapped = '"' + doubled + '"'

    const result = fixDoubledQuotes(doubleWrapped)

    expect(result).toBe('{"action":"[EXCEPTION]","level":"error"}')
  })
})
