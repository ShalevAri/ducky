import { getRandomSentence } from '../../data/random-sentences'

/**
 * Renders the redirect page with a random message
 * @param targetUrl The URL to redirect to
 */
export function renderRedirectPage(targetUrl: string): void {
  console.log('RedirectPage: Starting redirection to:', targetUrl)

  const enableLoadingPage = localStorage.getItem('ENABLE_LOADING_PAGE') === 'true'
  console.log('RedirectPage: Loading page enabled:', enableLoadingPage)

  if (!enableLoadingPage) {
    console.log('RedirectPage: Loading page disabled, redirecting immediately')
    window.location.replace(targetUrl)
    return
  }

  const app = document.querySelector<HTMLDivElement>('#app')
  if (!app) {
    console.error('RedirectPage: Could not find app element, redirecting immediately')
    window.location.replace(targetUrl)
    return
  }

  const randomMessage = getRandomSentence()
  const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
  const bgColor = isDarkMode ? '#121212' : '#ffffff'
  const textColor = isDarkMode ? '#e0e0e0' : '#1a1a1a'

  app.innerHTML = `
    <div class="redirect-container">
      <div class="redirect-message">
        <div class="redirect-text">${randomMessage}</div>
        <div class="redirect-loader"></div>
        <div class="redirect-destination">Redirecting to: ${new URL(targetUrl).hostname}</div>
      </div>
    </div>
  `

  const style = document.createElement('style')
  style.textContent = `
    .redirect-container {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      width: 100vw;
      background-color: ${bgColor};
      color: ${textColor};
      transition: background-color 0.3s ease;
    }
    
    .redirect-message {
      text-align: center;
      max-width: 80%;
    }
    
    .redirect-text {
      font-size: 1.5rem;
      font-weight: 500;
      margin-bottom: 1.5rem;
    }
    
    .redirect-destination {
      font-size: 0.9rem;
      opacity: 0.7;
      margin-top: 1.5rem;
    }
    
    .redirect-loader {
      display: inline-block;
      width: 40px;
      height: 40px;
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: ${textColor};
      animation: spin 1s ease-in-out infinite;
      margin: 0 auto;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `

  document.head.appendChild(style)
  window.location.replace(targetUrl)
}
