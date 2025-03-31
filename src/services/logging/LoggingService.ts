export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

interface LogEntry {
  timestamp: number
  level: LogLevel
  message: string
  context?: string
  data?: unknown
}

export class LoggingService {
  private static _instance: LoggingService | null = null
  private static readonly MAX_LOG_ENTRIES = 1000
  private logs: LogEntry[] = []
  private logLevel: LogLevel = LogLevel.INFO

  private constructor() {
    // Private constructor to prevent direct construction
  }

  public static getInstance(): LoggingService {
    LoggingService._instance ??= new LoggingService()
    return LoggingService._instance
  }

  setLogLevel(level: LogLevel): void {
    this.logLevel = level
  }

  debug(message: string, context?: string, data?: unknown): void {
    this.log(LogLevel.DEBUG, message, context, data)
  }

  info(message: string, context?: string, data?: unknown): void {
    this.log(LogLevel.INFO, message, context, data)
  }

  warn(message: string, context?: string, data?: unknown): void {
    this.log(LogLevel.WARN, message, context, data)
  }

  error(message: string, context?: string, data?: unknown): void {
    this.log(LogLevel.ERROR, message, context, data)
  }

  getLogs(level?: LogLevel): LogEntry[] {
    return level ? this.logs.filter((log) => log.level === level) : this.logs
  }

  clearLogs(): void {
    this.logs = []
  }

  private log(level: LogLevel, message: string, context?: string, data?: unknown): void {
    if (this.shouldLog(level)) {
      const entry: LogEntry = {
        timestamp: Date.now(),
        level,
        message,
        context,
        data
      }

      this.logs.push(entry)
      if (this.logs.length > LoggingService.MAX_LOG_ENTRIES) {
        this.logs.shift()
      }

      const logMessage = `[${level}]${context ? ` [${context}]` : ''}: ${message}`
      switch (level) {
        case LogLevel.DEBUG:
          console.debug(logMessage, data)
          break
        case LogLevel.INFO:
          console.info(logMessage, data)
          break
        case LogLevel.WARN:
          console.warn(logMessage, data)
          break
        case LogLevel.ERROR:
          console.error(logMessage, data)
          break
      }
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = Object.values(LogLevel)
    return levels.indexOf(level) >= levels.indexOf(this.logLevel)
  }
}
