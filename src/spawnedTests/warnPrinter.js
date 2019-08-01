import { printer, getAllowedNamespaces } from '../utils'
const levels = ['debug', 'info', 'warn', 'error']
const logEntry = {
  namespace: 'test/*',
  message: 'warnMessage',
  date: new Date(),
  level: 2
}
const chalkMap = {
  date: 'gray',
  debug: 'cyan',
  info: 'green',
  warn: 'yellow',
  error: 'red'
}
const allowedNamespaces = getAllowedNamespaces(
  'test/*:warn',
  levels,
  1
)
printer(logEntry, allowedNamespaces, levels, chalkMap)
