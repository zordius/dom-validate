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

        if (error) {
            util.error((N.length ? 'refused' : 'required') + ' element "' + sel + (N.length ? '' : ' not') + '" found.');
            util.exit(options);
        }

        if (N.length && options.verbose) {
            console.log(sel + ':' + N.html());
        }

        return error ? 1 : 0;
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

        if (options.require && options.require.forEach && options.require.forEach.call) {
            options.require.forEach(function (sel) {
                error += util.check(DOM, sel, true, options);
            });
        }

        if (options.refuse && options.refuse.forEach && options.refuse.forEach.call) {
            options.refuse.forEach(function (sel) {
                error += util.check(DOM, sel, false, options);
            });
        }

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
