import { Component } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormBuilder, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { TransactionService } from 'src/app/services/transaction.service';

@Component({
  selector: 'app-add-transaction',
  templateUrl: './add-transaction.component.html',
  styleUrls: ['./add-transaction.component.scss'],
  imports: [IonicModule, ReactiveFormsModule],
})
export class AddTransactionComponent {
  form = this.fb.group({
    type: ['SAVING', Validators.required],
    amount: [null, [Validators.required, Validators.min(0.01)]],
    note: [''],
  });

  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder,
    private txService: TransactionService
  ) {}

  dismiss() {
    this.modalCtrl.dismiss();
  }

  submit() {
    if (this.form.invalid) return;
    const { type, amount, note } = this.form.value;
    this.txService.addTransaction({
      type: type! as 'SAVING' | 'WITHDRAW' | 'INTEREST',
      amount: Number(amount),
      date: new Date().toISOString(),
      note: note || '',
    });
    this.dismiss();
  }
}
