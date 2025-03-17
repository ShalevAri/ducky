import { DucklingForm } from '../../components/forms/DucklingForm'
import { IslandForm } from '../../components/forms/IslandForm'
import { bangs } from '../../hashbang'
import { type Bang } from '../../types/bangs'
import { type DuckyIsland } from '../../types/islands'
import { PerformanceMonitor } from '../../utils/performance'
import { DucklingService } from '../ducklings/DucklingService'
import { IslandService } from '../islands/IslandService'
import { StorageService } from '../storage/StorageService'

export class UIManager {
  private static instance: UIManager
  private islandService: IslandService
  private ducklingService: DucklingService
  private storage: StorageService
  // @ts-expect-error: unused variable
  private performanceMonitor: PerformanceMonitor

  private constructor() {
    this.islandService = IslandService.getInstance()
    this.ducklingService = DucklingService.getInstance()
    this.storage = StorageService.getInstance()
    this.performanceMonitor = PerformanceMonitor.getInstance()
  }

  static getInstance(): UIManager {
    if (!UIManager.instance) {
      UIManager.instance = new UIManager()
    }
    return UIManager.instance
  }

  renderDefaultPage(defaultBang: Bang, duckyIslands: Record<string, DuckyIsland>): void {
    const currentUrl = window.location.href.replace(/\/+$/, '')
    const app = document.querySelector<HTMLDivElement>('#app')!

    const recentBangs = this.storage.get<string[]>('recent-bangs', [])
    const recentBangsHtml = this.renderRecentBangs(recentBangs)

    app.innerHTML = this.getDefaultPageHTML(currentUrl, defaultBang, duckyIslands, recentBangsHtml)
    this.setupEventListeners(duckyIslands)
  }

  private renderRecentBangs(recentBangs: string[]): string {
    if (recentBangs.length === 0) return ''
    const bangsHtml = recentBangs
      .filter((bangName): bangName is string => typeof bangName === 'string' && bangName in bangs)
      .map((bangName) => {
        const bang = bangs[bangName as keyof typeof bangs]
        return `<button class="recent-bang" data-bang="${bangName}">!${bangName} (${bang.s})</button>`
      })
      .join('')

    if (!bangsHtml) return ''

    return `
      <div class="recent-bangs-container">
        <div class="recent-bangs-header">
          <p>Recently used bangs:</p>
          <button class="clear-recent-bangs">Clear</button>
        </div>
        <div class="recent-bangs">
          ${bangsHtml}
        </div>
      </div>
    `
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
              ${this.renderIslandsList(duckyIslands)}
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
              ${this.renderDucklingsList()}
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
                  <input type="text" id="duckling-description" name="description" class="duckling-input" required>
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

  private renderIslandsList(duckyIslands: Record<string, DuckyIsland>): string {
    const islands = Object.values(duckyIslands)
    if (islands.length === 0) {
      return '<p>No islands created yet.</p>'
    }

    return `
      <table class="islands-table">
        <thead>
          <tr>
            <th>Suffix</th>
            <th>Name</th>
            <th>Prompt</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${islands
            .map(
              (island) => `
                <tr>
                  <td>${island.key}</td>
                  <td>${island.name}</td>
                  <td class="prompt-cell" title="${island.prompt}">${island.prompt}</td>
                  <td>
                    <button class="delete-island" data-key="${island.key}">Delete</button>
                  </td>
                </tr>
              `
            )
            .join('')}
        </tbody>
      </table>
    `
  }

  private renderDucklingsList(): string {
    const ducklings = this.ducklingService.loadDucklings()
    if (ducklings.length === 0) {
      return '<p>No ducklings created yet.</p>'
    }

    return `
      <table class="ducklings-table">
        <thead>
          <tr>
            <th>Pattern</th>
            <th>Bang</th>
            <th>Target</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${ducklings
            .map(
              (duckling) => `
                <tr>
                  <td>${duckling.pattern}</td>
                  <td>${duckling.bangCommand ? `!${duckling.bangCommand}` : 'Direct URL'}</td>
                  <td class="target-cell" title="${duckling.targetValue}">${duckling.targetValue}</td>
                  <td>${duckling.description}</td>
                  <td>
                    <button class="delete-duckling" data-pattern="${duckling.pattern}">Delete</button>
                  </td>
                </tr>
              `
            )
            .join('')}
        </tbody>
      </table>
    `
  }

  private setupEventListeners(duckyIslands: Record<string, DuckyIsland>): void {
    const app = document.querySelector<HTMLDivElement>('#app')!

    // Setup copy functionality
    this.setupCopyFunctionality(app)

    // Setup bang form
    this.setupBangForm(app)

    // Setup island form
    this.setupIslandForm(app, duckyIslands)

    // Setup duckling form
    this.setupDucklingForm(app)

    // Setup recent bangs
    this.setupRecentBangs(app)
  }

  private setupCopyFunctionality(app: HTMLDivElement): void {
    const copyButton = app.querySelector<HTMLButtonElement>('.copy-button')!
    const copyIcon = copyButton.querySelector('img')!
    const urlInput = app.querySelector<HTMLInputElement>('.url-input')!

    const copyUrlToClipboard = async () => {
      await navigator.clipboard.writeText(urlInput.value)
      copyIcon.src = '/clipboard-check.svg'

      setTimeout(() => {
        copyIcon.src = '/clipboard.svg'
      }, 2000)
    }

    urlInput.addEventListener('keydown', (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'c' && window.getSelection()?.toString() === '') {
        event.preventDefault()
        void copyUrlToClipboard()
      }
    })

    copyButton.addEventListener('click', () => void copyUrlToClipboard())
  }

  private setupBangForm(app: HTMLDivElement): void {
    const bangDatalist = app.querySelector<HTMLDataListElement>('#bang-list')!
    const bangForm = app.querySelector<HTMLFormElement>('.bang-form')!
    const bangInput = app.querySelector<HTMLInputElement>('#bang-input')!
    const bangErrorDiv = app.querySelector<HTMLParagraphElement>('.bang-error')!
    const urlInput = app.querySelector<HTMLInputElement>('.url-input')!

    Object.entries(bangs).forEach(([_key, bang]) => {
      const option = document.createElement('option')
      option.value = bang.t
      bangDatalist.appendChild(option)
    })

    bangForm.addEventListener('submit', (submitEvent: SubmitEvent) => {
      submitEvent.preventDefault()
      const bangName = bangInput.value.trim()
      if (!(bangName in bangs)) {
        bangErrorDiv.innerHTML = `This bang is not known. Check the <a href="https://duckduckgo.com/bang.html" target="_blank">list of available bangs.</a>`
        return
      }
      bangErrorDiv.innerHTML = ''
      localStorage.setItem('default-bang', bangName)
      const currentUrl = window.location.origin + window.location.pathname
      urlInput.value = `${currentUrl}?q=%s&default_bang=${encodeURIComponent(bangName)}`
    })
  }

  private setupIslandForm(app: HTMLDivElement, duckyIslands: Record<string, DuckyIsland>): void {
    const islandFormElement = app.querySelector<HTMLFormElement>('.island-form')!
    const islandFormContainer = app.querySelector<HTMLDivElement>('.island-form-container')!
    const addIslandButton = app.querySelector<HTMLButtonElement>('.add-island-button')!
    const cancelButton = app.querySelector<HTMLButtonElement>('.cancel-button')!

    void new IslandForm(islandFormElement, islandFormContainer, addIslandButton, cancelButton, (island) => {
      duckyIslands[island.key] = island
      const islandsList = app.querySelector<HTMLDivElement>('.islands-list')!
      islandsList.innerHTML = this.renderIslandsList(duckyIslands)
      this.attachIslandDeleteHandlers(app, duckyIslands)
    })

    this.attachIslandDeleteHandlers(app, duckyIslands)
  }

  private setupDucklingForm(app: HTMLDivElement): void {
    const ducklingFormElement = app.querySelector<HTMLFormElement>('.duckling-form')!
    const ducklingFormContainer = app.querySelector<HTMLDivElement>('.duckling-form-container')!
    const addDucklingButton = app.querySelector<HTMLButtonElement>('.add-duckling-button')!
    const cancelButton = app.querySelector<HTMLButtonElement>('.duckling-cancel-button')!

    void new DucklingForm(ducklingFormElement, ducklingFormContainer, addDucklingButton, cancelButton, () => {
      const ducklingsList = app.querySelector<HTMLDivElement>('.ducklings-list')!
      ducklingsList.innerHTML = this.renderDucklingsList()
      this.attachDucklingDeleteHandlers(app)
    })

    this.attachDucklingDeleteHandlers(app)
  }

  private setupRecentBangs(app: HTMLDivElement): void {
    const recentBangButtons = app.querySelectorAll<HTMLButtonElement>('.recent-bang')
    const bangInput = app.querySelector<HTMLInputElement>('#bang-input')!
    const bangForm = app.querySelector<HTMLFormElement>('.bang-form')!
    const clearButton = app.querySelector<HTMLButtonElement>('.clear-recent-bangs')

    recentBangButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const bangName = button.dataset.bang ?? ''
        if (bangName && bangName in bangs) {
          bangInput.value = bangName
          bangForm.dispatchEvent(new Event('submit'))
        }
      })
    })

    if (clearButton) {
      clearButton.addEventListener('click', () => {
        this.storage.set('recent-bangs', [])
        const container = app.querySelector('.recent-bangs-container')
        if (container) {
          container.remove()
        }
      })
    }
  }

  private attachIslandDeleteHandlers(app: HTMLDivElement, duckyIslands: Record<string, DuckyIsland>): void {
    const deleteButtons = app.querySelectorAll<HTMLButtonElement>('.delete-island')
    deleteButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const key = button.dataset.key
        if (key && duckyIslands[key]) {
          if (confirm(`Are you sure you want to delete the "${duckyIslands[key].name}" island?`)) {
            this.islandService.removeIsland(key)
            delete duckyIslands[key]
            const islandsList = app.querySelector<HTMLDivElement>('.islands-list')!
            islandsList.innerHTML = this.renderIslandsList(duckyIslands)
            this.attachIslandDeleteHandlers(app, duckyIslands)
          }
        }
      })
    })
  }

  private attachDucklingDeleteHandlers(app: HTMLDivElement): void {
    const deleteButtons = app.querySelectorAll<HTMLButtonElement>('.delete-duckling')
    deleteButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const pattern = button.dataset.pattern
        if (!pattern) return

        this.ducklingService.removeDuckling(pattern)
        const ducklingsList = app.querySelector<HTMLDivElement>('.ducklings-list')!
        ducklingsList.innerHTML = this.renderDucklingsList()
        this.attachDucklingDeleteHandlers(app)
      })
    })
  }
}
