import { ISutMap, ILogMethod, ILogIndexMap, IFlatLog } from './interfaces/index';
import { PerfLog } from './index';

export class PerfLogManager {
  public static logMethod: ILogMethod;

  private static perfLogs: PerfLog[] = [];
  private static indexMap: ILogIndexMap = {};

  private static suts: ISutMap = {};
  private static currentActionId: any;

  // Used as a "static constructor"
  static initialize() {
    this.logMethod = PerfLogManager.defaultLogMethod;
  }

  /**
   * Global override of logMethod - the defaultLogMethod simply writes to console.log()
   * @param logMethod the new logMethod
   */
  public static setLogMethod(logMethod: ILogMethod): void {
    this.logMethod = logMethod;
  }

  /**
   * Gets the currently active actionId
   */
  public static getActionId(): any {
    return this.currentActionId;
  }

  /**
   * Sets a new actionId that will be cleared once the current code-under-test completes.
   * Only sets a new actionId if there's none previously set
   * @param actionId the new actionId
   * @param force Forces the new actionId even if a previous one is still set
   */
  public static setActionId(actionId: any, force: boolean = false): void {
    if (force ||
        !actionId ||
        !this.currentActionId) {
      this.currentActionId = actionId;
    }
  }

  public static logPerfInit(key: string, actionId?: any): void {
    PerfLogManager.getLog(key);
    this.suts[key] = {
      startDate: new Date(),
      startTime: performance.now()
    };
    if (actionId !== undefined) {
      this.setActionId(actionId);
    }
  }

  public static logPerfEnd(key: string, success: boolean) {
    let log = PerfLogManager.getLog(key);
    let timeTaken = performance.now() - this.suts[key].startTime;
    this.logMethod(key,
                   this.getActionId(),
                   success,
                   this.suts[key].startDate,
                   timeTaken);
    if (success) {
      log.appendSuccessTime(timeTaken);
    } else {
      log.appendFailureTime(timeTaken);
    }

    this.removeFromSut(key);
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

  public static getLog(key: string): PerfLog {
    if (this.indexMap.hasOwnProperty(key)) {
      return this.perfLogs[this.indexMap[key]];
    }
    let perfLog = new PerfLog(key);
    let index = this.perfLogs.length;
    this.perfLogs[index] = perfLog;
    this.indexMap[key] = index;

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

  private static removeFromSut(key: string) {
    delete this.suts[key];

    if (Object.keys(this.suts).length === 0) {
      this.setActionId(undefined);
    }
  }

  private static defaultLogMethod(name: string, actionId: any, success: boolean, startDate: Date, timeTaken: number): void {
    const message = `Finished method '${name}';  ActionId: ${actionId}; Success: ${success}; ` +
                    `Date: ${startDate.toISOString()}; Time: ${timeTaken}ms.`;
    console.log(message);
  }

}
PerfLogManager.initialize(); // call "static constructor"
