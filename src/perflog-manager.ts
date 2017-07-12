import { ILogMethod, ILogIndexMap, IFlatLog } from './interfaces/index';
import { PerfLog } from './index';

export class PerfLogManager {
  public static logMethod: ILogMethod = PerfLogManager.defaultLogMethod;

  public static perfLogs: PerfLog[] = [];
  private static indexMap: ILogIndexMap = {};

  private static blockStartTime: any = {};

  public static setLogMethod(logMethod: ILogMethod) {
    this.logMethod = logMethod;
  }

  public static getLog(name: string) {
    if (this.indexMap.hasOwnProperty(name)) {
      return this.perfLogs[this.indexMap[name]];
    }
    let perfLog = new PerfLog(name);
    let index = this.perfLogs.length;
    this.perfLogs[index] = perfLog;
    this.indexMap[name] = index;

    return perfLog;
  }

  public static clearLogs() {
    for (let i = 0; i < this.perfLogs.length; i++) {
      this.perfLogs[i].clear();
    }
  }

  public static logPerfInit(name: string) {
    PerfLogManager.getLog(name);
    this.blockStartTime[name] = performance.now();
  }

  public static logPerfEnd(name: string, success: boolean) {
    let log = PerfLogManager.getLog(name);
    let timeTaken = performance.now() - this.blockStartTime[name];
    this.logMethod(name, success, timeTaken);
    if (success) {
      log.appendSuccessTime(timeTaken);
    } else {
      log.appendFailureTime(timeTaken);
    }

    delete this.blockStartTime[name];
  }

  public static getStatistics() {
    let flatLogs = [];

    for (let key in this.indexMap) {
      if (this.indexMap.hasOwnProperty(key)) {
        const log = this.perfLogs[this.indexMap[key]];
        const flatLog = this.getFlatLog(key, log);
        flatLogs.push(flatLog);
      }
    }

    return flatLogs;
  }

  private static getFlatLog(name: string, perfLog: PerfLog): IFlatLog {
    return {
      name: perfLog.getName(),
      successes: perfLog.getSuccesses(),
      successMin: perfLog.getSuccessMin(),
      successMax: perfLog.getSuccessMax(),
      successAverage: perfLog.getSuccessAverage(),
      successStandardDeviation: perfLog.getSuccessStandardDeviation(),
      failures: perfLog.getFailures(),
      failureMin: perfLog.getFailureMin(),
      failureMax: perfLog.getFailureMax(),
      failureAverage: perfLog.getFailureAverage(),
      failureStandardDeviation: perfLog.getFailureStandardDeviation()
    };
  }

  private static defaultLogMethod(name: string, success: boolean, timeTaken: number): void {
    const status = (success) ? 'success' : 'fail';
    const message = `Finished method ${name};  Status: ${status}; Time: ${timeTaken}ms.`;
    console.log(message);
  }

}
