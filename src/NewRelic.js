/* globals ErrorUtils, __DEV__ */
import { NativeModules } from 'react-native';
import * as _ from 'lodash';

const RNNewRelic = NativeModules.RNNewRelic;

class NewRelic {
  init(config) {
    if (config.overrideConsole) {
      this._overrideConsole();
    }
    if (config.reportUncaughtExceptions) {
      this._reportUncaughtExceptions();
    }
    if (config.reportRejectedPromises) {
      this._reportRejectedPromises();
    }
    if (config.globalAttributes) {
      this.setGlobalAttributes(config.globalAttributes);
    }
  }

  _overrideConsole() {
    const defaultLog = console.log;
    const defaultWarn = console.warn;
    const defaultError = console.error;
    const self = this;

    console.log = function() {
      self.sendConsole('log', arguments);
      defaultLog.apply(console, arguments);
    };
    console.warn = function() {
      self.sendConsole('warn', arguments);
      defaultWarn.apply(console, arguments);
    };
    console.error = function() {
      self.sendConsole('error', arguments);
      defaultError.apply(console, arguments);
    };
  }

  _reportUncaughtExceptions(errorUtils = global.ErrorUtils) {
    const defaultHandler = errorUtils._globalHandler;
    errorUtils._globalHandler = error => {
      this.send('JS:UncaughtException', { error, stack: error && error.stack });
      defaultHandler(error);
    };
  }

  _reportRejectedPromises() {
    const rejectionTracking = require('promise/setimmediate/rejection-tracking');
    if (!__DEV__) {
      rejectionTracking.enable({
        allRejections: true,
        onUnhandled: (id, error) => {
          this.send('JS:UnhandledRejectedPromise', { error });
          this.nativeLog('[UnhandledRejectedPromise] ' + error);
        },
        onHandled: () => {
          //
        }
      });
    }
  }

  /**
   * registers global attributes that will be sent with every event
   * @param args
   */
  setGlobalAttributes(args) {
    _.forEach(args, (value, key) => {
      RNNewRelic.setAttribute(String(key), String(value));
    });
  }

  /**
   * remove attribute
   * @param {string} attributeName
   */
  removeAttribute(attributeName) {
    RNNewRelic.removeAttribute(String(attributeName));
  }

  sendConsole(type, args) {
    const argsStr = _.map(args, String).join(', ');
    this.send('JSConsole', { consoleType: type, args: argsStr });
    if (type === 'error') {
      this.nativeLog('[JSConsole:Error] ' + argsStr);
    }
  }

  report(eventName, args) {
    this.send(eventName, args);
  }

  /*
   logs a message to the native console (useful when running in release mode)
  */
  nativeLog(log) {
    RNNewRelic.nativeLog(log);
  }

  /**
   * Send custom events to NewRelic
   * @param {string} eventType The type of event. Do not use eventType to name your custom events.
   * @param {string} eventName  Use this parameter to name the event.
   * @param {object} args A json object that includes a list of optional attributes related to the event
   */
  recordCustomEvent(eventType, eventName, args) {
    const eventTypeStr = String(eventType);
    const eventNameStr = String(eventName);
    const argsIsObject = typeof args === 'object';
    const argsStr = argsIsObject
      ? Object.keys(args).reduce((argsObject, key) => {
          const value = args[key];
          argsObject[String(key)] = String(value);
          return argsObject;
        }, {})
      : {};

    RNNewRelic.recordCustomEvent(eventTypeStr, eventNameStr, argsStr);
  }

  send(name, args) {
    const nameStr = String(name);
    const argsStr = {};
    _.forEach(args, (value, key) => {
      argsStr[String(key)] = String(value);
    });
    RNNewRelic.send(nameStr, argsStr);
  }
}

export default new NewRelic();
