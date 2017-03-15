# dom-validate
A tool to check required/refused DOM nodes 

## Usage

```shell
npm install dom-validate
# Check for Yahoo page, there should be an .lsb element
node-validate -u 'https://google.com/' -r '.lsb'
# Check for Yahoo page, there should not be any empty link
node-validate -u 'https://us.yahoo.com/' -n 'a[href=""]'
