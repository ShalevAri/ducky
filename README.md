# Ducky

DuckDuckGo's bang redirects are too slow. When you use Ducky as a custom search engine in your browser, it enables all of DuckDuckGo's bangs (and more!) but much faster and better.

## Features

### Bangs

Ducky supports all of DuckDuckGo's bangs and processes them client-side for faster redirects.

### Ducky Islands

Ducky Islands allow you to create custom prompt prefixes for AI bangs. For example, using `!t3a` instead of `!t3` will tell the AI to give you the answer first.

### Ducklings

Ducklings allow you to create automatic bang redirects for specific patterns without having to type the bang command.

For example, if you add a Duckling for the pattern `shalevari/ducky` with the bang command `ghr`, then typing `shalevari/ducky` in your search bar will automatically redirect you to the GitHub repository as if you had typed `!ghr shalevari/ducky`.

This feature is great for:

- Quickly accessing frequently visited GitHub repositories
- Creating shortcuts for common search patterns
- Automating navigation to specific websites based on recognizable patterns

## How Does It Work?

DuckDuckGo does their redirects server side. Their DNS is...not always great. Result is that it often takes ages.

We solve this by doing all of the work client side so that your device does the redirects, not me.

## Instructions

1. Clone this repository locally on your computer.
2. Run `pnpm i` or equivalent to download the (few) dependencies.
3. Run `pnpm run build` to build the project.
4. Run `pnpm dev` to start the server.
5. Add `http://localhost:49152?q=%s` to your browser as a custom search engine (I use the Zen browser)

## Example Commands

1. `git clone https://github.com/ShalevAri/ducky.git`
2. `cd ducky`
3. `pnpm i`
4. `pnpm run build`
5. `pnpm dev`
6. Add `http://localhost:49152?q=%s` to your browser as a custom search engine.
7. You're done!

## Speed

Speed is the core focus of Ducky.

I'm optimizing everything to make sure you get every ounce of speed possible.

The end goal is to get all the benefits of Ducky while having virtually 0 overhead.

## Debug Mode

Ducky has a Debug Mode that allows you to see the time it takes for each redirect to happen.

To enable it, open the `http://localhost:49152` Ducky UI page in your browser, inspect it, add the `DEBUG_MODE` variable to `localStorage` with the value `true` and then refresh the page.

Then, open the console and navigate to a website. You'll now see the debug information.

## Local Storage

Ducky provides a few LocalStorage keys to customize your experience.

- `DEBUG_MODE`: Enables Debug Mode.
- `DISABLE_LOADING_PAGE`: Disables the loading page.
- `default-bang`: The default bang to use.

## FAQ

### How can I change the port?

The port itself is hardcoded in the `vite.config.ts` file, however it is also mentioned

in the `src/main.ts` file for instructional purposes. (this one doesn't matter for actual functionality)

### How can I change the default bang?

The default bang is hardcoded in `src/main.ts`.

Change it by first finding the correct bang code in the `src/bang.ts` file

and swapping it in `src/main.ts`.

For example, google's code is `g` and brave's is `brave` (which is the default)

## Credits

Ducky is a (hopefully better!) fork of [Unduck](https://github.com/t3dotgg/unduck) by [Theo](https://github.com/t3dotgg)

Credits to him for giving me the inspiration for this project and for releasing the original project as MIT.
