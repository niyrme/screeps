"use strict";

import nodeResolve from "@rollup/plugin-node-resolve";
import swc from "@rollup/plugin-swc";
import terser from "@rollup/plugin-terser";
import fs from "node:fs";
import path from "node:path";
import clear from "rollup-plugin-clear";
import screepsDeploy from "./rollup/rollup-plugin-screeps-deploy.js";
import screeps from "./rollup/rollup-plugin-screeps.js";

let cfg;
const dest = process.env.DEST;
if (dest && (!(cfg = require("./screeps.json")[dest]))) {
	throw new Error("A");
}

const rootModules = [
	"SourceMapper",
];

/** @type {Array<string>} */
const modules = fs.readdirSync("src", { recursive: false })
	.filter(name => name !== "WASM" && fs.statSync(path.join("src", name)).isDirectory());

/** @type {import("rollup").RollupOptions} */
const options = {
	input: {
		...Object.fromEntries(modules.map(name => [name, `src/${name}/_index.ts`])),
		...Object.fromEntries(rootModules.map(name => [name, `src/${name}.ts`])),
		main: "src/index.ts",
	},
	output: {
		dir: "dist",
		format: "commonjs",
		globals: {
			"_": "lodash",
		},
		sourcemap: "hidden",
		sourcemapFileNames: "[name].map.json"
	},
	external: [...rootModules, ...modules],
	plugins: [
		clear({
			targets: ["dist"],
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
		terser({
			ecma: 2018,
		}),
		screeps(),
		screepsDeploy({ dest, config: cfg }),
	],
};

export default options;
