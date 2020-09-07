const join = require("path").join;
const Taskr = require("taskr");
const test = require("tape");

const dir = join(__dirname, 'fixtures');
const tmp = join(__dirname, 'tmp');

test('taskr-esbuild', (t) => {
  t.plan(3);

  const taskr = new Taskr({
    plugins: [
      require('../'),
      require('@taskr/clear')
    ],
    tasks: {
      * foo(f) {
        t.ok('esbuild' in taskr.plugins, 'attach the `esbuild()` plugin to taskr');
        yield f.source(`${dir}/foo.tsx`).esbuild().target(tmp);
        const sent = yield f.$.read(`${tmp}/foo.tsx`, 'utf8');
        t.ok(sent, 'creates a `.js` file');
        t.equal(sent, 'import {h, render, Component} from "preact";\nclass App extends Component {\n  render() {\n    return /* @__PURE__ */ h("h1", null, "Hello, world!");\n  }\n}\nrender(/* @__PURE__ */ h(App, null), document.getElementById("app"));\n', 'compile the `.js` contents correctly');
        yield f.clear(tmp);
      }
    }
  });

  taskr.serial(['foo']);
});