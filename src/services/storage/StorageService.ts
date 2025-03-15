import { loadFromLocalStorage, saveToLocalStorage } from '../../utils/storage'

export class StorageService {
  private static instance: StorageService
  private cache: Map<string, unknown>

  private constructor() {
    this.cache = new Map()
  }

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService()
    }
    return StorageService.instance
  }

  get<T>(key: string, defaultValue: T): T {
    if (this.cache.has(key)) {
      return this.cache.get(key) as T
    }
    const value = loadFromLocalStorage(key, defaultValue)
    this.cache.set(key, value)
    return value
  }

  set<T>(key: string, value: T): void {
    this.cache.set(key, value)
    saveToLocalStorage(key, value)
  }

  remove(key: string): void {
    this.cache.delete(key)
    localStorage.removeItem(key)
  }

  clear(): void {
    this.cache.clear()
    localStorage.clear()
  }

  has(key: string): boolean {
    return this.cache.has(key) || localStorage.getItem(key) !== null
  }
}
