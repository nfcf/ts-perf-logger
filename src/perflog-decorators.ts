import { ILogMethod } from './interfaces/index';
import { PerfLogManager } from './index';

import * as _ from 'lodash';


/**
 * Logs the time it takes for the all class functions to complete (or a subset of them).
 * Functions that return observables should not be included here and their performance logging should be
 * done using PerfLogManager.logPerfInit() and PerfLogManager.logPerfEnd().
 * @param methodNames Array of method's names that are to be logged; if undefined, all methods are logged.
 * @param newLogMethod Override of logMethod - the defaultLogMethod simply writes to console.log()
 */
export function LogClassPerformance(methodNamesToLog?: string[], newLogMethod?: ILogMethod) {
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

      target.prototype[methodName] = getPerfLogPatchedMethod(name, originalMethod, newLogMethod);
    });
  };
}

/**
 * Logs the time it takes for the function to complete
 * @param name Name to be used in the logs to reference this function; Otherwise, 'Class.functionName' is used
 * @param newLogMethod Override of logMethod - the defaultLogMethod simply writes to console.log()
 */
export function LogFunctionPerformance(name?: string, newLogMethod?: ILogMethod) {
  return function (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) {
    name = name || getObjectClass(target) + '.' + propertyKey;
    descriptor = descriptor || Object.getOwnPropertyDescriptor(target, propertyKey);

    let originalMethod = descriptor.value;
    descriptor.value = getPerfLogPatchedMethod(name, originalMethod, newLogMethod);
    descriptor.value.__perfLogCompleted = true;
  };
}

/**
 * Disable the Performance Logging feature for this method. To be used inside classes decorated with @LogClassPerformance()
 */
export function DisableLogFunctionPerformance() {
  return function (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) {
    descriptor = descriptor || Object.getOwnPropertyDescriptor(target, propertyKey);

    let originalMethod = descriptor.value;
    originalMethod.__perfLogCompleted = true;

    return descriptor;
  };
}

function getPerfLogPatchedMethod(name: string, method: Function, newLogMethod: ILogMethod) {
  return function (...args: any[]) {
    let logMethod = newLogMethod || PerfLogManager.logMethod;

    PerfLogManager.logPerfInit(name);

    try {
      let result = method.apply(this, args);

      if (result && result.then) { // if promise
        return result.then((val) => {
          PerfLogManager.logPerfEnd(name, true);
          return val;
        }).catch((e) => {
          PerfLogManager.logPerfEnd(name, false);
          throw e;
        });
      } else { // if synchronous method
        PerfLogManager.logPerfEnd(name, true);
        return result;
      }
    } catch (ex) {
      PerfLogManager.logPerfEnd(name, false);
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
