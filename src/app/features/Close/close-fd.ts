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

  standalone: false,


  templateUrl: './close-fd.html',

  styleUrls: ['./close-fd.css']
})

export class CloseFd implements OnInit {

  isAgreed = false;

  isSuccess = false;

  accounts:any[]=[];

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

      this.loadAccounts();

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

  getHeaders() {

  return {
    Authorization:
      `Bearer ${localStorage.getItem('accessToken')}`
  };

}

loadAccounts(): void {

  this.http.get<any>(
    'https://localhost:7085/api/accounts/my',
    {
      headers: this.getHeaders()
    }
  ).subscribe({

    next: (res) => {

      this.accounts =
        (res.data || []).filter(
          (acc: any) =>

            acc.status !== 'Closed'
            &&

            (
              acc.accountType === 'Savings'
              ||
              acc.accountType === 'Checking'
            )
        );

      console.log(
        'AVAILABLE ACCOUNTS',
        this.accounts
      );

    },

    error: (err) => {

      console.log(err);

    }

  });

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
            data.accountType === 'Recurring Deposit'
              ? (
                (data.paidInstallments || 0) > 0
                  ? (
                    (data.monthlyInstallment || 0) *
                    (data.paidInstallments || 0)
                  )
                  : (data.availableBalance || 0)
              )
              : (data.availableBalance || 0),

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
    // RECURRING DEPOSIT
    // RECURRING DEPOSIT
    if (
      this.fdDetails.accountType === 'Recurring Deposit'
    ) {

      return Number(
        this.fdDetails.earnedInterest || 0
      );

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
    // AFTER CLOSURE USE EXACT BACKEND VALUE
    if (this.isSuccess) {

      return Number(
        this.fdDetails.amount || 0
      );

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

        // FORCE FULL OBJECT UPDATE
        this.fdDetails = {

          ...this.fdDetails,

          principal:
            Number(res.data.principal || 0),

          earnedInterest:
            Number(res.data.earnedInterest || 0),

          amount:
            Number(res.data.amount || 0)

        };

        console.log('UPDATED FD DETAILS', this.fdDetails);

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

