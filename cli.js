#!/usr/local/bin/node
var argv = require('yargs').argv;
var DV = require('.');

if (argv.u && (argv.r || argv.n)) {
    DV.validateURL(argv.u, {
        require: argv.r ? [argv.r] : undefined,
        refuse: argv.n ? [argv.n] : undefined,
        verbose: argv.v
    });
}
