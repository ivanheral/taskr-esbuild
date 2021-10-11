'use strict';
var NAME = "esbuild";
const p = require("path");
const fs = require("fs");
const u = require("./esbuild/utils");
const v = require("./esbuild/vue3");
var fw = "";
var dependence = "";

function setError(ctx, msg) {
	const error = msg
		.replace(ctx.root, "")
		.replace(": ", ": \n\n  ")
		.replace(" while parsing", "\n\nwhile parsing")
		.concat("\n");

	ctx.emit("plugin_error", {
		plugin: NAME,
		error
	});

	return new Buffer(
		`console.error('${NAME}: Bundle error! Check CLI output.');`
	);
}

module.exports = function (task) {
	task.plugin('esbuild', {
		every: false
	}, function* (files, opts) {
		opts = opts || {};
		// files
		if (true) {
			for (const file of files) {
				try {
					// get file extension
					var ext = p.extname(file.base).replace('.', '');
					if (u.files.includes(ext)) {
						// change extension -> .js
						if (!u.imgs.includes(ext)) {
							file.base = file.base.replace(ext, 'js');
						}
						opts["esbuild"]["loader"] = u.imgs.includes(ext) ? "text" : ext;
						// vue
						if (ext === "vue") {
							let result = yield v.vue3(file.data.toString(), `${file.dir}\\${file.base}`, {});
							file.data = result.code;
							opts["esbuild"]["loader"] = result.lang;
							// add one style
							if (result.styles[0]) {
								let style_vue = yield u.add_styles(null, null, null, result.styles[0], result.styles[0].lang);
								result.code = result.code + style_vue;
								file.data = result.code;
							}
						}

						// add h (js, jsx, ts, tsx)
						if (ext !== "json" && u.files.includes(ext)) {
							// framework / dependences
							file.data = file.data.toString().replace(u.fw_REGEX, function (...all) {
								dependence = all[2].replace(/['"]+/g, '');
								// dependence is framework
								if ((/(vue|react|preact)$/.test(dependence))) {
									fw = dependence;
								}
								opts["esbuild"] = u.change_jsx(fw, opts["esbuild"]);
								return u.getDependence(all[0], dependence, opts["alias"]);
							});
							// replace extensions						
							file.data = file.data.toString().replace(u.import_REGEX, function (...all) {
								return all[0].replace(`${all[4]}${all[5]}`, `${all[4]}.js`);
							});

							file.data = `${u.add_h(fw)}
						${file.data}`;
							// add styles
							file.data = yield u.replaceAsync(file.data.toString(), u.css_REGEX, file);
							// add css modules
							file.data = yield u.replaceAsync(file.data.toString(), u.mod_REGEX, file);
						}

						let text = file.data.toString();						
						if (u.imgs.includes(ext)) {
							let path = file.dir.replace("/", "\\");
							let image = p.resolve(process.cwd(), `${path}\\${file.base}`);
							text = fs.readFileSync(image, {
								encoding: 'base64'
							});
						}
						const result = yield require('esbuild').transform(text, opts["esbuild"]);


						if (ext === "json") {
							result.code = result.code.replace(/module.exports\s*=\s*/, 'export default');
						}
						if (u.imgs.includes(ext)) {
							result.code = result.code.replace(/module.exports\s*=\s*"/, `export default "data:image/${ext};base64,`);
							file.base = file.base.replace(ext, 'js');
						}
						file.data = new Buffer(result.code);
					}
				} catch (err) {
					file.data = setError(task, err.message);
				}
			}
		} else {
			// ¿? build
		}
		this._.files = files;
	});
}