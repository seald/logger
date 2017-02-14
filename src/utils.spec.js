'use strict'
/* global describe, it */
import {getAllowedNamespaces, getLevel, getFromCache} from './utils'
import {assert} from 'chai'

describe('Get allowed namespaces', () => {
  const levels = [
    'debug',
    'info',
    'warn',
    'error'
  ]

  it('* only test', () => {
    assert.deepEqual(getAllowedNamespaces('*', levels, 1), [ { namespace: [ '' ], level: 1 } ])
  })

  it('* with level', () => {
    assert.deepEqual(getAllowedNamespaces('*:error', levels, 1), [ { namespace: [ '' ], level: 3 } ])
  })

  it('test with /', () => {
    assert.deepEqual(getAllowedNamespaces('test/test:error', levels, 1), [ {
      namespace: [ 'test', 'test' ],
      level: 3
    } ])
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
