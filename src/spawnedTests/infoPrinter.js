import { printer, getAllowedNamespaces } from '../utils'
const levels = ['debug', 'info', 'warn', 'error']
const logEntry = {
  namespace: 'test2/test',
  message: 'infoMessage',
  date: new Date(),
  level: 1
}
const chalkMap = {
  date: 'gray',
  debug: 'cyan',
  info: 'green',
  warn: 'yellow',
  error: 'red'
}
const allowedNamespaces = getAllowedNamespaces(
  'test2/test:info',
  levels,
  1
)
printer(logEntry, allowedNamespaces, levels, chalkMap)
