import { defaultDucklings, type Duckling } from '../../ducklings'
import { StorageService } from '../storage/StorageService'

export class DucklingService {
  private static instance: DucklingService
  private storage: StorageService
  private static readonly STORAGE_KEY = 'ducky-ducklings'

  private constructor() {
    this.storage = StorageService.getInstance()
  }

  static getInstance(): DucklingService {
    if (!DucklingService.instance) {
      DucklingService.instance = new DucklingService()
    }
    return DucklingService.instance
  }

  loadDucklings(): Duckling[] {
    return this.storage.get<Duckling[]>(DucklingService.STORAGE_KEY, [])
  }

  saveDucklings(ducklings: Duckling[]): void {
    this.storage.set(DucklingService.STORAGE_KEY, ducklings)
  }

  initializeDucklings(): void {
    const existingDucklings = this.loadDucklings()

    if (existingDucklings.length === 0) {
      this.saveDucklings(defaultDucklings)
    }
  }

  addDuckling(duckling: Duckling): void {
    const ducklings = this.loadDucklings()
    const existingIndex = ducklings.findIndex((d) => d.pattern === duckling.pattern)

    if (existingIndex >= 0) {
      ducklings[existingIndex] = duckling
    } else {
      ducklings.push(duckling)
    }

    this.saveDucklings(ducklings)
  }

  removeDuckling(pattern: string): void {
    const ducklings = this.loadDucklings()
    const updatedDucklings = ducklings.filter((d) => d.pattern !== pattern)
    this.saveDucklings(updatedDucklings)
  }

  getDuckling(pattern: string): Duckling | null {
    const ducklings = this.loadDucklings()
    return ducklings.find((d) => d.pattern === pattern) ?? null
  }

  matchDuckling(query: string): { bangCommand: string; remainingQuery: string } | null {
    const ducklings = this.loadDucklings()

    for (const duckling of ducklings) {
      if (query === duckling.pattern) {
        return {
          bangCommand: duckling.bangCommand,
          remainingQuery: duckling.targetValue
        }
      }
    }

    for (const duckling of ducklings) {
      if (query.startsWith(duckling.pattern + ' ')) {
        const additionalQuery = query.slice(duckling.pattern.length + 1)
        const remainingQuery = duckling.targetValue + ' ' + additionalQuery
        return {
          bangCommand: duckling.bangCommand,
          remainingQuery
        }
      }
    }

    return null
  }
}
