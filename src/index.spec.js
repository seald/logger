/* eslint-env mocha */
import { spawn } from 'child_process'
import path from 'path'
import { assert } from 'chai'
import makeLogger, { setHistorySize, flushToString } from './index.js'

const log = makeLogger('log-level-test')

const nodeCommand = process.execPath

export const spawnFile = async (env, file) => {
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
    describe('test LOG_LEVEL environment', () => {
      it('test LOG_LEVEL scoped namespaces debug Level', async () => {
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
      it('test LOG_LEVEL wildcard namespace debug Level', async () => {
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
      it('test LOG_LEVEL scoped namespace error Level', async () => {
        const { stderr } = await spawnFile({ LOG_LEVEL: 'log-level-test:error' }, 'logLevel.js')
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
    })

    describe('test DEBUG environment', () => {
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
      it('test DEBUG wildcard namespace debug Level', async () => {
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
      it('test DEBUG scoped namespace error Level', async () => {
        const { stderr } = await spawnFile({ DEBUG: 'log-level-test:error' }, 'logLevel.js')
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
    })

    describe('test DEBUG_NAMESPACES environment', () => {
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
      it('test DEBUG_NAMESPACES wildcard namespace debug Level', async () => {
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
      it('test DEBUG_NAMESPACES scoped namespace error Level', async () => {
        const { stderr } = await spawnFile({ DEBUG_NAMESPACES: 'log-level-test:error' }, 'logLevel.js')

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
    })

    describe('test environment when undefined', () => {
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
  describe('test logger when crashed and given to type objects', () => {
    it('test logger when crashed with controlled object type', async () => {
      const { stdout } = await spawnFile({ }, 'logControlledObject.js')
      assert.include(stdout, 'Couldn\'t output log because tu ne me stringifieras pas')
    })
    it('test logger when crashed with error type ', async () => {
      const { stderr } = await spawnFile({ }, 'logErrorType.js')
      assert.include(stderr, 'error:log-error-type')
      assert.include(stderr, 'Error message')
      assert.include(stderr, 'code: MY_CODE')
    })
    it('test logger when crashed with undefined', async () => {
      const { stdout } = await spawnFile({ }, 'logUndefined.js')
      assert.include(stdout, '')
    })
    it('test type objects', async () => {
      const { stdout } = await spawnFile({ }, 'logAllTypes.js')
      assert.include(stdout, 'test')
      assert.include(stdout, '1')
      assert.include(stdout, '{\n  "foo": "bar"\n}')
      assert.include(stdout, 'null')
      assert.include(stdout, 'true')
      assert.include(stdout, 'Symbol(symbol)')
      assert.include(stdout, '() => {\n  console.log(\'test\');\n}')
    })
    it('test type objects with multiple arguments', async () => {
      const { stdout } = await spawnFile({ }, 'logMultipleArgs.js')
      assert.include(stdout, 'test test test')
    })
  })
})

describe('test setHistorySize and flushToString', () => {
  it('test setHistorySize with fewer logs than historySize', async () => {
    setHistorySize(5)
    log.debug('this should be debug level 1')
    log.debug('this should be debug level 2')
    log.debug('this should be debug level 3')
    const result = flushToString()
    const lines = result.split('\n')
    assert.strictEqual(lines.length, 3)
    assert.include(lines[0], 'this should be debug level 1')
    assert.include(lines[1], 'this should be debug level 2')
    assert.include(lines[2], 'this should be debug level 3')
  })
  it('test setHistorySize with equal flushToString output size', async () => {
    setHistorySize(5)
    log.debug('this should be debug level 4')
    log.debug('this should be debug level 5')
    log.debug('this should be debug level 6')

    const result2 = flushToString()
    const lines2 = result2.split('\n')
    assert.strictEqual(lines2.length, 5)
    assert.include(lines2[0], 'this should be debug level 2')
    assert.include(lines2[1], 'this should be debug level 3')
    assert.include(lines2[2], 'this should be debug level 4')
    assert.include(lines2[3], 'this should be debug level 5')
    assert.include(lines2[4], 'this should be debug level 6')
  })
})
