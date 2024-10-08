import esbuild from "esbuild";
import options from "./options";

await esbuild.build(options).then(function (result) {
	if (result.errors.length) {
		console.error(result.errors);
	}
	return esbuild.stop();
});
