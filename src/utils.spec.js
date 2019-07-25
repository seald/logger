/* eslint-env mocha */

import { getAllowedNamespaces, getLevel, getFromCache, formatter, padStart, padEnd } from './utils'
import { spawn } from 'child_process'
import path from 'path'
import { assert } from 'chai'
const MockDate = require('mockdate')
const levels = ['debug', 'info', 'warn', 'error']
const chalk = require('chalk')

const nodeCommand = process.execPath
const spawnPrinter = async (file) => {
  const subprocess = spawn(nodeCommand, [path.join(__dirname, './indexTests', file)])
  const end = new Promise((resolve, reject) => {
    subprocess.on('exit', (code) => {
      if (code === 0) resolve()
      else reject(new Error('exit code is ' + code))
    })
    subprocess.on('error', (error) => {
      reject(error)
    })
  })
  let stdout = ''
  subprocess.stdout.on('data', (data) => {
    stdout += data
  })
  let stderr = ''
  subprocess.stderr.on('data', (data) => {
    stderr += data
  })
  await end
  return { stdout, stderr }
}

describe('Get allowed namespaces', () => {
  it('* only test', () => {
    assert.deepEqual(getAllowedNamespaces('*', levels, 1), [{ namespace: [''], level: 1 }])
  })

  it('* with level', () => {
    assert.deepEqual(getAllowedNamespaces('*:error', levels, 1), [{ namespace: [''], level: 3 }])
  })

  it('* after a subNamespace', () => {
    assert.deepEqual(getAllowedNamespaces('test/*:error', levels, 1), [{ namespace: ['test'], level: 3 }])
  })

  it('test with /', () => {
    assert.deepEqual(getAllowedNamespaces('test/test:error', levels, 1), [
      {
        namespace: ['test', 'test'],
        level: 3
      }
    ])
  })

  it('test with unknown levels', () => {
    assert.deepEqual(getAllowedNamespaces('test/test:fuck, test:info,test/test/test:warn', levels, 1), [
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
    assert.deepEqual(getAllowedNamespaces('test/test:error, test:info,test/test/test:warn', levels, 1), [
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
    assert.deepEqual(allowedNamespaces, [
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
    assert.equal(getLevel('test3', allowedNamespaces), 3)
  })

  it('get level for test', () => {
    assert.equal(getLevel('test', allowedNamespaces), 1)
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

  it('get level for t', () => {
    assert.equal(getLevel('t', allowedNamespaces), 1)
  })
})

describe('Check cache', () => {
  const allowedNamespaces = getAllowedNamespaces('*:error', levels, 1)
  const cache = {}
  it('assert allowed namespaces is what is to be expected', () => {
    assert.deepEqual(allowedNamespaces, [{ namespace: [''], level: 3 }])
  })

  it('get level for default behaviour', () => {
    assert.equal(getFromCache('test3', allowedNamespaces, cache), 3)
  })

  it('check cache', () => {
    assert.deepEqual(cache, { test3: 3 })
  })

  it('get level for default behaviour', () => {
    assert.equal(getFromCache('test3', allowedNamespaces, cache), 3)
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

describe('Check formatter when the Date object is mocked', () => {
  const regex = /\[([0-9]{2}):([0-9]{2}):([0-9]{2})\.([0-9]{3}) ([0-9]{2})\/([0-9]{2})\/([0-9]{4}) UTC([+-])([0-9]{2})] ([a-z ]+):([A-z/]+) - (.*)/
  it('test formatter with warn when the Date is set with negatif getTimeZone', () => {
    MockDate.set(new Date(), -60)
    const logEntry = {
      namespace: 'test/test',
      message: 'testMessage',
      date: new Date(),
      level: 2
    }
    const formatted = formatter(logEntry, levels)
    assert(regex.test(formatted))
    const [, hours, minutes, seconds, milliseconds, day, month, year, UTCSign, UTCOffset, level, namespace, message] = regex.exec(formatted)
    assert.equal(parseInt(hours), logEntry.date.getHours())
    assert.equal(parseInt(minutes), logEntry.date.getMinutes())
    assert.equal(parseInt(seconds), logEntry.date.getSeconds())
    assert.equal(parseInt(milliseconds), logEntry.date.getMilliseconds())
    assert.equal(parseInt(day), logEntry.date.getDate())
    assert.equal(parseInt(month), logEntry.date.getMonth() + 1)
    assert.equal(parseInt(year), logEntry.date.getFullYear())
    assert.equal(UTCSign, '+')
    assert.equal(parseInt(UTCOffset), Math.abs(logEntry.date.getTimezoneOffset() / 60))
    assert.equal(namespace, logEntry.namespace)
    assert.equal(level, 'warn ')
    assert.equal(message, message)
    MockDate.reset()
  })

  it('test formatter with warn when the Date is set with postif getTimeZone', () => {
    MockDate.set(new Date(), 60)
    const logEntry = {
      namespace: 'test/test',
      message: 'testMessage',
      date: new Date(),
      level: 2
    }
    const formatted = formatter(logEntry, levels)
    assert(regex.test(formatted))
    const [, hours, minutes, seconds, milliseconds, day, month, year, UTCSign, UTCOffset, level, namespace, message] = regex.exec(formatted)
    assert.equal(parseInt(hours), logEntry.date.getHours())
    assert.equal(parseInt(minutes), logEntry.date.getMinutes())
    assert.equal(parseInt(seconds), logEntry.date.getSeconds())
    assert.equal(parseInt(milliseconds), logEntry.date.getMilliseconds())
    assert.equal(parseInt(day), logEntry.date.getDate())
    assert.equal(parseInt(month), logEntry.date.getMonth() + 1)
    assert.equal(parseInt(year), logEntry.date.getFullYear())
    assert.equal(UTCSign, '-')
    assert.equal(parseInt(UTCOffset), Math.abs(logEntry.date.getTimezoneOffset() / 60))
    assert.equal(namespace, logEntry.namespace)
    assert.equal(level, 'warn ')
    assert.equal(message, message)
    MockDate.reset()
  })
})

describe('Check formatter when chalkmap set to true', () => {
  it('test formatter with chalkmap for all levels', () => {
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
    const formatted = formatter(logEntry, levels, chalkMap)
    const cyanLine = formatted.split('\n')
    assert.strictEqual(cyanLine.length, 1)
    assert.include(cyanLine[0], chalk.cyan('debug:test/test - debugMessage'))

    const logEntry2 = {
      namespace: 'test2/test',
      message: 'infoMessage',
      date: new Date(),
      level: 1
    }
    const formatted2 = formatter(logEntry2, levels, chalkMap)
    const greenLine = formatted2.split('\n')
    assert.strictEqual(greenLine.length, 1)
    assert.include(greenLine[0], chalk.green('info :test2/test - infoMessage'))

    const logEntry3 = {
      namespace: 'test/*',
      message: 'warnMessage',
      date: new Date(),
      level: 2
    }
    const formatted3 = formatter(logEntry3, levels, chalkMap)
    const yellowLine = formatted3.split('\n')
    assert.strictEqual(yellowLine.length, 1)
    assert.include(yellowLine[0], chalk.yellow('warn :test/* - warnMessage'))

    const logEntry4 = {
      namespace: '*',
      message: 'errorMessage',
      date: new Date(),
      level: 3
    }
    const formatted4 = formatter(logEntry4, levels, chalkMap)
    const redLine = formatted4.split('\n')
    assert.strictEqual(redLine.length, 1)
    assert.include(redLine[0], chalk.red('error:* - errorMessage'))
  })
})

describe('Check printer', () => {
  it('test printer debug level', async () => {
    const { stdout } = await spawnPrinter('debugPrinter.js')
    const lines = stdout.split('\n')
    assert.strictEqual(lines.length, 2)
    console.log(stdout)
    assert.include(lines[0], 'test/test - debugMessage')
    assert.include(lines[1], '')
  })
  it('test printer info level', async () => {
    const { stdout } = await spawnPrinter('infoPrinter.js')
    const lines = stdout.split('\n')
    assert.strictEqual(lines.length, 2)
    console.log(stdout)
    assert.include(lines[0], 'test2/test - infoMessage')
    assert.include(lines[1], '')
  })
  it('test printer error level', async () => {
    const { stderr } = await spawnPrinter('errorPrinter.js')
    const lines = stderr.split('\n')
    assert.strictEqual(lines.length, 2)
    console.log(stderr)
    assert.include(lines[0], '* - errorMessage')
    assert.include(lines[1], '')
  })
})
