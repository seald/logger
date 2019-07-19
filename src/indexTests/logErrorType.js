import makeLogger from '../index.js'
const log = makeLogger('log-error-type')

log.error(new Error('error'))
