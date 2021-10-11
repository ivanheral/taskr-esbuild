const fs = require("fs");
// clor
var clor = require('clor');
// taskr
const {
    log
} = require('./taskr.js');

const get_styles = async (file, ext) => {
    if (/module.css/.test(file)) {
        ext = "cssmod";
    }
    let content = file.content ? file.content.replace(/(\r\n|\n|\r)/g, "") : fs.readFileSync(file).toString().replace(/(\r\n|\n|\r)/g, "");
    switch (ext) {
        case "cssmod":
            var x = await load_cssmod(file, content, {});
            return x;
        case "css":
            return content;
        case "scss":
            var x = await load_sass(file, content, {});
            return x;
        case "less":
            var x = await load_less(file, content, {});
            return x;
        case "stylus":
        case "styl":
            var x = await load_stylus(file, content, {});
            return x;
        default:
            return "";
            break;
    }
}


// css modules
const load_cssmod = async (_file, content, opts) => {
    try {
        // postcss
        var postcss = require('postcss');
        let json;
        var result = await postcss([
            require("postcss-modules")({
                getJSON: function (_css, result_json, _out) {
                    json = result_json;
                }
            })
        ]).process(content, {
            from: undefined,
            to: undefined
        });

        return {
            css: result.css,
            json: json
        };
    } catch (e) {
        log(`${clor.red.bold(e.message)}`);
        return "";
    }
}

function load_sass(_file, content, opts) {
    try {
        // sass
        var sass = require('node-sass');
        // generate opts
        let conf = opts.sass || {};
        conf = {
            ...conf,
            data: content
        }
        return sass.renderSync(conf).css.toString().replace(/(\r\n|\n|\r)/g, "");

    } catch (e) {
        log(`${clor.red.bold(e.message)}`);
        return "";
    }

}
// less
function load_less(file, content, opts) {
    try {
        // less
        var less = require('less');
        // generate opts
        let conf = opts.less || {};
        conf = {
            ...conf,
            filename: typeof file === "object" ? null : file
        }
        return new Promise(function (resolve, reject) {
            less.render(content, conf, function (err, data) {
                if (err !== null) return reject(err);
                resolve(data.css.toString().replace(/(\r\n|\n|\r)/g, ""));
            })
        });
    } catch (e) {
        log(`${clor.red.bold(e.message)}`);
        return "";
    }
}

// stylus
function load_stylus(file, content, opts) {
    try {
        // stylus
        var stylus = require('stylus');
        // generate opts
        let conf = opts.stylus || {};
        conf = {
            ...conf,
            filename: typeof file === "object" ? null : file
        }
        return new Promise(function (resolve, reject) {
            stylus.render(content, conf, function (err, css) {
                if (err !== null) return reject(err);
                resolve(css.toString().replace(/(\r\n|\n|\r)/g, ""));
            })
        });
    } catch (e) {
        log(`${clor.red.bold(e.message)}`);
        return "";
    }
}

module.exports.get_styles = get_styles;