export interface ILogMethod {
  (name: string, success: boolean, timeTaken: number): void;
}
