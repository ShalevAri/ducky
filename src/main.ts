import { defaultDucklings, loadDucklings, saveDucklings } from './ducklings.ts'
import './global.css'
import { bangs } from './hashbang.ts'
import { initializeIslands } from './islands-manager.ts'
import { doRedirect } from './redirect-manager.ts'
import { Bang } from './types/bangs.ts'
import { renderDefaultPage } from './ui-manager.ts'
import { debounce } from './utils/debounce.ts'

// Initialize ducklings
if (loadDucklings().length === 0) {
  saveDucklings(defaultDucklings)
}

// Initialize islands
const duckyIslands = initializeIslands()

// Get default bang from URL or localStorage
const url = new URL(window.location.href)
const urlDefaultBang = url.searchParams.get('default_bang')
const LS_DEFAULT_BANG = urlDefaultBang || localStorage.getItem('default-bang') || 'g'
const defaultBang: Bang = bangs[LS_DEFAULT_BANG]

// Set up the redirect functionality when the DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
  const debouncedRedirect = debounce(
    () => doRedirect(defaultBang, duckyIslands, () => renderDefaultPage(defaultBang, duckyIslands)),
    50
  )
  debouncedRedirect()
})
