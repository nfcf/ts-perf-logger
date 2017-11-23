import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { Map, PerfLogFlatStats, IPerfLogMethod, IPerfLogHandler, PerfLogItem } from './models';
import { PerfLog } from './index';
import { PerfLogHandler } from './perflog-log-handler';

export class PerfLogManager {
  private static perfLogHandler: IPerfLogHandler;

  private static perfLogs: PerfLog[] = [];
  private static logsIndexMap: Map = {};

  private static sutsMap: Map = {};
  private static currentActionId: any;

  // Used as a "static constructor"
  static initialize() {
    this.perfLogHandler = new PerfLogHandler();
  }

  /**
   * Global override of perfLogHandler - the default perfLogHandler implementation simply writes to console.log()
   * @param perfLogHandler the new perfLogHandler
   */
  public static setLogHandler(perfLogHandler: IPerfLogHandler): void {
    this.perfLogHandler = perfLogHandler;
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
  public static setActionId(actionId: any, force = false): void {
    if (force ||
        !actionId ||
        !this.currentActionId) {
      this.currentActionId = actionId;
    }
  }

  /**
   * Initializes a performance logging system-under-test with the given key
   * @param key the unique key/id for this perfLog. The same key needs to be used on the logPerfEnd call.
   * @param actionId a unique actionId that we want to associate with this system-under-test
   * @param force Forces the new actionId even if a previous one is still set
   */
  public static logPerfInit(key: string, actionId?: any, force?: boolean): void {
    PerfLogManager.getLog(key);
    this.sutsMap[key] = {
      startDate: new Date(),
      startTime: performance.now()
    };
    if (actionId !== undefined || force) {
      this.setActionId(actionId, force);
    }
  }

  /**
   * Finalizes the performance logging for the system-under-test with the given key;
   * If a matching logPerfInit(key) wasn't previously called, no action is taken.
   * @param key the unique key/id for this perfLog. Should be the same key used on the logPerfInit call.
   * @param success whether the system-under-test executed successfuly or not.
   */
  public static logPerfEnd(key: string, success: boolean, newLogMethod?: IPerfLogMethod) {
    let log = PerfLogManager.getLog(key);
    let sut = this.sutsMap[key];

    if (log && sut) {
      let timeTaken = performance.now() - this.sutsMap[key].startTime;

      if (newLogMethod) {
        newLogMethod(new PerfLogItem(key, this.getActionId(), success, this.sutsMap[key].startDate, timeTaken));
      } else {
        this.perfLogHandler.handleLog(new PerfLogItem(key, this.getActionId(), success, this.sutsMap[key].startDate, timeTaken));
      }

      if (success) {
        log.appendSuccessTime(timeTaken);
      } else {
        log.appendFailureTime(timeTaken);
      }

      this.removeFromSut(key);
    }
  }

  public static getStatistics(): PerfLogFlatStats[] {
    let flatStats = [];

    for (let key in this.logsIndexMap) {
      if (this.logsIndexMap.hasOwnProperty(key)) {
        const log = this.perfLogs[this.logsIndexMap[key]];
        const flatStat = this.getFlatStats(key, log);
        flatStats.push(flatStat);
      }
    }

    return flatStats;
  }

  public static getLog(key: string): PerfLog {
    if (this.logsIndexMap.hasOwnProperty(key)) {
      return this.perfLogs[this.logsIndexMap[key]];
    }
    let perfLog = new PerfLog(key);
    let index = this.perfLogs.length;
    this.perfLogs[index] = perfLog;
    this.logsIndexMap[key] = index;

    return perfLog;
  }

  public static clearLogs(): void {
    for (let i = 0; i < this.perfLogs.length; i++) {
      this.perfLogs[i].clear();
    }
  }

  private static getFlatStats(name: string, perfLog: PerfLog): PerfLogFlatStats {
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
    delete this.sutsMap[key];

    // if after 250ms, the SUTs is empty, clear the actionId
    // this is because some functions are synchronous but trigger other functions once they complete
    setTimeout(() => {
      if (Object.keys(this.sutsMap).length === 0) {
        this.setActionId(undefined);
      }
    }, 250);
  }

}
PerfLogManager.initialize(); // call "static constructor"
