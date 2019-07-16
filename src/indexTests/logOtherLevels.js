import makeLogger from '../index.js'
const log = makeLogger('log-level-test')

log.info({
  toJSON () {
    throw new Error('tu ne me stringifieras pas')
  }
})

log.info('test', 1, { foo: 'bar' }, null, new Error('error'), true, Symbol('symbol'), () => { console.log('test') })
