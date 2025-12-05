import { Logger } from 'winston';
import { Application } from 'express';

export interface S3OutputPath {
    /** The name of the S3 bucket */
    bucketName: string;
    /** The path in the S3 bucket where logs will be stored */
    path: string;
}

export type LogLevel = 'error' | 'warn' | 'info' | 'verbose' | 'debug' | 'silly';

export interface LoggerOptions {
    /** Log level. Defaults to LOG_LEVEL env var or 'info' */
    logLevel?: LogLevel;
    /** Whether to override console.* methods. Defaults to true */
    overrideConsole?: boolean;
}

/**
 * Creates a logger instance with optional S3 output and configurable options.
 * By default, overrides console.log/info/warn/error/debug to use the logger.
 * 
 * @param expressApp - Optional Express app instance for Morgan HTTP logging
 * @param s3OutputPath - Optional S3 output configuration for persisting logs
 * @param options - Optional configuration options
 * @returns Winston logger instance
 * 
 * @example
 * // Basic usage - just init and use console.*
 * require('logger')(app);
 * console.log('This now has timestamps');
 * 
 * @example
 * // With S3 and custom log level
 * const logger = require('logger')(app, { bucketName: 'my-bucket', path: 'app/logs' }, { logLevel: 'debug' });
 * 
 * @example
 * // Without console override
 * const logger = require('logger')(null, null, { overrideConsole: false });
 * logger.info('Direct logger usage');
 */
declare function createLogger(
    expressApp?: Application | null,
    s3OutputPath?: S3OutputPath | null,
    options?: LoggerOptions
): Logger;

export = createLogger;

