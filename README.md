# Ducky

DuckDuckGo's bang redirects are too slow. When you use Ducky as a custom search engine in your browser, it enables all of DuckDuckGo's bangs (and more!) but much faster and better.

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
