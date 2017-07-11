import { ILogMethod } from './interfaces/index';
import { PerfLogManager } from './index';

import * as _ from 'lodash';


/**
 * Logs the time it takes for the all class functions to complete (or a subset of them).
 * Functions that return observables should not be included here and their performance logging should be
 * done using PerfLogManager.logPerfInit() and PerfLogManager.logPerfEnd().
 * @param methodNames Array of method's names that are to be logged; if undefined, all methods are logged.
 * @param logMethod Override of logMethod - the defaultLogMethod simply writes to console.log()
 */
export function LogClassPerformance(methodNamesToLog?: string[], logMethod: ILogMethod = PerfLogManager.logMethod) {
  if (!logMethod) {
    logMethod = () => { };
  }

  return function (target) {
    _.keys(target.prototype).filter(function (methodName: string): boolean {
      return !methodNamesToLog || methodNamesToLog.indexOf(methodName) !== -1;
    }).forEach(function (methodName: string): void {
      const originalMethod = target.prototype[methodName];
      let name = target.prototype.constructor.name + '.' + methodName;

      // set by method logger decorator for disabling the method log
      if (typeof (originalMethod) !== 'function' || originalMethod.__perfLogCompleted === true) {
        return;
      }

      target.prototype[methodName] = getPerfLogPatchedMethod(name, originalMethod, logMethod);
    });
  };
}

/**
 * Logs the time it takes for the function to complete
 * @param name Name to be used in the logs to reference this function; Otherwise, 'Class.functionName' is used
 * @param logMethod Override of logMethod - the defaultLogMethod simply writes to console.log()
 */
export function LogFunctionPerformance(name?: string, logMethod: ILogMethod = PerfLogManager.logMethod) {
  if (!logMethod) {
    logMethod = () => { };
  }

  return function (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) {
    name = name || getObjectClass(target) + '.' + propertyKey;
    descriptor = descriptor || Object.getOwnPropertyDescriptor(target, propertyKey);

    let originalMethod = descriptor.value;
    originalMethod = getPerfLogPatchedMethod(name, originalMethod, logMethod);
    originalMethod.__perfLogCompleted = true;

    return descriptor;
  };
}

export function DisableLogFunctionPerformance() {
  return function (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) {
    descriptor = descriptor || Object.getOwnPropertyDescriptor(target, propertyKey);

    let originalMethod = descriptor.value;
    originalMethod.__perfLogCompleted = true;

    return descriptor;
  };
}

function getPerfLogPatchedMethod(name: string, method: Function, logMethod: ILogMethod) {
  return function (...args: any[]) {
    let log = PerfLogManager.getLog(name);
    let startTime = performance.now();
    let timeTaken;
    try {
      let result = method.apply(this, args);
      if (result && result.then) { // if promise
        return result.then((val) => {
          timeTaken = performance.now() - startTime;
          logMethod(name, true, timeTaken);
          log.appendSuccessTime(timeTaken);
          return val;
        }).catch((e) => {
          timeTaken = performance.now() - startTime;
          logMethod(name, false, timeTaken);
          log.appendFailureTime(timeTaken);
          throw e;
        });
      } else { // if synchronous method
        timeTaken = performance.now() - startTime;
        logMethod(name, true, timeTaken);
        log.appendSuccessTime(timeTaken);
        return result;
      }
    } catch (ex) {
      timeTaken = performance.now() - startTime;
      logMethod(name, false, timeTaken);
      log.appendFailureTime(timeTaken);
      throw ex;
    }
  };
}

function getObjectClass(target: Object) {
  if (target && target.constructor && target.constructor.toString) {
    let arr = target.constructor.toString().match(
      /function\s*(\w+)/);

    if (arr && arr.length === 2) {
      return arr[1];
    }
  }

  return undefined;
}
