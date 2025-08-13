
const winston = require('winston');
const { combine, timestamp, json, errors, cli } = winston.format;


let logger = null;

const wrapper = ( original ) => {
    return (...args) => original(args.join(" "));
};


function createLogger(withS3Output = false) {
    let transports = [new winston.transports.Console()];
    if (withS3Output) {
        const S3Transport = require('winston-s3');
        transports.push(new S3Transport({
            bucket: 'your-s3-bucket-name',
            level: 'info',
            format: combine(errors({ stack: true }), timestamp(), json())
        }));
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
        transports: [
            new (winston.transports.Console)({'timestamp':true})
        ],
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
    return logger;
}

exports.createLogger = createLogger;