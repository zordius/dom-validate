# dom-validate
A tool to check required/refused DOM nodes 

## Usage

```shell
npm install dom-validate
# Check for Google page, there should be an .lsb element
node-validate -u 'https://google.com/' -r '.lsb'

# Check for Yahoo page, there should not be any empty link
node-validate -u 'https://us.yahoo.com/' -n 'a[href=""]'
```

## Command line options
* **-u** specify a url string to verify
* **-r** specify the css selector for the required element
* **-n** specify the css selector for the refused element
* **-v** show verbose message for the success cases
* **-v=2** show verbose message for the html of css selector selected elements
* **-c** [BATCH] specify a local yaml config file to do batch check
* **-b** [BATCH] specify base URL

## BATCH check example

Try this command: `node-validate -c sample.yaml -b https://tw.search.yahoo.com -v`

The content of <a href="sample.yaml">sample.yaml</a> can be:
```yaml
# do one check for one URL
http://google.com:
  require: .lsb

# do 2 required element checks for the URL
http://us.yahoo.com:
  require:
    - body > div
    - form

# do many required and refused element check for the URL
/search?p=test:
  require:
    - body > div
    - form button
  refuse:
    - 'a[href=""]'
```

Sample output:
```
# check for http://google.com
OK: required element ".lsb" found(2)
# check for http://us.yahoo.com
OK: required element "body > div" found(2)
OK: required element "form" found(1)
# check for https://tw.search.yahoo.com/search?p=test
OK: required element "body > div" found(1)
OK: required element "form button" found(2)
OK: refused element "a[href=""]" not found
```


## node module usage

```javascript
var DV = require('dom-validate');

// validate by a HTML string
DV.validateHTML(htmlString, options);

// validate by an URL
DV.validateURL(urlString, options);

// validate by a yaml config file
DV.validateByYaml(yamlFileName, options);
```

**Options**
```javascript
var options = {
    url: 'http://sample.com',                  // URL for error or debug message
    baseURL: 'https://test.com',               // Will be used for relative URL when call .validateByYaml()
    require: 'body',                           // String or Array of CSS selector to check
    refuse: ['a[href=""]', 'img[src=""]'],     // String or Array of CSS selector to check
    exit: false,                               // true to end process when test done, the exit code will be number of failed case
    verbose: false,                            // true to show message for success cases
                                               // 2 to show the html of css selector selected elements
    callback: function (err, options) {        // Will be executed for every cases
        if (err) {
            // err will be the error message string when the case failed
            console.log('ERROR!' + err);
            return;
        } else {
            // success case
            connsole.log('OK!');
        }
        // You can get the whole options object in callback function, plus:
        // options.selector will be the CSS selector of current case
        // options.nodes will be the selected nodes (check cheerio document)
        // options.task will be 'require' or 'refuse'
    }
};
