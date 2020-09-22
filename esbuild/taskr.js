const clor = require('clor');
const tinydate = require('tinydate');
function stamp() {
    let i = 0;
    const args = new Array(arguments.length);
    for (; i < args.length; ++i) {
        args[i] = arguments[i];
    }

    let stamp = tinydate('[{HH}:{mm}:{ss}]');
    let Dates = new Date();
    process.stdout.write(clor['magenta'](stamp(Dates)) + ' ');
    console[this.method].apply(console, (this.custom ? [this.custom].concat(args) : args));
}

function log() {
    stamp.apply({
        method: 'log',
        color: 'magenta'
    }, arguments);
    return this;
}

module.exports.log = log;