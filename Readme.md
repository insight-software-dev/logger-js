# JS Logger

Standardised logging output across JS based services in Insight.

## Install

```bash
npm install insight-software-dev/logger-js.git#1.1.0 --save
```

## Usage

### Basic - init once, use console.* everywhere

```javascript
const app = express();
require('logger')(app);

// Now console.* has timestamps and formatting
console.log('Server started');           // 2025-12-05T10:30:00.000Z info Server started
console.error('Something broke', error); // Includes stack trace
console.log({ user: 'bob' });            // Auto JSON stringified
```

### With options

```javascript
require('logger')(app, null, {
  logLevel: 'debug',      // Show debug logs (default: 'info' or LOG_LEVEL env var)
  overrideConsole: false  // Don't override console.* (default: true)
});
```

### With S3 logging

```javascript
require('logger')(app, {
  bucketName: 'my-logs-bucket',
  path: 'sica/backend'
});
```

### Using the logger directly

```javascript
const logger = require('logger')(app);
logger.info('message');
logger.debug('only shows if logLevel is debug or lower');
logger.error('error with', new Error('details'));
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `logLevel` | string | `process.env.LOG_LEVEL` or `'info'` | `error`, `warn`, `info`, `verbose`, `debug`, `silly` |
| `overrideConsole` | boolean | `true` | Replace console.log/info/warn/error/debug with logger |

## Log Levels

From most to least severe:
- `error` - Only errors
- `warn` - Errors + warnings
- `info` - Default, general info (default)
- `verbose` - More detailed info
- `debug` - Debug information
- `silly` - Everything

## Contributing

1. Make changes
2. Test: `node test_logger.js`
3. Create tag and push: `git tag x.x.x && git push --tags`
