export interface IBlock {
  startDate: Date;
  startTime: number;
  actionId: any;
}

export interface IBlockMap {
  [k: string]: IBlock;
}
