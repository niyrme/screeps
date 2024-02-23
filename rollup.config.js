"use strict";

import nodeResolve from "@rollup/plugin-node-resolve";
import swc from "@rollup/plugin-swc";
import fs from "node:fs";
import path from "node:path";
import clear from "rollup-plugin-clear";
import copy from "rollup-plugin-copy";
import screepsDeploy from "./rollup/rollup-plugin-screeps-deploy.js";
import screeps from "./rollup/rollup-plugin-screeps.js";

let cfg;
const dest = process.env.DEST;
if (dest && (!(cfg = require("./screeps.json")[dest]))) {
	throw new Error("A");
}

const modules = fs.readdirSync("src", { recursive: false })
	.filter(name => name !== "WASM" && fs.statSync(path.join("src", name)).isDirectory());

/** @type {import("rollup").RollupOptions} */
const options = {
	input: [
		...modules.map(name => `src/${name}/_index.ts`),
		"src/index.ts",
	],
	output: {
		dir: "dist",
		format: "commonjs",
		globals: {
			"_": "lodash",
		},
		entryFileNames(chunk) {
			const chunkPath = path.parse(chunk.facadeModuleId);
			if (chunkPath.name === "_index") {
				return `${path.parse(chunkPath.dir).name}.js`;
			} else {
				return "main.js";
			}
		},
	},
	external: modules,
	plugins: [
		clear({
			targets: ["dist"],
		}),
		copy({
			targets: [
				{ src: "src/WASM/**/*.wasm", dest: "dist" },
			],
		}),
		nodeResolve(),
		swc({
			swc: {
				jsc: {
					parser: {
						syntax: "typescript",
						tsx: false,
						dynamicImport: true,
					},
					target: "es2018",
				},
			},
		}),
		screeps(),
		screepsDeploy({ dest, config: cfg }),
	],
};

export default options;
