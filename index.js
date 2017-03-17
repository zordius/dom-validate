var cheerio = require('cheerio');
var request = require('request');

var util = {
    error: function (msg, err, exit) {
        console.error('!!ERROR: ' + msg);
        err && console.error(err);
        util.exit(exit, 1);
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

        if (error) {
            util.error(msg);
            util.callback(sel, N, req, options, msg);
            util.exit(options);
        } else {
            if (options.verbose) {
                console.log('OK: ' + msg);
            }
            util.callback(sel, N, req, options);
        }

        if (N.length && (options.verbose > 1)) {
            console.log(sel + ':' + N.html());
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

        if (url.match(/^https?:/)) {
            U = '';
        }

        U = (U || '') + url;

        domValidate.receiveURL(U, function (err, html) {
            if (err) {
                util.error('when get url ' + U, err);
            } else {
                domValidate.validateHTML(html, Object.assign({url: U}, options));
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

        if (options.url && options.verbose) {
            console.log('# check for ' + options.url);
        }

        error += util.checks(DOM, 'require', true, options);
        error += util.checks(DOM, 'refuse', false, options);

        if (error) {
            util.exit(error);
        }
    },
    validateByYaml: function (file, options) {
        var yaml = require('js-yaml').safeLoad(require('fs').readFileSync(file, 'utf8'));
        Object.keys(yaml).forEach(function (key) {
            domValidate.validateURL(key, Object.assign(yaml[key], options));
        });
    }
};

module.exports = domValidate;
