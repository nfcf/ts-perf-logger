import { PerfLogItem } from './perflog-item.class';


export interface IPerfLogMethod {
  (item: PerfLogItem): void;
}
