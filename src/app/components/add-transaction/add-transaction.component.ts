import { Component, Input, OnInit } from '@angular/core';
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
  @Input() transactionToEdit?: Transaction;
  editMode = false;

  form = this.fb.group({
    type: ['SAVING', Validators.required],
    amount: [
      null as number | null,
      [Validators.required, Validators.min(0.01)],
    ],
    remarks: [''],
    date: [this.getLocalISODateString(), Validators.required],
  });

  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder,
    private txService: TransactionService
  ) {}

  ngOnInit() {
    if (this.transactionToEdit) {
      this.editMode = true;
      this.form.patchValue({
        type: this.transactionToEdit.type,
        amount: this.transactionToEdit.amount,
        remarks: this.transactionToEdit.remarks,
        date: this.transactionToEdit.date,
      });
    }
  }

  dismiss(reload = false) {
    this.modalCtrl.dismiss({ reload });
  }

  getLocalISODateString() {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16); // "YYYY-MM-DDTHH:mm"
  }

  submit() {
    if (this.form.invalid) return;
    const { type, amount, remarks, date } = this.form.value;

    if (this.editMode && this.transactionToEdit) {
      const updatedTx: Transaction = {
        ...this.transactionToEdit,
        type: type! as 'SAVING' | 'WITHDRAW' | 'INTEREST',
        amount: Number(amount),
        remarks: remarks || '',
        date: date || new Date().toISOString(),
      };
      this.txService.updateTransaction(updatedTx);
    } else {
      this.txService.addTransaction({
        type: type! as 'SAVING' | 'WITHDRAW' | 'INTEREST',
        amount: Number(amount),
        remarks: remarks || '',
        date: date || new Date().toISOString(),
      });
    }

    this.dismiss(true);
  }
}
