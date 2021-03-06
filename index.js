var cheerio = require('cheerio');
var request = require('request');

var util = {
    error: function (msg, err, exit) {
        console.error('!!ERROR: ' + msg);
        err && console.error(err);
        util.exit({exit: exit}, 1);
    },
    exit_all: function (options) {
        if (options.tests && (options.tests.suites === options.tests.current)) {
            util.exit(options, options.tests.error);
        }
    },
    debug: function (msg, lvl, options) {
        if (options.report) {
            return;
        }
        if (options.verbose >= lvl) {
            console.log(msg);
        }
    },
    exit: function (options, code) {
        if (options && options.exit) {
            process.exit(code);
        }
    },
    check: function (dom, sel, req, options) {
        var N = dom(sel);
        var error = (N.length > 0) ^ req;
        var msg = (req ? 'required' : 'refused') + ' element "' + sel + '"' + (N.length ? '' : ' not') + ' found' + (N.length ? '(' + N.length + ')' : '');

        util.tap_reporter(msg, !error, options);

        if (error) {
            options.verbose && util.error(msg);
            util.callback(sel, N, req, options, msg);
        } else {
            util.debug('OK: ' + msg, 2, options);
            util.callback(sel, N, req, options);
        }

        if (N.length) {
            util.debug(sel + ':' + N.html(), 3, options);
        }

        return error ? 1 : 0;
    },
    checks: function (dom, key, req, options) {
        var error = 0;

        if (!options[key]) {
            return 0;
        }

        if (options[key].forEach && options[key].forEach.call) {
            options[key].forEach(function (sel) {
                error += util.check(dom, sel, req, options);
            });
            return error;
        }

        return util.check(dom, options[key], req, options);
    },
    report: function (msg, options) {
        if (options.report) {
            console.log(msg);
        }
    },
    tap_reporter: function (msg, success, options) {
        if (!options.tests) {
            return;
        }

        if (!msg) {
            if (options.tests.suites === options.tests.current) {
                util.report('1..' + options.tests.cases, options);
            }
            return;
        }

        options.tests.cases++;

        util.report((success ? '' : 'not ') + 'ok ' + options.tests.cases + ' - ' + msg + ' in ' + options.url, options);
    },
    callback: function (sel, node, req, options, msg) {
        if (options.callback && options.callback.call) {
            options.callback.call(msg, Object.assign({
                selector: sel,
                nodes: node,
                task: req ? 'require' : 'refuse'
            }, options));
        }
    }
};

var domValidate = {
    receiveRequest: function (config, callback) {
        request(config, function (err, res, body) {
            callback(err, body);
        });
    },
    receiveURL: function (url, callback) {
        domValidate.receiveRequest({
            url: url,
            gzip: true
        }, callback);
    },
    validateURL: function (url, options) {
        var U = options ? options.baseURL : '';
        var C = {};

        if (url.match(/^https?:/)) {
            U = '';
        }

        C.url = (U || '') + url;

        domValidate.receiveURL(C.url, function (err, html) {
            C.tests = options.tests;
            if (err && options.verbose) {
                util.error('when get url ' + U, err);
            } else {
                domValidate.validateHTML(html, Object.assign(C, options));
            }
        });
    },
    validateHTML: function (html, options) {
        var DOM = cheerio.load(html);
        var error = 0;

        if (!options) {
            error++;
            return util.error('call .validateHTML() without options', undefined, true);
        }

        util.debug('# check for ' + options.url, 2, options);
        error += util.checks(DOM, 'require', true, options);
        error += util.checks(DOM, 'refuse', false, options);

        if (options.tests) {
            options.tests.current++;
            options.tests.error += error;
        }

        util.tap_reporter(undefined, false, options);

        if (error && ((!options.tests) || (options.tests.suites === options.tests.current))) {
            util.exit(options, error);
        }

        util.exit_all(options);

        return error;
    },
    validateByYaml: function (file, options) {
        var yaml = require('js-yaml').safeLoad(require('fs').readFileSync(file, 'utf8'));
        options.tests = {
            suites: 0,
            cases: 0,
            current: 0,
            error: 0
        };
        Object.keys(yaml).forEach(function (key) {
            options.tests.suites++;
            domValidate.validateURL(key, Object.assign(yaml[key], options));
        });
    }
};

module.exports = domValidate;
