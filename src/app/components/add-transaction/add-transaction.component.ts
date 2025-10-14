import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController, NavParams } from '@ionic/angular';
import { FormBuilder, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { TransactionService } from 'src/app/services/transaction.service';
import { Transaction } from 'src/app/models/transaction.mode';

@Component({
  selector: 'app-add-transaction',
  templateUrl: './add-transaction.component.html',
  styleUrls: ['./add-transaction.component.scss'],
  imports: [IonicModule, ReactiveFormsModule],
})
export class AddTransactionComponent implements OnInit {
  form = this.fb.group({
    type: ['SAVING', Validators.required],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    note: [''],
  });

  editMode = false;
  transactionToEdit?: Transaction;

  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder,
    private txService: TransactionService,
    private navParams: NavParams
  ) {}

  ngOnInit() {
    const tx = this.navParams.get('transaction') as Transaction | undefined;
    if (tx) {
      this.editMode = true;
      this.transactionToEdit = tx;
      this.form.patchValue({
        type: tx.type,
        amount: tx.amount,
        note: tx.note,
      });
    }
  }

  dismiss(reload = false) {
    this.modalCtrl.dismiss({ reload });
  }

  submit() {
    if (this.form.invalid) return;
    const { type, amount, note } = this.form.value;

    if (this.editMode && this.transactionToEdit) {
      const updatedTx: Transaction = {
        ...this.transactionToEdit,
        type: type! as 'SAVING' | 'WITHDRAW' | 'INTEREST',
        amount: Number(amount),
        note: note || '',
      };
      this.txService.updateTransaction(updatedTx);
    } else {
      this.txService.addTransaction({
        type: type! as 'SAVING' | 'WITHDRAW' | 'INTEREST',
        amount: Number(amount),
        date: new Date().toISOString(),
        note: note || '',
      });
    }

    this.dismiss(true);
  }
}
