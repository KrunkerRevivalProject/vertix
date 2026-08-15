import { svelte } from "@sveltejs/vite-plugin-svelte";
import type { UserConfig } from "vite";

// todo: when we start not using the dev server
// https://vite.dev/guide/build#multi-page-app
export default {
	appType: "mpa",
	plugins: [
		svelte({
			compilerOptions: {
				experimental: {
					async: true,
				},
				runes: true,
				hmr: true,
				preserveComments: true,
				// not ideal
				warningFilter: (w) => !w.code.includes("a11y"),
			},
			inspector: true,
		}),
	],
	build: {
		target: "esnext",
	},
	server: {
		allowedHosts: [".trycloudflare.com"],
		proxy: {
			"/api": "http://localhost:1118",
			"/socket.io": {
				target: "http://localhost:1119",
				ws: true,
			},
		},
	},
} satisfies UserConfig;
