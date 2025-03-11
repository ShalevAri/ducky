import './global.css'
import { bangs } from './hashbang.ts'

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
  const bangCandidate: string = match?.[1]?.toLowerCase() ?? ''
  const selectedBang = bangs[bangCandidate] ?? defaultBang

  // Update recent bangs if a bang was used
  if (bangCandidate && bangs[bangCandidate]) {
    updateRecentBangs(bangCandidate)
  }

  // Remove the bang from the query
  const cleanQuery = query.replace(/!\S+\s*/i, '').trim()
  if (cleanQuery === '') return selectedBang ? `https://${selectedBang.d}` : null

  const searchUrl = selectedBang.u.replace('{{{s}}}', encodeURIComponent(cleanQuery).replace(/%2F/g, '/'))
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
