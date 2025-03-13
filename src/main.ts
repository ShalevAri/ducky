import { defaultDucklings, loadDucklings, matchDuckling, renderDucklingsList, saveDucklings } from './ducklings.ts'
import './global.css'
import { bangs } from './hashbang.ts'
import { DuckyIsland, defaultIslands } from './islands.ts'

// Utility function for debouncing
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: number | undefined

  return function (...args: Parameters<T>): void {
    const later = () => {
      timeout = undefined
      func(...args)
    }

    clearTimeout(timeout)
    timeout = setTimeout(later, wait) as unknown as number
  }
}

// Initialize ducklings if none exist
if (loadDucklings().length === 0) {
  saveDucklings(defaultDucklings)
}

// Load custom islands from localStorage
function loadDuckyIslands(): { [key: string]: DuckyIsland } {
  const islands = localStorage.getItem('ducky-islands')
  if (!islands) return {}
  try {
    return JSON.parse(islands)
  } catch (e) {
    console.error('Failed to parse ducky islands', e)
    return {}
  }
}

// Save islands to localStorage
function saveDuckyIslands(islands: { [key: string]: DuckyIsland }) {
  localStorage.setItem('ducky-islands', JSON.stringify(islands))
}

// Get stored islands or initialize with defaults if none exist
const duckyIslands = loadDuckyIslands()
if (Object.keys(duckyIslands).length === 0) {
  // Initialize with default islands
  defaultIslands.forEach((island) => {
    duckyIslands[island.key] = island
  })
  saveDuckyIslands(duckyIslands)
}

// Get stored ducklings or initialize with defaults if none exist
const ducklings = loadDucklings()
if (ducklings.length === 0) {
  // Initialize with default ducklings
  saveDucklings(defaultDucklings)
}

// Check for default_bang parameter in URL first, then localStorage, then fallback to "g"
const url = new URL(window.location.href)
const urlDefaultBang = url.searchParams.get('default_bang')
const LS_DEFAULT_BANG = urlDefaultBang || localStorage.getItem('default-bang') || 'g'
const defaultBang = bangs[LS_DEFAULT_BANG]

// Track recently used bangs
function updateRecentBangs(bangName: string) {
  if (!bangName) return

  // Get recent bangs from localStorage
  const recentBangsJson = localStorage.getItem('recent-bangs') || '[]'
  let recentBangs: string[] = []

  try {
    recentBangs = JSON.parse(recentBangsJson)
    // Ensure it's an array
    if (!Array.isArray(recentBangs)) recentBangs = []
  } catch (e) {
    // Reset if invalid JSON
    recentBangs = []
  }

  // Remove the bang if it already exists
  const index = recentBangs.indexOf(bangName)
  if (index > -1) {
    recentBangs.splice(index, 1)
  }

  // Add to the beginning of the array
  recentBangs.unshift(bangName)

  // Keep only the 5 most recent bangs
  recentBangs = recentBangs.slice(0, 5)

  // Save back to localStorage
  localStorage.setItem('recent-bangs', JSON.stringify(recentBangs))
}

// Render the list of Ducky Islands
function renderIslandsList(): string {
  const islands = Object.values(duckyIslands)
  if (islands.length === 0) {
    return '<p>No custom islands created yet.</p>'
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
          <tr data-key="${island.key}">
            <td>${island.key}</td>
            <td>${island.name}</td>
            <td class="prompt-cell">${island.prompt}</td>
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

function noSearchDefaultPageRender() {
  const currentUrl = window.location.href.replace(/\/+$/, '')
  const app = document.querySelector<HTMLDivElement>('#app')!

  // Get recent bangs
  const recentBangsJson = localStorage.getItem('recent-bangs') || '[]'
  let recentBangs: string[] = []

  try {
    recentBangs = JSON.parse(recentBangsJson)
    // Ensure it's an array
    if (!Array.isArray(recentBangs)) recentBangs = []
  } catch (e) {
    // Reset if invalid JSON
    recentBangs = []
  }

  // Create recent bangs HTML if there are any
  let recentBangsHtml = ''
  if (recentBangs.length > 0) {
    const bangsHtml = recentBangs
      .filter((bangName) => bangs[bangName]) // Filter out any invalid bangs
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
              value="${LS_DEFAULT_BANG}"
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
            ${renderIslandsList()}
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

  const copyButton = app.querySelector<HTMLButtonElement>('.copy-button')!
  const copyIcon = copyButton.querySelector('img')!
  const urlInput = app.querySelector<HTMLInputElement>('.url-input')!
  const bangDatalist = app.querySelector<HTMLDataListElement>('#bang-list')!
  const bangForm = app.querySelector<HTMLFormElement>('.bang-form')!
  const bangInput = app.querySelector<HTMLInputElement>('#bang-input')!
  const bangErrorDiv = app.querySelector<HTMLParagraphElement>('.bang-error')!

  // Function to copy URL to clipboard
  const copyUrlToClipboard = async () => {
    await navigator.clipboard.writeText(urlInput.value)
    copyIcon.src = '/clipboard-check.svg'

    setTimeout(() => {
      copyIcon.src = '/clipboard.svg'
    }, 2000)
  }

  // Since bangs is now a hashmap, iterate over its values
  Object.values(bangs).forEach((b) => {
    const option = document.createElement('option')
    option.value = b.t
    bangDatalist.appendChild(option)
  })

  // Add keyboard shortcut for copying URL
  urlInput.addEventListener('keydown', (event) => {
    // Check for Ctrl+C or Cmd+C when the input is focused
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
    // Store the selected bang in localStorage
    localStorage.setItem('default-bang', bangName)
    // Use the current URL instead of hardcoded localhost
    const currentUrl = window.location.origin + window.location.pathname
    urlInput.value = `${currentUrl}?q=%s&default_bang=${encodeURIComponent(bangName)}`
  })

  copyButton.addEventListener('click', copyUrlToClipboard)

  // Add event listeners for recent bang buttons
  const recentBangButtons = app.querySelectorAll<HTMLButtonElement>('.recent-bang')
  recentBangButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const bangName = button.dataset.bang || ''
      if (bangName && bangs[bangName]) {
        bangInput.value = bangName
        // Trigger the form submission
        bangForm.dispatchEvent(new Event('submit'))
      }
    })
  })

  // Ducky Islands event handlers
  const addIslandButton = app.querySelector<HTMLButtonElement>('.add-island-button')
  const islandFormContainer = app.querySelector<HTMLDivElement>('.island-form-container')
  const islandForm = app.querySelector<HTMLFormElement>('.island-form')
  const cancelButton = app.querySelector<HTMLButtonElement>('.cancel-button')
  const islandKeyInput = app.querySelector<HTMLInputElement>('#island-key')
  const islandNameInput = app.querySelector<HTMLInputElement>('#island-name')
  const islandPromptInput = app.querySelector<HTMLTextAreaElement>('#island-prompt')

  if (addIslandButton && islandFormContainer && islandForm && cancelButton) {
    // Show the form when Add New Island is clicked
    addIslandButton.addEventListener('click', () => {
      islandFormContainer.style.display = 'block'
      addIslandButton.style.display = 'none'
    })

    // Hide the form when Cancel is clicked
    cancelButton.addEventListener('click', () => {
      islandFormContainer.style.display = 'none'
      addIslandButton.style.display = 'block'
      islandForm.reset()
    })

    // Handle form submission
    islandForm.addEventListener('submit', (event) => {
      event.preventDefault()

      if (!islandKeyInput || !islandNameInput || !islandPromptInput) return

      const key = islandKeyInput.value.trim()
      const name = islandNameInput.value.trim()
      const prompt = islandPromptInput.value.trim()

      // Validate inputs
      if (!key || !name || !prompt) {
        alert('All fields are required')
        return
      }

      if (duckyIslands[key]) {
        alert(`Island with suffix "${key}" already exists. Please choose a different suffix.`)
        return
      }

      // Add the new island
      duckyIslands[key] = { key, name, prompt }
      saveDuckyIslands(duckyIslands)

      // Reset and hide the form
      islandForm.reset()
      islandFormContainer.style.display = 'none'
      addIslandButton.style.display = 'block'

      // Refresh the islands list
      const islandsList = app.querySelector<HTMLDivElement>('.islands-list')
      if (islandsList) {
        islandsList.innerHTML = renderIslandsList()
        // Re-attach delete event handlers
        attachDeleteHandlers()
      }
    })

    // Attach delete event handlers
    function attachDeleteHandlers() {
      const deleteButtons = app.querySelectorAll<HTMLButtonElement>('.delete-island')
      deleteButtons.forEach((button) => {
        button.addEventListener('click', () => {
          const key = button.dataset.key
          if (key && duckyIslands[key]) {
            if (confirm(`Are you sure you want to delete the "${duckyIslands[key].name}" island?`)) {
              delete duckyIslands[key]
              saveDuckyIslands(duckyIslands)

              // Refresh the islands list
              const islandsList = app.querySelector<HTMLDivElement>('.islands-list')
              if (islandsList) {
                islandsList.innerHTML = renderIslandsList()
                // Re-attach delete event handlers
                attachDeleteHandlers()
              }
            }
          }
        })
      })
    }

    // Initial attachment of delete handlers
    attachDeleteHandlers()
  }

  // Add Ducklings event handlers
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

    // Make bangCommand optional if targetValue is a URL
    const isDirectUrl = targetValue.startsWith('http://') || targetValue.startsWith('https://')
    const finalBangCommand = isDirectUrl && !bangCommand ? 'raw' : bangCommand

    // Validate required fields
    if (!pattern || (!finalBangCommand && !isDirectUrl) || !targetValue || !description) {
      return
    }

    // Add the new duckling
    const ducklings = loadDucklings()

    // Check if the pattern already exists
    const existingIndex = ducklings.findIndex((d) => d.pattern === pattern)
    if (existingIndex >= 0) {
      // Update existing duckling
      ducklings[existingIndex] = { pattern, bangCommand: finalBangCommand, targetValue, description }
    } else {
      // Add new duckling
      ducklings.push({ pattern, bangCommand: finalBangCommand, targetValue, description })
    }

    saveDucklings(ducklings)

    // Reset form and hide
    ducklingForm.reset()
    ducklingFormContainer?.style.setProperty('display', 'none')

    // Update the ducklings list display
    const ducklingsList = app.querySelector<HTMLDivElement>('.ducklings-list')
    if (ducklingsList) {
      ducklingsList.innerHTML = renderDucklingsList()
      // Re-attach delete handlers
      attachDucklingDeleteHandlers()
    }
  })

  function attachDucklingDeleteHandlers() {
    const deleteButtons = app.querySelectorAll<HTMLButtonElement>('.delete-duckling')
    deleteButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const pattern = button.dataset.pattern
        if (!pattern) return

        const ducklings = loadDucklings()
        const updatedDucklings = ducklings.filter((d) => d.pattern !== pattern)
        saveDucklings(updatedDucklings)

        // Update the list display
        const ducklingsList = app.querySelector<HTMLDivElement>('.ducklings-list')
        if (ducklingsList) {
          ducklingsList.innerHTML = renderDucklingsList()
          // Re-attach delete handlers
          attachDucklingDeleteHandlers()
        }
      })
    })
  }

  // Attach delete handlers for ducklings
  attachDucklingDeleteHandlers()
}

// Add a memoization cache for bang redirects
const bangRedirectCache = new Map<string, string | null>()
const ducklingMatchCache = new Map<string, { bangCommand: string; remainingQuery: string } | null>()

// Precompile regex patterns for better performance
const BANG_REGEX = /!(\S+)/i
const FEELING_LUCKY_REGEX = /!(?:\s|$)/i
const BANG_REPLACE_REGEX = /!\S+\s*/i

function getBangredirectUrl() {
  const url = new URL(window.location.href)
  const query = url.searchParams.get('q')?.trim() ?? ''
  if (!query) {
    noSearchDefaultPageRender()
    return null
  }

  // Check cache first
  if (bangRedirectCache.has(query)) {
    return bangRedirectCache.get(query)
  }

  // First, check if the query has an explicit bang command
  const bangMatch = BANG_REGEX.exec(query)

  if (bangMatch) {
    // Process as normal with existing bang logic
    const bangWithIslandCandidate = bangMatch?.[1]?.toLowerCase() ?? ''

    // Check if the bang has a Ducky Island suffix
    let bangCandidate = bangWithIslandCandidate
    let islandKey = ''
    let injectionPrompt = ''

    // Look for suffixes that match our islands
    for (const key of Object.keys(duckyIslands)) {
      if (bangWithIslandCandidate.endsWith(key) && bangWithIslandCandidate.length > key.length) {
        // Found a matching island suffix
        bangCandidate = bangWithIslandCandidate.slice(0, -key.length)
        islandKey = key
        injectionPrompt = duckyIslands[key].prompt
        break
      }
    }

    const selectedBang = bangs[bangCandidate] ?? defaultBang

    // Update recent bangs if a bang was used
    if (bangCandidate && bangs[bangCandidate]) {
      // Defer the localStorage update to not block the redirect
      setTimeout(() => updateRecentBangs(bangCandidate), 0)
    }

    // Remove the bang from the query
    const cleanQuery = query.replace(BANG_REPLACE_REGEX, '').trim()
    if (cleanQuery === '') {
      const result = selectedBang ? `https://${selectedBang.d}` : null
      bangRedirectCache.set(query, result)
      return result
    }

    // If we have an island, inject the prompt
    const finalQuery = islandKey ? `${injectionPrompt}${cleanQuery}` : cleanQuery

    const searchUrl = selectedBang.u.replace('{{{s}}}', encodeURIComponent(finalQuery).replace(/%2F/g, '/'))
    if (!searchUrl) return null

    // Cache the result
    bangRedirectCache.set(query, searchUrl)
    return searchUrl
  } else {
    // If there's no explicit bang, check if the query matches any duckling pattern
    // Use cached duckling match if available
    let ducklingMatch
    if (ducklingMatchCache.has(query)) {
      ducklingMatch = ducklingMatchCache.get(query)
    } else {
      ducklingMatch = matchDuckling(query)
      ducklingMatchCache.set(query, ducklingMatch)
    }

    if (ducklingMatch) {
      // We found a matching duckling pattern
      const { bangCommand, remainingQuery } = ducklingMatch

      // Special case for 'raw' bangCommand which indicates a direct URL
      if (bangCommand === 'raw') {
        bangRedirectCache.set(query, remainingQuery)
        return remainingQuery // Direct URL, no need for further processing
      }

      // Make sure the bang command exists
      if (!bangs[bangCommand]) {
        // If the bang doesn't exist, fall back to default bang
        const searchUrl = defaultBang.u.replace('{{{s}}}', encodeURIComponent(query).replace(/%2F/g, '/'))
        bangRedirectCache.set(query, searchUrl)
        return searchUrl
      }

      // Update recent bangs asynchronously to not block the redirect
      setTimeout(() => updateRecentBangs(bangCommand), 0)

      // Use the remainingQuery (which now contains the targetValue or targetValue + additional query)
      const searchUrl = bangs[bangCommand].u.replace('{{{s}}}', encodeURIComponent(remainingQuery).replace(/%2F/g, '/'))
      bangRedirectCache.set(query, searchUrl)
      return searchUrl
    }

    // If no duckling pattern matches, use the default bang
    const searchUrl = defaultBang.u.replace('{{{s}}}', encodeURIComponent(query).replace(/%2F/g, '/'))
    bangRedirectCache.set(query, searchUrl)
    return searchUrl
  }
}

function feelingLuckyRedirect(query: string) {
  // Cache key for feeling lucky redirects
  const cacheKey = `lucky:${query}`
  if (bangRedirectCache.has(cacheKey)) {
    return bangRedirectCache.get(cacheKey)
  }

  const cleanQuery = query.replace('!', '').trim()
  const url = `https://duckduckgo.com/?q=!ducky+${encodeURIComponent(cleanQuery)}`

  // Cache the result
  bangRedirectCache.set(cacheKey, url)
  return url
}

function doRedirect() {
  const url = new URL(window.location.href)
  const query = url.searchParams.get('q')?.trim() ?? ''
  if (!query) {
    noSearchDefaultPageRender()
    return null
  }

  // If the query ends with an exclamation mark, use the feeling lucky redirect
  const type = FEELING_LUCKY_REGEX.test(query)
  if (type) {
    const searchUrl = feelingLuckyRedirect(query)
    if (!searchUrl) return

    // Use a more efficient redirect approach
    window.location.href = searchUrl
    return
  }

  const searchUrl = getBangredirectUrl()
  if (!searchUrl) return

  // Use replace for faster redirects
  window.location.replace(searchUrl)
}

// Initialize function to be called after DOM loads
document.addEventListener('DOMContentLoaded', function () {
  // Debounce the redirect for smoother experience
  const debouncedRedirect = debounce(doRedirect, 50)

  // Call the debounced redirect function
  debouncedRedirect()
})
