'use strict';
var NAME = "esbuild";
var t = require("esbuild");
const {
	extname
} = require("path");
const {
	getDependence,
	add_h,
	change_jsx,
	add_styles,
	css_REGEX,
	styles_REGEX,
	fw_REGEX,
	import_REGEX
} = require("./utils");
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
async function startService() {
	if (!service) {
		service = await t.startService();
	}
};
const stopService = () => {
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
					var ext = extname(file.base).replace('.', '');
					if (['js', 'jsx', 'ts', 'tsx', 'json'].includes(ext)) {
						// change extension -> .js
						file.base = file.base.replace(ext, 'js');
						// add loader
						opts["loader"] = ext;
						// framework / dependences
						file.data = file.data.toString().replace(fw_REGEX, function (...all) {
							dependence = all[3];
							// dependence is framework
							if ((/(vue|react|preact)$/.test(dependence))) {
								fw = dependence;
							}
							opts = change_jsx(fw, opts);
							return getDependence(all[0], dependence);
						});
						// remove styles
						file.data = file.data.toString().replace(styles_REGEX, function (...all) {
							return '';
						});
						// replace extensions						
						file.data = file.data.toString().replace(import_REGEX, function (...all) {
							if (all[4]) {
								return all[0].replace(`${all[3]}${all[4]}`, `${all[3]}.js`);
							} else return all[0].replace(all[3], `${all[3]}.js`);
						});
						// add h (js, jsx, ts, tsx)
						if (ext !== "json") {
							file.data = `${add_h(fw)}
						${file.data}`;
						}
						// add css
						file.data = file.data.toString().replace(css_REGEX, function (...all) {
							return add_styles(all[2], file, all[3]);
						});
						// start
						startService();
						const result = t.transformSync(file.data.toString(), opts);
						stopService();
						if (ext === "json") {
							result.js = result.js.replace("module.exports =", "export default");
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