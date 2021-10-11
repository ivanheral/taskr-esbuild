// imports
const p = require("path");
// styles
const st = require("./styles.js");
// Frameworks
var fw = {};
fw["vue"] = 'https://unpkg.com/vue@next/dist/vue.runtime.esm-browser.js';
fw["react"] = 'https://unpkg.com/es-react?module';
fw["preact"] = 'https://unpkg.com/preact?module';
// REGEX
const fw_REGEX = /import\s+(.|\n)*\s+from\s+(['"][^.](.*?)['"])/igm;
const import_REGEX = /import\s+(.|\n)*\s+from\s+['"](\.{1,1}\/|(\.{2,2}\/)*)(\S+)(.ts|.tsx|.jsx|.json|.jpg|.png|.gif|.webp|.svg|.bmp|.vue)['"]/igm;
const css_REGEX = /import\s+(['"](\.{1,1}\/|(\.{2,2}\/)*)(\S+[.](css|scss|less|styl))['"])/igm;
const mod_REGEX = /import\s+(\w+)[^stn]*from\s+['"](\.{1,1}\/|(\.{2,2}\/)*)(\S+[.](module.css))['"]/igm;
// INCLUDES
const files = ['js', 'jsx', 'ts', 'tsx', 'json', 'jpg', 'png', 'gif', 'webp', 'svg', 'bmp', 'vue'];
const imgs = ['jpg', 'png', 'gif', 'webp', 'svg', 'bmp'];
// Add h
const add_h = (fww, ext) => {
    return ((fww === "vue" || fww === "preact") && ext !== 'vue') ? `import { h } from "${fw[fww]}"` : '';
}

// add dependence
const getDependence = (line, dependence, opts) => {
    // remove '"
    dependence = dependence.replace(/['"]+/g, '');
    if (opts && opts[dependence]) {
        return line.replace(dependence, opts[dependence]);
    } else if ((/(vue|react|preact)$/.test(dependence))) {
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
const add_styles = async (mod, path, file, file_css, ext) => {
    let name = Math.random().toString(36).replace('0.', '');
    let css = file ? get_file(path, file, file_css) : file_css;
    let content_css = await st.get_styles(css, ext);
    if (typeof content_css === "string") {
        return `let css_${name} = document.createElement('style');\
    css_${name}.appendChild(document.createTextNode('${content_css.trim()}'));\
    document.head.appendChild(css_${name})`;
    } else {
        return `let css_${name} = document.createElement('style');\
        css_${name}.appendChild(document.createTextNode('${content_css.css.trim()}'));\
        document.head.appendChild(css_${name});\
        var ${mod} = ${JSON.stringify(content_css.json)}`;
    }
}

// get file
const get_file = (path, file, file_) => {
    let path_rel = path.replace(/\//g, "\\");
    let path_folder = file.dir.replace(/\//g, "\\");
    return p.resolve(`${process.cwd()}\\${path_folder}`, `${path_rel}\\${file_}`);
}

// replace async
async function replaceAsync(str, regex, file) {
    const promises = [];
    str.replace(regex, (...all) => {
        const promise = add_styles(all[1], all[2], file, all[4], all[5]);
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
module.exports.mod_REGEX = mod_REGEX;
module.exports.replaceAsync = replaceAsync;
module.exports.get_file = get_file;
module.exports.files = files;
module.exports.imgs = imgs;