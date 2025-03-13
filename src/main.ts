import { defaultDucklings, loadDucklings, matchDuckling, renderDucklingsList, saveDucklings } from './ducklings.ts'
import './global.css'
import { bangs } from './hashbang.ts'
import { DuckyIsland, defaultIslands } from './islands.ts'
import { debounce } from './utils/debounce.ts'
import { loadFromLocalStorage, saveToLocalStorage } from './utils/storage.ts'

if (loadDucklings().length === 0) {
  saveDucklings(defaultDucklings)
}

function loadDuckyIslands(): { [key: string]: DuckyIsland } {
  return loadFromLocalStorage('ducky-islands', {})
}

function saveDuckyIslands(islands: { [key: string]: DuckyIsland }) {
  saveToLocalStorage('ducky-islands', islands)
}

const duckyIslands = loadDuckyIslands()
if (Object.keys(duckyIslands).length === 0) {
  defaultIslands.forEach((island) => {
    duckyIslands[island.key] = island
  })
  saveDuckyIslands(duckyIslands)
}

const ducklings = loadDucklings()
if (ducklings.length === 0) {
  saveDucklings(defaultDucklings)
}

const url = new URL(window.location.href)
const urlDefaultBang = url.searchParams.get('default_bang')
const LS_DEFAULT_BANG = urlDefaultBang || localStorage.getItem('default-bang') || 'g'
const defaultBang = bangs[LS_DEFAULT_BANG]

function updateRecentBangs(bangName: string) {
  if (!bangName) return

  let recentBangs = loadFromLocalStorage('recent-bangs', [] as string[])

  const index = recentBangs.indexOf(bangName)
  if (index > -1) {
    recentBangs.splice(index, 1)
  }

  recentBangs.unshift(bangName)
  recentBangs = recentBangs.slice(0, 5)

  saveToLocalStorage('recent-bangs', recentBangs)
}

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
        islandsList.innerHTML = renderIslandsList()
        attachDeleteHandlers()
      }
    })

    function attachDeleteHandlers() {
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
                islandsList.innerHTML = renderIslandsList()
                attachDeleteHandlers()
              }
            }
          }
        })
      })
    }

    attachDeleteHandlers()
  }

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

  function attachDucklingDeleteHandlers() {
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

  attachDucklingDeleteHandlers()
}

const bangRedirectCache = new Map<string, string | null>()
const ducklingMatchCache = new Map<string, { bangCommand: string; remainingQuery: string } | null>()

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

  if (bangRedirectCache.has(query)) {
    return bangRedirectCache.get(query)
  }

  const bangMatch = BANG_REGEX.exec(query)

  if (bangMatch) {
    const bangWithIslandCandidate = bangMatch?.[1]?.toLowerCase() ?? ''

    let bangCandidate = bangWithIslandCandidate
    let islandKey = ''
    let injectionPrompt = ''

    for (const key of Object.keys(duckyIslands)) {
      if (bangWithIslandCandidate.endsWith(key) && bangWithIslandCandidate.length > key.length) {
        bangCandidate = bangWithIslandCandidate.slice(0, -key.length)
        islandKey = key
        injectionPrompt = duckyIslands[key].prompt
        break
      }
    }

    const selectedBang = bangs[bangCandidate] ?? defaultBang

    if (bangCandidate && bangs[bangCandidate]) {
      setTimeout(() => updateRecentBangs(bangCandidate), 0)
    }

    const cleanQuery = query.replace(BANG_REPLACE_REGEX, '').trim()
    if (cleanQuery === '') {
      const result = selectedBang ? `https://${selectedBang.d}` : null
      bangRedirectCache.set(query, result)
      return result
    }

    const finalQuery = islandKey ? `${injectionPrompt}${cleanQuery}` : cleanQuery

    const searchUrl = selectedBang.u.replace('{{{s}}}', encodeURIComponent(finalQuery).replace(/%2F/g, '/'))
    if (!searchUrl) return null

    bangRedirectCache.set(query, searchUrl)
    return searchUrl
  } else {
    let ducklingMatch
    if (ducklingMatchCache.has(query)) {
      ducklingMatch = ducklingMatchCache.get(query)
    } else {
      ducklingMatch = matchDuckling(query)
      ducklingMatchCache.set(query, ducklingMatch)
    }

    if (ducklingMatch) {
      const { bangCommand, remainingQuery } = ducklingMatch

      if (bangCommand === 'raw') {
        bangRedirectCache.set(query, remainingQuery)
        return remainingQuery
      }

      if (!bangs[bangCommand]) {
        const searchUrl = defaultBang.u.replace('{{{s}}}', encodeURIComponent(query).replace(/%2F/g, '/'))
        bangRedirectCache.set(query, searchUrl)
        return searchUrl
      }
      setTimeout(() => updateRecentBangs(bangCommand), 0)

      const searchUrl = bangs[bangCommand].u.replace('{{{s}}}', encodeURIComponent(remainingQuery).replace(/%2F/g, '/'))
      bangRedirectCache.set(query, searchUrl)
      return searchUrl
    }

    const searchUrl = defaultBang.u.replace('{{{s}}}', encodeURIComponent(query).replace(/%2F/g, '/'))
    bangRedirectCache.set(query, searchUrl)
    return searchUrl
  }
}

function feelingLuckyRedirect(query: string) {
  const cacheKey = `lucky:${query}`
  if (bangRedirectCache.has(cacheKey)) {
    return bangRedirectCache.get(cacheKey)
  }

  const cleanQuery = query.replace('!', '').trim()
  const url = `https://duckduckgo.com/?q=!ducky+${encodeURIComponent(cleanQuery)}`

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

  const type = FEELING_LUCKY_REGEX.test(query)
  if (type) {
    const searchUrl = feelingLuckyRedirect(query)
    if (!searchUrl) return

    window.location.href = searchUrl
    return
  }

  const searchUrl = getBangredirectUrl()
  if (!searchUrl) return

  window.location.replace(searchUrl)
}

document.addEventListener('DOMContentLoaded', function () {
  const debouncedRedirect = debounce(doRedirect, 50)

  debouncedRedirect()
})
