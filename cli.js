#!/usr/bin/env node
var argv = require('yargs').argv;
var DV = require('.');

var usage = function () {
    console.log('USAGE: ' + argv['$0'] + ' options...');
    console.log('');
    console.log('options:');
    console.log('* -u specify a url string to verify');
    console.log('* -r specify the css selector for the required element');
    console.log('* -n specify the css selector for the refused element');
    console.log('* -v show verbose message for the error cases');
    console.log('* -v=1 show verbose message for the successed cases');
    console.log('* -v=2 show verbose message for the html of css selector selected elements');
    console.log('* -c [BATCH] specify a local yaml config file to do batch check');
    console.log('* -b [BATCH] specify base URL');
    console.log('* -t [TEST REPORT] output result as TAP format');
    process.exit();
};

var error = function (E) {
    console.error('!!ERROR: ' + E);
    process.exit(1);
};

if (argv.h || !argv.c || !argv.u) {
    usage();
}

if (argv.u && (argv.r || argv.n)) {
    DV.validateURL(argv.u, {
        require: argv.r ? [argv.r] : undefined,
        refuse: argv.n ? [argv.n] : undefined,
        verbose: argv.v,
        report: argv.t,
        exit: true
    });
}

if (argv.b && !argv.c) {
    error('-b should be used with the -c option');
}

if (argv.t && !argv.c) {
    error('-t should be used with the -c option');
}

if (argv.c) {
    DV.validateByYaml(argv.c, {
        baseURL: argv.b,
        verbose: argv.v,
        report: argv.t,
        exit: true
    });
}
