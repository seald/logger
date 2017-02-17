'use strict'
import {formatter, printer, getAllowedNamespaces} from './utils'

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

const allowedNamespaces = getAllowedNamespaces('*:info,' + process.env.DEBUG_NAMESPACES || '', levels, 1)
const cache = {}

/**
 *
 * @param {number} level
 * @param {string} namespace
 * @returns {function(...*)}
 */
const logger = (level, namespace) => (...messages) => {
  let message
  try {
    message = messages.map(_message => String(_message)).join(' ')
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
