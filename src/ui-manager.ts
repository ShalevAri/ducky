import { loadDucklings, renderDucklingsList, saveDucklings } from './ducklings.ts'
import { bangs } from './hashbang.ts'
import { loadDuckyIslands, renderIslandsList, saveDuckyIslands } from './islands-manager.ts'
import { Bang } from './types/bangs.ts'
import { DuckyIsland } from './types/islands.ts'
import { loadFromLocalStorage } from './utils/storage.ts'

/**
 * Render the default page when no search is being performed
 */
export function renderDefaultPage(defaultBang: Bang, duckyIslands: { [key: string]: DuckyIsland }): void {
  const currentUrl = window.location.href.replace(/\/+$/, '')
  const app = document.querySelector<HTMLDivElement>('#app')!

  const recentBangsJson = localStorage.getItem('recent-bangs') || '[]'
  let recentBangs: string[] = []

  try {
    recentBangs = JSON.parse(recentBangsJson)
    if (!Array.isArray(recentBangs)) recentBangs = []
  } catch (e) {
    recentBangs = []
  }

  let recentBangsHtml = ''
  if (recentBangs.length > 0) {
    const bangsHtml = recentBangs
      .filter((bangName) => bangs[bangName])
      .map((bangName) => {
        const bang = bangs[bangName]
        return `<button class="recent-bang" data-bang="${bangName}">!${bangName} (${bang.s})</button>`
      })
      .join('')

    if (bangsHtml) {
      recentBangsHtml = `
        <div class="recent-bangs-container">
          <p>Recently used bangs:</p>
          <div class="recent-bangs">
            ${bangsHtml}
          </div>
        </div>
      `
    }
  }

  app.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh;">
      <div class="content-container">
        <h1>Ducky</h1>
        <p>DuckDuckGo's bang redirects are too slow.</p>
        <p>Add the following URL as a custom search engine to your browser.</p>
        <p>Enables <a href="https://duckduckgo.com/bang.html" target="_blank">all of DuckDuckGo's bangs</a> (and more!).</p>
        <p>NOTE: Make sure to follow all of the instructions in the <a href="https://github.com/ShalevAri/ducky" target="_blank">README</a> before using this.</p>
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
        
        <div class="ducky-islands-container">
          <h2>Ducky Islands</h2>
          <p>Ducky Islands allow you to create custom prompt prefixes for AI bangs.</p>
          <p>For example, using <code>!t3a</code> instead of <code>!t3</code> will tell the AI to give you the answer first.</p>
          
          <div class="islands-list">
            ${renderIslandsList(duckyIslands)}
          </div>
          
          <button class="add-island-button">Add New Island</button>
          
          <div class="island-form-container" style="display: none;">
            <form class="island-form">
              <h3>Create New Island</h3>
              
              <div class="form-group">
                <label for="island-key">Suffix Key:</label>
                <input type="text" id="island-key" class="island-input" maxlength="3" required>
                <p class="form-help">The letter(s) to add after a bang (e.g., 'a' for !t3a)</p>
              </div>
              
              <div class="form-group">
                <label for="island-name">Island Name:</label>
                <input type="text" id="island-name" class="island-input" required>
                <p class="form-help">A descriptive name for this island</p>
              </div>
              
              <div class="form-group">
                <label for="island-prompt">Prompt Text:</label>
                <textarea id="island-prompt" class="island-textarea" rows="4" required></textarea>
                <p class="form-help">The text to inject before your query</p>
              </div>
              
              <div class="form-actions">
                <button type="button" class="cancel-button">Cancel</button>
                <button type="submit" class="save-button">Save Island</button>
              </div>
            </form>
          </div>
        </div>
        
        <div class="ducklings-container">
          <h2>Ducklings</h2>
          <p>Ducklings allow you to create automatic bang redirects for specific patterns.</p>
          <p>For example, typing <code>shalevari/ducky</code> will automatically use <code>!ghr</code> bang.</p>
          
          <div class="ducklings-list">
            ${renderDucklingsList()}
          </div>
          
          <button class="add-duckling-button">Add New Duckling</button>
          
          <div class="duckling-form-container" style="display: none;">
            <form class="duckling-form">
              <h3>Create New Duckling</h3>
              
              <div class="form-group">
                <label for="duckling-pattern">Pattern:</label>
                <input type="text" id="duckling-pattern" class="duckling-input" required>
                <p class="form-help">The search pattern to match (e.g., 'ducky')</p>
              </div>
              
              <div class="form-group">
                <label for="duckling-bang">Bang Command:</label>
                <input type="text" id="duckling-bang" class="duckling-input">
                <p class="form-help">The bang command to use (e.g., 'ghr'). Optional for direct URLs.</p>
              </div>
              
              <div class="form-group">
                <label for="duckling-target-value">Target Value:</label>
                <input type="text" id="duckling-target-value" class="duckling-input" required>
                <p class="form-help">The value to use with the bang command or a direct URL (e.g., 'shalevari/ducky' or 'http://localhost:49152')</p>
              </div>
              
              <div class="form-group">
                <label for="duckling-description">Description:</label>
                <input type="text" id="duckling-description" class="duckling-input" required>
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

  setupEventListeners(duckyIslands)
}

/**
 * Set up all event listeners for the UI
 */
function setupEventListeners(duckyIslands: { [key: string]: DuckyIsland }): void {
  const app = document.querySelector<HTMLDivElement>('#app')!
  const copyButton = app.querySelector<HTMLButtonElement>('.copy-button')!
  const copyIcon = copyButton.querySelector('img')!
  const urlInput = app.querySelector<HTMLInputElement>('.url-input')!
  const bangDatalist = app.querySelector<HTMLDataListElement>('#bang-list')!
  const bangForm = app.querySelector<HTMLFormElement>('.bang-form')!
  const bangInput = app.querySelector<HTMLInputElement>('#bang-input')!
  const bangErrorDiv = app.querySelector<HTMLParagraphElement>('.bang-error')!

  const copyUrlToClipboard = async () => {
    await navigator.clipboard.writeText(urlInput.value)
    copyIcon.src = '/clipboard-check.svg'

    setTimeout(() => {
      copyIcon.src = '/clipboard.svg'
    }, 2000)
  }

  Object.values(bangs).forEach((b) => {
    const option = document.createElement('option')
    option.value = b.t
    bangDatalist.appendChild(option)
  })

  urlInput.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'c' && window.getSelection()?.toString() === '') {
      event.preventDefault()
      copyUrlToClipboard()
    }
  })

  bangForm.addEventListener('submit', (submitEvent: SubmitEvent) => {
    submitEvent.preventDefault()
    const bangName = bangInput.value.trim()
    if (!bangs[bangName]) {
      bangErrorDiv.innerHTML = `This bang is not known. Check the <a href="https://duckduckgo.com/bang.html" target="_blank">list of available bangs.</a>`
      return
    }
    bangErrorDiv.innerHTML = ''
    localStorage.setItem('default-bang', bangName)
    const currentUrl = window.location.origin + window.location.pathname
    urlInput.value = `${currentUrl}?q=%s&default_bang=${encodeURIComponent(bangName)}`
  })

  copyButton.addEventListener('click', copyUrlToClipboard)

  const recentBangButtons = app.querySelectorAll<HTMLButtonElement>('.recent-bang')
  recentBangButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const bangName = button.dataset.bang || ''
      if (bangName && bangs[bangName]) {
        bangInput.value = bangName
        bangForm.dispatchEvent(new Event('submit'))
      }
    })
  })

  setupIslandEventListeners(duckyIslands)
  setupDucklingEventListeners()
}

/**
 * Set up event listeners for island management
 */
function setupIslandEventListeners(duckyIslands: { [key: string]: DuckyIsland }): void {
  const app = document.querySelector<HTMLDivElement>('#app')!
  const addIslandButton = app.querySelector<HTMLButtonElement>('.add-island-button')
  const islandFormContainer = app.querySelector<HTMLDivElement>('.island-form-container')
  const islandForm = app.querySelector<HTMLFormElement>('.island-form')
  const cancelButton = app.querySelector<HTMLButtonElement>('.cancel-button')
  const islandKeyInput = app.querySelector<HTMLInputElement>('#island-key')
  const islandNameInput = app.querySelector<HTMLInputElement>('#island-name')
  const islandPromptInput = app.querySelector<HTMLTextAreaElement>('#island-prompt')

  if (addIslandButton && islandFormContainer && islandForm && cancelButton) {
    addIslandButton.addEventListener('click', () => {
      islandFormContainer.style.display = 'block'
      addIslandButton.style.display = 'none'
    })

    cancelButton.addEventListener('click', () => {
      islandFormContainer.style.display = 'none'
      addIslandButton.style.display = 'block'
      islandForm.reset()
    })

    islandForm.addEventListener('submit', (event) => {
      event.preventDefault()

      if (!islandKeyInput || !islandNameInput || !islandPromptInput) return

      const key = islandKeyInput.value.trim()
      const name = islandNameInput.value.trim()
      const prompt = islandPromptInput.value.trim()

      if (!key || !name || !prompt) {
        alert('All fields are required')
        return
      }

      if (duckyIslands[key]) {
        alert(`Island with suffix "${key}" already exists. Please choose a different suffix.`)
        return
      }

      duckyIslands[key] = { key, name, prompt }
      saveDuckyIslands(duckyIslands)

      islandForm.reset()
      islandFormContainer.style.display = 'none'
      addIslandButton.style.display = 'block'

      const islandsList = app.querySelector<HTMLDivElement>('.islands-list')
      if (islandsList) {
        islandsList.innerHTML = renderIslandsList(duckyIslands)
        attachDeleteHandlers(duckyIslands)
      }
    })

    attachDeleteHandlers(duckyIslands)
  }
}

/**
 * Attach delete handlers to island delete buttons
 */
function attachDeleteHandlers(duckyIslands: { [key: string]: DuckyIsland }): void {
  const app = document.querySelector<HTMLDivElement>('#app')!
  const deleteButtons = app.querySelectorAll<HTMLButtonElement>('.delete-island')
  deleteButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const key = button.dataset.key
      if (key && duckyIslands[key]) {
        if (confirm(`Are you sure you want to delete the "${duckyIslands[key].name}" island?`)) {
          delete duckyIslands[key]
          saveDuckyIslands(duckyIslands)

          const islandsList = app.querySelector<HTMLDivElement>('.islands-list')
          if (islandsList) {
            islandsList.innerHTML = renderIslandsList(duckyIslands)
            attachDeleteHandlers(duckyIslands)
          }
        }
      }
    })
  })
}

/**
 * Set up event listeners for duckling management
 */
function setupDucklingEventListeners(): void {
  const app = document.querySelector<HTMLDivElement>('#app')!
  const addDucklingButton = app.querySelector<HTMLButtonElement>('.add-duckling-button')
  const ducklingFormContainer = app.querySelector<HTMLDivElement>('.duckling-form-container')
  const ducklingForm = app.querySelector<HTMLFormElement>('.duckling-form')
  const ducklingCancelButton = app.querySelector<HTMLButtonElement>('.duckling-cancel-button')
  const ducklingPatternInput = app.querySelector<HTMLInputElement>('#duckling-pattern')
  const ducklingBangInput = app.querySelector<HTMLInputElement>('#duckling-bang')
  const ducklingTargetValueInput = app.querySelector<HTMLInputElement>('#duckling-target-value')
  const ducklingDescriptionInput = app.querySelector<HTMLInputElement>('#duckling-description')

  addDucklingButton?.addEventListener('click', () => {
    ducklingFormContainer?.style.setProperty('display', 'block')
  })

  ducklingCancelButton?.addEventListener('click', () => {
    ducklingFormContainer?.style.setProperty('display', 'none')
    ducklingForm?.reset()
  })

  ducklingForm?.addEventListener('submit', (e) => {
    e.preventDefault()

    const pattern = ducklingPatternInput?.value.trim() || ''
    const bangCommand = ducklingBangInput?.value.trim().replace(/^!/, '') || ''
    const targetValue = ducklingTargetValueInput?.value.trim() || ''
    const description = ducklingDescriptionInput?.value.trim() || ''
    const isDirectUrl = targetValue.startsWith('http://') || targetValue.startsWith('https://')
    const finalBangCommand = isDirectUrl && !bangCommand ? 'raw' : bangCommand

    if (!pattern || (!finalBangCommand && !isDirectUrl) || !targetValue || !description) {
      return
    }

    const ducklings = loadDucklings()
    const existingIndex = ducklings.findIndex((d) => d.pattern === pattern)
    if (existingIndex >= 0) {
      ducklings[existingIndex] = { pattern, bangCommand: finalBangCommand, targetValue, description }
    } else {
      ducklings.push({ pattern, bangCommand: finalBangCommand, targetValue, description })
    }

    saveDucklings(ducklings)

    ducklingForm.reset()
    ducklingFormContainer?.style.setProperty('display', 'none')

    const ducklingsList = app.querySelector<HTMLDivElement>('.ducklings-list')
    if (ducklingsList) {
      ducklingsList.innerHTML = renderDucklingsList()
      attachDucklingDeleteHandlers()
    }
  })

  attachDucklingDeleteHandlers()
}

/**
 * Attach delete handlers to duckling delete buttons
 */
function attachDucklingDeleteHandlers(): void {
  const app = document.querySelector<HTMLDivElement>('#app')!
  const deleteButtons = app.querySelectorAll<HTMLButtonElement>('.delete-duckling')
  deleteButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const pattern = button.dataset.pattern
      if (!pattern) return

      const ducklings = loadDucklings()
      const updatedDucklings = ducklings.filter((d) => d.pattern !== pattern)
      saveDucklings(updatedDucklings)

      const ducklingsList = app.querySelector<HTMLDivElement>('.ducklings-list')
      if (ducklingsList) {
        ducklingsList.innerHTML = renderDucklingsList()
        attachDucklingDeleteHandlers()
      }
    })
  })
}
