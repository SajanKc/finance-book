export interface Transaction {
  id: number;
  type: 'SAVING' | 'WITHDRAW' | 'INTEREST';
  amount: number;
  date: string;
  note?: string;
  balanceAfter?: number;
}
