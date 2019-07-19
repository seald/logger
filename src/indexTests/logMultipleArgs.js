import makeLogger from '../index.js'
const log = makeLogger('log-multiple-arguments')

log.info('test', 'test', 'test')
