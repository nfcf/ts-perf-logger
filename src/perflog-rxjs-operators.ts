import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { PerfLogManager } from './index';

export function logPerformance<T>(this: Observable<T>, key: string, actionId?: any): Observable<T> {
  let source = this;

  return Observable.create((observer: Observer<T>) => {
    PerfLogManager.logPerfInit(key, actionId);
    return source.subscribe(
      (x: any) => {
        observer.next(x);
      },
      (error: any) => {
        PerfLogManager.logPerfEnd(key, false);
        observer.error(error);
      },
      () => {
        PerfLogManager.logPerfEnd(key, true);
        observer.complete();
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
