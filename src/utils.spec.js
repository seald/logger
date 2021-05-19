/* eslint-env mocha */

import { getAllowedNamespaces, getLevel, getFromCache, formatter, padStart, padEnd, formatDate } from './utils'
import { assert } from 'chai'
import * as path from 'path'
import { execFile } from 'child_process'
import { promisify } from 'util'

const exec = (env, file) => promisify(execFile)(process.execPath, [path.join(__dirname, './spawnedTests', file)], { env })

const levels = ['debug', 'info', 'warn', 'error']
const chalk = require('chalk')

describe('Get allowed namespaces', () => {
  it('* only test', () => {
    assert.deepStrictEqual(getAllowedNamespaces('*', levels, 1), [{ namespace: [''], level: 1 }])
  })

  it('* with level', () => {
    assert.deepStrictEqual(getAllowedNamespaces('*:error', levels, 1), [{ namespace: [''], level: 3 }])
  })

  it('* after a subNamespace', () => {
    assert.deepStrictEqual(getAllowedNamespaces('test/*:error', levels, 1), [{ namespace: ['test'], level: 3 }])
  })

  it('test with /', () => {
    assert.deepStrictEqual(getAllowedNamespaces('test/test:error', levels, 1), [
      {
        namespace: ['test', 'test'],
        level: 3
      }
    ])
  })

  it('test with unknown levels', () => {
    assert.deepStrictEqual(getAllowedNamespaces('test/test:fuck, test:info,test/test/test:warn', levels, 1), [
      {
        namespace: ['test', 'test'],
        level: 1
      },
      {
        namespace: ['test'],
        level: 1
      },
      {
        namespace: ['test', 'test', 'test'],
        level: 2
      }
    ])
  })

  it('test with multiple rules', () => {
    assert.deepStrictEqual(getAllowedNamespaces('test/test:error, test:info,test/test/test:warn', levels, 1), [
      {
        namespace: ['test', 'test'],
        level: 3
      },
      {
        namespace: ['test'],
        level: 1
      },
      {
        namespace: ['test', 'test', 'test'],
        level: 2
      }
    ])
  })
})

describe('Get levels', () => {
  const allowedNamespaces = getAllowedNamespaces(
    '*:error, test/*:warn, test/test: debug, test2/test:info, test2/test2,t,test',
    levels,
    1
  )

  it('assert allowed namespaces is what is to be expected', () => {
    assert.deepStrictEqual(allowedNamespaces, [
      { namespace: [''], level: 3 },

      { namespace: ['test'], level: 2 },
      { namespace: ['test', 'test'], level: 0 },
      { namespace: ['test2', 'test'], level: 1 },
      { namespace: ['test2', 'test2'], level: 1 },
      { namespace: ['t'], level: 1 },
      { namespace: ['test'], level: 1 }
    ])
  })

  it('get level for default behaviour', () => {
    assert.strictEqual(getLevel('test3', allowedNamespaces), 3)
  })

  it('get level for test', () => {
    assert.strictEqual(getLevel('test', allowedNamespaces), 1)
  })

  it('get level for test/test', () => {
    assert.strictEqual(getLevel('test/test', allowedNamespaces), 0)
  })

  it('get level for test2', () => {
    assert.strictEqual(getLevel('test2', allowedNamespaces), 3)
  })

  it('get level for test2/test', () => {
    assert.strictEqual(getLevel('test2/test', allowedNamespaces), 1)
  })

  it('get level for test2/test2', () => {
    assert.strictEqual(getLevel('test2/test2', allowedNamespaces), 1)
  })

  it('get level for t', () => {
    assert.strictEqual(getLevel('t', allowedNamespaces), 1)
  })
})

describe('Check cache', () => {
  const allowedNamespaces = getAllowedNamespaces('*:error', levels, 1)
  const cache = {}
  it('assert allowed namespaces is what is to be expected', () => {
    assert.deepStrictEqual(allowedNamespaces, [{ namespace: [''], level: 3 }])
  })

  it('get level for default behaviour', () => {
    assert.strictEqual(getFromCache('test3', allowedNamespaces, cache), 3)
  })

  it('check cache', () => {
    assert.deepStrictEqual(cache, { test3: 3 })
  })

  it('get level for default behaviour', () => {
    assert.strictEqual(getFromCache('test3', allowedNamespaces, cache), 3)
  })
})

describe('Check padStart', () => {
  it('test padStart when length is less than length of string', () => {
    assert.strictEqual(padStart('abc', 3, 'd'), 'abc')
    assert.strictEqual(padStart('abc', 1, 'd'), 'abc')
    assert.strictEqual(padStart('abc'), 'abc')
  })
  it('test padStart when length is more than length of string', () => {
    assert.strictEqual(padStart('cd', 3, 'ab'), 'abcd')
    assert.strictEqual(padStart('a', 3, 'b'), 'bba')
    assert.strictEqual(padStart('a', 3), '  a')
    assert.strictEqual(padStart('a', 2, 'bc'), 'bca')
    assert.strictEqual(padStart('a', 2, ' '), ' a')
  })
})
describe('Check padEnd', () => {
  it('test padEnd when length is less than length of string', () => {
    assert.strictEqual(padEnd('test', 4, 't'), 'test')
    assert.strictEqual(padEnd('test', 2, 't'), 'test')
    assert.strictEqual(padEnd('test'), 'test')
  })
  it('test padEnd when length is more than length of string', () => {
    assert.strictEqual(padEnd('test', 5, 't'), 'testt')
    assert.strictEqual(padEnd('t', 2, 'e'), 'te')
    assert.strictEqual(padEnd('t', 2), 't ')
    assert.strictEqual(padEnd('t', 2, 'es'), 'tes')
    assert.strictEqual(padEnd('t', 2, ' '), 't ')
  })
})

describe('Check formatter when chalkmap set to true', () => {
  it('test formatter with chalkmap for levels 0', () => {
    const chalkMap = {
      date: 'gray',
      debug: 'cyan',
      info: 'green',
      warn: 'yellow',
      error: 'red'
    }
    const logEntry = {
      namespace: 'test/test',
      message: 'debugMessage',
      date: new Date(),
      level: 0
    }
    const { date } = logEntry
    const formatted = formatter(logEntry, levels, chalkMap)
    const cyanLine = formatted.split('\n')
    assert.strictEqual(cyanLine.length, 1)
    assert.include(cyanLine[0], chalk.cyan('debug:test/test - debugMessage'))
    assert.include(cyanLine[0], chalk.gray(formatDate(date)))
  })
  it('test formatter with chalkmap for level 1', () => {
    const chalkMap = {
      date: 'gray',
      debug: 'cyan',
      info: 'green',
      warn: 'yellow',
      error: 'red'
    }
    const logEntry = {
      namespace: 'test2/test',
      message: 'infoMessage',
      date: new Date(),
      level: 1
    }
    const { date } = logEntry
    const formatted = formatter(logEntry, levels, chalkMap)
    const greenLine = formatted.split('\n')
    assert.strictEqual(greenLine.length, 1)
    assert.include(greenLine[0], chalk.green('info :test2/test - infoMessage'))
    assert.include(greenLine[0], chalk.gray(formatDate(date)))
  })
  it('test formatter with chalkmap for level 2', () => {
    const chalkMap = {
      date: 'gray',
      debug: 'cyan',
      info: 'green',
      warn: 'yellow',
      error: 'red'
    }
    const logEntry = {
      namespace: 'test/*',
      message: 'warnMessage',
      date: new Date(),
      level: 2
    }
    const { date } = logEntry
    const formatted = formatter(logEntry, levels, chalkMap)
    const yellowLine = formatted.split('\n')
    assert.strictEqual(yellowLine.length, 1)
    assert.include(yellowLine[0], chalk.yellow('warn :test/* - warnMessage'))
    assert.include(yellowLine[0], chalk.gray(formatDate(date)))
  })
  it('test formatter with chalkmap for level 3', () => {
    const chalkMap = {
      date: 'gray',
      debug: 'cyan',
      info: 'green',
      warn: 'yellow',
      error: 'red'
    }
    const logEntry = {
      namespace: 'error',
      message: 'errorMessage',
      date: new Date(),
      level: 3
    }
    const { date } = logEntry
    const formatted = formatter(logEntry, levels, chalkMap)
    const redLine = formatted.split('\n')
    assert.strictEqual(redLine.length, 1)
    assert.include(redLine[0], chalk.red('error:error - errorMessage'))
    assert.include(redLine[0], chalk.gray(formatDate(date)))
  })
})

describe('Check printer', () => {
  it('test printer debug level', async () => {
    const { stdout } = await exec({}, 'debugPrinter.js')
    const lines = stdout.split('\n')
    assert.strictEqual(lines.length, 2)
    assert.include(lines[0], 'test/test - debugMessage')
    assert.strictEqual(lines[1], '')
  })
  it('test printer info level', async () => {
    const { stdout } = await exec({}, 'infoPrinter.js')
    const lines = stdout.split('\n')
    assert.strictEqual(lines.length, 2)
    assert.include(lines[0], 'test2/test - infoMessage')
    assert.strictEqual(lines[1], '')
  })
  it('test printer warn level', async () => {
    const { stdout } = await exec({}, 'warnPrinter.js')
    const lines = stdout.split('\n')
    assert.strictEqual(lines.length, 2)
    assert.include(lines[0], 'test/* - warnMessage')
    assert.strictEqual(lines[1], '')
  })
  it('test printer error level', async () => {
    const { stderr } = await exec({}, 'errorPrinter.js')
    const lines = stderr.split('\n')
    assert.strictEqual(lines.length, 2)
    assert.include(lines[0], 'error - errorMessage')
    assert.strictEqual(lines[1], '')
  })
  it('test printer with low level for its namespace', async () => {
    const { stdout } = await exec({}, 'infoNotPrinted.js')
    const lines = stdout.split('\n')
    assert.strictEqual(lines.length, 1)
    assert.strictEqual(lines[0], '')
  })
})
