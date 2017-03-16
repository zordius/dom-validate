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
* -u specify a url string to verify
* -r specify the css selector for the required element
* -n specify the css selector for the refused element
* -v show verbose message for the css selector selected elements
* -c [BATCH] specify a local yaml config file to do batch check
* -b [BATCH] specify base URL

## BATCH check example

Try this command: `node-validate -c test.yaml -b https://tw.search.yahoo.com`

The content of test.yaml is:
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
