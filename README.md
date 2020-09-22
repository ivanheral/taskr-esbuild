# taskr-esbuild [![npm](https://img.shields.io/npm/v/taskr-esbuild.svg)](https://npmjs.org/package/taskr-esbuild)

> [Esbuild](https://github.com/evanw/esbuild/) plugin for [Taskr](https://github.com/lukeed/taskr).

## Explanation

- **🐣 The smallest toolchain for web development**: Only 7 MB (node_modules folder).
- **👏 Library Support**: Vue 3, React and Preact (.vue file not supported).
- **🎨 Import Styles**: supports basic (css/less/sass/stylus) imports inside of JavaScript files.
- **🖼️ Import Images & JSON**: supports basic (jpg/png/gif/webp/svg/bmp) imports inside of JavaScript files.

## Install

```
$ npm install --save-dev taskr-esbuild
```

## Usage

Check out the [documentation](https://github.com/evanw/esbuild) to see the available options.

```js
exports.esbuild = function * (task) {
  yield task.source('src/**/*.js').esbuild().target('dist/js')
}
```

## Examples

[Word Counter "stupid" with React](https://github.com/ivanheral/count_word_stupid)

[Counter with Vue 3](https://github.com/ivanheral/counter_vue3_esbuild)

## Support

Any issues or questions can be sent to the [Taskr monorepo](https://github.com/lukeed/taskr/issues/new).

Please be sure to specify that you are using `taskr-esbuild`.