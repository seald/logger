import makeLogger, { setLogLevel } from '../index.js'
const log = makeLogger('log-level-test')

log.debug('this should be debug level')

log.info('this should be info level')

log.warn('this should be warn level')

log.error('this should be error level')

setLogLevel('*:debug')

log.debug('this should be debug level')
