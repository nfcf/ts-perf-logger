import { Map, PerfLogFlatStats, IPerfLogMethod, IPerfLogHandler, PerfLogItem, Sut } from './models';
import { PerfLog } from './index';
import { PerfLogHandler } from './perflog-log-handler';

export class PerfLogManager {
  private static perfLogHandler: IPerfLogHandler;

  private static perfLogs: PerfLog[] = [];
  private static logsIndexMap: Map<number> = {};

  private static sutsMap: Map<Sut> = {};
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
  public static getCurrentActionId(): any {
    return this.currentActionId;
  }

  /**
   * Sets a new actionId that will be cleared once the current code-under-test completes.
   * @param actionId the new actionId
   */
  public static setCurrentActionId(actionId: any): void {
    this.currentActionId = actionId || undefined;
  }

  /**
   * Initializes a performance logging system-under-test with the given key
   * @param key the unique key/id for this perfLog. The same key needs to be used on the logPerfEnd call.
   * @param actionId a unique actionId that we want to associate with this system-under-test
   * @param setCurrentAction whether to associate this actionId with this system-under-test only,
   * or make it the current active actionId for any follow up async calls that happen
   */
  public static logPerfInit(key: string, actionId?: any, setCurrentAction = true): void {
    PerfLogManager.getLog(key);
    this.sutsMap[key] = <Sut>{
      startDate: new Date(),
      startTime: performance.now(),
      actionId: actionId || this.getCurrentActionId()
    };
    if (setCurrentAction) {
      this.setCurrentActionId(this.sutsMap[key].actionId);
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
    let sut: Sut = this.sutsMap[key];

    if (log && sut) {
      let timeTaken = performance.now() - this.sutsMap[key].startTime;

      if (newLogMethod) {
        newLogMethod(new PerfLogItem(key, sut.actionId, success, this.sutsMap[key].startDate, timeTaken));
      } else {
        this.perfLogHandler.handleLog(new PerfLogItem(key, sut.actionId, success, this.sutsMap[key].startDate, timeTaken));
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

    // if after 250ms, the SUTs is empty, clear the currently active actionId
    // this is because some functions are synchronous but trigger other functions once they complete
    setTimeout(() => {
      if (Object.keys(this.sutsMap).length === 0) {
        this.setCurrentActionId(undefined);
      }
    }, 250);
  }

}
PerfLogManager.initialize(); // call "static constructor"
