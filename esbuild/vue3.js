var path = require('path');

const defaultOptions = {
    include: /\.vue$/,
    exclude: [],
    target: 'browser',
    exposeFilename: false,
    customBlocks: [],
}

const vue3 = async (content, filePath, opts) => {

    try {
        var v = require('@vue/compiler-sfc');
        const options = {
            ...defaultOptions,
            ...opts,
        }

        const isServer = options.target === 'node'
        const isProduction =
            process.env.NODE_ENV === 'production' || process.env.BUILD === 'production'
        const rootContext = process.cwd()
        const id = Math.random()
            .toString(36)
            .replace('0.', '');
        // descriptor
        const {
            descriptor,
            _errors
        } = await v.parse(content, {
            sourceMap: true,
            filename: id,
            sourceRoot: rootContext,
            pad: 'line',
        });
        // save styles
        const style_saved = [];
        if (descriptor.styles) {
            descriptor.styles.map((styl) => {
                style_saved.push({
                    content: styl.content,
                    lang: styl.attrs.lang ? styl.attrs.lang : 'css',
                    scoped: styl.scoped,
                    id_scoped: id
                })
            })
        }

        const hasScoped = descriptor.styles.some((s) => s.scoped)
        const block = descriptor.template

        const result = v.compileTemplate({
            source: block.content,
            inMap: block.map,
            id: id,
            filename: _(path.basename(filePath)),
            preprocessLang: block.lang,
            compiler: options.compiler,
            ssr: isServer,
            compilerOptions: {
                ...options.compilerOptions,
                scopeId: hasScoped ? `data-v-${id}` : undefined,
            },
            transformAssetUrls: options.transformAssetUrls || true,
        })
        const result_script = descriptor.script.content;
        const result_template = result.code;
        var new_script = result_script;
        var script_final = mergeParts(id, new_script, result_template, isServer, rootContext, filePath, isProduction, hasScoped);
        return {
            code: `${script_final}\nexport default _default;`.replace('export default {', 'var _default = {'),
            lang: descriptor.script.lang ? descriptor.script.lang : 'js',
            styles: style_saved
        };
    } catch (error) {
    }
};

function mergeParts(id, script, template, isServer, rootContext, filePath, isProduction, hasScoped) {
    const output = [
        script,
        template,
        isServer ? `_default.ssrRender = ssrRender` : `_default.render = render`,
    ]
    if (hasScoped) {
        output.push(`_default.__scopeId = ${_(`data-v-${id}`)}`)
    }

    const shortFilePath = path.relative(rootContext, filePath)
        .replace(/^(\.\.[\/\\])+/, '')
        .replace(/\\/g, '/')

    if (!isProduction) {
        output.push(`_default.__file = ${_(shortFilePath)};`)
    } else if (options.exposeFilename) {
        output.push(`_default.__file = ${_(basename(shortFilePath))};`)
    }
    return output.join('\n');
}

function _(any) {
    return JSON.stringify(any)
}

module.exports.vue3 = vue3;