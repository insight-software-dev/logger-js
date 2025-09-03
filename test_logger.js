
const logger = require('./logger')();
console.log("info log")
console.error("error log")
console.error(new Error("error object"))
console.error("text with", new Error("error object2"))
