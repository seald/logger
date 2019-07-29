import makeLogger from '../index.js'
const log = makeLogger('log-controlled-object')

log.info({
  toJSON () {
    throw new Error('tu ne me stringifieras pas')
  }
})
