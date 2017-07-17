export interface ILogMethod {
  (name: string, actionId: any, success: boolean, startDate: Date, timeTaken: number): void;
}
