'use strict';
var NAME = "esbuild";
const {
	startService
} = require("esbuild");
const p = require("path");
const fs = require("fs");
const u = require("./esbuild/utils");
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

// esBuild service
let service = undefined;
async function start() {
	if (!service) {
		service = await startService();
	}
};
const stop = () => {
	if (service) {
		service.stop();
		service = undefined;
	}
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
						// add loader
						opts["loader"] = u.imgs.includes(ext) ? "text" : ext;
						// add h (js, jsx, ts, tsx)
						if (ext !== "json" && u.files.includes(ext)) {
							// framework / dependences
							file.data = file.data.toString().replace(u.fw_REGEX, function (...all) {
								dependence = all[3];
								// dependence is framework
								if ((/(vue|react|preact)$/.test(dependence))) {
									fw = dependence;
								}
								opts = u.change_jsx(fw, opts);
								return u.getDependence(all[0], dependence);
							});
							// replace extensions						
							file.data = file.data.toString().replace(u.import_REGEX, function (...all) {
								return all[0].replace(`${all[3]}${all[5]}.${all[6]}`, `${all[3]}${all[5]}.js`);
							});						

							file.data = `${u.add_h(fw)}
						${file.data}`;
							// add styles
							file.data = yield u.replaceAsync(file.data.toString(), u.css_REGEX, file);
						}

						// start
						yield start();
						let text = file.data.toString()
						if (u.imgs.includes(ext)) {
							let path = file.dir.replace("/", "\\");
							let image = p.resolve(process.cwd(), `${path}\\${file.base}`);
							text = fs.readFileSync(image, {
								encoding: 'base64'
							});
						}
						const result = yield service.transform(text, opts);
						stop();
						if (ext === "json") {
							result.js = result.js.replace('module.exports =', 'export default');
						}
						if (u.imgs.includes(ext)) {
							result.js = result.js.replace('module.exports = "', `export default "data:image/${ext};base64,`);
							file.base = file.base.replace(ext, 'js');
						}
						file.data = new Buffer(result.js);
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