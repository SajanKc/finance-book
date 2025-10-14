import { Component, OnInit } from '@angular/core';
import { ModalController, IonicModule, AlertController } from '@ionic/angular';
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
    private alertCtrl: AlertController,
    private txService: TransactionService
  ) {}

  ngOnInit() {
    // reactive updates
    this.txService.transaction$.subscribe(() => this.loadData());
    this.loadData();
  }

  loadData() {
    this.transactions = this.txService.getTransactions();
    this.balance = this.txService.getBalance();
  }

  async openAddModal() {
    const modal = await this.modalCtrl.create({
      component: AddTransactionComponent,
    });
    await modal.present();
  }

  async openEditModal(tx: Transaction) {
    const modal = await this.modalCtrl.create({
      component: AddTransactionComponent,
      componentProps: { transactionToEdit: tx },
    });
    await modal.present();
  }

  async confirmDelete(id: number) {
    const alert = await this.alertCtrl.create({
      header: 'Delete Transaction',
      message: 'Are you sure you want to delete this transaction?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => this.txService.deleteTransaction(id),
        },
      ],
    });
    await alert.present();
  }

  formatAmount(tx: Transaction) {
    return (tx.type === 'WITHDRAW' ? '-' : '+') + ' ' + tx.amount.toFixed(2);
  }
}
