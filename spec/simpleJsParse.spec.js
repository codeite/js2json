'use strict'

const demand = require('must')

const simpleJsParser = require('../src/server/simpleJsParser')

describe('simpleJsParser', () => {
  describe('reading strings', () => {
    it('should parse a double quoted string', () => {
      demand(simpleJsParser.parse('"cheese"')).must.equal('cheese')
    })

    it('should parse a double quoted string with escaped double quote in', () => {
      demand(simpleJsParser.parse('"che\\"ese"')).must.equal('che"ese')
    })

    it('should parse a single quoted string', () => {
      demand(simpleJsParser.parse("'cheese'")).must.equal('cheese')
    })

    it('should parse a single quoted string with escaped single quote in', () => {
      demand(simpleJsParser.parse("'che\\'ese'")).must.equal("che'ese")
    })

    it('should read escaped chars', () => {
      demand(simpleJsParser.parse("'a\\nb'")).must.equal('a\nb')
      demand(simpleJsParser.parse("'a\\rb'")).must.equal('a\rb')
      demand(simpleJsParser.parse("'a\\tb'")).must.equal('a\tb')
      demand(simpleJsParser.parse("'a\\fb'")).must.equal('a\fb')
      demand(simpleJsParser.parse("'a\\bb'")).must.equal('a\bb')
    })

    it('should read unicode chars chars', () => {
      demand(simpleJsParser.parse("'a\\u000Ab'")).must.equal('a\nb')
      demand(simpleJsParser.parse("'a\\u000Db'")).must.equal('a\rb')
      demand(simpleJsParser.parse("'a\\u0041b'")).must.equal('aAb')
      demand(simpleJsParser.parse("'a\\u0061b'")).must.equal('aab')
    })
  })

  describe('reading numbers', () => {
    it('should parse an integer', () => {
      demand(simpleJsParser.parse('567')).must.equal(567)
    })

    it('should parse a negetive integer', () => {
      demand(simpleJsParser.parse('-992')).must.equal(-992)
    })

    it('should parse a decimal number', () => {
      demand(simpleJsParser.parse('45.54')).must.equal(45.54)
    })

    it('should parse a decimal fractional number', () => {
      demand(simpleJsParser.parse('0.5')).must.equal(0.5)
    })

    it('should parse a positive exponent', () => {
      demand(simpleJsParser.parse('7.7e5')).must.equal(7.7e5)
      demand(simpleJsParser.parse('7.7e+5')).must.equal(7.7e+5)
    })

    it('should parse a negetive exponent', () => {
      demand(simpleJsParser.parse('7.7e-5')).must.equal(7.7e-5)
    })
  })

  describe('reading booleans', () => {
    it('should parse true', () => {
      demand(simpleJsParser.parse('true')).must.equal(true)
    })

    it('should parse false', () => {
      demand(simpleJsParser.parse('false')).must.equal(false)
    })
  })

  describe('reading null and undefined', () => {
    it('should parse null', () => {
      demand(simpleJsParser.parse('null')).must.equal(null)
    })

    it('should parse undefined', () => {
      demand(simpleJsParser.parse('undefined')).must.equal(undefined)
    })
  })

  describe('reading an array', () => {
    it('should be able to read an empty array', () => {
      demand(simpleJsParser.parse('[]')).must.eql([])
    })

    it('should be able to read an array with a single element', () => {
      demand(simpleJsParser.parse('[1]')).must.eql([1])
    })

    it('should be able to read an array with two elements', () => {
      demand(simpleJsParser.parse('[1,2]')).must.eql([1, 2])
    })

    it('should be able to read an array with two elements with whitespace', () => {
      demand(simpleJsParser.parse('[  1  ,  2  ]  ')).must.eql([1, 2])
    })

    it('should be able to read an array with many elements', () => {
      demand(simpleJsParser.parse(`[1, 2, false, true, "five", 'six', 7]`)).must.eql([1, 2, false, true, 'five', 'six', 7])
    })
  })

  describe('reading an object', () => {
    it('should be able to read an empty object', () => {
      demand(simpleJsParser.parse('{}')).must.eql({})
    })

    it('should be able to read an object with a single property with string key', () => {
      demand(simpleJsParser.parse(`{"alpha":"a"}`)).must.eql({alpha: 'a'})
      demand(simpleJsParser.parse(`{'alpha':"a"}`)).must.eql({alpha: 'a'})
    })

    it('should be able to read an object with a single property with an indetifier key', () => {
      demand(simpleJsParser.parse(`{alpha0:"a"}`)).must.eql({alpha0: 'a'})
      demand(simpleJsParser.parse(`{_alpha0:"a"}`)).must.eql({_alpha0: 'a'})
      demand(simpleJsParser.parse(`{Alpha0:"a"}`)).must.eql({Alpha0: 'a'})
    })

    it('should be able to read an object with a single property with a numeric key', () => {
      demand(simpleJsParser.parse(`{5:"a"}`)).must.eql({5: 'a'})
    })

    it('should be able to read an object with two properties', () => {
      demand(simpleJsParser.parse('{a:1,b:2}')).must.eql({a: 1, b: 2})
    })

    it('should be able to read an object with two properties with whitespace', () => {
      demand(simpleJsParser.parse('{  a  :  1  ,  b  :  2  }  ')).must.eql({a: 1, b: 2})
    })

    it('should be able to read an object with many properties', () => {
      demand(simpleJsParser.parse(`{a:1, b:2, true:true, false:false, "e":"five", 'f':'six', g:7}`)).must.eql({a: 1, b: 2, true: true, false: false, e: 'five', f: 'six', g: 7})
    })
  })
})
