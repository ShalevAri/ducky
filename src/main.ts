import './global.css'
import { bangs } from './hashbang.ts'
import { DucklingService } from './services/ducklings/DucklingService'
import { IslandService } from './services/islands/IslandService'
import { RedirectService } from './services/redirect/RedirectService'
import { UIManager } from './services/ui/UIManager'
import { type Bang } from './types/bangs.ts'
import { debounce } from './utils/debounce.ts'

// Initialize services
const islandService = IslandService.getInstance()
const ducklingService = DucklingService.getInstance()
const redirectService = RedirectService.getInstance()
const uiManager = UIManager.getInstance()

// Initialize data
ducklingService.initializeDucklings()
const duckyIslands = islandService.initializeIslands()

// Get default bang from URL or localStorage
const url = new URL(window.location.href)
const urlDefaultBang = url.searchParams.get('default_bang')
const LS_DEFAULT_BANG = urlDefaultBang ?? localStorage.getItem('default-bang') ?? 'g'
const defaultBang: Bang = bangs[LS_DEFAULT_BANG]

// Set up the redirect functionality when the DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
  redirectService.doRedirect(
    defaultBang,
    Object.keys(duckyIslands),
    () => uiManager.renderDefaultPage(defaultBang, duckyIslands),
    duckyIslands,
    bangs
  )
})
