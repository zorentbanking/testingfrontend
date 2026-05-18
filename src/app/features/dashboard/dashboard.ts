import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Account } from '../../core/models/account.model';
import { AccountService } from '../../core/services/account.service';
import { APP_CONSTANTS } from '../../app.constants';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  standalone: false
})
export class DashboardComponent implements OnInit {

  accounts: Account[] = [];

  netWorth: number = 0;

  currencySymbol = APP_CONSTANTS.currencySymbol;

  loading: boolean = false;

  errorMessage: string = '';
  isFlipped: { [key: string]: boolean } = {};


  isProfileOpen: boolean = false;

  selectedAccountType: string = 'All';

  userName: string = 'User';

  userEmail: string = '';
  userPhone: string = '';
  userFullName: string = '';

  userAddress: string = '';
  userUsername: string = '';
  showWelcomeMessage: boolean = false;

  welcomeUserName: string = '';


  constructor(
    private router: Router,
    private accountService: AccountService
  ) { }

  ngOnInit(): void {

    this.loadUserData();

    this.loadAccounts();
    const welcomeUser =
      localStorage.getItem('welcomeUser');

    if (welcomeUser) {

      this.welcomeUserName = welcomeUser;

      this.showWelcomeMessage = true;

      setTimeout(() => {

        this.showWelcomeMessage = false;

        localStorage.removeItem('welcomeUser');

      }, 3500);
    }
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

  loadAccounts(): void {

    this.loading = true;

    this.errorMessage = '';

    this.accountService.getMyAccounts().subscribe({

      next: (res: any) => {

        this.loading = false;

        if (!res.success) {

          this.errorMessage =
            res.message || 'Failed to load accounts';

          return;
        }

        this.accounts =
          (res.data || []).filter(
            (acc: any) => acc.status !== 'Closed'
          );

        this.calculateNetWorth();
      },

      error: (err: any) => {

        this.loading = false;

        this.errorMessage =
          err.error?.message ||
          'Unable to fetch accounts';
      }
    });
  }

  calculateNetWorth(): void {

    this.netWorth = this.accounts.reduce(
      (total, account) => total + account.balance,
      0
    );
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
  get filteredAccounts() {

  if (this.selectedAccountType === 'All') {
    return this.accounts;
  }

  return this.accounts.filter(
    acc => acc.accountType === this.selectedAccountType
  );
}
}
