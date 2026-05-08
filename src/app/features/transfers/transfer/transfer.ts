import { Component, OnInit } from '@angular/core';

import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';

import { Router } from '@angular/router';

import { Account } from '../../../core/models/account.model';

import { AccountService } from '../../../core/services/account.service';

import { TransactionService } from '../../../core/services/transaction.service';

@Component({
  selector: 'app-transfer',
  templateUrl: './transfer.html',
  styleUrls: ['./transfer.css'],
  standalone: false
})

export class TransferComponent implements OnInit {

  transferForm!: FormGroup;

  myAccounts: Account[] = [];

  selectedAccountBalance: number = 0;

  loading: boolean = false;

  successMessage: string = '';
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private accountService: AccountService,
    private transactionService: TransactionService
  ) { }

  ngOnInit(): void {

    this.loadMyAccounts();

    this.transferForm = this.fb.group({

      fromAccount: ['', Validators.required],

      toAccount: [
        '',
        [
          Validators.required,
          Validators.pattern('^[0-9]{10}$')
        ]
      ],

      amount: [
        '',
        [
          Validators.required,
          Validators.min(1)
        ]
      ],

      description: ['']
    });

    this.transferForm
      .get('fromAccount')
      ?.valueChanges.subscribe(accountId => {

        const account = this.myAccounts.find(
          a => a.id.toString() === accountId
        );

        if (account) {

          this.selectedAccountBalance = account.balance;

          this.transferForm.get('amount')?.setValidators([
            Validators.required,
            Validators.min(1),
            Validators.max(account.balance)
          ]);

          this.transferForm
            .get('amount')
            ?.updateValueAndValidity();
        }
      });
  }

  loadMyAccounts(): void {

    this.accountService.getMyAccounts().subscribe({

      next: (res: any) => {

        if (res.success) {

          this.myAccounts = res.data;
        }
      },

      error: () => {

        this.errorMessage =
          'Unable to load accounts';
      }
    });
  }

  onSubmit(): void {

    if (this.transferForm.invalid) {

      this.transferForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    this.successMessage = '';
    this.errorMessage = '';

    const payload = {

      sourceId:
        Number(this.transferForm.value.fromAccount),

      destinationAccount:
        this.transferForm.value.toAccount,

      amount:
        Number(this.transferForm.value.amount),

      description:
        this.transferForm.value.description || ''
    };

    this.transactionService.transfer(payload).subscribe({

      next: (res: any) => {

        this.loading = false;

        if (!res.success) {

          this.errorMessage =
            res.message || 'Transfer failed';

          return;
        }

        this.successMessage =
          res.message || 'Transfer successful';

        setTimeout(() => {

          this.router.navigate(['/dashboard']);

        }, 1500);
      },

      error: (err: any) => {

        this.loading = false;

        this.errorMessage =
          err.error?.message ||
          'Transfer failed';
      }
    });
  }
}
