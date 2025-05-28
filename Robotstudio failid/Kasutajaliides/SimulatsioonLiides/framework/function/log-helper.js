const LogLevel = {
  Debug: 'debug',
  Info: 'info',
  Warn: 'warn',
  Error: 'err',
};

const MessageTypeWriteLog = 'WriteLog';

/**
 * Below class is used to seal complicated logic.
 */
const Logger = {};
const factoryLogger = (o) => {
  o.log = (level, module, ...messages) => {
    const timestamp = new Date().toISOString();

    // use different console according to log level
    // TODO: it doesn't work for FP env
    if (level === LogLevel.Error) {
      console.error(`[${timestamp}] [${module}]`, ...messages);
    } else if (level === LogLevel.Warn) {
      console.warn(`[${timestamp}] [${module}]`, ...messages);
    } else if (level === LogLevel.Debug) {
      console.debug(`[${timestamp}] [${module}]`, ...messages);
    } else {
      console.log(`[${timestamp}] [${module}]`, ...messages);
    }

    // save log to shell if it is AppStudio env
    if (App.NotifyShell && window.ASCustomData && window.ASCustomData.isInAppStudio) {
      App.NotifyShell(MessageTypeWriteLog, {
        module: module,
        message: messages.join(' '), // merge message into single line
        level: level,
        timestamp: new Date().toLocaleString(),
      });
    }
  };

  o.d = (module, ...messages) => {
    return o.log(LogLevel.Debug, module, ...messages);
  };

  o.i = (module, ...messages) => {
    return o.log(LogLevel.Info, module, ...messages);
  };

  o.w = (module, ...messages) => {
    return o.log(LogLevel.Warn, module, ...messages);
  };

  o.e = (module, ...messages) => {
    return o.log(LogLevel.Error, module, ...messages);
  };
};

factoryLogger(Logger);

export {Logger, MessageTypeWriteLog};
