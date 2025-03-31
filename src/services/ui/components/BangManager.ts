import { bangs } from '../../../hashbang'
import { type Bang } from '../../../types/bangs'
import { LoggingService } from '../../logging/LoggingService'
import { StorageService } from '../../storage/StorageService'

/**
 * Manager class for handling bang commands in the UI
 * Provides functionality for managing and executing bang search commands
 */
export class BangManager {
  private storage: StorageService
  private logger: LoggingService

  /**
   * Creates a new BangManager instance
   * Initializes required services
   */
  constructor() {
    this.storage = StorageService.getInstance()
    this.logger = LoggingService.getInstance()
  }

  renderRecentBangs(recentBangs: string[]): string {
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

  setupBangForm(app: HTMLDivElement): void {
    const bangForm = app.querySelector<HTMLFormElement>('.bang-form')
    const bangInput = app.querySelector<HTMLInputElement>('.bang-input')
    const bangError = app.querySelector<HTMLParagraphElement>('.bang-error')
    const bangList = app.querySelector<HTMLDataListElement>('#bang-list')

    if (!bangForm || !bangInput || !bangError || !bangList) {
      this.logger.error('Failed to find bang form elements')
      return
    }

    // Populate datalist
    bangList.innerHTML = Object.entries(bangs)
      .map(([key, bang]) => `<option value="${bang.t}">!${key} - ${bang.s}</option>`)
      .join('')

    bangForm.addEventListener('submit', (e) => {
      e.preventDefault()
      const selectedBang = Object.values(bangs).find((bang) => bang.t === bangInput.value)

      if (!selectedBang) {
        bangError.textContent = 'Invalid bang selected'
        return
      }

      this.storage.set('default-bang', selectedBang)
      bangError.textContent = 'Default bang updated successfully!'
      setTimeout(() => {
        bangError.textContent = ''
      }, 3000)
    })
  }

  setupRecentBangs(app: HTMLDivElement): void {
    const clearButton = app.querySelector<HTMLButtonElement>('.clear-recent-bangs')
    if (clearButton) {
      clearButton.addEventListener('click', () => {
        this.storage.set('recent-bangs', [])
        const container = app.querySelector('.recent-bangs-container')
        if (container) {
          container.remove()
        }
      })
    }

    const recentBangButtons = app.querySelectorAll<HTMLButtonElement>('.recent-bang')
    recentBangButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const bangName = button.dataset.bang
        if (!bangName) return

        const bang = bangs[bangName as keyof typeof bangs]
        if (!bang) return

        const bangInput = app.querySelector<HTMLInputElement>('.bang-input')
        if (!bangInput) return

        bangInput.value = bang.t
        const bangForm = app.querySelector<HTMLFormElement>('.bang-form')
        if (bangForm) {
          bangForm.dispatchEvent(new Event('submit'))
        }
      })
    })
  }
}
