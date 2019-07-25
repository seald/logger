import { printer, getAllowedNamespaces } from '../utils'
const levels = ['debug', 'info', 'warn', 'error']
const logEntry = {
  namespace: 'test/test',
  message: 'debugMessage',
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
  '*:error, test/*:warn, test/test: debug, test2/test:info',
  levels,
  1
)
printer(logEntry, allowedNamespaces, levels, chalkMap)
