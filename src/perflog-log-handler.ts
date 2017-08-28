import { IPerfLogHandler, PerfLogItem } from './models';


export class PerfLogHandler implements IPerfLogHandler {
  constructor() { }

  handleLog(item: PerfLogItem): void {
    const message = `Finished method '${item.name}';  ActionId: ${item.actionId}; Success: ${item.success}; ` +
    `Date: ${item.startDate.toISOString()}; Time: ${item.timeTaken}ms.`;

    console.log(message);
  }
}
