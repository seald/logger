import makeLogger, {setLogLevel, setHistorySize, flushToString} from './'

import {ok} from 'assert'

ok(typeof makeLogger === 'function')

ok(typeof setLogLevel === 'function')

ok(typeof setHistorySize === 'function')

ok(typeof flushToString === 'function')

const logger = makeLogger('test-logger')

ok(typeof logger.debug === 'function')
ok(typeof logger.info === 'function')
ok(typeof logger.warn === 'function')
ok(typeof logger.error === 'function')

console.log('typings look ok')
