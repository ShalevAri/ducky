import {bangs} from "./bang"
import "./global.css"

function noSearchDefaultPageRender() {
	const app = document.querySelector<HTMLDivElement>("#app")!
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
            value="http://localhost:49152?q=%s"
            readonly 
          />
          <button class="copy-button">
            <img src="/clipboard.svg" alt="Copy" />
          </button>
        </div>
      </div>
    </div>
  `

	const copyButton = app.querySelector<HTMLButtonElement>(".copy-button")!
	const copyIcon = copyButton.querySelector("img")!
	const urlInput = app.querySelector<HTMLInputElement>(".url-input")!

	copyButton.addEventListener("click", async () => {
		await navigator.clipboard.writeText(urlInput.value)
		copyIcon.src = "/clipboard-check.svg"

		setTimeout(() => {
			copyIcon.src = "/clipboard.svg"
		}, 2000)
	})
}

const LS_DEFAULT_BANG = localStorage.getItem("default-bang") ?? "brave"
const defaultBang = bangs.find((b) => b.t === LS_DEFAULT_BANG)

function getBangredirectUrl() {
	const url = new URL(window.location.href)
	const query = url.searchParams.get("q")?.trim() ?? ""
	if (!query) {
		noSearchDefaultPageRender()
		return null
	}

	const match = query.match(/!(\S+)/i)

	const bangCandidate = match?.[1]?.toLowerCase()
	const selectedBang = bangs.find((b) => b.t === bangCandidate) ?? defaultBang

	// Remove the first bang from the query
	const cleanQuery = query.replace(/!\S+\s*/i, "").trim()

	// Format of the url is:
	// https://www.google.com/search?q={{{s}}}
	const searchUrl = selectedBang?.u.replace(
		"{{{s}}}",
		// Replace %2F with / to fix formats like "!ghr+t3dotgg/unduck"
		encodeURIComponent(cleanQuery).replace(/%2F/g, "/")
	)
	if (!searchUrl) return null

	return searchUrl
}

function doRedirect() {
	const searchUrl = getBangredirectUrl()
	if (!searchUrl) return
	window.location.replace(searchUrl)
}

doRedirect()
