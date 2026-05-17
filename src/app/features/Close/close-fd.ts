import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import {
  Router,
  ActivatedRoute
} from '@angular/router';

import {
  HttpClient
} from '@angular/common/http';

@Component({
  selector: 'app-close-fd',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './close-fd.html',

  styleUrls: ['./close-fd.css']
})

export class CloseFd implements OnInit {

  isAgreed = false;

  isSuccess = false;

  loading = false;

  targetAccount = '';

  transactionId = '';

  errorMessage = '';
  userName: string = '';
  userUsername: string = '';

  isProfileOpen: boolean = false;

  fdDetails: any = {};

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    const user =
      JSON.parse(localStorage.getItem('user') || '{}');

    this.userName =
      user.fullName || 'User';

    this.userUsername =
      user.username || '';

    this.route.queryParams.subscribe(params => {

      const accountNumber =
        params['accountNumber'];

      if (accountNumber) {

        this.loadDepositDetails(accountNumber);

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


  loadDepositDetails(
    accountNumber: string
  ): void {

    this.loading = true;

    const token =
      localStorage.getItem('accessToken');

    this.http.get<any>(
      `https://localhost:7085/api/accounts/${accountNumber}`,
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    ).subscribe({

      next: (res) => {

        console.log('ACCOUNT RESPONSE', res);

        this.loading = false;

        // SAFETY CHECK
        if (!res.success || !res.data) {

          this.errorMessage =
            'Account details not found';

          return;
        }

        const data = res.data;
        data.earnedInterest = data.earnedInterest ?? 0;
        data.amount = data.amount ?? 0;

        this.fdDetails = {

          // ACCOUNT NUMBER
          fdAccountNumber:
            data.accountNumber || '',

          sourceAccount:
            data.accountNumber || '',
          accountType:
            data.accountType || '',

          paidInstallments:
            data.paidInstallments || 0,

          // BALANCE
          principal:
            data.availableBalance || 0,

          // FD/RD VALUES
          interestRate:
            data.interestRate || 0,

          maturityAmount:
            data.maturityAmount || 0,
          earnedInterest: data.earnedInterest ?? 0,

          // DATES
          startDate:
            data.createdAt
              ? new Date(data.createdAt)
              : new Date(),

          endDate:
            new Date(),

          // TENURE
          durationYears:
            (
              data.tenureMonths || 12
            ) / 12
        };

        console.log(
          'FD DETAILS',
          this.fdDetails
        );

      },

      error: (err) => {

        console.log(
          'LOAD ERROR',
          err
        );

        this.loading = false;

        this.errorMessage =
          err?.error?.message
          ||
          'Failed to load account details';

      }

    });

  }
  getDaysCompleted(): number {

    if (!this.fdDetails.startDate) {
      return 0;
    }

    const startDate =
      new Date(this.fdDetails.startDate);

    const today =
      new Date();

    const diffTime =
      today.getTime() -
      startDate.getTime();

    return Math.floor(
      diffTime / (1000 * 60 * 60 * 24)
    );

  }

  get totalInterest(): number {

    if (!this.fdDetails.principal) {
      return 0;
    }

    // AFTER CLOSURE
    if (this.isSuccess) {

      return this.fdDetails.earnedInterest || 0;

    }

    // CHECKING ACCOUNT
    if (
      this.fdDetails.accountType === 'Checking'
    ) {
      return 0;
    }

    
    // RECURRING DEPOSIT
    // RECURRING DEPOSIT (FIXED - MATCH BACKEND EXACTLY)
    if (
      this.fdDetails.accountType === 'Recurring Deposit'
    ) {
      const earnedInterest =
        this.fdDetails.earnedInterest ?? 0;

      // BEFORE CLOSURE → NEVER GUESS OR CALCULATE
      if (!this.isSuccess) {
        return 0;
      }

      // AFTER CLOSURE → TRUST BACKEND ONLY
      return earnedInterest;
    }

    // FIXED DEPOSIT
    const principal =
      this.fdDetails.principal;

    const rate =
      this.fdDetails.interestRate;

    const daysCompleted =
      this.getDaysCompleted();

    return (
      principal *
      rate *
      daysCompleted
    ) / (365 * 100);

  }

  get finalPayout(): number {

    // AFTER CLOSURE USE BACKEND VALUE
    if (this.isSuccess) {

      return this.fdDetails.amount || 0;

    }

    return (
      this.fdDetails.principal || 0
    ) + this.totalInterest;

  }

  processClosure() {

    this.errorMessage = '';

    // EMPTY VALIDATION
    if (!this.targetAccount) {

      this.errorMessage =
        'Please enter target account number';

      return;
    }

    // ONLY NUMBERS
    if (!/^[0-9]+$/.test(this.targetAccount)) {

      this.errorMessage =
        'Account number must contain only numbers';

      return;
    }

    // LENGTH VALIDATION
    if (this.targetAccount.length < 10) {

      this.errorMessage =
        'Invalid account number';

      return;
    }

    // SAME ACCOUNT BLOCK
    if (
      this.targetAccount ===
      this.fdDetails.fdAccountNumber
    ) {

      this.errorMessage =
        'Cannot transfer to same account';

      return;
    }

    const payload = {

      depositAccountNumber:
        this.fdDetails.fdAccountNumber,

      targetAccountNumber:
        this.targetAccount
    };
    this.loading = true;
    this.http.post<any>(
      'https://localhost:7085/api/accounts/close-deposit',
      payload
    ).subscribe({

      next: (res) => {
        this.loading = false;
        this.isSuccess = true;

        this.transactionId =
          res.data.transactionId;

        // UPDATE REAL VALUES FROM BACKEND
        this.fdDetails.earnedInterest =
          res.data.earnedInterest;

        this.fdDetails.amount =
          res.data.amount;

      },

      error: (err) => {
        this.loading = false;
        this.errorMessage =
          err?.error?.message
          ||
          'Closure failed';

      }

    });

  }

  navDashboard() {

    this.router.navigate(
      ['/dashboard']
    );

  }
}
