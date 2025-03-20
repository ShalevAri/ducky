import './global.css'
import { bangs } from './hashbang.ts'
import { DucklingService } from './services/ducklings/DucklingService'
import { IslandService } from './services/islands/IslandService'
import { RedirectService } from './services/redirect/RedirectService'
import { UIManager } from './services/ui/UIManager'
import { type Bang } from './types/bangs.ts'
// @ts-expect-error: unused import
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { debounce } from './utils/debounce.ts'

const islandService = IslandService.getInstance()
const ducklingService = DucklingService.getInstance()
const redirectService = RedirectService.getInstance()
const uiManager = UIManager.getInstance()

ducklingService.initializeDucklings()
const duckyIslands = islandService.initializeIslands()

const url = new URL(window.location.href)
const urlDefaultBang = url.searchParams.get('default_bang')
const LS_DEFAULT_BANG = urlDefaultBang ?? localStorage.getItem('default-bang') ?? 'g'
const defaultBang: Bang = bangs[LS_DEFAULT_BANG]

document.addEventListener('DOMContentLoaded', () => {
  redirectService.doRedirect(
    defaultBang,
    Object.keys(duckyIslands),
    () => uiManager.renderDefaultPage(defaultBang, duckyIslands),
    duckyIslands,
    bangs
  )
})
