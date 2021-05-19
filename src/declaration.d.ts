export type makeLogger = (namespace: string) => ({
  debug: (message?: any, ...optionalParams: any[]) => void
  info: (message?: any, ...optionalParams: any[]) => void
  warn: (message?: any, ...optionalParams: any[]) => void
  error: (message?: any, ...optionalParams: any[]) => void
})

export type setLogLevel = (logLevel: string) => void
export type setHistorySize = (size: number) => void
export type flushToString = () => string
