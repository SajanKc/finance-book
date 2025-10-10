import { Component, OnInit } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular';
import { AddTransactionComponent } from '../components/add-transaction/add-transaction.component';
import { Transaction } from '../models/transaction.mode';
import { TransactionService } from '../services/transaction.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  imports: [CommonModule, IonicModule],
})
export class HomePage implements OnInit {
  transactions: Transaction[] = [];
  balance = 0;

  constructor(
    private modalCtrl: ModalController,
    private txService: TransactionService
  ) {}

  ngOnInit() {
    this.txService.transaction$.subscribe((tx) => {
      this.transactions = tx;
      this.balance = this.txService.getBalance();
    });
    // sync initial state
    this.transactions = this.txService.getTransactions();
    this.balance = this.txService.getBalance();
  }

  async openAddModal() {
    const modal = await this.modalCtrl.create({
      component: AddTransactionComponent,
    });
    await modal.present();
  }

  // convenience: format amount for display positive/negative
  formatAmount(tx: Transaction) {
    return (tx.type === 'WITHDRAW' ? '-' : '+') + ' ' + tx.amount.toFixed(2);
  }

  // optional: clear all (dev only)
  // async clearAllConfirm() {
  //   const ok = confirm('Clear all transactions? This cannot be undone.');
  //   if (ok) this.txService.clearAll();
  // }
}
