export type makeLogger = (namespace: string) => ({
  debug: (log: string) => void,
  info: (log: string) => void,
  warn: (log: string) => void,
  error: (log: string) => void,
})
