'use strict'
/* global describe, it */
import {getAllowedNamespaces, getLevel, getFromCache} from './utils'
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

  it('assert allowed namespaces is what is to be expected',() => {
    assert.deepEqual(allowedNamespaces, [
      {namespace: [''], level: 3},
      {namespace: ['test'], level: 2},
      {namespace: ['test', 'test'], level: 0},
      {namespace: ['test2', 'test'], level: 1},
      {namespace: ['test2', 'test2'], level: 1}
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