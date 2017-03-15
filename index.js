var cheerio = require('cheerio');

var domValidate = {
    error: function (msg, err) {
        console.error(msg);
        console.error(err);
    },
    receiveRequest: function (config, callback) {
        request(config, function (err, res, body) {
            callback(err, body);
        });
    },
    receiveURL: function (url, callback) {
        domValidate.receiveRequest({url: url}, callback);
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
    }
};

module.exports = domValidate;
