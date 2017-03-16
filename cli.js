#!/usr/local/bin/node
var argv = require('yargs').argv;
var DV = require('.');

var usage = function () {
    console.log('USAGE: ' + argv['$0'] + ' options...');
    console.log('');
    console.log('options:');
    console.log('* -u specify a url string to verify');
    console.log('* -r specify the css selector for the required element');
    console.log('* -n specify the css selector for the refused element');
    console.log('* -v show verbose message for the css selector selected elements');
    console.log('* -c [BATCH] specify a local yaml config file to do batch check');
    console.log('* -b [BATCH] specify base URL');
    process.exit();
}

if (argv.h) {
    usage();
}

if (argv.u && (argv.r || argv.n)) {
    DV.validateURL(argv.u, {
        require: argv.r ? [argv.r] : undefined,
        refuse: argv.n ? [argv.n] : undefined,
        verbose: argv.v,
        exit: true
    });
}

if (argv.b && !argv.c) {
    DV.error('-b should be used with the -c option');
}

if (argv.c) {
    DV.validateByYaml(argv.c, {
        base: argv.b,
        verbose: argv.v,
        exit: true
    });
}
