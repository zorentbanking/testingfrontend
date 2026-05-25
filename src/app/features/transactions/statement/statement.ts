import { Component, OnInit } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { APP_CONSTANTS } from '../../../app.constants';

@Component({
  selector: 'app-statement',
  templateUrl: './statement.html',
  styleUrls: ['./statement.css'],
  standalone: false
})

export class StatementComponent implements OnInit {

  statements: any[] = [];

  loading = false;

  currencySymbol = APP_CONSTANTS.currencySymbol;

  // ACCOUNT DETAILS

  customerName: string = '';

  customerId: number = 0;

  accountNumber: string = '';
  accountStatus: string = '';
  maturityAmount: number = 0;

  accountType: string = '';

  availableBalance: number = 0;
  userName: string = '';

  userUsername: string = '';

  isProfileOpen: boolean = false;

  branchName: string =
    'Zorent Main Branch';

  // FD / RD

  interestRate: any;

  durationMonths: any;

  maturityDate: any;

  estimatedMaturityAmount: any;

  installmentDate: any;

  totalInstallments: any;

  paidInstallments: any;

  remainingInstallments: any;

  // PAGINATION

  currentPage = 1;

  itemsPerPage = 5;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
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

        this.loadStatement(accountNumber);

      }

    });

  }

  loadStatement(accountNumber: string): void {

    this.loading = true;

    this.http.get<any>(
      `https://localhost:7085/api/transactions/statement/${accountNumber}`
    )
      .subscribe({

        next: (res) => {

          const data = res.data;

          // ACCOUNT DETAILS

          this.customerName =
            data.customerName;

          this.customerId =
            data.customerId;

          this.accountNumber =
            data.accountNumber;

          this.accountType =
            data.accountType;

          this.availableBalance =
            data.availableBalance;

          // FD / RD

          this.interestRate =
            data.interestRate;

          this.estimatedMaturityAmount = data.maturityAmount;

          this.maturityDate =
            data.maturityDate;



          this.installmentDate =
            data.installmentDate;

          this.totalInstallments =
            data.totalInstallments;

          this.paidInstallments =
            data.paidInstallments;

          this.remainingInstallments =
            data.remainingInstallments;
          this.durationMonths = this.calculateDurationMonths(
            data.createdAt,
            data.maturityDate,
            data.closedAt
          );

          // TRANSACTIONS

          this.statements =
            data.transactions;

          console.log(this.statements);

          this.loading = false;

        },

        error: (err) => {

          console.log(err);

          this.loading = false;

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

  get paginatedStatements() {

    const start =
      (this.currentPage - 1)
      * this.itemsPerPage;

    const end =
      start + this.itemsPerPage;

    return this.statements.slice(
      start,
      end
    );

  }

  nextPage(): void {

    if (
      this.currentPage <
      this.totalPages
    ) {

      this.currentPage++;

    }

  }

  previousPage(): void {

    if (this.currentPage > 1) {

      this.currentPage--;

    }

  }
  calculateDurationMonths(
    createdAt: any,
    maturityDate: any,
    closedAt?: any
  ): number {

    // ACTIVE ACCOUNT
    // BALANCE EXISTS
    if (this.availableBalance > 0) {

      return this.totalInstallments || 0;

    }

    // CLOSED AFTER FULL COMPLETION
    if (
      this.paidInstallments ===
      this.totalInstallments
    ) {

      return this.totalInstallments || 0;

    }

    // PREMATURE CLOSED ACCOUNT
    const start = new Date(createdAt);

    const end =
      closedAt
        ? new Date(closedAt)
        : new Date();

    let months =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth());

    // SAME MONTH CLOSURE
    if (months < 0) {
      months = 0;
    }

    return months;
  }
  get totalPages(): number {

    return Math.ceil(
      this.statements.length
      / this.itemsPerPage
    );

  }

}
