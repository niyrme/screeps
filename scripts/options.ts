import type { BuildOptions } from "esbuild";

export default {
	entryPoints: [
		{ in: "src/index.ts", out: "main" },
	],
	platform: "node",
	bundle: true,
	outdir: "dist",
	sourcemap: "external",
	minify: false,
	format: "cjs",
	logLevel: "info",
	treeShaking: true,
} satisfies BuildOptions;
