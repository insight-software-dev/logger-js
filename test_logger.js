// Test basic logger functionality
const logger = require('./logger')(null, null, { logLevel: 'debug' });

console.log("info log");
console.error("error log");
console.error(new Error("error object"));
console.error("text with", new Error("error object2"));
console.debug("debug log - should show with logLevel: debug");
console.log({ key: "value", nested: { a: 1 } });

// Test direct logger usage
logger.info("direct logger info");
logger.debug("direct logger debug");
logger.verbose("direct logger verbose - won't show unless logLevel is verbose or lower");
