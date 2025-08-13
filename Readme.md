# JS Logger

This Logger is to standardise output from logs across JS based services in Insight

## How to add

`npm install insight-software-dev/logger-js.git --save`

## How to use

### Call initialisation step once and set wether the logs need to be sent to S3
`require('logger').createLogger(false);`

### How to print logs
`console.log(); console.warn()` etc...


