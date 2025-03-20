import { loadFromLocalStorage, saveToLocalStorage } from './storage'

interface RequestTiming {
  url: string
  duration: number
  timestamp: number
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private static readonly MAX_ENTRIES = 10
  private static readonly STORAGE_KEY = 'request-timings'
  private static readonly DEBUG_MODE_KEY = 'DEBUG_MODE'

  private constructor() {
    window.addEventListener('beforeunload', () => {
      const timings = this.getTimings()
      if (timings.length > 0 && this.isDebugMode()) {
        console.group('🦆 Ducky Request Timings')
        timings.forEach((timing) => {
          console.log(
            `%c${new Date(timing.timestamp).toLocaleString()}%c ${(timing.duration / 1000).toFixed(3)}s %c${timing.url}`,
            'color: #888',
            'color: #8ff; font-weight: bold',
            'color: inherit'
          )
        })
        console.groupEnd()
      }
    })
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  isDebugMode(): boolean {
    return loadFromLocalStorage(PerformanceMonitor.DEBUG_MODE_KEY, false)
  }

  recordTiming(url: string, duration: number): void {
    if (!this.isDebugMode()) return

    const timings = this.getTimings()
    const newTiming: RequestTiming = {
      url,
      duration,
      timestamp: Date.now()
    }

    timings.unshift(newTiming)
    if (timings.length > PerformanceMonitor.MAX_ENTRIES) {
      timings.pop()
    }

    saveToLocalStorage(PerformanceMonitor.STORAGE_KEY, timings)

    console.log(
      `%c${new Date(newTiming.timestamp).toLocaleString()}%c ${(newTiming.duration / 1000).toFixed(3)}s %c${newTiming.url}`,
      'color: #888',
      'color: #8ff; font-weight: bold',
      'color: inherit'
    )
  }

  private getTimings(): RequestTiming[] {
    return loadFromLocalStorage<RequestTiming[]>(PerformanceMonitor.STORAGE_KEY, [])
  }

  clearTimings(): void {
    saveToLocalStorage(PerformanceMonitor.STORAGE_KEY, [])
  }
}
