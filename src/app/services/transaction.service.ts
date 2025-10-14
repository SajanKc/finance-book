import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Transaction } from '../models/transaction.mode';

const STORAGE_KEY = 'finance_passbook_transactions_v1';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private transactions: Transaction[] = [];
  private transactionSubject = new BehaviorSubject<Transaction[]>([]);
  transaction$ = this.transactionSubject.asObservable();
  private balance = 0;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        this.transactions = JSON.parse(data) as Transaction[];

        // Sort transactions by date, newest first
        this.transactions.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        // Set balance from the latest transaction or 0
        this.balance = this.transactions[0]?.balanceAfter ?? 0;
        this.transactionSubject.next(this.transactions);
      }
    } catch (e) {
      console.error('Failed to load transactions', e);
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.transactions));
    } catch (e) {
      console.error('Failed to save transactions', e);
    }
  }

  getBalance(): number {
    return this.balance;
  }

  getTransactions(): Transaction[] {
    return [...this.transactions];
  }

  addTransaction(tx: Omit<Transaction, 'id' | 'balanceAfter'>) {
    const balanceAfter = this.calculateBalance(tx);
    const newTx: Transaction = {
      id: Date.now(),
      ...tx,
      balanceAfter,
    };

    this.transactions.push(newTx);
    this.transactions.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    this.transactionSubject.next([...this.transactions]);
    this.saveToStorage();

    return newTx;
  }

  /**
   * 📝 Update an existing transaction
   */
  updateTransaction(updated: Transaction) {
    const index = this.transactions.findIndex((t) => t.id === updated.id);
    if (index === -1) return;

    this.transactions[index] = updated;
    this.recalculateBalances();
    this.saveToStorage();
    this.transactionSubject.next(this.transactions);
  }

  /**
   * 🗑️ Delete a transaction by ID
   */
  deleteTransaction(id: number) {
    this.transactions = this.transactions.filter((t) => t.id !== id);
    this.recalculateBalances();
    this.saveToStorage();
    this.transactionSubject.next(this.transactions);
  }

  /**
   * 🔄 Recalculate all balances from scratch
   */
  private recalculateBalances() {
    // Sort by date newest first
    this.transactions.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    let runningBalance = 0;
    // Recalculate from oldest to newest
    const oldestFirst = [...this.transactions].reverse();
    oldestFirst.forEach((tx) => {
      if (tx.type === 'SAVING' || tx.type === 'INTEREST')
        runningBalance += tx.amount;
      else if (tx.type === 'WITHDRAW') runningBalance -= tx.amount;
      tx.balanceAfter = Math.round(runningBalance * 100) / 100;
    });

    this.transactions = oldestFirst.reverse();
    this.balance = this.transactions[0]?.balanceAfter ?? 0;
    this.transactionSubject.next([...this.transactions]);
  }

  private calculateBalance(
    tx: Omit<Transaction, 'id' | 'balanceAfter'>
  ): number {
    if (tx.type === 'SAVING' || tx.type === 'INTEREST') {
      this.balance += tx.amount;
    } else if (tx.type === 'WITHDRAW') {
      this.balance -= tx.amount;
    }
    // round to 2 decimals
    this.balance = Math.round(this.balance * 100) / 100;
    return this.balance;
  }

  // optional helpers
  // clearAll() {
  //   this.transactions = [];
  //   this.balance = 0;
  //   this.saveToStorage();
  //   this.transactionSubject.next(this.transactions);
  // }
}
