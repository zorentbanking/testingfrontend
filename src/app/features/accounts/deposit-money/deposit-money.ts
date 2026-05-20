import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { APP_CONSTANTS } from '../../../app.constants';

import {
  Router,
  RouterModule
} from '@angular/router';

import {
  HttpClient
} from '@angular/common/http';

@Component({
  selector: 'app-deposit-money',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],

  templateUrl: './deposit-money.html',

  styleUrls: ['./deposit-money.css']
})

export class DepositMoney implements OnInit {

  depositAmount: number = 0;

  accountNumber: string = '';

  accountDetails: any = {};

  loading = false;

  currencySymbol = APP_CONSTANTS.currencySymbol;

  isSuccess = false;

  errorMessage = '';

  transactionId = '';

  userName: string = '';

  userUsername: string = '';

  isProfileOpen = false;

  constructor(
    private router: Router,
    private http: HttpClient
  ) { }

  ngOnInit(): void {

    const user =
      JSON.parse(
        localStorage.getItem('user') || '{}'
      );

    this.userName =
      user.fullName || 'User';

    this.userUsername =
      user.username || '';

    // GET ACCOUNT NUMBER FROM STATE
    const nav =
      this.router.getCurrentNavigation();

    this.accountNumber =
      nav?.extras?.state?.['accountNumber']
      || history.state.accountNumber;

    console.log(
      'ACCOUNT NUMBER:',
      this.accountNumber
    );

    if (this.accountNumber) {

      this.loadAccount();

    }
    else {

      this.errorMessage =
        'Account number missing';

    }

  }

  loadAccount(): void {

    this.loading = true;

    const token =
      localStorage.getItem('accessToken');

    this.http.get<any>(
      `https://localhost:7085/api/accounts/${this.accountNumber}`,
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    ).subscribe({

      next: (res) => {

        console.log(
          'ACCOUNT RESPONSE:',
          res
        );

        this.loading = false;

        if (!res.success) {

          this.errorMessage =
            res.message;

          return;

        }

        this.accountDetails = {

          accountNumber:
            res.data.accountNumber,

          accountType:
            res.data.accountType,

          availableBalance:
            res.data.availableBalance

        };

      },

      error: (err) => {

        console.log(
          'LOAD ERROR:',
          err
        );

        this.loading = false;

        this.errorMessage =
          err?.error?.message
          ||
          'Failed to load account';

      }

    });

  }

  processDeposit(): void {

    this.errorMessage = '';

    // MIN VALIDATION
    if (this.depositAmount < 100) {

      this.errorMessage =
        'Minimum deposit amount is ₹100';

      return;

    }

    // MAX VALIDATION
    if (this.depositAmount > 100000) {

      this.errorMessage =
        'Maximum deposit amount is ₹100000';

      return;

    }

    const payload = {

      accountNumber:
        this.accountNumber,

      amount:
        this.depositAmount

    };

    console.log(
      'PAYLOAD:',
      payload
    );

    this.loading = true;

    const token =
      localStorage.getItem('accessToken');

    this.http.post<any>(
      'https://localhost:7085/api/accounts/deposit',
      payload,
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    ).subscribe({

      next: (res) => {

        console.log(
          'DEPOSIT RESPONSE:',
          res
        );

        this.loading = false;

        if (!res.success) {

          this.errorMessage =
            res.message;

          return;

        }

        this.isSuccess = true;

        this.transactionId =
          res.data.transactionId;

        // UPDATE BALANCE
        this.accountDetails.availableBalance =
          res.data.balance;

      },

      error: (err) => {

        console.log(
          'DEPOSIT ERROR:',
          err
        );

        this.loading = false;

        this.errorMessage =
          err?.error?.message
          ||
          'Deposit failed';

      }

    });

  }

  toggleProfile(): void {

    this.isProfileOpen =
      !this.isProfileOpen;

  }

  logout(): void {

    localStorage.clear();

    this.router.navigate(['/login']);

  }

  navDashboard(): void {

    this.router.navigate(['/dashboard']);

  }

}
