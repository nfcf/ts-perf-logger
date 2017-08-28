export class PerfLogItem {
  constructor(public name: string,
    public actionId: any,
    public success: boolean,
    public startDate: Date,
    public timeTaken: number) { }
}
