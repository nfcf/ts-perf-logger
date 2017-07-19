export interface ISut {
  startDate: Date;
  startTime: number;
}

export interface ISutMap {
  [k: string]: ISut;
}
