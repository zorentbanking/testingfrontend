import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';

import { AccountService } from '../../core/services/account.service';

@Component({
  selector: 'app-closed-accounts',

  templateUrl: './closed-accounts.html',

  styleUrls: ['./closed-accounts.css'],

  standalone: false
})

export class ClosedAccountsComponent implements OnInit {

  accounts: any[] = [];
  closedAccounts: any[] = [];

  loading: boolean = false;

  errorMessage: string = '';

  isFlipped: { [key: string]: boolean } = {};

  isProfileOpen: boolean = false;

  userName: string = 'User';

  userEmail: string = '';

  userPhone: string = '';

  userAddress: string = '';

  userUsername: string = '';

  netWorth: number = 0;

  constructor(
    private router: Router,
    private accountService: AccountService
  ) { }

  ngOnInit(): void {

    this.loadUserData();

    this.loadClosedAccounts();

  }

  loadUserData(): void {

    const userData =
      localStorage.getItem('user');

    if (userData) {

      const user = JSON.parse(userData);

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

  loadClosedAccounts(): void {

    this.loading = true;

    this.accountService.getMyAccounts().subscribe({

      next: (res: any) => {

        this.loading = false;
        this.closedAccounts =
          (res.data || []).filter(
            (x: any) =>
              x.status === 'Closed'
          );

        this.accounts =
          (res.data || []).filter(
            (a: any) => a.status === 'Closed'
          );

        this.calculateNetWorth();

      },

      error: (err: any) => {

        this.loading = false;

        this.errorMessage =
          err.error?.message
          ||
          'Failed to load closed accounts';

      }

    });

  }

  calculateNetWorth(): void {

    this.netWorth = this.accounts.reduce(
      (total, account) =>
        total + account.balance,
      0
    );

  }

  toggleProfile(): void {

    this.isProfileOpen =
      !this.isProfileOpen;

  }

  logout(): void {

    localStorage.removeItem('accessToken');

    localStorage.removeItem('refreshToken');

    localStorage.removeItem('user');

    this.router.navigate(['/login']);

  }

}
