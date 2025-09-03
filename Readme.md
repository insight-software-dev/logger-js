# JS Logger

This Logger is to standardise output from logs across JS based services in Insight

## How to add

`npm install insight-software-dev/logger-js.git#chosen_version --save`

## How to use

### Call initialisation step once and set wether the logs need to be sent to S3
`require('logger')(<optional express app instance>, <optional S3 URL path>);`

### How to print logs
`console.log(); console.warn()` etc...

## How to contribute
### make changes
### test
`node test_logger.js`
### create a new tag and push tags
`git tag x.x.x`
`git push --tags`


