import {defineConfig} from "vite"
import {VitePWA} from "vite-plugin-pwa"

export default defineConfig({
	plugins: [
		VitePWA({
			registerType: "autoUpdate",
		}),
	],
	server: {
		port: 49152,
		host: true, // Listen on all local IPs
		open: true, // Automatically open browser
	},
})
