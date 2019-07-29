import makeLogger from '../index.js'
const log = makeLogger('log-object-type-test')

log.info('test')
log.info(1)
log.info({ foo: 'bar' })
log.info(null)
log.info(true)
log.info(Symbol('symbol'))
log.info(/* istanbul ignore next */ () => { console.log('test') })
