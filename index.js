var cheerio = require('cheerio');
var request = require('request');

var domValidate = {
    error: function (msg, err, exit) {
        console.error('!!ERROR: ' + msg);
        err && console.error(err);
        domValidate.exit(exit, 1);
    },
    exit: function (options, code) {
        if (options && options.exit) {
            process.exit(code);
        }
    },
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

        domValidate.receiveURL((U || '') + url, function (err, html) {
            if (err) {
                domValidate.error('when get url ' + url, err);
            } else {
                domValidate.validateHTML(html, Object.assign({url: url}, options));
            }
        });
    },
    validateHTML: function (html, options) {
        var DOM = cheerio.load(html);
        var error = 0;

        if (!options) {
            error++;
            return domValidate.error('call .validateHTML() without options', undefined, true);
        }

        if (options.require && options.require.forEach && options.require.forEach.call) {
            options.require.forEach(function (sel) {
                var N = DOM(sel);
                if (N.length == 0) {
                    error++;
                    domValidate.error('required element ' + sel + ' not found.');
                    domValidate.exit(options);
                } else {
                    if (options.verbose) {
                        console.log(sel + ':' + N.html());
                    }
                }
            });
        }

        if (options.refuse && options.refuse.forEach && options.refuse.forEach.call) {
            options.refuse.forEach(function (sel) {
                var N = DOM(sel);
                if (N.length > 0) {
                    error++;
                    domValidate.error('refused element ' + sel + ' found (' + N.length + ').');
                    if (options.verbose) {
                        console.log(sel + ':' + N.html());
                    }
                }
            });
        }

        if (error) {
            domValidate.exit(error);
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
