/* eslint-env mocha */
import { spawn } from 'child_process'
import path from 'path'
import { assert } from 'chai'
import { setHistorySize, history, flushToString } from './index.js'

const nodeCommand = process.env.NODE_COMMAND || 'node'

const spawnFile = async (env, file) => {
  const subprocess = spawn(nodeCommand, [path.join(__dirname, './indexTests', file)], { env })
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
describe('forked tests', () => {
  it('test LOG_LEVEL', async () => {
    const { stdout, stderr } = await spawnFile({ LOG_LEVEL: 'log-level-test:error' }, 'logLevel.js')
    assert.strictEqual(stdout, '')
    const lines = stderr.split('\n')
    assert.strictEqual(lines.length, 2)
    assert.strictEqual(lines[1], '')
    assert.include(lines[0], 'this should be error level')
  })
  it('test DEBUG', async () => {
    const { stdout, stderr } = await spawnFile({ DEBUG: '*:debug' }, 'logLevel.js')
    const lines = stdout.split('\n')
    assert.strictEqual(lines.length, 4)
    assert.include(lines[0], 'this should be debug level')
    assert.include(lines[1], 'this should be info level')
    assert.include(lines[2], 'this should be warn level')
    assert.include(lines[3], '')

    const linesErr = stderr.split('\n')
    assert.strictEqual(linesErr.length, 2)
    assert.include(linesErr[0], 'this should be error level')
    assert.include(linesErr[1], '')
  })
  it('test DEBUG NAMESPACES', async () => {
    const { stdout, stderr } = await spawnFile({ DEBUG_NAMESPACES: '*:warn' }, 'logLevel.js')
    const lines = stdout.split('\n')
    assert.strictEqual(lines.length, 2)
    assert.include(lines[0], 'this should be warn level')

    const linesErr = stderr.split('\n')
    assert.strictEqual(linesErr.length, 2)
    assert.include(linesErr[0], 'this should be error level')
    assert.include(linesErr[1], '')
  })

  it('test undefined', async () => {
    const { stdout, stderr } = await spawnFile({ }, 'logLevel.js')
    const lines = stdout.split('\n')
    assert.strictEqual(lines.length, 3)
    assert.include(lines[0], 'this should be info level')
    assert.include(lines[1], 'this should be warn level')
    assert.include(lines[2], '')

    const linesErr = stderr.split('\n')
    assert.strictEqual(linesErr.length, 2)
    assert.include(linesErr[0], 'this should be error level')
    assert.include(linesErr[1], '')
  })
})
describe('test log', () => {
  it('test log types', async () => {
    const { stdout, stderr } = await spawnFile({ }, 'logOtherLevels.js')
    assert.include(stdout, 'Couldn\'t output log because tu ne me stringifieras pas')

    console.log('stdout', stdout)
    console.log('stderr', stderr)
  })
})
describe('test setHistorySize', () => {
  it('size less than history length', async () => {
    const newSize = 50
    setHistorySize(newSize)
    assert.equal(history.length, newSize)
  })
  it('size equal history length', async () => {
    const newSizeHistory = 10000
    setHistorySize(newSizeHistory)
    assert.equal(history.length, newSizeHistory)
  })
})

describe('test flushToString', () => {
  it('flushToString is formatting items and joining with new line ', async () => {
    history[0] = {
      namespace: 'test/test',
      date: new Date(),
      level: 2,
      message: 'testMessage'
    }
    history[1] = {
      namespace: 'test/test2',
      date: new Date(),
      level: 2,
      message: 'testMessage2'
    }
    flushToString()
  })
})
