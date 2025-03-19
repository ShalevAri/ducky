# Ducky

A lightning-fast alternative to DuckDuckGo's bang redirects, designed for speed and efficiency.

When used as a custom search engine, Ducky provides all of DuckDuckGo's bangs (and more!)

with significantly improved performance.

## Why Ducky?

DuckDuckGo's bang redirects are processed server-side, leading to slow DNS resolution and redirect times.

Ducky solves this by handling all redirects client-side, resulting in near-instantaneous navigation.

## Features

### Bang Commands

- Full support for all DuckDuckGo bangs
- Client-side processing for faster redirects
- Zero server latency

### Ducky Islands

Custom prompt prefixes for AI bangs:

```bash
!t3   # Search regularly in T3 Chat
!t3a  # Injects a prompt to prioritize direct answers (for when you need a quick answer instead of a wall of text)
```

### Ducklings

Automatic pattern-based redirects without typing bang commands:

```bash
# Pattern: shalevari/ducky
# Bang: !ghr
typing 'shalevari/ducky' → automatically redirects to this GitHub repository
```

## Installation

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

1. Either open `http://localhost:49152` or type `duckylocal` to open it automatically
2. Add `DEBUG_MODE: true` to localStorage
3. Open the console and navigate to any website, you should now see debug information

### LocalStorage Options

```javascript
{
  "DEBUG_MODE": true/false,           // Enable/disable debug mode
  "DISABLE_LOADING_PAGE": true/false, // Disable the loading page
  "default-bang": "string"           // Set the default search engine to use
}
```

### Port Configuration

The default port is `49152`, you can change it by editing the `vite.config.ts` file

## Credits

Ducky is a fork of [Unduck](https://github.com/t3dotgg/unduck) by [Theo](https://github.com/t3dotgg) with additional features and performance optimizations.

Special thanks to him for the original project and the inspiration for this work.

## Roadmap

### Backlog

- [ ] FEAT: Export custom Islands and Ducklings as JSON to share / import
- [ ] v2.0.0

### Next Up

- [ ] Remove unnecessary comments, console logs, etc and overall clean up the code
- [ ] FEAT: Be able to edit & delete current Islands and Ducklings

### In Progress

- [ ] TEST: Add Playwright tests

### Done

- [x] v1.0.0
- [x] Add a "clear recent bangs" button
- [x] Choose AI model when searching in T3 Chat
- [x] Add some sort of Debug Mode
- [x] Add CI for linting, formatting, tests, etc.
- [x] Improve UI/UX
- [x] Fix broken reverse bangs
- [x] Choose AI model when searching in T3 Chat with `!t3a` bang
- [x] Search ducklings regularly if they start with a backslash
- [x] Add a funny loading page
- [x] Add more built-in Islands and Ducklings
- [x] Fix incorrect search results when searching normally but with a duckling at the start
- [x] Add LocalStorage keys to customize Ducky
- [x] Create a new README file
