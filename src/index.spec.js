/* eslint-env mocha */
import { spawn } from 'child_process'
import path from 'path'
import { assert } from 'chai'
import { setHistorySize, flushToString, history } from './index.js'

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

describe('spawned tests', () => {
  describe('test environment Variables Alias', () => {
    describe('test environment LOG_LEVEL', () => {
      it('test LOG_LEVEL scoped namespace error Level', async () => {
        const { stderr } = await spawnFile({ LOG_LEVEL: 'log-level-test:error' }, 'logLevel.js')
        const linesErr = stderr.split('\n')
        assert.strictEqual(linesErr.length, 2)
        assert.include(linesErr[0], 'this should be error level')
        assert.include(linesErr[1], '')
      })
      it('test LOG_LEVEL scoped namespace warn Level', async () => {
        const { stdout, stderr } = await spawnFile({ LOG_LEVEL: 'log-level-test:warn' }, 'logLevel.js')
        const lines = stdout.split('\n')
        assert.strictEqual(lines.length, 2)
        assert.include(lines[0], 'this should be warn level')
        assert.include(lines[1], '')

        const linesErr = stderr.split('\n')
        assert.strictEqual(lines.length, 2)
        assert.include(linesErr[0], 'this should be error level')
        assert.include(linesErr[1], '')
      })
      it('test LOG_LEVEL scoped namespace debug Level', async () => {
        const { stdout, stderr } = await spawnFile({ LOG_LEVEL: 'log-level-test:debug' }, 'logLevel.js')
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
      it('test LOG_LEVEL scoped namespace info Level', async () => {
        const { stdout, stderr } = await spawnFile({ LOG_LEVEL: 'log-level-test:info' }, 'logLevel.js')
        const lines = stdout.split('\n')
        assert.strictEqual(lines.length, 3)
        assert.include(lines[0], 'this should be info level')
        assert.include(lines[1], 'this should be warn level')

        const linesErr = stderr.split('\n')
        assert.strictEqual(linesErr.length, 2)
        assert.include(linesErr[0], 'this should be error level')
        assert.include(linesErr[1], '')
      })
      it('test LOG_LEVEL wildcard namespace error Level', async () => {
        const { stderr } = await spawnFile({ LOG_LEVEL: '*:error' }, 'logLevel.js')

        const linesErr = stderr.split('\n')
        assert.strictEqual(linesErr.length, 2)
        assert.include(linesErr[0], 'this should be error level')
        assert.include(linesErr[1], '')
      })
      it('test LOG_LEVEL wildcard namespace Debug Level', async () => {
        const { stdout, stderr } = await spawnFile({ LOG_LEVEL: '*:debug' }, 'logLevel.js')
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
      it('test LOG_LEVEL wildcard namespace info Level', async () => {
        const { stdout, stderr } = await spawnFile({ LOG_LEVEL: '*:info' }, 'logLevel.js')
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
      it('test LOG_LEVEL wildcard namespace warn Level', async () => {
        const { stdout, stderr } = await spawnFile({ LOG_LEVEL: '*:warn' }, 'logLevel.js')
        const lines = stdout.split('\n')
        assert.strictEqual(lines.length, 2)
        assert.include(lines[0], 'this should be warn level')
        assert.include(lines[1], '')

        const linesErr = stderr.split('\n')
        assert.strictEqual(linesErr.length, 2)
        assert.include(linesErr[0], 'this should be error level')
        assert.include(linesErr[1], '')
      })
    })
    describe('test environment DEBUG ', () => {
      it('test DEBUG scoped namespace error Level', async () => {
        const { stdout, stderr } = await spawnFile({ DEBUG: 'log-level-test:debug' }, 'logLevel.js')
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

      it('test DEBUG scoped namespace warn Level', async () => {
        const { stdout, stderr } = await spawnFile({ DEBUG: 'log-level-test:warn' }, 'logLevel.js')
        const lines = stdout.split('\n')
        assert.strictEqual(lines.length, 2)
        assert.include(lines[0], 'this should be warn level')
        assert.include(lines[1], '')

        const linesErr = stderr.split('\n')
        assert.strictEqual(lines.length, 2)
        assert.include(linesErr[0], 'this should be error level')
        assert.include(linesErr[1], '')
      })
      it('test DEBUG scoped namespace debug Level', async () => {
        const { stdout, stderr } = await spawnFile({ DEBUG: 'log-level-test:debug' }, 'logLevel.js')
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
      it('test DEBUG scoped namespace info Level', async () => {
        const { stdout, stderr } = await spawnFile({ DEBUG: 'log-level-test:info' }, 'logLevel.js')
        const lines = stdout.split('\n')
        assert.strictEqual(lines.length, 3)
        assert.include(lines[0], 'this should be info level')
        assert.include(lines[1], 'this should be warn level')

        const linesErr = stderr.split('\n')
        assert.strictEqual(linesErr.length, 2)
        assert.include(linesErr[0], 'this should be error level')
        assert.include(linesErr[1], '')
      })
      it('test DEBUG wildcard namespace error Level', async () => {
        const { stderr } = await spawnFile({ DEBUG: '*:error' }, 'logLevel.js')

        const linesErr = stderr.split('\n')
        assert.strictEqual(linesErr.length, 2)
        assert.include(linesErr[0], 'this should be error level')
        assert.include(linesErr[1], '')
      })
      it('test DEBUG wildcard namespace Debug Level', async () => {
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
      it('test DEBUG wildcard namespace info Level', async () => {
        const { stdout, stderr } = await spawnFile({ DEBUG: '*:info' }, 'logLevel.js')
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
      it('test DEBUG wildcard namespace warn Level', async () => {
        const { stdout, stderr } = await spawnFile({ DEBUG: '*:warn' }, 'logLevel.js')
        const lines = stdout.split('\n')
        assert.strictEqual(lines.length, 2)
        assert.include(lines[0], 'this should be warn level')
        assert.include(lines[1], '')

        const linesErr = stderr.split('\n')
        assert.strictEqual(linesErr.length, 2)
        assert.include(linesErr[0], 'this should be error level')
        assert.include(linesErr[1], '')
      })
    })

    describe('test environment DEBUG_NAMESPACES ', () => {
      it('test DEBUG_NAMESPACES scoped namespace error Level', async () => {
        const { stdout, stderr } = await spawnFile({ DEBUG_NAMESPACES: 'log-level-test:debug' }, 'logLevel.js')
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

      it('test DEBUG_NAMESPACES scoped namespace warn Level', async () => {
        const { stdout, stderr } = await spawnFile({ DEBUG_NAMESPACES: 'log-level-test:warn' }, 'logLevel.js')
        const lines = stdout.split('\n')
        assert.strictEqual(lines.length, 2)
        assert.include(lines[0], 'this should be warn level')
        assert.include(lines[1], '')

        const linesErr = stderr.split('\n')
        assert.strictEqual(lines.length, 2)
        assert.include(linesErr[0], 'this should be error level')
        assert.include(linesErr[1], '')
      })
      it('test DEBUG_NAMESPACES scoped namespace debug Level', async () => {
        const { stdout, stderr } = await spawnFile({ DEBUG_NAMESPACES: 'log-level-test:debug' }, 'logLevel.js')
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
      it('test DEBUG_NAMESPACES scoped namespace info Level', async () => {
        const { stdout, stderr } = await spawnFile({ DEBUG_NAMESPACES: 'log-level-test:info' }, 'logLevel.js')
        const lines = stdout.split('\n')
        assert.strictEqual(lines.length, 3)
        assert.include(lines[0], 'this should be info level')
        assert.include(lines[1], 'this should be warn level')

        const linesErr = stderr.split('\n')
        assert.strictEqual(linesErr.length, 2)
        assert.include(linesErr[0], 'this should be error level')
        assert.include(linesErr[1], '')
      })
      it('test DEBUG_NAMESPACES wildcard namespace error Level', async () => {
        const { stderr } = await spawnFile({ DEBUG_NAMESPACES: '*:error' }, 'logLevel.js')

        const linesErr = stderr.split('\n')
        assert.strictEqual(linesErr.length, 2)
        assert.include(linesErr[0], 'this should be error level')
        assert.include(linesErr[1], '')
      })
      it('test DEBUG_NAMESPACES wildcard namespace Debug Level', async () => {
        const { stdout, stderr } = await spawnFile({ DEBUG_NAMESPACES: '*:debug' }, 'logLevel.js')
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
      it('test DEBUG_NAMESPACES wildcard namespace info Level', async () => {
        const { stdout, stderr } = await spawnFile({ DEBUG_NAMESPACES: '*:info' }, 'logLevel.js')
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
      it('test DEBUG_NAMESPACES wildcard namespace warn Level', async () => {
        const { stdout, stderr } = await spawnFile({ DEBUG_NAMESPACES: '*:warn' }, 'logLevel.js')
        const lines = stdout.split('\n')
        assert.strictEqual(lines.length, 2)
        assert.include(lines[0], 'this should be warn level')
        assert.include(lines[1], '')

        const linesErr = stderr.split('\n')
        assert.strictEqual(linesErr.length, 2)
        assert.include(linesErr[0], 'this should be error level')
        assert.include(linesErr[1], '')
      })
    })
    describe('test environment undefined', () => {
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
  })
  describe('test logger crash when type object given', () => {
    it('test JSON.stringify when crashed', async () => {
      const { stdout } = await spawnFile({ }, 'logObjectTypes.js')
      assert.include(stdout, 'Couldn\'t output log because tu ne me stringifieras pas')
    })
    it('test other type objects', async () => {
      const { stdout } = await spawnFile({ }, 'logObjectTypes.js')
      console.log(stdout)
    })
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
    const result = flushToString()
    const lines = result.split('\n')
    assert.strictEqual(lines.length, 2)
    assert.include(lines[0], 'testMessage')
    assert.include(lines[1], 'testMessage2')
  })
})
