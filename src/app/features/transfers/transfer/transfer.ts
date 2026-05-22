import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';

import { Router } from '@angular/router';

import { debounceTime } from 'rxjs/operators';

import { Account } from '../../../core/models/account.model';

import { AccountService } from '../../../core/services/account.service';

import { TransactionService } from '../../../core/services/transaction.service';
import { APP_CONSTANTS } from '../../../app.constants';

@Component({
  selector: 'app-transfer',
  templateUrl: './transfer.html',
  styleUrls: ['./transfer.css'],
  standalone: false
})

export class TransferComponent implements OnInit {

  transferForm!: FormGroup;
  currencySymbol = APP_CONSTANTS.currencySymbol;

  currency = APP_CONSTANTS.currency;

  myAccounts: Account[] = [];

  selectedAccountBalance: number = 0;

  minimumBalance: number = 0;
  hasAccounts: boolean = false;

  loading: boolean = false;

  successMessage: string = '';

  errorMessage: string = '';

  isProfileOpen: boolean = false;

  userName: string = 'User';

  userEmail: string = '';
  userPhone: string = '';
  userFullName: string = '';

  userAddress: string = '';
  userUsername: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private accountService: AccountService,
    private transactionService: TransactionService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    

      this.checkAccounts();

    
    this.loadUserData();

    this.loadMyAccounts();


    this.transferForm = this.fb.group({

      fromAccount: [
        '',
        Validators.required
      ],

      toAccount: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[0-9]{10}$/)
        ]
      ],

      amount: [
        '',
        [
          Validators.required,
          Validators.min(1)
        ]
      ],

      description: [
        '',
        [
          Validators.maxLength(250)
        ]
      ]
    });


    // SOURCE ACCOUNT CHANGE
    this.transferForm
      .get('fromAccount')
      ?.valueChanges
      .subscribe((accountId: string) => {

        const account = this.myAccounts.find(
          (a: Account) =>
            a.id.toString() === accountId
        );

        if (account) {

          // BLOCK FIXED DEPOSIT TRANSACTIONS
          if (account.accountType === 'Fixed Deposit') {

            this.errorMessage =
              'Transactions are not allowed from Fixed Deposit accounts';

            this.transferForm
              .get('amount')
              ?.disable();

            return;
          }

          // ENABLE AGAIN FOR OTHER ACCOUNTS
          this.transferForm
            .get('amount')
            ?.enable();

          this.errorMessage = '';

          this.selectedAccountBalance =
            account.balance;

          // SET MINIMUM BALANCE BASED ON ACCOUNT TYPE
          switch (account.accountType) {

            case 'Savings':
              this.minimumBalance = 500;
              break;

            case 'Checking':
              this.minimumBalance = 100;
              break;

            case 'Recurring Deposit':
              this.minimumBalance = 100;
              break;

            default:
              this.minimumBalance = 0;
          }

          const allowedAmount =
            account.balance - this.minimumBalance;

          this.transferForm
            .get('amount')
            ?.setValidators([

              Validators.required,

              Validators.min(1),

              Validators.max(
                allowedAmount > 0
                  ? allowedAmount
                  : 0
              )
            ]);

          this.transferForm
            .get('amount')
            ?.updateValueAndValidity();
        }
      });

    // DESTINATION ACCOUNT VALIDATION
    this.transferForm
      .get('toAccount')
      ?.valueChanges
      .pipe(debounceTime(500))
      .subscribe((accountNumber: string) => {

        if (
          accountNumber &&
          accountNumber.length === 10
        ) {

          this.validateDestinationAccount(
            accountNumber
          );
        }
      });
  }

  checkAccounts(): void {

    this.http.get<any>(
      'https://localhost:7085/api/accounts/my',
      {
        headers: {
          Authorization:
            `Bearer ${localStorage.getItem('accessToken')}`
        }
      }
    ).subscribe({

      next: (res :any) => {

        this.hasAccounts =
          (res.data || []).length > 0;
      },

      error: () => {

        this.hasAccounts = false;
      }
    });
  }

  loadUserData(): void {

    const userData =
      localStorage.getItem('user');

    if (userData) {

      const user = JSON.parse(userData);

      console.log(user);

      this.userName =
        user.fullName || 'User';

      this.userEmail =
        user.email || '';

      this.userPhone =
        user.phone || '';

      this.userAddress =
        user.address || '';

      this.userUsername =
        user.username || '';
    }
  }

  // ALLOW ONLY NUMBERS
  allowOnlyNumbers(
    event: KeyboardEvent
  ): void {

    const charCode =
      event.which
        ? event.which
        : event.keyCode;

    if (
      charCode < 48 ||
      charCode > 57
    ) {
      event.preventDefault();
    }
  }

  // LOAD USER ACCOUNTS
  loadMyAccounts(): void {

    this.accountService
      .getMyAccounts()
      .subscribe({

        next: (res: any) => {

          if (res.success) {

            this.myAccounts = res.data.filter(
              (acc: Account) =>
                acc.status === 'Active'
            );
          }
        },

        error: () => {

          this.errorMessage =
            'Unable to load accounts';
        }
      });
  }

  // VALIDATE DESTINATION ACCOUNT
  validateDestinationAccount(
    accountNumber: string
  ): void {

    const control =
      this.transferForm.get('toAccount');

    if (!control) {
      return;
    }

    // SAME ACCOUNT CHECK
    const selectedAccount =
      this.myAccounts.find(

        (a: Account) =>

          a.id.toString() ===
          this.transferForm
            .get('fromAccount')
            ?.value
      );

    if (
      selectedAccount &&
      selectedAccount.accountNumber ===
      accountNumber
    ) {

      control.setErrors({
        sameAccount: true
      });

      return;
    }

    // API VALIDATION
    this.accountService
      .validateAccount(accountNumber)
      .subscribe({

        next: (res: any) => {

          if (res.success) {

            // CLEAR ONLY CUSTOM ERRORS
            if (
              control.hasError('accountNotFound') ||
              control.hasError('sameAccount')
            ) {

              control.setErrors(null);
            }
          }

          else {

            control.setErrors({
              accountNotFound: true
            });
          }
        },

        error: () => {

          control.setErrors({
            accountNotFound: true
          });
        }
      });
  }

  // SUBMIT TRANSFER
  onSubmit(): void {

    if (this.transferForm.invalid) {

      this.transferForm
        .markAllAsTouched();

      return;
    }

    this.loading = true;

    this.successMessage = '';

    this.errorMessage = '';
    const enteredAmount =
      Number(this.transferForm.value.amount);
    const selectedAccount =
      this.myAccounts.find(
        a =>
          a.id.toString() ===
          this.transferForm.value.fromAccount
      );

    if (
      selectedAccount?.accountType ===
      'Fixed Deposit'
    ) {

      this.errorMessage =
        'Transactions are not allowed from Fixed Deposit accounts';

      return;
    }

    const payload = {

      sourceId: Number(
        this.transferForm.value.fromAccount
      ),

      destinationAccount:
        this.transferForm.value.toAccount,

      amount: Number(
        this.transferForm.value.amount
      ),

      description:
        this.transferForm.value.description || ''
    };

    this.transactionService
      .transfer(payload)
      .subscribe({

        next: (res: any) => {

          this.loading = false;

          if (!res.success) {

            this.errorMessage =
              res.message ||
              'Transfer failed';

            return;
          }

          const selectedAccount =
            this.myAccounts.find(
              acc =>
                acc.id.toString() ===
                this.transferForm.value.fromAccount
            );

          this.router.navigate(
            ['/transfer-success'],
            {
              state: {
                transaction: {

                  senderName:
                    this.userName,

                  senderAccount:
                    selectedAccount?.accountNumber || 'N/A',

                  receiverAccount:
                    this.transferForm.value.toAccount,

                  amount:
                    enteredAmount,

                  description:
                    this.transferForm.value.description ||
                    'Fund Transfer',

                  transactionId:
                    res.data?.transactionId ||
                    res.data?.id ||
                    'TXN' + Date.now(),

                  time:
                    new Date().toLocaleString()
                }
              }
            }
          );
        },
        error: (err: any) => {

          this.loading = false;

          this.errorMessage =
            err.error?.message ||
            'Transfer failed';
        }
      });
  }
  toggleProfile(): void {

    this.isProfileOpen = !this.isProfileOpen;
  }

  logout(): void {

    localStorage.removeItem('accessToken');

    localStorage.removeItem('refreshToken');

    localStorage.removeItem('user');

    this.router.navigate(['/login']);
  }
}




