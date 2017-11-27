import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { PerfLogManager } from './index';

/**
 * Logs the performance of Observables (from the moment it's subscribed to to the moment
 * it first emits - useful for Observables that emit only once and complete like HTTP requests)
 * @param this Source Observable
 * @param key The unique key/id for this perfLog. Should be the same key used on the logPerfInit call.
 * @param actionId a unique actionId that we want to associate with this system-under-test
 * @param checkSuccess Custom function to check if the next(response) is to be considered a success or not.
 * Example: A http requests that always returns 200 OK but the response contents can indicate errors.
 */
export function logPerformance<T>(this: Observable<T>, key: string, actionId?: string, checkSuccess?: (x: any) => boolean): Observable<T> {
  let source = this;

  return Observable.create((observer: Observer<T>) => {
    PerfLogManager.logPerfInit(key, actionId, false);
    return source.subscribe(
      (x: any) => {
        if (!checkSuccess || checkSuccess(x)) {
          PerfLogManager.logPerfEnd(key, true);
        } else {
          PerfLogManager.logPerfEnd(key, false);
        }
        observer.next(x);
      },
      (error: any) => {
        PerfLogManager.logPerfEnd(key, false);
        observer.error(error);
      }
    );
  })
}

Observable.prototype.logPerformance = logPerformance;

/*tslint:disable:no-shadowed-variable*/
declare module 'rxjs/Observable' {
  interface Observable<T> {
    logPerformance: typeof logPerformance;
  }
}
