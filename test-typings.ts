import makeLogger, {setLogLevel, setHistorySize, flushToString} from './'

import {ok} from 'assert'

ok(typeof makeLogger === 'function')

ok(typeof setLogLevel === 'function')

ok(typeof setHistorySize === 'function')

ok(typeof flushToString === 'function')

console.log('typings look ok')
