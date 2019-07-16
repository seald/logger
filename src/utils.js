import chalk from 'chalk'

/**
 * Takes as input unParsedNameSpaces which is formatted as such:
 * namespace[:level][,[ ]namespace[:level]]...
 *
 * Each namespace must be formatted as such:
 * [* | level_0][/[* | level_1]][/[* | level_2]]...
 *
 * And returns an Array made of objects:
 * {namespace: [* | level_0, * | level_1, ...], level: number}
 * @param {string} unParsedNamespaces
 * @param {Array.<string>} levels
 * @param {number} defaultLevelIndex
 * @returns {Array.<{namespace:Array.<string>, level: number}>}
 */
export const getAllowedNamespaces = (unParsedNamespaces, levels, defaultLevelIndex) =>
  unParsedNamespaces
    .split(',')
    .map(str => str.trim())
    .filter(str => str !== '')
    .map(str => {
      const [namespace, level = levels[defaultLevelIndex]] = str.split(':').map(str => str.trim())
      const splitNameSpace = namespace.split('/')
      let starIndex = splitNameSpace.findIndex(el => el === '*')
      if (starIndex === 0) {
        splitNameSpace[0] = ''
        starIndex = 1
      }
      if (starIndex !== -1) splitNameSpace.splice(starIndex)
      const levelIndex = levels.findIndex(el => el === level)
      return { namespace: splitNameSpace, level: levelIndex === -1 ? 1 : levelIndex }
    })

/**
 * It takes inputNamespace formatted in the same way as unParsedNameSpaces but without *,
 * and takes allowedNamespaces which is the result given by getAllowedNamespaces.
 *
 * @param {string} inputNamespace
 * @param {Array.<{namespace:Array.<string>, level: number}>} allowedNamespaces
 */
export const getLevel = (inputNamespace, allowedNamespaces) =>
  allowedNamespaces
    .filter(
      allowedNamespaces =>
        allowedNamespaces.namespace.join('/') === '' ||
        inputNamespace === allowedNamespaces.namespace.join('/') ||
        inputNamespace.startsWith(allowedNamespaces.namespace.join('/') + '/')
    )
    .reduce(
      ({ previousLevel, priority }, { level, namespace }) =>
        priority <= namespace.length ? { previousLevel: level, priority: namespace.length } : { priority, previousLevel },
      { previousLevel: null, priority: -1 }
    ).previousLevel

/**
 * To handle the cache of namespace levels
 * @param {string} namespace
 * @param {Array.<{namespace:Array.<string>, level: number}>} allowedNamespaces
 * @param {Object.<string, number>} cacheObject
 * @returns {number}
 */
export const getFromCache = (namespace, allowedNamespaces, cacheObject) => {
  if (!Object.prototype.hasOwnProperty.call(cacheObject, namespace)) cacheObject[namespace] = getLevel(namespace, allowedNamespaces)
  return cacheObject[namespace]
}
/**
 * Pads string at the beginning of the string with given padChar (must be 1 character) to reach wanted length
 * @param {string|number} string
 * @param {number} length
 * @param {string} [padChar = ' ']
 */
export const padStart = (string, length, padChar = ' ') =>
  (string.toString().length < length ? padChar.repeat(length - string.toString().length) : '') + string.toString()

/**
 * Pads string at the end of the string with given padChar (must be 1 character) to reach wanted length
 * @param {string|number} string
 * @param {number} length
 * @param {string} [padChar = ' ']
 */
export const padEnd = (string, length, padChar = ' ') =>
  string.toString() + (string.toString().length < length ? padChar.repeat(length - string.toString().length) : '')

/**
 *
 * @param {{namespace: string, date: Date, level: number, message: string}} logEntry
 * @param {Array.<number>} levels
 * @param {Object.<string, string>|boolean} [chalkMap = false]
 * @returns {string}
 */
export const formatter = (logEntry, levels, chalkMap = false) => {
  const { namespace, date, level, message } = logEntry
  const offset = padStart(Math.abs(date.getTimezoneOffset() / -60), 2, '0')
  const formattedDate = `${padStart(date.getHours(), 2, '0')}:${padStart(date.getMinutes(), 2, '0')}:${padStart(
    date.getSeconds(),
    2,
    '0'
  )}.${padStart(date.getMilliseconds(), 3, '0')} ${padStart(date.getDate(), 2, '0')}/${padStart(
    date.getMonth() + 1,
    2,
    '0'
  )}/${date.getFullYear()} UTC${date.getTimezoneOffset() <= 0 ? '+' : '-'}${offset}`
  const formattedMessage = `${padEnd(levels[level], 5)}:${namespace} - ${message}`
  if (chalkMap) return `[${chalk.gray(formattedDate)}] ${chalk[chalkMap[[levels[level]]]](formattedMessage)}`
  else return `[${formattedDate}] ${formattedMessage}`
}

/**
 *
 * @param {{namespace: string, date: Date, level: number, message: string}} logEntry
 * @param {Array.<{namespace:Array.<string>, level: number}>} allowedNamespaces
 * @param {Array.<number>} levels
 * @param {Object.<string, string>} chalkMap
 * @param {Object.<string, number>} cacheObject
 */
export const printer = (logEntry, allowedNamespaces, levels, chalkMap, cacheObject = {}) => {
  const formatted = formatter(logEntry, levels, chalkMap)
  const minLevel = getFromCache(logEntry.namespace, allowedNamespaces, cacheObject)
  if (minLevel !== null && minLevel <= logEntry.level) {
    if (logEntry.level >= 3) console.error(formatted)
    else console.log(formatted)
  }
}
