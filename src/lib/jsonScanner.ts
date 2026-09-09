import type { Scanner } from './jsonFormatter.types'

export class JsonParseError extends Error {
  line: number
  column: number

  constructor(message: string, line: number, column: number) {
    super(message)
    this.line = line
    this.column = column
  }
}

/** Walks the full input and throws JsonParseError at the first violation of JSON grammar. */
export function scanJson(raw: string): void {
  const s: Scanner = { raw, pos: 0, line: 1, column: 1 }
  parseValue(s)
  skipWhitespace(s)
  if (s.pos < raw.length) {
    fail(s, `Unexpected trailing content '${peek(s)}'`)
  }
}

function parseValue(s: Scanner): void {
  skipWhitespace(s)
  const ch = peek(s)
  if (ch === '{') return parseObject(s)
  if (ch === '[') return parseArray(s)
  if (ch === '"') return parseString(s)
  if (ch === '-' || (ch >= '0' && ch <= '9')) return parseNumber(s)
  if (s.raw.startsWith('true', s.pos)) {
    s.pos += 4
    s.column += 4
    return
  }
  if (s.raw.startsWith('false', s.pos)) {
    s.pos += 5
    s.column += 5
    return
  }
  if (s.raw.startsWith('null', s.pos)) {
    s.pos += 4
    s.column += 4
    return
  }
  fail(
    s,
    `Unexpected '${ch ?? 'end of input'}' here. Values must be a string in double quotes, a number, true, false, null, an object or an array.`,
  )
}

function skipWhitespace(s: Scanner): void {
  while (s.pos < s.raw.length && ' \t\n\r'.includes(peek(s))) {
    advance(s)
  }
}

function peek(s: Scanner): string {
  return s.raw[s.pos]
}

function parseObject(s: Scanner): void {
  advance(s) // {
  skipWhitespace(s)
  if (peek(s) === '}') {
    advance(s)
    return
  }
  while (true) {
    skipWhitespace(s)
    if (peek(s) !== '"') {
      fail(s, `Unexpected token '${peek(s) ?? 'end of input'}', expected string key`)
    }
    parseString(s)
    skipWhitespace(s)
    expect(s, ':', 'after object key')
    parseValue(s)
    skipWhitespace(s)
    if (peek(s) === ',') {
      advance(s)
      continue
    }
    if (peek(s) === '}') break
    fail(s, `Expected ',' or '}' after property value, but found '${peek(s) ?? 'end of input'}'`)
  }
  advance(s) // }
}

function parseArray(s: Scanner): void {
  advance(s) // [
  skipWhitespace(s)
  if (peek(s) === ']') {
    advance(s)
    return
  }
  while (true) {
    parseValue(s)
    skipWhitespace(s)
    if (peek(s) === ',') {
      advance(s)
      continue
    }
    if (peek(s) === ']') break
    const found = peek(s)
    const hint = found === ':' ? ` (the array above may be missing its closing ']')` : ''
    fail(s, `Expected ',' or ']' after array element, but found '${found ?? 'end of input'}'${hint}`)
  }
  advance(s) // ]
}

function parseString(s: Scanner): void {
  advance(s) // opening "
  while (true) {
    if (s.pos >= s.raw.length) {
      fail(s, 'Unterminated string')
    }
    if (peek(s) === '\n' || peek(s) === '\r') {
      fail(s, 'Unterminated string')
    }
    const ch = advance(s)
    if (ch === '"') return
    if (ch === '\\') {
      if (s.pos >= s.raw.length) {
        fail(s, 'Unterminated string')
      }
      const esc = advance(s)
      if (!'"\\/bfnrt'.includes(esc)) {
        if (esc === 'u') {
          for (let i = 0; i < 4; i++) {
            if (!/[0-9a-fA-F]/.test(peek(s) ?? '')) {
              fail(s, 'Invalid unicode escape')
            }
            advance(s)
          }
        } else {
          fail(s, `Invalid escape character '${esc}'`)
        }
      }
    }
  }
}

function parseNumber(s: Scanner): void {
  if (peek(s) === '-') advance(s)
  if (peek(s) === '0') {
    advance(s)
  } else {
    if (!/[1-9]/.test(peek(s) ?? '')) {
      fail(s, 'Invalid number')
    }
    while (/[0-9]/.test(peek(s) ?? '')) advance(s)
  }
  if (peek(s) === '.') {
    advance(s)
    if (!/[0-9]/.test(peek(s) ?? '')) {
      fail(s, 'Invalid number')
    }
    while (/[0-9]/.test(peek(s) ?? '')) advance(s)
  }
  if (peek(s) === 'e' || peek(s) === 'E') {
    advance(s)
    if (peek(s) === '+' || peek(s) === '-') advance(s)
    if (!/[0-9]/.test(peek(s) ?? '')) {
      fail(s, 'Invalid number')
    }
    while (/[0-9]/.test(peek(s) ?? '')) advance(s)
  }
}

function advance(s: Scanner): string {
  const ch = s.raw[s.pos]
  s.pos++
  if (ch === '\n') {
    s.line++
    s.column = 1
  } else {
    s.column++
  }
  return ch
}

function fail(s: Scanner, message: string): never {
  throw new JsonParseError(message, s.line, s.column)
}

function expect(s: Scanner, ch: string, context: string): void {
  if (peek(s) !== ch) {
    fail(s, `Expected '${ch}' ${context}, but found '${peek(s) ?? 'end of input'}'`)
  }
  advance(s)
}
