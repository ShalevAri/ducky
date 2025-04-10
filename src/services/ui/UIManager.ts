import { type Bang } from '../../types/bangs'
import { type DuckyIsland } from '../../types/islands'
import { PerformanceMonitor } from '../../utils/performance'
import { SuperCacheService } from '../cache/SuperCacheService'
import { LoggingService } from '../logging/LoggingService'
import { StorageService } from '../storage/StorageService'
import { BangManager } from './components/BangManager'
import { DucklingManager } from './components/DucklingManager'
import { IslandManager } from './components/IslandManager'

/**
 * Core UI management service that coordinates all UI-related functionality
 * Implements the Singleton pattern to ensure only one instance exists
 */
export class UIManager {
  private static _instance: UIManager | null = null
  private storage: StorageService
  private superCache: SuperCacheService
  private performanceMonitor: PerformanceMonitor
  private logger: LoggingService
  private bangManager: BangManager
  private islandManager: IslandManager
  private ducklingManager: DucklingManager

  /**
   * Private constructor to prevent direct instantiation
   * Initializes all required services and managers
   */
  private constructor() {
    this.storage = StorageService.getInstance()
    this.superCache = SuperCacheService.getInstance()
    this.performanceMonitor = PerformanceMonitor.getInstance()
    this.logger = LoggingService.getInstance()
    this.bangManager = new BangManager()
    this.islandManager = new IslandManager()
    this.ducklingManager = new DucklingManager()
  }

  /**
   * Gets the singleton instance of UIManager
   * Creates a new instance if one doesn't exist
   * @returns The UIManager instance
   */
  static getInstance(): UIManager {
    UIManager._instance ??= new UIManager()
    return UIManager._instance
  }

  renderDefaultPage(defaultBang: Bang, duckyIslands: Record<string, DuckyIsland>): void {
    const currentUrl = window.location.href.replace(/\/+$/, '')
    const app = document.querySelector<HTMLDivElement>('#app')

    if (!app) {
      this.logger.error('Failed to find app element')
      return
    }

    const recentBangs = this.storage.get<string[]>('recent-bangs', [])
    const recentBangsHtml = this.bangManager.renderRecentBangs(recentBangs)

    app.innerHTML = this.getDefaultPageHTML(currentUrl, defaultBang, duckyIslands, recentBangsHtml)
    this.setupEventListeners(app, duckyIslands)
  }

  private getDefaultPageHTML(
    currentUrl: string,
    defaultBang: Bang,
    duckyIslands: Record<string, DuckyIsland>,
    recentBangsHtml: string
  ): string {
    return `
      <div class="container">
        <div class="content-container">
          <h1 class="main-heading">Ducky</h1>
          <h2 class="main-subheading">The Fastest Search Router</h2>

          <!-- URL Input Section -->
          <div class="url-container"> 
            <input 
              type="text" 
              class="url-input"
              value="${currentUrl}?q=%s"
              readonly 
            />
            <button class="copy-button">
              <img src="/clipboard.svg" alt="Copy" />
            </button>
          </div>

          <!-- Super Cache Toggle -->
          <div class="super-cache-container">
            <label class="super-cache-label">
              <input 
                type="checkbox" 
                class="super-cache-toggle"
                ${this.storage.get('ENABLE_SUPER_CACHE', false) ? 'checked' : ''}
              />
              Enable Super Cache
            </label>
            <p class="super-cache-description">Cache search results for faster access (up to 100 recent searches)</p>
          </div>

          <!-- Bang Form Section -->
          <form class="bang-form">
            <label for="bang-input">Care to pick a default bang?</label>
            <div class="bang-container">
              <input
                id="bang-input"
                type="text"
                class="bang-input"
                value="${defaultBang.t}"
                list="bang-list"
                spellcheck="false"
              />
              <input type="submit" value="Apply" class="bang-confirm"/>
            </div>
            <datalist id="bang-list"></datalist>
          </form>
          <p class="bang-error"></p>

          <!-- Ducky Islands Section -->
          <div class="ducky-islands-container">
            <h2>Ducky Islands</h2>
            <p>Ducky Islands allow you to create custom prompt prefixes for AI bangs.</p>
            <p>For example, using <code>!t3a</code> instead of <code>!t3</code> will tell the AI to give you the answer first.</p>
            
            <div class="islands-list">
              ${this.islandManager.renderIslandsList(duckyIslands)}
            </div>
            
            <button class="add-island-button">Add New Island</button>
            
            <div class="island-form-container" style="display: none;">
              <form class="island-form">
                <h3>Create New Island</h3>
                
                <div class="form-group">
                  <label for="island-key">Suffix Key:</label>
                  <input type="text" id="island-key" name="key" class="island-input" maxlength="3" required>
                  <p class="form-help">The letter(s) to add after a bang (e.g., 'a' for !t3a)</p>
                </div>
                
                <div class="form-group">
                  <label for="island-name">Island Name:</label>
                  <input type="text" id="island-name" name="name" class="island-input" required>
                  <p class="form-help">A descriptive name for this island</p>
                </div>
                
                <div class="form-group">
                  <label for="island-prompt">Prompt Text:</label>
                  <textarea id="island-prompt" name="prompt" class="island-textarea" rows="4" required></textarea>
                  <p class="form-help">The text to inject before your query</p>
                </div>
                
                <div class="form-actions">
                  <button type="button" class="cancel-button">Cancel</button>
                  <button type="submit" class="save-button">Save Island</button>
                </div>
              </form>
            </div>
          </div>

          <!-- Ducklings Section -->
          <div class="ducklings-container">
            <h2>Ducklings</h2>
            <p>Ducklings allow you to create automatic bang redirects for specific patterns.</p>
            <p>For example, typing <code>shalevari/ducky</code> will automatically use <code>!ghr</code> bang.</p>
            
            <div class="ducklings-list">
              ${this.ducklingManager.renderDucklingsList()}
            </div>
            
            <button class="add-duckling-button">Add New Duckling</button>
            
            <div class="duckling-form-container" style="display: none;">
              <form class="duckling-form">
                <h3>Create New Duckling</h3>
                
                <div class="form-group">
                  <label for="duckling-pattern">Pattern:</label>
                  <input type="text" id="duckling-pattern" name="pattern" class="duckling-input" required>
                  <p class="form-help">The search pattern to match (e.g., 'ducky')</p>
                </div>
                
                <div class="form-group">
                  <label for="duckling-bang">Bang Command:</label>
                  <input type="text" id="duckling-bang" name="bangCommand" class="duckling-input">
                  <p class="form-help">The bang command to use (e.g., 'ghr'). Optional for direct URLs.</p>
                </div>
                
                <div class="form-group">
                  <label for="duckling-target-value">Target Value:</label>
                  <input type="text" id="duckling-target-value" name="targetValue" class="duckling-input" required>
                  <p class="form-help">The value to use with the bang command or a direct URL (e.g., 'shalevari/ducky' or 'http://localhost:49152')</p>
                </div>
                
                <div class="form-group">
                  <label for="duckling-description">Description:</label>
                  <input type="text" id="duckling-description" name="description" class="duckling-input">
                  <p class="form-help">A short description of what this duckling does</p>
                </div>
                
                <div class="form-actions">
                  <button type="button" class="duckling-cancel-button">Cancel</button>
                  <button type="submit" class="duckling-save-button">Save Duckling</button>
                </div>
              </form>
            </div>
          </div>
          
          ${recentBangsHtml}
        </div>
        <div class="footer">
          <p>
            <a href="https://github.com/ShalevAri/ducky" target="_blank">GitHub</a> | 
            Made with ❤️ by <a href="https://github.com/ShalevAri" target="_blank">ShalevAri</a>
          </p>
        </div>
      </div>
    `
  }

  private setupEventListeners(app: HTMLDivElement, duckyIslands: Record<string, DuckyIsland>): void {
    this.setupCopyFunctionality(app)
    this.setupSuperCacheToggle(app)
    this.bangManager.setupBangForm(app)
    this.islandManager.setupIslandForm(app, duckyIslands)
    this.ducklingManager.setupDucklingForm(app)
    this.bangManager.setupRecentBangs(app)
    this.islandManager.attachIslandDeleteHandlers(app, duckyIslands)
    this.ducklingManager.attachDucklingDeleteHandlers(app)
  }

  private setupCopyFunctionality(app: HTMLDivElement): void {
    const copyButton = app.querySelector<HTMLButtonElement>('.copy-button')
    const urlInput = app.querySelector<HTMLInputElement>('.url-input')

    if (!copyButton || !urlInput) {
      this.logger.error('Failed to find copy functionality elements')
      return
    }

    copyButton.addEventListener('click', () => {
      void this.copyUrlToClipboard(urlInput.value, copyButton)
    })
  }

  private async copyUrlToClipboard(text: string, button: HTMLButtonElement): Promise<void> {
    try {
      await navigator.clipboard.writeText(text)
      const img = button.querySelector('img')
      if (img) {
        const originalSrc = img.src
        img.src = '/clipboard-check.svg'
        setTimeout(() => {
          img.src = originalSrc
        }, 2000)
      }
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error('Failed to copy URL to clipboard', undefined, error.message)
      } else {
        this.logger.error('Failed to copy URL to clipboard', undefined, String(error))
      }
    }
  }

  private setupSuperCacheToggle(app: HTMLDivElement): void {
    const toggle = app.querySelector<HTMLInputElement>('.super-cache-toggle')
    if (!toggle) {
      this.logger.error('Failed to find super cache toggle')
      return
    }

    toggle.addEventListener('change', () => {
      this.storage.set('ENABLE_SUPER_CACHE', toggle.checked)
    })
  }
}
