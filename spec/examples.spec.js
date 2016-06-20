'use strict'

const demand = require('must')

const simpleJsParser = require('../src/server/simpleJsParser')

describe('exaples', () => {
  it('example 1', () => {
    const text = `
    {
      alpha: 1,
      beta: 'two',
      gamma: "three",
      things: [1, 2, 3],
      "person": {
        'name': 'Ralf',
        age: 27,
        maried: true
      },
      true: 'wibble'
    }
    `
    demand(simpleJsParser.parseJustObject(text)).must.eql({
      alpha: 1,
      beta: 'two',
      gamma: 'three',
      things: [1, 2, 3],
      person: {
        name: 'Ralf',
        age: 27,
        maried: true
      },
      true: 'wibble'
    })
  })

  it('error 1', () => {
    const text = `
    {
      alpha: 1,
      beta: 'two',
      gamma: "three",
      things: [1, 2, 3, cheese],
      "person": {
        'name': 'Ralf',
        age: 27,
        maried: true
      },
      true: 'wibble'
    }
    `
    simpleJsParser.parseJustObject(text)
  })
})
