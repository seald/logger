import { formatter, getAllowedNamespaces, printer } from './utils'
import { SetLogLevel } from './declaration'

const levels = [
  'debug',
  'info',
  'warn',
  'error'
]
const chalkMap = {
  date: 'gray',
  debug: 'cyan',
  info: 'green',
  warn: 'yellow',
  error: 'red'
}
const history = new Array(10000)

let allowedNamespaces
const cache = {}

export const setLogLevel = (logLevel) => {
  allowedNamespaces = getAllowedNamespaces(logLevel, levels, 1)
}

setLogLevel('*:info,' + (process.env.LOG_LEVEL || process.env.DEBUG_NAMESPACES || process.env.DEBUG || ''))

/**
 *
 * @param {number} level
 * @param {string} namespace
 * @returns {function(...*)}
 */
const logger = (level, namespace) => (...messages) => {
  let message
  try {
    message = messages.map(_message => {
      const typeOfMessage = typeof _message
      if (typeOfMessage === 'string') return _message
      else if (typeOfMessage === 'number') return String(_message)
      else if (typeOfMessage === 'object') {
        if (_message instanceof Error) return `${Object.keys(_message).reduce((accumulator, key) => accumulator + `${key}: ${_message[key]}`, '')} ${_message.stack}`
        else return JSON.stringify(_message, null, 2)
      } else if (typeOfMessage === 'boolean') return String(_message)
      else if (typeOfMessage === 'symbol') return _message.toString()
      else if (typeOfMessage === 'undefined') return 'undefined'
      else if (typeOfMessage === 'function') return _message.toString()
      else return JSON.stringify(_message)
    }).join(' ')
  } catch (error) {
    level = 2
    message = `Couldn't output log because ${error.message} at ${error.stack}`
  }
  history.shift()
  const logEntry = {
    namespace,
    date: new Date(),
    level,
    message
  }
  history.push(logEntry)
  printer(logEntry, allowedNamespaces, levels, chalkMap, cache)
}
/**
 * @param {number} size
 */
export const setHistorySize = size => {
  if (size < history.length) history.splice(0, history.length - size)
  history.length = size
}

/**
 * @returns {string}
 */
export const flushToString = () => history
  .filter(logEntry => !!logEntry)
  .map(logEntry => formatter(logEntry, levels))
  .join('\n')

/**
 * @param namespace
 * @returns {{debug: function(...*), info: function(...*), warn: function(...*), error: function(...*)}}
 */
export default namespace => ({
  debug: logger(0, namespace),
  info: logger(1, namespace),
  warn: logger(2, namespace),
  error: logger(3, namespace)
})
