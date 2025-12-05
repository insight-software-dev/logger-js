const winston = require('winston');
const split = require('split');
const S3Transport = require('winston-s3-transport');
const { v4: uuidv4 } = require('uuid');
const { format } = require('date-fns');
const { combine, timestamp, errors } = winston.format;

const LOG_LEVELS = ['error', 'warn', 'info', 'verbose', 'debug', 'silly'];

let logger = null;

const wrapper = (original) => {
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

/**
 * Creates a logger instance with optional S3 output and configurable options.
 * @param {Object} expressApp - Optional Express app instance for Morgan HTTP logging.
 * @param {Object} s3OutputPath - Optional S3 output configuration.
 * @param {string} s3OutputPath.bucketName - The name of the S3 bucket.
 * @param {string} s3OutputPath.path - The path in the S3 bucket where logs will be stored.
 * @param {Object} options - Optional configuration options.
 * @param {string} options.logLevel - Log level: 'error', 'warn', 'info', 'verbose', 'debug', 'silly'. Defaults to LOG_LEVEL env var or 'info'.
 * @param {boolean} options.overrideConsole - Whether to override console.* methods. Defaults to true.
 * @returns {Object} The logger instance with error, warn, info, verbose, debug, silly methods.
 */
function createLogger(expressApp = null, s3OutputPath = null, options = {}) {
    const logLevel = options.logLevel || process.env.LOG_LEVEL || 'info';
    const overrideConsole = options.overrideConsole !== false;

    // Validate log level
    if (!LOG_LEVELS.includes(logLevel)) {
        console.warn(`Invalid log level "${logLevel}", defaulting to "info". Valid levels: ${LOG_LEVELS.join(', ')}`);
    }

    let transports = [new (winston.transports.Console)({'timestamp': true})];

    if (s3OutputPath) {
        const bucketName = s3OutputPath.bucketName;
        const s3Path = s3OutputPath.path;
        const s3Transport = new S3Transport({
            s3TransportConfig: {
                bucket: bucketName,
                bucketPath: () => {
                    const date = new Date();
                    const ts = format(date, "yyyyMMddhhmmss");
                    const uuid = uuidv4();
                    return `/${s3Path}/logs/${ts}/${uuid}.log`;
                },
            },
        });
        transports.push(s3Transport);
    }

    logger = winston.createLogger({
        level: LOG_LEVELS.includes(logLevel) ? logLevel : 'info',
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

    // Wrap logger methods to handle objects and errors nicely
    logger.error = wrapper(logger.error);
    logger.warn = wrapper(logger.warn);
    logger.info = wrapper(logger.info);
    logger.verbose = wrapper(logger.verbose);
    logger.debug = wrapper(logger.debug);
    logger.silly = wrapper(logger.silly);

    // Override console methods if enabled (default)
    if (overrideConsole) {
        console.log = (...args) => logger.info.call(logger, ...args);
        console.info = (...args) => logger.info.call(logger, ...args);
        console.warn = (...args) => logger.warn.call(logger, ...args);
        console.error = (...args) => logger.error.call(logger, ...args);
        console.debug = (...args) => logger.debug.call(logger, ...args);
    }

    // Stream for Morgan HTTP logging
    logger.stream = {
        write: split().on('data', function(message) {
            logger.info(message);
        })
    };

    if (expressApp) {
        expressApp.use(require("morgan")(
            "short", { "stream": logger.stream }
        ));
    }

    return logger;
}

module.exports = createLogger;
