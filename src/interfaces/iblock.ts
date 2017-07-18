export interface IBlock {
  startDate: Date;
  startTime: number;
}

export interface IBlockMap {
  [k: string]: IBlock;
}
