import makeLogger from '../index.js'
const log = makeLogger('log-error-type')
const error = new Error('Error message')

error.code = 'MY_CODE'

log.error(error)
