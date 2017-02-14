'use strict'
/* global describe, it */
import {getAllowedNamespaces, getLevel, getFromCache, formatter} from './utils'
import {assert} from 'chai'

const levels = [
  'debug',
  'info',
  'warn',
  'error'
]

describe('Get allowed namespaces', () => {
  it('* only test', () => {
    assert.deepEqual(getAllowedNamespaces('*', levels, 1), [ { namespace: [ '' ], level: 1 } ])
  })

  it('* with level', () => {
    assert.deepEqual(getAllowedNamespaces('*:error', levels, 1), [ { namespace: [ '' ], level: 3 } ])
  })

  it('* after a subNamespace', () => {
    assert.deepEqual(getAllowedNamespaces('test/*:error', levels, 1), [ { namespace: [ 'test' ], level: 3 } ])
  })

  it('test with /', () => {
    assert.deepEqual(getAllowedNamespaces('test/test:error', levels, 1), [ {
      namespace: [ 'test', 'test' ],
      level: 3
    } ])
  })

  it('test with unknown levels', () => {
    assert.deepEqual(getAllowedNamespaces('test/test:fuck, test:info,test/test/test:warn', levels, 1), [
      {
        namespace: [ 'test', 'test' ],
        level: 1
      }, {
        namespace: [ 'test' ],
        level: 1
      }, {
        namespace: [ 'test', 'test', 'test' ],
        level: 2
      }
    ])
  })

  it('test with multiple rules', () => {
    assert.deepEqual(getAllowedNamespaces('test/test:error, test:info,test/test/test:warn', levels, 1), [
      {
        namespace: [ 'test', 'test' ],
        level: 3
      }, {
        namespace: [ 'test' ],
        level: 1
      }, {
        namespace: [ 'test', 'test', 'test' ],
        level: 2
      }
    ])
  })
})

describe('Get levels', () => {
  const allowedNamespaces = getAllowedNamespaces('*:error, test/*:warn, test/test: debug, test2/test:info, test2/test2', levels, 1)

  it('assert allowed namespaces is what is to be expected', () => {
    assert.deepEqual(allowedNamespaces, [
      { namespace: [ '' ], level: 3 },
      { namespace: [ 'test' ], level: 2 },
      { namespace: [ 'test', 'test' ], level: 0 },
      { namespace: [ 'test2', 'test' ], level: 1 },
      { namespace: [ 'test2', 'test2' ], level: 1 }
    ])
  })

  it('get level for default behaviour', () => {
    assert.equal(getLevel('test3', allowedNamespaces), 3)
  })

  it('get level for test', () => {
    assert.equal(getLevel('test', allowedNamespaces), 2)
  })

  it('get level for test/test', () => {
    assert.equal(getLevel('test/test', allowedNamespaces), 0)
  })

  it('get level for test2', () => {
    assert.equal(getLevel('test2', allowedNamespaces), 3)
  })

  it('get level for test2/test', () => {
    assert.equal(getLevel('test2/test', allowedNamespaces), 1)
  })

  it('get level for test2/test2', () => {
    assert.equal(getLevel('test2/test2', allowedNamespaces), 1)
  })
})

describe('Check cache', () => {
  const allowedNamespaces = getAllowedNamespaces('*:error', levels, 1)
  const cache = {}
  it('assert allowed namespaces is what is to be expected', () => {
    assert.deepEqual(allowedNamespaces, [
      { namespace: [ '' ], level: 3 }
    ])
  })

  it('get level for default behaviour', () => {
    assert.equal(getFromCache('test3', allowedNamespaces, cache), 3)
  })

  it('check cache', () => {
    assert.deepEqual(cache, { 'test3': 3 })
  })
})

describe('Check formatter', () => {
  const regex = /\[([0-9]{2}):([0-9]{2}):([0-9]{2})\.([0-9]{3}) ([0-9]{2})\/([0-9]{2})\/([0-9]{4}) UTC([+-])([0-9]{2})] ([A-z/]+):([a-z ]+) - (.*)/
  it('test formatter with warn', () => {
    const logEntry = {
      namespace: 'test/test',
      message: 'testMessage',
      date: new Date(),
      level: 2
    }
    const formatted = formatter(logEntry, levels)
    assert(regex.test(formatted))
    const [ , hours, minutes, seconds, milliseconds, day, month, year, UTCSign, UTCOffset, namespace, level, message ] = regex.exec(formatted)
    assert.equal(parseInt(hours), logEntry.date.getHours())
    assert.equal(parseInt(minutes), logEntry.date.getMinutes())
    assert.equal(parseInt(seconds), logEntry.date.getSeconds())
    assert.equal(parseInt(milliseconds), logEntry.date.getMilliseconds())
    assert.equal(parseInt(day), logEntry.date.getDate())
    assert.equal(parseInt(month), logEntry.date.getMonth() + 1)
    assert.equal(parseInt(year), logEntry.date.getFullYear())
    assert.equal(UTCSign, logEntry.date.getTimezoneOffset() <= 0 ? '+' : '-')
    assert.equal(parseInt(UTCOffset), Math.abs(logEntry.date.getTimezoneOffset() / 60))
    assert.equal(namespace, logEntry.namespace)
    assert.equal(level, 'warn ')
    assert.equal(message, message)
  })
})
