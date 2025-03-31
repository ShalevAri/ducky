export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

/**
 * Structure of a log entry
 */
interface LogEntry {
  /** Timestamp when the log was created */
  timestamp: number
  /** Log level indicating severity */
  level: LogLevel
  /** Log message content */
  message: string
  /** Optional context information */
  context?: string
  /** Optional additional data */
  data?: unknown
}

/**
 * Service for managing application logging
 * Implements the Singleton pattern to ensure consistent logging across the application
 */
export class LoggingService {
  private static _instance: LoggingService | null = null
  private static readonly MAX_LOG_ENTRIES = 1000
  private logs: LogEntry[] = []
  private logLevel: LogLevel = LogLevel.INFO

  private constructor() {
    // Private constructor to prevent direct construction
  }

  /**
   * Gets the singleton instance of LoggingService
   * @returns The LoggingService instance
   */
  public static getInstance(): LoggingService {
    LoggingService._instance ??= new LoggingService()
    return LoggingService._instance
  }

  setLogLevel(level: LogLevel): void {
    this.logLevel = level
  }

  /**
   * Logs a debug level message
   * @param message - The message to log
   * @param context - Optional context information
   * @param data - Optional additional data
   */
  debug(message: string, context?: string, data?: unknown): void {
    this.log(LogLevel.DEBUG, message, context, data)
  }

  /**
   * Logs an info level message
   * @param message - The message to log
   * @param context - Optional context information
   * @param data - Optional additional data
   */
  info(message: string, context?: string, data?: unknown): void {
    this.log(LogLevel.INFO, message, context, data)
  }

  /**
   * Logs a warning level message
   * @param message - The message to log
   * @param context - Optional context information
   * @param data - Optional additional data
   */
  warn(message: string, context?: string, data?: unknown): void {
    this.log(LogLevel.WARN, message, context, data)
  }

  /**
   * Logs an error level message
   * @param message - The message to log
   * @param context - Optional context information
   * @param data - Optional additional data
   */
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
