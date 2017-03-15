var cheerio = require('cheerio');
var request = require('request');

var domValidate = {
    error: function (msg, err) {
        console.error(msg);
        err && console.error(err);
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
        domValidate.receiveURL(url, function (err, html) {
            if (err) {
                domValidate.error('!ERROR: when get url ' + url, err);
            } else {
                domValidate.validateHTML(html, options);
            }
        });
    },
    validateHTML: function (html, options) {
        var DOM = cheerio.load(html);

        if (!options) {
            return domValidate.error('!ERROR: call .validateHTML() without options');
        }

        if (options.require && options.require.forEach && options.require.forEach.call) {
            options.require.forEach(function (sel) {
                var N = DOM(sel);
                if (N.length == 0) {
                    domValidate.error('!ERROR: required element ' + sel + ' not found.');
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
                    domValidate.error('!ERROR: refused element ' + sel + ' found (' + N.length + ').');
                    if (options.verbose) {
                        console.log(sel + ':' + N.html());
                    }
                }
            });
        }
    }
};

module.exports = domValidate;
