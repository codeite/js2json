'use strict'

module.exports = {
  parse,
  parseJustObject (str) { return parse(str).obj }
}

function parse (str) {
  const parser = new Parser(str)
  const result = {}
  try {
    result.obj = parser.parse()
  } catch (e) {
    const lines = str.split('\n')
    result.report = 'Report\n' + e.message + '\n'
    for (let l = e.line - 2; l < e.line + 3; l++) {
      if (l < 0) l = 0
      if (l < lines.length) {
        result.report += `${('0000' + l).slice(-4)}> ${lines[l]}\n`

        if (l === e.line) {
          result.report += '    | '
          for (let c = 0; c < e.col; c++) {
            result.report += '-'
          }
          result.report += '^ '
          result.report += e.message
          result.report += '\n'
        }
      }
    }
  }

  return result
}

class Parser {
  constructor (str) {
    this.chars = str.split('')
    this.pos = 0
    this.line = 0
    this.col = 0
  }
  raiseError (message, col, line) {
    const error = new Error(message)
    error.col = (col !== undefined) ? col : this.col
    error.line = (line !== undefined) ? line : this.line
    return error
  }
  get peek () {
    return this.chars[this.pos]
  }
  read (expected) {
    if (expected && expected !== this.peek) {
      throw this.raiseError(`Asked to read "${expected} but got: »${this.peek}«`)
    }
    const val = this.peek

    if (val === '\n') {
      this.line++
      this.col = 0
    } else {
      this.col++
    }

    this.pos++

    if (this.pos > this.chars.length) throw this.raiseError(`Error, read past end of input`)
    return val
  }
  parse () {
    this.result = this.readValue()
    return this.result
  }
  readValue () {
    this.skipWhitespace()
    const peek = this.peek

    switch (peek) {
      case `"`: return this.readString(`"`)
      case `'`: return this.readString(`'`)
      case '`': return this.readBacktickString()
      case `[`: return this.readArray()
      case `{`: return this.readObject()
      default: if (this.isStartOfNumber()) {
        return this.readNumber()
      } else if (this.nextIsStartOfIdentifier()) {
        const identifier = this.readIdentifier()
        if (identifier === 'true') return true
        if (identifier === 'false') return false
        if (identifier === 'null') return null
        if (identifier === 'undefined') return undefined
        throw this.raiseError(`Unexpected identifier: »${identifier}«`, this.col - identifier.length)
      } else {
        throw this.raiseError(`Unexpected token: »${peek}«`)
      }
    }
  }
  readString (quoteType) {
    let str = ''
    this.read(quoteType)
    while (this.peek !== quoteType) {
      if (this.peek === '\\') {
        str += this.readEscapeCode(quoteType)
      } else {
        str += this.read()
      }
    }
    this.read(quoteType)

    return str
  }
  readBacktickString () {
    let str = ''
    this.read('`')
    while (this.peek !== '`') {
      if (this.peek === '\\') {
        str += this.readEscapeCode('`')
      } else {
        str += this.read()
      }
    }
    this.read('`')

    return str
  }
  readEscapeCode (quoteType) {
    this.read('\\')
    switch (this.peek) {
      case `'`:
      case `"`:
      case `\\`:
      case `/`:
        return this.read()
      case `b`: this.read(); return `\b`
      case `f`: this.read(); return `\f`
      case `n`: this.read(); return `\n`
      case `r`: this.read(); return `\r`
      case `t`: this.read(); return `\t`
      case `u`: this.read(); return this.readUnicode()
      case '\r': this.read(); return ''
      case '\n': this.read(); return '\n'
      default: throw this.raiseError(`Unknown escape code: »${this.peek}« (0x${('00' + this.peek.charCodeAt(0).toString(16)).substr(-2)})`)
    }
  }
  readUnicode () {
    const code = [this.readHex(), this.readHex(), this.readHex(), this.readHex()].join('')
    const val = parseInt(code, 16)
    return String.fromCharCode(val)
  }
  readHex () {
    const hex = this.read()
    if (!/[a-fA-F0-9]/.test(hex)) {
      throw this.raiseError('Failed to read hex, read: ' + hex)
    }
    return hex
  }
  nextIsDigit () {
    if (!this.peek) return false
    return /[0-9]/.test(this.peek)
  }
  isStartOfNumber () {
    return this.nextIsDigit() || this.peek === '-'
  }
  readNumber () {
    let num = ''

    if (this.peek === '-') {
      num += this.read('-')
    }

    if (this.peek === '0') {
      num += this.read('0')
    } else {
      while (this.nextIsDigit()) {
        num += this.read()
      }
    }

    if (this.peek === '.') {
      num += this.read('.')
      if (!this.nextIsDigit()) throw this.raiseError(`"." in number must be followed by a digit. Got: »${this.peek}«`)

      while (this.nextIsDigit()) {
        num += this.read()
      }
    }

    if (this.peek === 'E' || this.peek === 'e') {
      num += this.read()

      if (this.peek === '-') {
        num += this.read('-')
      } else if (this.peek === '+') {
        num += this.read('+')
      }

      if (!this.nextIsDigit()) throw this.raiseError(`exponent in number have a number. Got: »${this.peek}«`)

      while (this.nextIsDigit()) {
        num += this.read()
      }
    }

    return parseFloat(num)
  }
  readArray () {
    this.read('[')
    this.skipWhitespace()

    const arr = []
    while (this.peek !== ']') {
      arr.push(this.readValue())
      this.skipWhitespace()
      if (this.peek !== ']') this.read(',')
      this.skipWhitespace()
    }
    this.read(']')
    this.skipWhitespace()
    return arr
  }
  readObject () {
    this.read('{')
    this.skipWhitespace()

    const obj = {}
    while (this.peek !== '}') {
      let key = this.readObjectKey()
      this.skipWhitespace()
      this.read(':')
      this.skipWhitespace()
      obj[key] = this.readValue()
      this.skipWhitespace()
      if (this.peek !== '}') this.read(',')
      this.skipWhitespace()
    }
    this.read('}')
    this.skipWhitespace()
    return obj
  }
  readObjectKey () {
    if (this.peek === `"`) return this.readString(`"`)
    if (this.peek === `'`) return this.readString(`'`)

    if (this.nextIsStartOfIdentifier()) {
      return this.readIdentifier()
    }

    if (this.isStartOfNumber()) {
      return this.readNumber()
    }

    throw new Error(`Expected to read object key. Got: »${this.peek}«`)
  }
  nextIsStartOfIdentifier () {
    if (!this.peek) return false
    return /[_a-zA-Z]/.test(this.peek)
  }
  nextIsIdentifier () {
    if (!this.peek) return false
    return /[_a-zA-Z0-9]/.test(this.peek)
  }
  readIdentifier () {
    let identifier = this.read()
    while (this.nextIsIdentifier()) {
      identifier += this.read()
    }
    return identifier
  }
  skipWhitespace () {
    while (this.nextIsWhitespace()) {
      this.read()
    }
  }
  nextIsWhitespace () {
    return [' ', '\t', '\n', '\r'].indexOf(this.peek) !== -1
  }
}
