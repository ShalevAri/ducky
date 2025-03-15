import { defaultIslands } from '../../islands'
import { type DuckyIsland } from '../../types/islands'
import { StorageService } from '../storage/StorageService'

export class IslandService {
  private static instance: IslandService
  private storage: StorageService

  private constructor() {
    this.storage = StorageService.getInstance()
  }

  static getInstance(): IslandService {
    if (!IslandService.instance) {
      IslandService.instance = new IslandService()
    }
    return IslandService.instance
  }

  loadIslands(): Record<string, DuckyIsland> {
    return this.storage.get<Record<string, DuckyIsland>>('ducky-islands', {})
  }

  saveIslands(islands: Record<string, DuckyIsland>): void {
    this.storage.set('ducky-islands', islands)
  }

  initializeIslands(): Record<string, DuckyIsland> {
    const duckyIslands = this.loadIslands()
    if (Object.keys(duckyIslands).length === 0) {
      defaultIslands.forEach((island) => {
        duckyIslands[island.key] = island
      })
      this.saveIslands(duckyIslands)
    }
    return duckyIslands
  }

  addIsland(island: DuckyIsland): void {
    const islands = this.loadIslands()
    islands[island.key] = island
    this.saveIslands(islands)
  }

  removeIsland(key: string): void {
    const islands = this.loadIslands()
    delete islands[key]
    this.saveIslands(islands)
  }

  getIsland(key: string): DuckyIsland | null {
    const islands = this.loadIslands()
    return islands[key] || null
  }

  updateIsland(key: string, island: DuckyIsland): void {
    const islands = this.loadIslands()
    islands[key] = island
    this.saveIslands(islands)
  }
}
