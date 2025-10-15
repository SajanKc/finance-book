import { Component, OnInit } from '@angular/core';
import { ModalController, IonicModule, AlertController } from '@ionic/angular';
import { AddTransactionComponent } from '../components/add-transaction/add-transaction.component';
import { Transaction } from '../models/transaction.mode';
import { TransactionService } from '../services/transaction.service';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  imports: [CommonModule, IonicModule, FormsModule],
  providers: [CurrencyPipe],
})
export class HomePage implements OnInit {
  transactions: Transaction[] = [];
  balance = 0;

  currentPage: number = 1;
  itemsPerPage: number = 5;
  readonly itemsPerPageOptions = [5, 10, 25, 50, 100];

  constructor(
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private txService: TransactionService,
    private currencyPipe: CurrencyPipe
  ) {}

  ngOnInit() {
    // reactive updates
    this.txService.transaction$.subscribe(() => this.loadData());
    this.loadData();
  }

  get paginatedTransactions(): Transaction[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.transactions.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.transactions.length / this.itemsPerPage));
  }

  onItemsPerPageChange() {
    this.currentPage = 1;
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  loadData() {
    this.transactions = this.txService.getTransactions();
    this.balance = this.txService.getBalance();
    this.currentPage = 1; // reset to first page on data reload
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

  formatAmount(tx: Transaction): string {
    const sign = tx.type === 'WITHDRAW' ? '-' : '+';
    // format currency in NPR, adjust 'NPR' or 'symbol' as needed
    const formatted = this.currencyPipe.transform(
      tx.amount,
      'Rs ',
      'symbol',
      '1.2-2'
    );
    return `${sign} ${formatted}`;
  }
}
