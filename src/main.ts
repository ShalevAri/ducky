import './global.css'
import { bangs } from './hashbang.ts'
import { DuckyIsland, defaultIslands } from './islands.ts'

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
}

function getBangredirectUrl() {
  const url = new URL(window.location.href)
  const query = url.searchParams.get('q')?.trim() ?? ''
  if (!query) {
    noSearchDefaultPageRender()
    return null
  }

  // Match a bang in the query (only prefix bang is supported)
  const match = query.match(/!(\S+)/i)
  const bangWithIslandCandidate: string = match?.[1]?.toLowerCase() ?? ''

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
    updateRecentBangs(bangCandidate)
  }

  // Remove the bang from the query
  const cleanQuery = query.replace(/!\S+\s*/i, '').trim()
  if (cleanQuery === '') return selectedBang ? `https://${selectedBang.d}` : null

  // If we have an island, inject the prompt
  const finalQuery = islandKey ? `${injectionPrompt}${cleanQuery}` : cleanQuery

  const searchUrl = selectedBang.u.replace('{{{s}}}', encodeURIComponent(finalQuery).replace(/%2F/g, '/'))
  if (!searchUrl) return null

  return searchUrl
}

function feelingLuckyRedirect(query: string) {
  const cleanQuery = query.replace('!', '').trim()
  return `https://duckduckgo.com/?q=!ducky+${encodeURIComponent(cleanQuery)}`
}

function doRedirect() {
  const url = new URL(window.location.href)
  const query = url.searchParams.get('q')?.trim() ?? ''
  if (!query) {
    noSearchDefaultPageRender()
    return null
  }

  // If the query ends with an exclamation mark, use the feeling lucky redirect
  const type = /!(?:\s|$)/i.test(query)
  if (type) {
    const searchUrl = feelingLuckyRedirect(query)
    if (!searchUrl) return
    const link = document.createElement('a')
    link.href = searchUrl
    link.rel = 'noreferrer noopener'
    link.click()
    return
  }

  const searchUrl = getBangredirectUrl()
  if (!searchUrl) return
  window.location.replace(searchUrl)
}

doRedirect()
