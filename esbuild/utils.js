// imports
const {
    resolve
} = require("path");
// styles
const st = require("./styles.js");
// Frameworks
var fw = {};
fw["vue"] = 'https://unpkg.com/vue@next/dist/vue.runtime.esm-browser.js';
fw["react"] = 'https://unpkg.com/es-react?module';
fw["preact"] = 'https://unpkg.com/preact?module';
// REGEX
const fw_REGEX = /[stn]*import[^stn]*(\w+|[{].*?[}])[\s\S]*?from[^stn]*(['"](\w+)['"])/igm;
const import_REGEX = /[stn]*import[^stn]*(\w+|[{](.*?)[}])[^stn]*from[^stn]*['"](\.{1,1}\/|(\.{2,2}\/)*)(\S+)[.](ts|tsx|jsx|json|jpg|png|gif|webp|svg|bmp)['"]/igm;
const css_REGEX = /[stn]*import[^stn]*(['"](.[\/]|..[\/])((.*?).(css|scss|less|styl))['"])/igm;
// INCLUDES
const files = ['js', 'jsx', 'ts', 'tsx', 'json', 'jpg', 'png', 'gif', 'webp', 'svg', 'bmp'];
const imgs = ['jpg', 'png', 'gif', 'webp', 'svg', 'bmp'];
// Add h
const add_h = (fww) => {
    return (fww === "vue" || fww === "preact") ? `import { h } from "${fw[fww]}"` : '';
}

// add dependence
const getDependence = (line, dependence) => {
    if ((/(vue|react|preact)$/.test(dependence))) {
        return line.replace(dependence, fw[dependence]);
    } else {
        return line.replace(dependence, `https://unpkg.com/${dependence}?module`);
    }
}

// change jsx
const change_jsx = (fww, opts) => {
    return (fww === "vue" || fww === "preact") ? {
        ...opts,
        jsxFactory: "h"        
    } : opts;
}

// add css
const add_styles = async (path, file, file_css, ext) => {
    let name = file_css.replace(/[^a-zA-Z]+/g, '');
    let css = get_file(path, file, file_css);
    let content_css = await st.get_styles(css, ext);
    // test
    return `let style${name} = document.createElement('style');\
    style${name}.type = 'text/css';\
    style${name}.appendChild(document.createTextNode('${content_css.trim()}'));\
    document.head.appendChild(style${name})`;
}

// get file
const get_file = (path, file, file_) => {
    let test = path.replace("/", "\\");
    return resolve(process.cwd(), `${test}${file.dir}\\${file_}`);
}


// replace async
async function replaceAsync(str, regex, file) {
    const promises = [];
    str.replace(regex, (...all) => {
        const promise = add_styles(all[2], file, all[3], all[5]);
        promises.push(promise);
    });
    return Promise.all(promises).then(data => {
        if (data[0] !== "undefined") {
            return str.replace(regex, () => {
                return data.shift()
            });
        } else return " ";
    });
}

module.exports.getDependence = getDependence;
module.exports.add_h = add_h;
module.exports.change_jsx = change_jsx;
module.exports.add_styles = add_styles;
module.exports.fw_REGEX = fw_REGEX;
module.exports.import_REGEX = import_REGEX;
module.exports.css_REGEX = css_REGEX;
module.exports.replaceAsync = replaceAsync;
module.exports.get_file = get_file;
module.exports.files = files;
module.exports.imgs = imgs;