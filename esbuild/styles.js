const fs = require("fs");
// clor
var clor = require('clor');
// taskr
const {
    log
} = require('./taskr.js');

const get_styles = async (file, ext) => {

    let content = fs.readFileSync(file).toString().replace(/(\r\n|\n|\r)/g, "");

    switch (ext) {
        case "css":
            return content;
            break;
        case "scss":
            var x = await load_sass(file, null, {});
            return x;
            break;
        case "less":
            var x = await load_less(file, content, {});
            return x;
            break;
        case "styl":
            var x = await load_stylus(file, content, {});
            return x;
            break;
        default:
            break;
    }
}


function load_sass(file, _content, opts) {
    try {
        // sass
        var sass = require('node-sass');

        return new Promise(function (resolve, reject) {
            sass.render({
                file: file
            }, function (err, res) {
                if (err !== null) return reject(err);
                resolve(res.css.toString().replace(/(\r\n|\n|\r)/g, ""));
            });
        });

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
        return new Promise(function (resolve, reject) {
            less.render(content, {
                filename: file
            }, function (err, data) {
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
        return new Promise(function (resolve, reject) {
            stylus.render(content, {
                filename: file
            }, function (err, data) {
                if (err !== null) return reject(err);
                resolve(data.toString().replace(/(\r\n|\n|\r)/g, ""));
            })
        });
    } catch (e) {
        log(`${clor.red.bold(e.message)}`);
        return "";
    }
}

module.exports.get_styles = get_styles;