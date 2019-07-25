import { printer, getAllowedNamespaces } from '../utils'
const levels = ['debug', 'info', 'warn', 'error']
const logEntry = {
  namespace: '*',
  message: 'errorMessage',
  date: new Date(),
  level: 3
}
const chalkMap = {
  date: 'gray',
  debug: 'cyan',
  info: 'green',
  warn: 'yellow',
  error: 'red'
}
const allowedNamespaces = getAllowedNamespaces(
  '*:error',
  levels,
  1
)
printer(logEntry, allowedNamespaces, levels, chalkMap)
