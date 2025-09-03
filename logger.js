
const winston = require('winston');
var split = require('split')
const S3Transport = require('winston-s3-transport');
const { v4: uuidv4 } = require('uuid');
const { format } = require('date-fns');
const { combine, timestamp, errors } = winston.format;


let logger = null;

const wrapper = ( original ) => {
    return (...args) => {
        args.forEach((arg, index) => {
            if (arg instanceof Error) {
                args[index] = ('' + arg) + arg.stack;
            } else if (typeof arg === 'object') {
                args[index] = JSON.stringify(arg);
            }
        });
        original(args.join(" "));
    };
};

function createLogger(expressApp = null, s3OutputPath = null) {
    /**
     * Creates a logger instance with optional S3 output.
     * @param {Object} s3OutputPath - Optional S3 output configuration.
     * @param {string} s3OutputPath.bucketName - The name of the S3 bucket.
     * @param {string} s3OutputPath.path - The path in the S3 bucket where logs will be stored.
     * @returns {Object} The logger instance. Optional, because console.log, console.info, console.warn, 
     *              console.error, console.debug are also available.
     */

    let transports = [new (winston.transports.Console)({'timestamp':true})];
    if (s3OutputPath) {
        const bucketName = s3OutputPath.bucketName;
        const s3Path = s3OutputPath.path;
        const s3Transport = new S3Transport({
            s3TransportConfig: {
                bucket: bucketName,
                bucketPath: () => {
                    const date = new Date();
                    const timestamp = format(date, "yyyyMMddhhmmss");
                    const uuid = uuidv4();
                    // The bucket path in which the log is uploaded.
                    // You can create a bucket path by combining `group`, `timestamp`, and `uuid` values.
                    return `/${s3Path}/logs/${timestamp}/${uuid}.log`;
                },
            },
        });
        transports.push(s3Transport);
    }
    logger = winston.createLogger({
        level: 'info',
        format: combine(
            timestamp(),
            errors({ stack: true }),
            winston.format.colorize(),
            winston.format.printf((info) => {
                return `${info.timestamp} ${info.level} ${info.message}`;
            })
        ),
        transports: transports,
    });
    logger.error = wrapper(logger.error);
    logger.warn = wrapper(logger.warn);
    logger.info = wrapper(logger.info);
    logger.verbose = wrapper(logger.verbose);
    logger.debug = wrapper(logger.debug);
    logger.silly = wrapper(logger.silly);
    console.log = (...args) => logger.info.call(logger, ...args);
    console.info = (...args) => logger.info.call(logger, ...args);
    console.warn = (...args) => logger.warn.call(logger, ...args);
    console.error = (...args) => logger.error.call(logger, ...args);
    console.debug = (...args) => logger.debug.call(logger, ...args);

    logger.stream = split().on('data', function(message, encoding){
        logger.info(message);
    });
    if (expressApp){
        expressApp.use(require("morgan")(
            "short", { "stream": logger.stream }
        ));
    }
    // const morgan = require('morgan')(':method :url :status :res[content-length] - :response-time ms');

    return logger;
}

module.exports = createLogger;