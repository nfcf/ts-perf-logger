export interface IFlatLog {
  name: string;
  successes: number;
  successMin: number;
  successMax: number;
  successAverage: number;
  successStandardDeviation: number;
  failures: number;
  failureMin: number;
  failureMax: number;
  failureAverage: number;
  failureStandardDeviation: number;
}
