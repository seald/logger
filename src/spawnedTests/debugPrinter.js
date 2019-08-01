import { printer, getAllowedNamespaces } from '../utils'
const levels = ['debug', 'info', 'warn', 'error']
const logEntry = {
  namespace: 'test/test',
  message: 'debugMessage',
  date: new Date(),
  level: 0
}
const chalkMap = {
  date: 'gray',
  debug: 'cyan',
  info: 'green',
  warn: 'yellow',
  error: 'red'
}
const allowedNamespaces = getAllowedNamespaces(
  'test/test: debug',
  levels,
  1
)
printer(logEntry, allowedNamespaces, levels, chalkMap)
