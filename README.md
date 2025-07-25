# Ducky

A (very) fast alternative to DuckDuckGo's bang redirects, designed for speed and efficiency.

And when I say it's fast, I mean it. Ducky has finished doing its job before you can lift your finger from the enter key.

## Why Ducky?

DuckDuckGo's bang redirects are processed server-side, leading to slow DNS resolution and redirect times.

Ducky solves this by handling all redirects client-side, resulting in very fast navigation.

## Features

### Bang Commands

- Full support for all DuckDuckGo bangs
- Client-side processing for extremely fast redirects
- Ducklings (more on that below)
- Islands (more on that below)
- Super Cache (more on that below)

### Ducklings

Automatic pattern-based redirects without typing bang commands:

```bash
# Pattern: shalevari/ducky
# Bang: !ghr
typing 'shalevari/ducky' → automatically redirects to this GitHub repository
```

You can also set a URL to redirect to:

```bash
# Pattern: ducky
# Bang: N/A
# URL: https://github.com/ShalevAri/ducky
typing 'ducky' → automatically redirects to https://github.com/ShalevAri/ducky
```

If you want to search a term you used as a Duckling regularly (for example `ducky`), simply add a `\` before the term:

```bash
typing `\ducky` → searches the word `ducky` regularly
```

### Ducky Islands

Custom prompt prefixes for AI bangs:

```bash
!t3   # Directly search T3 Chat as usual
!t3a  # Injects a prompt before your search to prioritize direct answers
```

### Super Cache

Super Cache allows Ducky to cache the last 100 search results, so you don't even have to wait for the (already very fast) redirect.

### Sub-pages

You can now use `!!` to open sub-pages of a website (e.g. `!! example/path` would open `https://example.com/path`).

## Installation

The easiest way to install Ducky is by running the `setup.sh` script.

You can do that with the following command:

```bash
curl -sSf https://raw.githubusercontent.com/ShalevAri/ducky/main/setup.sh | bash
```

If you'd like to install manually, here are the steps:

### npm

```bash
git clone https://github.com/ShalevAri/ducky.git
cd ducky
npm install
npm run dev
```

### yarn

```bash
git clone https://github.com/ShalevAri/ducky.git
cd ducky
yarn install
yarn dev
```

### pnpm

```bash
git clone https://github.com/ShalevAri/ducky.git
cd ducky
pnpm install
pnpm dev
```

### bun

```bash
git clone https://github.com/ShalevAri/ducky.git
cd ducky
bun install
bun dev
```

### Add Ducky to your browser:

- Add `http://localhost:49152?q=%s` as a custom search engine in your browser

## Configuration

### Debug Mode

Enable detailed redirect timing information:

1. Either open `http://localhost:49152` or search `duckylocal` to open it automatically
2. Right click and inspect the page
3. Add `DEBUG_MODE` to LocalStorage and set it to `true`
4. In your current webpage, open the console. Then, search anything and you should see the debug information

### LocalStorage Options

```javascript
{
  "DEBUG_MODE": true/false,              // Enable/disable Debug Mode
  "DISABLE_LOADING_PAGE": true/false,    // Disable the loading page
  "SUPER_CACHE": true/false,             // Enable/disable Super Cache
}
```

### Port Configuration

The default port is `49152`, you can change it by editing the `vite.config.ts` file

## Roadmap

- [ ] Export user config as JSON
- [ ] Add more Playwright tests

## Credits

Ducky is a fork of [Unduck](https://github.com/t3dotgg/unduck) by [Theo](https://github.com/t3dotgg) with additional features and performance optimizations.

Special thanks to him for inspiring me to make this project.
