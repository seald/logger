# @seald-io/logger

`@seald-io/logger` is a logger packages, which pretty-prints logs to the console, and allows to change log-levels and
export the log history.

You can use the default export (usually named `makeLogger`), to create a logger instance.

A logger instance contains 4 logging functions with varying levels, `debug`, `info`, `warn`, `error`.

By default, `debug`-level logs are hidden, anything superior is shown.

## Usage

```javascript
import makeLogger from '@seald-io/logger'

const logger = makeLogger('my-app')

logger.info('this is an info message, it will print by default')
logger.debug('this is a debug message, it will *not* print by default')
```

## Changing log level

### Concept
The default log level is `*:info`. This means that all namespaces (`*`) print levels `info` and up.

You can use the function `setLogLevel` to change this log level.

```javascript
import makeLogger, {setLogLevel} from '@seald-io/logger'

const logger = makeLogger('my-app')

logger.debug('this is a debug message, it will *not* print')

setLogLevel('*:debug') // this sets all namespaces to print all logs

logger.debug('this is a debug message, but it will print because log level was changed')
```

### Namespaces

You can also change log levels only for a specific namespace.

```javascript
import makeLogger, {setLogLevel} from '@seald-io/logger'

const logger1 = makeLogger('logger1')
const logger2 = makeLogger('logger2')

setLogLevel('logger1:debug') // logger1 will now print debug messages

logger1.debug('this is a debug message, but it will print because log level was changed for this logger')

logger2.debug('this is a debug message, but it will *not* print because it is in another namespace')
```

Warning, this actually overrides the default log level, so anything other than `logger1` will now not print at all, even
for higher levels!

If you want to still print info messages, you can do instead:

```javascript
setLogLevel('logger1:debug,*:info') // logger1 will now print debug messages, other loggers will print info
```

You can also provide multiple namespaces, separated by `,`.

```javascript
setLogLevel('logger1:debug,logger2:info,*:error') // logger1 will now print debug messages, logger1 will print info, other loggers will only print errors
```

You can also use environment variables to set the log level, instead of calling `setLogLevel` in your code.
`@seald-io/logger` can be configured with the following environment variables (by order of priority):
- `LOG_LEVEL`
- `DEBUG_NAMESPACES`
- `DEBUG`

The syntax for environment variables is the same, except that it always keeps the default `*:info` level in addition to
the ones you specify.

You may want to run `setLogLevel` as soon as possible after your app has started, to see startup messages. A "trick" to
run it as soon as possible is to have it in a separate file which is then `import`ed into your main file.

## History

`@seald-io/logger` keeps a history of the logged messages, which you may subsequently export.

The `setHistorySize` function allows you to set the number of messages saved to this history. It defaults to 10,000
lines.

The `flushToString` function exports the current history to a string.
