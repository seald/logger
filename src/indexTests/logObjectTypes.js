import makeLogger from '../index.js'
const log = makeLogger('log-object-type-test')

log.info({
  toJSON () {
    throw new Error('tu ne me stringifieras pas')
  }
})
log.info('test')
log.info(1)
log.info({ foo: 'bar' })
log.info(null)
log.info(new Error('error'))
log.info(true)
log.info(Symbol('symbol'))
log.info(() => { console.log('test') })
