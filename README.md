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
5. Add `http://localhost:49152` to your browser as a custom search engine (I use the Zen browser)

## Example Commands

1. `git clone https://github.com/ShalevAri/ducky.git`
2. `cd ducky`
3. `pnpm i`
4. `pnpm run build`
5. `pnpm dev`
6. Add `http://localhost:49152?q=%s` to your browser as a custom search engine.
7. You're done!

## FAQ

1. How can I change the port?

The port is hardcoded in `vite.config.ts` and `src/main.ts`. You can change it there.

2. How can I change the default bang?

The default bang is hardcoded in `src/main.ts`.

You can also change it by first looking in the `src/bangs.ts` file to find the correct bang shortcut, and then changing the `LS_DEFAULT_BANG` variable in `src/main.ts`.

For example, searching by default using google is `g`, and searching using brave is `brave` (which is the default already).

## Credits

Ducky is a (hopefully better!) fork of [Unduck](https://github.com/t3dotgg/unduck) by [Theo](https://github.com/t3dotgg)

Credits to him for giving me the inspiration for this project and for releasing the original project as MIT.
