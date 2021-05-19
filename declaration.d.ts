export default function makeLogger (namespace: string): ({
  debug: (message?: any, ...optionalParams: any[]) => void
  info: (message?: any, ...optionalParams: any[]) => void
  warn: (message?: any, ...optionalParams: any[]) => void
  error: (message?: any, ...optionalParams: any[]) => void
})

export function setLogLevel(logLevel: string): void
export function setHistorySize(size: number): void
export function flushToString(): string
