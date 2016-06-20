'use strict'

const demand = require('must')

const simpleJsParser = require('../src/server/simpleJsParser')

describe('simpleJsParser', () => {
  describe('reading strings', () => {
    it('should parse a double quoted string', () => {
      demand(simpleJsParser.parseJustObject('"cheese"')).must.equal('cheese')
    })

    it('should parse a double quoted string with escaped double quote in', () => {
      demand(simpleJsParser.parseJustObject('"che\\"ese"')).must.equal('che"ese')
    })

    it('should parse a single quoted string', () => {
      demand(simpleJsParser.parseJustObject("'cheese'")).must.equal('cheese')
    })

    it('should parse a single quoted string with escaped single quote in', () => {
      demand(simpleJsParser.parseJustObject("'che\\'ese'")).must.equal("che'ese")
    })

    it('should read escaped chars', () => {
      demand(simpleJsParser.parseJustObject("'a\\nb'")).must.equal('a\nb')
      demand(simpleJsParser.parseJustObject("'a\\rb'")).must.equal('a\rb')
      demand(simpleJsParser.parseJustObject("'a\\tb'")).must.equal('a\tb')
      demand(simpleJsParser.parseJustObject("'a\\fb'")).must.equal('a\fb')
      demand(simpleJsParser.parseJustObject("'a\\bb'")).must.equal('a\bb')
    })

    it('should read unicode chars chars', () => {
      demand(simpleJsParser.parseJustObject("'a\\u000Ab'")).must.equal('a\nb')
      demand(simpleJsParser.parseJustObject("'a\\u000Db'")).must.equal('a\rb')
      demand(simpleJsParser.parseJustObject("'a\\u0041b'")).must.equal('aAb')
      demand(simpleJsParser.parseJustObject("'a\\u0061b'")).must.equal('aab')
    })
  })

  describe('reading numbers', () => {
    it('should parse an integer', () => {
      demand(simpleJsParser.parseJustObject('567')).must.equal(567)
    })

    it('should parse a negetive integer', () => {
      demand(simpleJsParser.parseJustObject('-992')).must.equal(-992)
    })

    it('should parse a decimal number', () => {
      demand(simpleJsParser.parseJustObject('45.54')).must.equal(45.54)
    })

    it('should parse a decimal fractional number', () => {
      demand(simpleJsParser.parseJustObject('0.5')).must.equal(0.5)
    })

    it('should parse a positive exponent', () => {
      demand(simpleJsParser.parseJustObject('7.7e5')).must.equal(7.7e5)
      demand(simpleJsParser.parseJustObject('7.7e+5')).must.equal(7.7e+5)
    })

    it('should parse a negetive exponent', () => {
      demand(simpleJsParser.parseJustObject('7.7e-5')).must.equal(7.7e-5)
    })
  })

  describe('reading booleans', () => {
    it('should parse true', () => {
      demand(simpleJsParser.parseJustObject('true')).must.equal(true)
    })

    it('should parse false', () => {
      demand(simpleJsParser.parseJustObject('false')).must.equal(false)
    })
  })

  describe('reading null and undefined', () => {
    it('should parse null', () => {
      demand(simpleJsParser.parseJustObject('null')).must.equal(null)
    })

    it('should parse undefined', () => {
      demand(simpleJsParser.parseJustObject('undefined')).must.equal(undefined)
    })
  })

  describe('reading an array', () => {
    it('should be able to read an empty array', () => {
      demand(simpleJsParser.parseJustObject('[]')).must.eql([])
    })

    it('should be able to read an array with a single element', () => {
      demand(simpleJsParser.parseJustObject('[1]')).must.eql([1])
    })

    it('should be able to read an array with two elements', () => {
      demand(simpleJsParser.parseJustObject('[1,2]')).must.eql([1, 2])
    })

    it('should be able to read an array with two elements with whitespace', () => {
      demand(simpleJsParser.parseJustObject('[  1  ,  2  ]  ')).must.eql([1, 2])
    })

    it('should be able to read an array with many elements', () => {
      demand(simpleJsParser.parseJustObject(`[1, 2, false, true, "five", 'six', 7]`)).must.eql([1, 2, false, true, 'five', 'six', 7])
    })
  })

  describe('reading an object', () => {
    it('should be able to read an empty object', () => {
      demand(simpleJsParser.parseJustObject('{}')).must.eql({})
    })

    it('should be able to read an object with a single property with string key', () => {
      demand(simpleJsParser.parseJustObject(`{"alpha":"a"}`)).must.eql({alpha: 'a'})
      demand(simpleJsParser.parseJustObject(`{'alpha':"a"}`)).must.eql({alpha: 'a'})
    })

    it('should be able to read an object with a single property with an indetifier key', () => {
      demand(simpleJsParser.parseJustObject(`{alpha0:"a"}`)).must.eql({alpha0: 'a'})
      demand(simpleJsParser.parseJustObject(`{_alpha0:"a"}`)).must.eql({_alpha0: 'a'})
      demand(simpleJsParser.parseJustObject(`{Alpha0:"a"}`)).must.eql({Alpha0: 'a'})
    })

    it('should be able to read an object with a single property with a numeric key', () => {
      demand(simpleJsParser.parseJustObject(`{5:"a"}`)).must.eql({5: 'a'})
    })

    it('should be able to read an object with two properties', () => {
      demand(simpleJsParser.parseJustObject('{a:1,b:2}')).must.eql({a: 1, b: 2})
    })

    it('should be able to read an object with two properties with whitespace', () => {
      demand(simpleJsParser.parseJustObject('{  a  :  1  ,  b  :  2  }  ')).must.eql({a: 1, b: 2})
    })

    it('should be able to read an object with many properties', () => {
      demand(simpleJsParser.parseJustObject(`{a:1, b:2, true:true, false:false, "e":"five", 'f':'six', g:7}`)).must.eql({a: 1, b: 2, true: true, false: false, e: 'five', f: 'six', g: 7})
    })
  })
})
