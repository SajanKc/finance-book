export interface Transaction {
  id: number;
  type: 'SAVING' | 'WITHDRAW' | 'INTEREST';
  amount: number;
  date: string;
  remarks?: string;
  balanceAfter?: number;
}
