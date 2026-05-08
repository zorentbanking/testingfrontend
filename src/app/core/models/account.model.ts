export enum AccountType {
  Savings = 'Savings',
  Checking = 'Checking',
  FixedDeposit = 'FixedDeposit',
  RecurringDeposit = 'RecurringDeposit'
}

export interface Account {
  id: number;
  accountNumber: string;
  accountType: string;
  balance: number;
  status: string;
  createdAt: string;
}
