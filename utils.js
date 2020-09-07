// imports
const {
    resolve
} = require("path");
const fs = require("fs");
// Frameworks
var fw = {};
fw["vue"] = 'https://unpkg.com/vue@next/dist/vue.runtime.esm-browser.js';
fw["react"] = 'https://unpkg.com/es-react?module';
fw["preact"] = 'https://unpkg.com/preact?module';
// REGEX
const fw_REGEX = /[stn]*import[^stn]*(\w+|[{].*?[}])[\s\S]*?from[^stn]*(['"](\w+)['"])/igm;
const import_REGEX = /[stn]*import[^stn]*(\w+|[{](.*?)[}])[^stn]*from[^stn]*['"][.\/|(..\/)*](.*?)(.ts|.tsx|.jsx|.json)?['"]/igm;
const css_REGEX = /[stn]*import[^stn]*(['"](.[\/]|..[\/])((.*?).css)['"])/igm;
const styles_REGEX = /[stn]*import[^stn]*(['"](.[\/]|..[\/])((.*?)(.scss|.styl|.less))['"])/igm;
// Add h
const add_h = (fww) => {
    return (fww === "vue" || fww === "preact") ? `import { h } from "${fw[fww]}"` : '';
}

// add dependence
const getDependence = (line, dependence) => {
    if ((/(vue|react|preact)$/.test(dependence))) {
        return line.replace(dependence, fw[dependence]);
    } else {
        return line.replace(dependence, `https://unpkg.com/${dependence}`);
    }
}

// change jsx
const change_jsx = (fww, opts) => {
    return (fww === "vue" || fww === "preact") ? {
        ...opts,
        jsxFactory: "h",
        jsxFragmentFactory: "Fragment"
    } : opts;
}

// add css
const add_styles = (path, file, file_css) => {
    let test = path.replace("/", "\\");
    let css = resolve(process.cwd(), `${test}${file.dir}\\${file_css}`);
    let content_css = fs.readFileSync(css).toString().replace(/(\r\n|\n|\r)/g, "");;
    // test
    return `let style = document.createElement('style');\
    style.type = 'text/css';\
    style.appendChild(document.createTextNode('${content_css.trim()}'));\
    document.head.appendChild(style)`;
}

module.exports.getDependence = getDependence;
module.exports.add_h = add_h;
module.exports.change_jsx = change_jsx;
module.exports.add_styles = add_styles;
module.exports.fw_REGEX = fw_REGEX;
module.exports.import_REGEX = import_REGEX;
module.exports.css_REGEX = css_REGEX;
module.exports.styles_REGEX = styles_REGEX;