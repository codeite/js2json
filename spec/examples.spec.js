'use strict'

const demand = require('must')

const simpleJsParser = require('../src/server/simpleJsParser')

describe('simpleJsParser', () => {
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
    demand(simpleJsParser.parse(text)).must.eql({
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
    simpleJsParser.parse(text)
  })
})
