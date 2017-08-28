export { IPerfLogHandler, IPerfLogMethod, PerfLog, PerfLogItem, PerfLogStats, PerfLogFlatStats } from './models';
import { PerfLogHandler } from './perflog-log-handler';
export { PerfLogManager } from './perflog-manager';
export { LogPerformance, DisableLogPerformance } from './perflog-decorators';

import './perflog-rxjs-operators';
