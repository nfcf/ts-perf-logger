import { IBlockMap, ILogMethod, ILogIndexMap, IFlatLog } from './interfaces/index';
import { PerfLog } from './index';

export class PerfLogManager {
  public static logMethod: ILogMethod = PerfLogManager.defaultLogMethod;

  public static perfLogs: PerfLog[] = [];
  private static indexMap: ILogIndexMap = {};

  private static blocksUnderMeasurement: IBlockMap = {};
  private static currentActionId: any;

  public static setLogMethod(logMethod: ILogMethod): void {
    this.logMethod = logMethod;
  }

  public static getActionId(): any {
    return this.currentActionId;
  }

  public static setActionId(actionId: any): void {
    this.currentActionId = actionId;
  }

  public static logPerfInit(name: string, actionId?: any): void {
    PerfLogManager.getLog(name);
    this.blocksUnderMeasurement[name] = {
      startDate: new Date(),
      startTime: performance.now(),
      actionId: actionId
    };
  }

  public static logPerfEnd(name: string, success: boolean) {
    let log = PerfLogManager.getLog(name);
    let timeTaken = performance.now() - this.blocksUnderMeasurement[name].startTime;
    this.logMethod(name,
                   this.blocksUnderMeasurement[name].actionId,
                   success,
                   this.blocksUnderMeasurement[name].startDate,
                   timeTaken);
    if (success) {
      log.appendSuccessTime(timeTaken);
    } else {
      log.appendFailureTime(timeTaken);
    }

    delete this.blocksUnderMeasurement[name];
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

  public static getLog(name: string): PerfLog {
    if (this.indexMap.hasOwnProperty(name)) {
      return this.perfLogs[this.indexMap[name]];
    }
    let perfLog = new PerfLog(name);
    let index = this.perfLogs.length;
    this.perfLogs[index] = perfLog;
    this.indexMap[name] = index;

    return perfLog;
  }

  public static clearLogs(): void {
    for (let i = 0; i < this.perfLogs.length; i++) {
      this.perfLogs[i].clear();
    }
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

  private static defaultLogMethod(name: string, actionId: any, success: boolean, startDate: Date, timeTaken: number): void {
    const message = `Finished method '${name}';  ActionId: ${actionId}; Success: ${success}; Date: ${startDate}; Time: ${timeTaken}ms.`;
    console.log(message);
  }

}
