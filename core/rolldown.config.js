import { join } from "node:path";
import { defineConfig } from "rolldown";

export default defineConfig({
	input: join(import.meta.dirname, "src/app.ts"),
	output: {
		dir: join(import.meta.dirname, "../public/js"),
	},
});
